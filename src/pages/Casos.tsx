import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CASE_STATUS_LABELS, CaseStatus } from "@/types/debt";
import { formatBRL } from "@/lib/format";
import { Loader2, ArrowRight, Briefcase } from "lucide-react";

interface CaseListRow {
  id: string;
  status: CaseStatus;
  payment_status: string;
  recommended_channel: string | null;
  opened_at: string;
  debt_id: string;
  debts: { creditor: string; product_type: string; outstanding_balance: number } | null;
}

export default function Casos() {
  const [cases, setCases] = useState<CaseListRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("cases")
        .select("id, status, payment_status, recommended_channel, opened_at, debt_id, debts(creditor, product_type, outstanding_balance)")
        .eq("user_id", user.id)
        .order("opened_at", { ascending: false });
      setCases((data ?? []) as unknown as CaseListRow[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold">Casos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe negociações em andamento</p>
      </div>

      {cases.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground space-y-3">
            <Briefcase className="h-10 w-10 mx-auto opacity-40" />
            <p>Nenhum caso aberto ainda. Vá ao diagnóstico e desbloqueie um plano de ação.</p>
            <Button asChild><Link to="/diagnostico">Ver diagnóstico</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map(c => (
            <Card key={c.id} className="glass-card">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-semibold">{c.debts?.creditor ?? "—"}</span>
                    <Badge variant="outline" className="text-xs">{CASE_STATUS_LABELS[c.status]}</Badge>
                    {c.payment_status === "pago" && <Badge variant="secondary" className="text-xs">Pago</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.debts ? formatBRL(c.debts.outstanding_balance) : ""}
                    {c.recommended_channel && ` · Canal: ${c.recommended_channel}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Aberto em {new Date(c.opened_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <Button size="sm" asChild>
                  <Link to={`/dividas/${c.debt_id}/acao`}>Abrir <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
