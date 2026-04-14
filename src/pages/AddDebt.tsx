import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";
import { DEBT_TYPE_LABELS, DEBT_STATUS_LABELS, DebtType, DebtStatus } from "@/types/debt";

export default function AddDebt() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "upload" | "manual">("choose");

  if (mode === "choose") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Adicionar Dívida</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-card cursor-not-allowed opacity-50">
            <CardContent className="p-6 text-center space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-heading font-semibold">Open Finance</p>
              <Badge variant="outline" className="text-xs">Em breve</Badge>
            </CardContent>
          </Card>

          <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setMode("upload")}>
            <CardContent className="p-6 text-center space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="font-heading font-semibold">Enviar Faturas</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
            </CardContent>
          </Card>

          <Card className="glass-card cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setMode("manual")}>
            <CardContent className="p-6 text-center space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <p className="font-heading font-semibold">Entrada Manual</p>
              <p className="text-xs text-muted-foreground">Preencher formulário</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "upload") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setMode("choose")}>← Voltar</Button>
          <h1 className="text-2xl font-heading font-bold">Enviar Faturas</h1>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-heading font-semibold">Arraste arquivos aqui</p>
                <p className="text-sm text-muted-foreground">ou clique para selecionar • PDF, JPG, PNG até 20MB</p>
              </div>
              <Button variant="outline">Selecionar Arquivos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setMode("choose")}>← Voltar</Button>
        <h1 className="text-2xl font-heading font-bold">Entrada Manual</h1>
      </div>
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Credor</Label>
              <Input placeholder="Ex: Nubank" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DEBT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Saldo devedor (R$)</Label>
              <Input type="number" placeholder="Ex: 12500" />
            </div>
            <div className="space-y-2">
              <Label>Parcela (R$)</Label>
              <Input type="number" placeholder="Ex: 625" />
            </div>
            <div className="space-y-2">
              <Label>Total de parcelas</Label>
              <Input type="number" placeholder="Ex: 24" />
            </div>
            <div className="space-y-2">
              <Label>Parcelas pagas</Label>
              <Input type="number" placeholder="Ex: 4" />
            </div>
            <div className="space-y-2">
              <Label>Taxa de juros (% a.m.)</Label>
              <Input type="number" step="0.1" placeholder="Ex: 14.5" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DEBT_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setMode("choose")}>Cancelar</Button>
            <Button onClick={() => navigate("/debts")}>Salvar Dívida</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
