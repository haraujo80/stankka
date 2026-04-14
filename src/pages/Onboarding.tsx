import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { WorkType, WORK_TYPE_LABELS } from "@/types/debt";

const steps = ["Renda", "Dependentes", "Vínculo"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState("");
  const [dependents, setDependents] = useState("");
  const [workType, setWorkType] = useState<WorkType | "">("");
  const navigate = useNavigate();

  const progress = ((step + 1) / steps.length) * 100;

  const canNext =
    (step === 0 && Number(income) > 0) ||
    (step === 1 && dependents !== "") ||
    (step === 2 && workType !== "");

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">S</div>
            <span className="font-heading font-bold text-lg">Stankka</span>
          </div>
          <CardTitle className="text-xl">Passo {step + 1} de {steps.length}: {steps[step]}</CardTitle>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-2">
              <Label htmlFor="income">Renda mensal líquida (R$)</Label>
              <Input
                id="income"
                type="number"
                placeholder="Ex: 4500"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="dependents">Número de dependentes</Label>
              <Input
                id="dependents"
                type="number"
                min="0"
                placeholder="Ex: 2"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Tipo de vínculo</Label>
              <Select value={workType} onValueChange={(v) => setWorkType(v as WorkType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Voltar
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canNext} className="flex-1">
              {step === steps.length - 1 ? "Concluir" : "Próximo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
