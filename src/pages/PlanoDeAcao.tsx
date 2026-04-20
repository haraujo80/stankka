import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Debt, BacenRate, Profile, PRODUCT_LABELS, KIT_DOC_LABELS, KitDocumentType, CASE_STATUS_LABELS, CaseStatus } from "@/types/debt";
import { diagnoseDebt } from "@/lib/diagnose";
import { recommendChannels, generateAllKitDocuments } from "@/lib/actionEngine";
import { formatBRL, formatPct } from "@/lib/format";
import { ArrowLeft, AlertTriangle, ShieldCheck, FileText, CheckCircle2, Clock, Lock, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CaseRow {
  id: string;
  status: CaseStatus;
  payment_status: string;
  payment_amount: number;
  recommended_channel: string | null;
  opened_at: string;
  closed_at: string | null;
  outcome_reduction_pct: number | null;
  outcome_notes: string | null;
}

interface DocRow {
  id: string;
  document_type: KitDocumentType;
  title: string;
  content: string;
}

export default function PlanoDeAcao() {
  const { debtId } = useParams();
  const navigate = useNavigate();
  const [debt, setDebt] = useState<Debt | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rates, setRates] = useState<BacenRate[]>([]);
  const [caseRow, setCaseRow] = useState<CaseRow | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDoc, setOpenDoc] = useState<DocRow | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [paying, setPaying] = useState(false);

  const load = async () => {
    if (!debtId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [d, p, r, c] = await Promise.all([
      supabase.from("debts").select("*").eq("id", debtId).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("bacen_rates").select("product_type, rate_monthly, rate_yearly, reference_period"),
      supabase.from("cases").select("*").eq("debt_id", debtId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setDebt(d.data as Debt | null);
    setProfile(p.data as Profile | null);
    setRates((r.data ?? []) as BacenRate[]);
    setCaseRow(c.data as CaseRow | null);
    if (c.data) {
      const { data: docsData } = await supabase.from("case_documents").select("*").eq("case_id", c.data.id).order("generated_at");
      setDocs((docsData ?? []) as DocRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [debtId]);

  const diag = useMemo(() => debt ? diagnoseDebt(debt, rates) : null, [debt, rates]);
  const channels = useMemo(() => debt && diag ? recommendChannels(debt, diag) : [], [debt, diag]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!debt || !diag) {
    return <div className="text-center py-12"><p>Dívida não encontrada.</p><Button variant="outline" asChild className="mt-4"><Link to="/dividas">Voltar</Link></Button></div>;
  }

  const isPaid = caseRow?.payment_status === "pago";
  const flagClass = diag.flag === "red" ? "flag-red" : diag.flag === "yellow" ? "flag-yellow" : "flag-green";

  const handlePay = async () => {
    if (!acceptDisclaimer) { toast.error("Você precisa aceitar o aviso para continuar."); return; }
    setPaying(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // (Mock) — create case as paid, generate documents
    const recommended = channels[0]?.channel ?? null;
    let currentCase = caseRow;
    if (!currentCase) {
      const { data, error } = await supabase.from("cases").insert({
        user_id: user.id,
        debt_id: debt.id,
        status: "aberto",
        payment_status: "pago",
        payment_amount: 9.99,
        paid_at: new Date().toISOString(),
        recommended_channel: recommended,
      }).select().maybeSingle();
      if (error) { toast.error(error.message); setPaying(false); return; }
      currentCase = data as CaseRow;
    } else {
      const { data, error } = await supabase.from("cases").update({
        payment_status: "pago",
        paid_at: new Date().toISOString(),
        recommended_channel: recommended,
      }).eq("id", currentCase.id).select().maybeSingle();
      if (error) { toast.error(error.message); setPaying(false); return; }
      currentCase = data as CaseRow;
    }

    const generated = generateAllKitDocuments({ debt, diag, profile, channel: recommended ?? "" });
    const rows = generated.map(g => ({
      case_id: currentCase!.id,
      user_id: user.id,
      document_type: g.document_type,
      title: g.title,
      content: g.content,
    }));
    await supabase.from("case_documents").insert(rows);
    await supabase.from("case_events").insert({
      case_id: currentCase.id,
      user_id: user.id,
      event_type: "kit_generated",
      description: `Kit de ${rows.length} documentos gerado. Canal recomendado: ${recommended}`,
    });

    toast.success("Pagamento confirmado! Seu plano de ação está pronto.");
    setPaywallOpen(false);
    setPaying(false);
    load();
  };

  const updateStatus = async (status: CaseStatus) => {
    if (!caseRow) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("cases").update({ status, closed_at: status === "concluido" ? new Date().toISOString() : null }).eq("id", caseRow.id);
    await supabase.from("case_events").insert({
      case_id: caseRow.id,
      user_id: user.id,
      event_type: "status_change",
      description: `Status alterado para ${CASE_STATUS_LABELS[status]}`,
    });
    toast.success("Status atualizado");
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/diagnostico"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao diagnóstico</Link>
      </Button>

      {/* Debt summary */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-heading font-bold">{debt.creditor}</h1>
              <p className="text-sm text-muted-foreground">{PRODUCT_LABELS[debt.product_type]} · {formatBRL(debt.outstanding_balance)}</p>
            </div>
            <Badge variant="outline" className={`text-xs border ${flagClass}`}>
              {diag.flag === "red" && <AlertTriangle className="h-3 w-3 mr-1" />}
              {diag.flag === "green" && <ShieldCheck className="h-3 w-3 mr-1" />}
              {diag.flag === "red" ? "Indícios de abuso" : diag.flag === "yellow" ? "Acima da média" : "Dentro da média"}
            </Badge>
          </div>
          <p className="text-sm">{diag.reason}</p>
          {diag.bacenRate && debt.contractual_rate_monthly && (
            <div className="text-sm text-muted-foreground">
              Contratual: <strong className="text-foreground">{formatPct(debt.contractual_rate_monthly)} a.m.</strong> · BACEN: {formatPct(diag.bacenRate)} a.m.
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="font-semibold text-foreground">Fundamentação:</p>
            {diag.citations.map((c, i) => <p key={i}>• {c}</p>)}
          </div>
        </CardContent>
      </Card>

      {/* Recommended channels */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg">Canais recomendados (em ordem)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {channels.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm">{c.channel}</p>
                <p className="text-xs text-muted-foreground">{c.rationale}</p>
              </div>
              <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />{c.expectedSlaDays}d</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Kit / paywall */}
      {!isPaid ? (
        <Card className="glass-card border-primary/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-heading font-semibold">Plano de ação completo</p>
                <p className="text-sm text-muted-foreground">Carta + 4 reclamações pré-preenchidas + contraproposta Lei 14.181</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg gradient-primary text-primary-foreground">
              <div>
                <p className="text-xs opacity-90">Pagamento único, por dívida</p>
                <p className="text-3xl font-heading font-bold">R$ 9,99</p>
              </div>
              <Sparkles className="h-8 w-8 opacity-80" />
            </div>
            <Button className="w-full" size="lg" onClick={() => setPaywallOpen(true)}>
              Desbloquear plano de ação
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Pagamento via Pix. A Stankka não promete resultado — entrega instrumentação para você negociar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-success/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-success" />Documentos do seu kit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {docs.map(doc => (
              <button key={doc.id} onClick={() => setOpenDoc(doc)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted text-left transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{KIT_DOC_LABELS[doc.document_type]}</p>
                    <p className="text-xs text-muted-foreground truncate">{doc.title}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Abrir</span>
              </button>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-sm font-heading font-semibold">Status do caso: {caseRow && CASE_STATUS_LABELS[caseRow.status]}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus("em_analise")}>Em análise</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus("resposta_recebida")}>Resposta recebida</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus("concluido")}>Concluído</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus("escalado")}>Escalar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paywall */}
      <Dialog open={paywallOpen} onOpenChange={setPaywallOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desbloquear plano de ação — R$ 9,99</DialogTitle>
            <DialogDescription>Pagamento via Pix (simulado para o MVP).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-4 rounded-lg bg-muted text-center space-y-2">
              <p className="text-xs text-muted-foreground">QR Code Pix (mock)</p>
              <div className="h-32 w-32 mx-auto bg-foreground/10 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground">Pix</div>
              <p className="font-heading font-bold text-lg">R$ 9,99</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p><strong>Aviso obrigatório:</strong> os documentos gerados são modelos baseados em legislação e jurisprudência. Não há garantia de resultado em negociação ou ação judicial. Cada caso depende do credor, histórico e contexto. Para casos complexos, procure a Defensoria Pública (NUDECON) ou advogado.</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="dis" checked={acceptDisclaimer} onCheckedChange={(v) => setAcceptDisclaimer(!!v)} />
              <label htmlFor="dis" className="text-sm cursor-pointer">Li e entendi</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaywallOpen(false)}>Cancelar</Button>
            <Button onClick={handlePay} disabled={paying || !acceptDisclaimer}>
              {paying ? "Processando..." : "Confirmar pagamento (mock)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document viewer */}
      <Dialog open={!!openDoc} onOpenChange={(o) => !o && setOpenDoc(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openDoc?.title}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm font-body text-foreground">{openDoc?.content}</pre>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              if (openDoc) {
                navigator.clipboard.writeText(openDoc.content);
                toast.success("Copiado para área de transferência");
              }
            }}>Copiar</Button>
            <Button onClick={() => setOpenDoc(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
