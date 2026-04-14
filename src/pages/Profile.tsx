import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockOnboarding } from "@/data/mockDebts";
import { WORK_TYPE_LABELS } from "@/types/debt";

export default function Profile() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Perfil</h1>
      <Card className="glass-card max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Dados Financeiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Renda mensal líquida</Label>
            <Input type="number" defaultValue={mockOnboarding.monthlyIncome} />
          </div>
          <div className="space-y-2">
            <Label>Dependentes</Label>
            <Input type="number" defaultValue={mockOnboarding.dependents} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de vínculo</Label>
            <Input disabled value={WORK_TYPE_LABELS[mockOnboarding.workType]} />
          </div>
          <Button>Salvar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
