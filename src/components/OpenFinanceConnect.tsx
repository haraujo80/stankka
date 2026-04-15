import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, Landmark, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function OpenFinanceConnect() {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);

    // Simulate Open Finance connection flow (e.g., Pluggy/Belvo widget)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Simulate successful connection and data import
      const { error: connError } = await supabase.from("bank_connections").insert({
        user_id: user.id,
        provider: "Pluggy (Simulated)",
        status: "active",
        last_sync: new Date().toISOString()
      });

      if (!connError) {
        // Mocking the import of data into the debts table
        const mockImportedDebts = [
          {
            user_id: user.id,
            creditor: "Banco do Brasil",
            type: "cartao_credito",
            balance: 4500.00,
            installment: 250.00,
            total_installments: 12,
            paid_installments: 3,
            interest_rate: 12.5,
            status: "em_dia"
          },
          {
            user_id: user.id,
            creditor: "Caixa",
            type: "emprestimo_pessoal",
            balance: 15000.00,
            installment: 600.00,
            total_installments: 48,
            paid_installments: 10,
            interest_rate: 4.5,
            status: "em_dia"
          }
        ];

        await supabase.from("debts").insert(mockImportedDebts);

        toast.success("Banco conectado com sucesso! Seus dados foram importados.");
      } else {
        toast.error("Erro ao registrar conexão bancária.");
      }
    }

    setConnecting(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          Conectar Open Finance
        </CardTitle>
        <CardDescription>
          Conecte suas contas bancárias para importar automaticamente suas dívidas, faturas e limites.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full gap-2"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          {connecting ? "Conectando..." : "Conectar via Open Finance"}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-4 text-center">
          Seus dados são protegidos e acessados de forma segura seguindo os padrões do Banco Central.
        </p>
      </CardContent>
    </Card>
  );
}
