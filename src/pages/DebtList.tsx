import { useState, useEffect } from "react";
import { DEBT_TYPE_LABELS, DEBT_STATUS_LABELS, Debt } from "@/types/debt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBRL } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function DebtList() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      setDebts(data.map(d => ({
        ...d,
        interestRate: d.interest_rate,
        totalInstallments: d.total_installments,
        paidInstallments: d.paid_installments,
        createdAt: d.created_at
      })) as unknown as Debt[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta dívida?")) {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) {
        toast.error("Erro ao excluir dívida.");
      } else {
        toast.success("Dívida excluída!");
        fetchData();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Minhas Dívidas</h1>
        <Button asChild>
          <Link to="/debts/add"><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {debts.map((d) => (
          <Card key={d.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold">{d.creditor}</span>
                    <Badge variant={d.status === "em_dia" ? "secondary" : d.status === "negativada" ? "destructive" : "outline"} className="text-xs">
                      {DEBT_STATUS_LABELS[d.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{DEBT_TYPE_LABELS[d.type]} • {d.interestRate}% a.m.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-heading font-bold">{formatBRL(d.balance)}</p>
                    <p className="text-xs text-muted-foreground">{d.paidInstallments}/{d.totalInstallments} parcelas</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
