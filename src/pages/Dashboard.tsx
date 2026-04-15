import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEBT_TYPE_LABELS, DEBT_STATUS_LABELS, Debt } from "@/types/debt";
import { AlertTriangle, CreditCard, DollarSign, Users, ShieldAlert, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatBRL } from "@/lib/format";
import { OpenFinanceConnect } from "@/components/OpenFinanceConnect";
import { supabase } from "@/integrations/supabase/client";

const COLORS = [
  "hsl(252, 96%, 67%)",
  "hsl(263, 91%, 75%)",
  "hsl(199, 89%, 48%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
];

export default function Dashboard() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [debtsRes, profileRes] = await Promise.all([
        supabase.from("debts").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("monthly_income").eq("id", user.id).single()
      ]);

      if (debtsRes.data) {
        setDebts(debtsRes.data.map(d => ({
          ...d,
          interestRate: d.interest_rate,
          totalInstallments: d.total_installments,
          paidInstallments: d.paid_installments,
          createdAt: d.created_at
        })) as unknown as Debt[]);
      }

      if (profileRes.data) {
        setIncome(Number(profileRes.data.monthly_income));
      }
      setLoading(false);
    };

    fetchData();

    // Subscribe to changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalDebt = debts.reduce((s, d) => s + Number(d.balance), 0);
  const totalInstallments = debts.reduce((s, d) => s + Number(d.installment), 0);
  const creditors = new Set(debts.map((d) => d.creditor)).size;
  const commitmentPct = income > 0 ? Math.round((totalInstallments / income) * 100) : 0;
  const minExistencial = 600;
  const remaining = income - totalInstallments;

  const byType = Object.entries(
    debts.reduce<Record<string, number>>((acc, d) => {
      acc[DEBT_TYPE_LABELS[d.type]] = (acc[DEBT_TYPE_LABELS[d.type]] || 0) + Number(d.balance);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const byCreditor = Object.entries(
    debts.reduce<Record<string, number>>((acc, d) => {
      acc[d.creditor] = (acc[d.creditor] || 0) + Number(d.balance);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const alerts: string[] = [];
  const creditorCounts: Record<string, number> = {};
  debts.forEach((d) => {
    creditorCounts[d.creditor] = (creditorCounts[d.creditor] || 0) + 1;
    if (d.interestRate && d.interestRate > 8 && d.type === "cartao_credito") {
      alerts.push(`${d.creditor}: Taxa de ${d.interestRate}% acima da média BACEN`);
    }
  });
  Object.entries(creditorCounts).forEach(([c, n]) => {
    if (n >= 2) alerts.push(`${n} dívidas com ${c} — possível negociação em lote`);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <div className="w-full md:w-auto">
          <OpenFinanceConnect />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dívida Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">{formatBRL(totalDebt)}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credores</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">{creditors}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comprometimento</CardTitle>
            <CreditCard className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-heading font-bold ${commitmentPct > 30 ? "text-destructive" : ""}`}>
              {commitmentPct}%
            </div>
            {commitmentPct > 30 && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Acima de 30%
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mínimo Existencial</CardTitle>
            <ShieldAlert className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-heading font-bold ${remaining < minExistencial ? "text-destructive" : "text-chart-4"}`}>
              {formatBRL(remaining)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {remaining < minExistencial ? "Abaixo do mínimo (R$600)" : "Acima do mínimo (R$600)"}
            </p>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card className="glass-card border-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              Observações Automáticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {alerts.map((a, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {a}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Por Tipo de Produto</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Por Credor</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCreditor} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {byCreditor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Todas as Dívidas</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground font-medium">Credor</th>
                  <th className="text-left p-2 text-muted-foreground font-medium">Tipo</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">Saldo</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">Parcela</th>
                  <th className="text-right p-2 text-muted-foreground font-medium">Taxa</th>
                  <th className="text-left p-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="p-2 font-medium">{d.creditor}</td>
                    <td className="p-2">{DEBT_TYPE_LABELS[d.type]}</td>
                    <td className="p-2 text-right">{formatBRL(d.balance)}</td>
                    <td className="p-2 text-right">{formatBRL(d.installment)}</td>
                    <td className="p-2 text-right">{d.interestRate}%</td>
                    <td className="p-2">
                      <Badge variant={d.status === "em_dia" ? "secondary" : d.status === "negativada" ? "destructive" : "outline"} className="text-xs">
                        {DEBT_STATUS_LABELS[d.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
