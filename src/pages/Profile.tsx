import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WORK_TYPE_LABELS, WorkType } from "@/types/debt";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [income, setIncome] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [workType, setWorkType] = useState<WorkType | "">("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setIncome(Number(data.monthly_income));
        setDependents(data.dependents);
        setWorkType(data.work_type as WorkType);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          monthly_income: income,
          dependents: dependents,
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Erro ao salvar perfil.");
      } else {
        toast.success("Perfil atualizado!");
      }
    }
    setSaving(false);
  };

  const handleDeleteData = async () => {
    const confirm = window.confirm(
      "Tem certeza que deseja excluir todos os seus dados? Esta ação é irreversível e sua conta será desativada de acordo com seu direito à exclusão (LGPD)."
    );

    if (confirm) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').delete().eq('id', user.id);
        
        if (error) {
          toast.error("Erro ao excluir dados: " + error.message);
        } else {
          await supabase.auth.signOut();
          toast.success("Seus dados foram excluídos com sucesso.");
          navigate("/login");
        }
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
      <h1 className="text-2xl font-heading font-bold">Perfil</h1>
      <Card className="glass-card max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Dados Financeiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Renda mensal líquida</Label>
            <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Dependentes</Label>
            <Input type="number" value={dependents} onChange={(e) => setDependents(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de vínculo</Label>
            <Input disabled value={workType ? WORK_TYPE_LABELS[workType] : ""} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card max-w-lg border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Privacidade e LGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Você tem o direito de solicitar a exclusão de todos os seus dados pessoais de nossa plataforma a qualquer momento.
          </p>
          <Button variant="destructive" onClick={handleDeleteData}>
            Excluir minha conta e dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
