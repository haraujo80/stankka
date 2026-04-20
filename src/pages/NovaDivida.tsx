import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { DebtProductType, PRODUCT_LABELS } from "@/types/debt";
import { parseBRL, formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { Upload, Building2, FileSpreadsheet, ArrowLeft } from "lucide-react";

export default function NovaDivida() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const editingId = search.get("id");

  const [creditor, setCreditor] = useState("");
  const [productType, setProductType] = useState<DebtProductType>("cartao_credito_rotativo");
  const [originalPrincipal, setOriginalPrincipal] = useState("");
  const [outstandingBalance, setOutstandingBalance] = useState("");
  const [installment, setInstallment] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [paidInstallments, setPaidInstallments] = useState("");
  const [rate, setRate] = useState("");
  const [contractDate, setContractDate] = useState("");
  const [isNegativada, setIsNegativada] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      const { data } = await supabase.from("debts").select("*").eq("id", editingId).maybeSingle();
      if (!data) return;
      setCreditor(data.creditor);
      setProductType(data.product_type as DebtProductType);
      setOriginalPrincipal(data.original_principal != null ? String(data.original_principal).replace(".", ",") : "");
      setOutstandingBalance(String(data.outstanding_balance).replace(".", ","));
      setInstallment(data.monthly_installment != null ? String(data.monthly_installment).replace(".", ",") : "");
      setTotalInstallments(data.total_installments?.toString() ?? "");
      setPaidInstallments(data.paid_installments?.toString() ?? "");
      setRate(data.contractual_rate_monthly != null ? String(data.contractual_rate_monthly).replace(".", ",") : "");
      setContractDate(data.contract_date ?? "");
      setIsNegativada(data.is_negativada);
      setNotes(data.notes ?? "");
    })();
  }, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    const payload = {
      user_id: user.id,
      creditor,
      product_type: productType,
      original_principal: originalPrincipal ? parseBRL(originalPrincipal) : null,
      outstanding_balance: parseBRL(outstandingBalance),
      monthly_installment: installment ? parseBRL(installment) : null,
      total_installments: totalInstallments ? parseInt(totalInstallments) : null,
      paid_installments: paidInstallments ? parseInt(paidInstallments) : null,
      contractual_rate_monthly: rate ? parseBRL(rate) : null,
      contract_date: contractDate || null,
      is_negativada: isNegativada,
      notes: notes || null,
      source: "manual" as const,
    };

    const { data: saved, error } = editingId
      ? await supabase.from("debts").update(payload).eq("id", editingId).select().maybeSingle()
      : await supabase.from("debts").insert(payload).select().maybeSingle();

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Dívida atualizada" : "Dívida cadastrada");
    navigate(`/dividas/${saved?.id}/acao`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/dividas"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-heading font-bold">{editingId ? "Editar dívida" : "Adicionar dívida"}</h1>
        <p className="text-sm text-muted-foreground">Quanto mais detalhe, melhor o diagnóstico. Você pode pular campos opcionais.</p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList className="w-full">
          <TabsTrigger value="manual" className="flex-1"><FileSpreadsheet className="mr-1 h-4 w-4" />Manual</TabsTrigger>
          <TabsTrigger value="upload" className="flex-1"><Upload className="mr-1 h-4 w-4" />Upload</TabsTrigger>
          <TabsTrigger value="of" className="flex-1"><Building2 className="mr-1 h-4 w-4" />Open Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="glass-card">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credor *</Label>
                    <Input value={creditor} onChange={(e) => setCreditor(e.target.value)} required placeholder="Ex.: Nubank, Itaú, Bradesco" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de produto *</Label>
                    <Select value={productType} onValueChange={(v) => setProductType(v as DebtProductType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRODUCT_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Saldo devedor atual *</Label>
                    <Input value={outstandingBalance} onChange={(e) => setOutstandingBalance(e.target.value)} required placeholder="0,00" />
                    {outstandingBalance && <p className="text-xs text-muted-foreground">{formatBRL(parseBRL(outstandingBalance))}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Principal original</Label>
                    <Input value={originalPrincipal} onChange={(e) => setOriginalPrincipal(e.target.value)} placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Parcela mensal</Label>
                    <Input value={installment} onChange={(e) => setInstallment(e.target.value)} placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa contratual (% a.m.)</Label>
                    <Input value={rate} onChange={(e) => setRate(e.target.value)} placeholder="ex.: 14,5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Total de parcelas</Label>
                    <Input type="number" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Parcelas pagas</Label>
                    <Input type="number" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Data do contrato</Label>
                    <Input type="date" value={contractDate} onChange={(e) => setContractDate(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="neg" checked={isNegativada} onCheckedChange={(v) => setIsNegativada(!!v)} />
                  <Label htmlFor="neg" className="cursor-pointer">Estou negativado por esta dívida (SPC/Serasa)</Label>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detalhes que possam ajudar" />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : editingId ? "Atualizar e ver plano de ação" : "Salvar e ver plano de ação"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <UploadTab />
        </TabsContent>

        <TabsContent value="of">
          <OpenFinanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UploadTab() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Faça login"); setUploading(false); return; }
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("debt-documents").upload(path, file);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Documento enviado. Confirme os dados manualmente abaixo.");
    toast.info("OCR automático em breve. Por enquanto, preencha o formulário Manual.");
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6 space-y-4">
        <div className="text-sm">
          <p className="font-heading font-semibold">Envie a fatura, boleto ou contrato</p>
          <p className="text-muted-foreground">Aceitamos PDF, JPG, PNG. Até 20MB. OCR automático em breve.</p>
        </div>
        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} disabled={uploading} />
        {uploading && <p className="text-sm text-muted-foreground">Enviando...</p>}
        <p className="text-xs text-muted-foreground">Por enquanto, após o upload, complete os dados na aba Manual.</p>
      </CardContent>
    </Card>
  );
}

function OpenFinanceTab() {
  return (
    <Card className="glass-card border-accent/30">
      <CardContent className="p-6 space-y-3 text-center">
        <Building2 className="h-10 w-10 mx-auto text-accent" />
        <h3 className="font-heading font-semibold">Open Finance Brasil</h3>
        <p className="text-sm text-muted-foreground">
          Em breve você poderá conectar seus bancos diretamente e importar todas as dívidas automaticamente,
          via Open Finance (FAPI + ICP-Brasil).
        </p>
        <p className="text-xs text-muted-foreground">Aguardando certificação como Receptor de Dados (TPP).</p>
        <Button disabled className="w-full">Em breve</Button>
      </CardContent>
    </Card>
  );
}
