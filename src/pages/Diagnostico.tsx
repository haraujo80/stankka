import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Debt, Profile, BacenRate, MINIMO_EXISTENCIAL, PRODUCT_LABELS } from "@/types/debt";
import { formatBRL, formatPct } from "@/lib/format";
import { diagnoseDebt, calcComprometimento } from "@/lib/diagnose";
import { AlertTriangle, ArrowRight, ShieldCheck, TrendingUp, Loader2, FileSearch, PlusCircle } from "lucide-react";

export default function Diagnostico() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rates, setRates] = useState<BacenRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [d, p, r] = await Promise.all([
        supabase.from("debts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("bacen_rates").select("product_type, rate_monthly, rate_yearly, reference_period"),
      ]);
      setDebts((d.data ?? []) as Debt[]);
      setProfile(p.data as Profile | null);
      setRates((r.data ?? []) as BacenRate[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (debts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="h-14 w-14 mx-auto rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
          <FileSearch className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-heading font-bold">Comece seu diagnóstico</h1>
        <p className="text-muted-foreground">Adicione uma dívida para ver como ela se compara à média BACEN e o que diz a lei.</p>
        <Button size="lg" asChild>
          <Link to="/dividas/nova"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar primeira dívida</Link>
        </Button>
      </div>
    );
  }

  const income = profile?.monthly_income ?? 0;
  const comp = calcComprometimento(debts, income);
  const redCount = debts.filter(d => diagnoseDebt(d, rates).flag === "red").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Diagnóstico</h1>
          <p className="text-sm text-muted-foreground">Estimativas com base em dados públicos do BACEN e regulação vigente.</p>
        </div>
        <Button asChild><Link to="/dividas/nova"><PlusCircle className="mr-2 h-4 w-4" />Adicionar dívida</Link></Button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Dívida total" value={formatBRL(comp.totalDebt)} />
        <MetricCard label="Credores" value={String(new Set(debts.map(d => d.creditor)).size)} />
        <MetricCard
          label="Comprometimento"
          value={formatPct(comp.pct)}
          alert={comp.pct > 30 ? "Acima de 30% — sinaliza superendividamento (Lei 14.181/2021)" : undefined}
        />
        <MetricCard
          label="Mínimo existencial"
          value={comp.respectsMinimoExistencial ? "Preservado" : "Violado"}
          alert={!comp.respectsMinimoExistencial ? `Renda pós-dívidas: ${formatBRL(comp.incomeAfterDebts)} < ${formatBRL(MINIMO_EXISTENCIAL)}` : undefined}
        />
      </div>

      {income > 0 && (
        <Card className="glass-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Comprometimento da renda</span>
              <span className="font-heading font-semibold">{formatPct(comp.pct)}</span>
            </div>
            <Progress value={Math.min(comp.pct, 100)} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Renda: {formatBRL(income)}</span>
              <span>Parcelas: {formatBRL(comp.totalInstallments)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {redCount > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong>{redCount}</strong> dívida(s) com indícios de abuso ou ilegalidade.
              Veja o detalhamento abaixo e gere o plano de ação correspondente.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debt list with diagnosis */}
      <div className="space-y-3">
        {debts.map((d) => {
          const diag = diagnoseDebt(d, rates);
          const flagClass = diag.flag === "red" ? "flag-red" : diag.flag === "yellow" ? "flag-yellow" : "flag-green";
          return (
            <Card key={d.id} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-semibold">{d.creditor}</span>
                      <Badge variant="outline" className="text-xs">{PRODUCT_LABELS[d.product_type]}</Badge>
                      <Badge variant="outline" className={`text-xs border ${flagClass}`}>
                        {diag.flag === "red" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {diag.flag === "green" && <ShieldCheck className="h-3 w-3 mr-1" />}
                        {diag.flag === "yellow" && <TrendingUp className="h-3 w-3 mr-1" />}
                        {diag.flag === "red" ? "Abusivo" : diag.flag === "yellow" ? "Acima da média" : "Dentro da média"}
                      </Badge>
                      {d.is_negativada && <Badge variant="destructive" className="text-xs">Negativada</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{diag.reason}</p>
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/dividas/nova?id=${d.id}`}>Ver plano de ação <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm pt-2 border-t border-border">
                  <Field label="Saldo" value={formatBRL(d.outstanding_balance)} />
                  <Field label="Parcela" value={d.monthly_installment ? formatBRL(d.monthly_installment) : "—"} />
                  <Field
                    label="Taxa contratual"
                    value={d.contractual_rate_monthly ? `${formatPct(d.contractual_rate_monthly)} a.m.` : "—"}
                  />
                  <Field
                    label="Média BACEN"
                    value={diag.bacenRate ? `${formatPct(diag.bacenRate)} a.m.` : "—"}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ label, value, alert }: { label: string; value: string; alert?: string }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-heading font-bold">{value}</p>
        {alert && <p className="text-xs text-destructive">{alert}</p>}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
