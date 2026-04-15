import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { WorkType, WORK_TYPE_LABELS } from "@/types/debt";
import { formatBRL } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const steps = ["Renda", "Dependentes", "Vínculo"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState(3000);
  const [dependents, setDependents] = useState(0);
  const [workType, setWorkType] = useState<WorkType | "">("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const progress = ((step + 1) / steps.length) * 100;

  const canNext =
    (step === 0 && income > 0) ||
    (step === 1) ||
    (step === 2 && workType !== "");

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            monthly_income: income,
            dependents: dependents,
            work_type: workType,
          })
          .eq("id", user.id);

        if (error) {
          toast.error("Erro ao salvar dados: " + error.message);
        } else {
          toast.success("Perfil atualizado!");
          navigate("/dashboard");
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
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
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <Label>Renda mensal líquida</Label>
              <div className="text-center">
                <span className="text-3xl font-heading font-bold text-primary">
                  {formatBRL(income)}
                </span>
              </div>
              <Slider
                value={[income]}
                onValueChange={(v) => setIncome(v[0])}
                min={500}
                max={100000}
                step={100}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>R$ 500,00</span>
                <span>R$ 100.000,00+</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Label>Número de dependentes</Label>
              <div className="text-center">
                <span className="text-3xl font-heading font-bold text-primary">
                  {dependents}
                </span>
              </div>
              <Slider
                value={[dependents]}
                onValueChange={(v) => setDependents(v[0])}
                min={0}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>10</span>
              </div>
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
            <Button onClick={handleNext} disabled={!canNext || loading} className="flex-1">
              {loading ? "Salvando..." : step === steps.length - 1 ? "Concluir" : "Próximo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
