import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Profile, WorkType, WORK_TYPE_LABELS } from "@/types/debt";
import { formatBRL } from "@/lib/format";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function Perfil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [income, setIncome] = useState(3000);
  const [dependents, setDependents] = useState(0);
  const [workType, setWorkType] = useState<WorkType>("clt");
  const [uf, setUf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data as Profile);
        setIncome(Number(data.monthly_income ?? 3000));
        setDependents(data.dependents ?? 0);
        setWorkType((data.work_type as WorkType) ?? "clt");
        setUf(data.uf ?? "");
        setPhone(data.phone ?? "");
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      monthly_income: income,
      dependents,
      work_type: workType,
      uf,
      phone,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Perfil</h1>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg">Dados pessoais</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={profile?.full_name ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input value={profile?.cpf ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>

          <div className="space-y-3">
            <Label>Renda mensal líquida — <span className="gradient-text font-bold">{formatBRL(income)}</span></Label>
            <Slider value={[income]} onValueChange={(v) => setIncome(v[0])} min={500} max={100000} step={100} />
          </div>

          <div className="space-y-3">
            <Label>Dependentes — <span className="gradient-text font-bold">{dependents}</span></Label>
            <Slider value={[dependents]} onValueChange={(v) => setDependents(v[0])} min={0} max={10} step={1} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de vínculo</Label>
              <Select value={workType} onValueChange={(v) => setWorkType(v as WorkType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Select value={uf} onValueChange={setUf}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {UFS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card border-destructive/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold text-sm">Sair da conta</p>
            <p className="text-xs text-muted-foreground">Você precisará entrar novamente</p>
          </div>
          <Button variant="outline" onClick={handleLogout}><LogOut className="mr-1 h-4 w-4" /> Sair</Button>
        </CardContent>
      </Card>
    </div>
  );
}
