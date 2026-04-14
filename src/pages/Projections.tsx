import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { mockDebts, getProjection } from "@/data/mockDebts";
import { DEBT_TYPE_LABELS, DEBT_STATUS_LABELS } from "@/types/debt";
import { AlertTriangle, ShieldCheck, TrendingDown } from "lucide-react";

const CONFIDENCE_COLORS: Record<string, string> = {
  baixo: "text-chart-5",
  medio: "text-accent",
  alto: "text-chart-4",
};

export default function Projections() {
  const [accepted, setAccepted] = useState(false);

  if (!accepted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Projeções de Redução</h1>
        <Card className="glass-card border-accent/30 max-w-lg mx-auto">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-heading font-semibold text-foreground text-base">Aviso Importante</p>
                <p>
                  As projeções apresentadas são <strong>estimativas baseadas em heurísticas</strong> e dados públicos 
                  (taxas médias BACEN, legislação vigente). <strong>Não constituem garantia</strong> de resultado em 
                  negociação ou judicialização.
                </p>
                <p>
                  Cada caso é único e pode variar conforme o credor, histórico do cliente e condições de mercado. 
                  Consulte sempre um profissional qualificado antes de tomar decisões financeiras.
                </p>
                <p className="text-xs">
                  Base legal: CDC Art. 6º, Lei 14.181/2021, Lei 14.690/2023, Súmula 530 STJ, Res. CMN 4.765.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="accept" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
              <label htmlFor="accept" className="text-sm cursor-pointer">Li e entendi o aviso acima</label>
            </div>
            <Button disabled={!accepted} className="w-full" onClick={() => setAccepted(true)}>
              Ver Projeções
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Projeções de Redução</h1>
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        <ShieldCheck className="h-4 w-4" /> Estimativas — não constituem garantia
      </p>

      <div className="grid gap-4">
        {mockDebts.map((d) => {
          const proj = getProjection(d);
          return (
            <Card key={d.id} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold">{d.creditor}</span>
                      <Badge variant="outline" className="text-xs">{DEBT_TYPE_LABELS[d.type]}</Badge>
                      <Badge variant={d.status === "negativada" ? "destructive" : "secondary"} className="text-xs">
                        {DEBT_STATUS_LABELS[d.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Saldo: {d.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} • 
                      Parcela: {d.installment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <Badge className="gradient-primary text-primary-foreground border-0 text-sm px-3 py-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {proj.reductionMin}–{proj.reductionMax}%
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nova parcela estimada</p>
                    <p className="font-heading font-semibold">{proj.newInstallment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Canal recomendado</p>
                    <p className="font-medium">{proj.channel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confiança</p>
                    <p className={`font-medium capitalize ${CONFIDENCE_COLORS[proj.confidence]}`}>{proj.confidence}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">Tese: {proj.legalBasis}</p>

                <Button variant="outline" className="w-full sm:w-auto">
                  Quero tentar reduzir essa dívida
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
