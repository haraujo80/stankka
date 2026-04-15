import { mockDebts } from "@/data/mockDebts";
import { DEBT_TYPE_LABELS, DEBT_STATUS_LABELS } from "@/types/debt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBRL } from "@/lib/format";

export default function DebtList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Minhas Dívidas</h1>
        <Button asChild>
          <Link to="/debts/add"><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {mockDebts.map((d) => (
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
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
