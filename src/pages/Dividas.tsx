import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Debt, BacenRate, PRODUCT_LABELS } from "@/types/debt";
import { formatBRL } from "@/lib/format";
import { diagnoseDebt } from "@/lib/diagnose";
import { Loader2, PlusCircle, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Dividas() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [rates, setRates] = useState<BacenRate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [d, r] = await Promise.all([
      supabase.from("debts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bacen_rates").select("product_type, rate_monthly, rate_yearly, reference_period"),
    ]);
    setDebts((d.data ?? []) as Debt[]);
    setRates((r.data ?? []) as BacenRate[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta dívida?")) return;
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Dívida removida"); load(); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Minhas Dívidas</h1>
          <p className="text-sm text-muted-foreground">{debts.length} dívida(s) cadastrada(s)</p>
        </div>
        <Button asChild><Link to="/dividas/nova"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar dívida</Link></Button>
      </div>

      {debts.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground space-y-3">
            <p>Nenhuma dívida cadastrada ainda.</p>
            <Button asChild><Link to="/dividas/nova">Adicionar primeira</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {debts.map(d => {
            const diag = diagnoseDebt(d, rates);
            const flagClass = diag.flag === "red" ? "flag-red" : diag.flag === "yellow" ? "flag-yellow" : "flag-green";
            return (
              <Card key={d.id} className="glass-card">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-semibold">{d.creditor}</span>
                      <Badge variant="outline" className="text-xs">{PRODUCT_LABELS[d.product_type]}</Badge>
                      <Badge variant="outline" className={`text-xs border ${flagClass}`}>
                        {diag.flag === "red" ? "Abusivo" : diag.flag === "yellow" ? "Acima média" : "Dentro média"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatBRL(d.outstanding_balance)} · {d.source === "manual" ? "Inserido manualmente" : d.source}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDelete(d.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/dividas/nova?id=${d.id}`}>Plano de ação <ArrowRight className="ml-1 h-3 w-3" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
