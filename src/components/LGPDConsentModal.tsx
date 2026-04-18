import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function LGPDConsentModal() {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkConsent = async (userId: string) => {
      const { data, error } = await supabase
        .from("user_consents")
        .select("id")
        .eq("user_id", userId)
        .eq("consent_type", "lgpd_general")
        .eq("agreed", true)
        .single();

      if (!data || error) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkConsent(session.user.id);
      } else {
        setOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAgree = async () => {
    if (!agreed) {
      toast.error("Você precisa aceitar os termos para continuar.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from("user_consents").insert({
        user_id: user.id,
        consent_type: "lgpd_general",
        agreed: true,
      });

      if (error) {
        console.error("LGPD consent error:", error);
        toast.error(`Erro ao salvar consentimento: ${error.message}`);
      } else {
        setOpen(false);
        toast.success("Consentimento registrado com sucesso.");
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Privacidade e Proteção de Dados (LGPD)</DialogTitle>
          <DialogDescription>
            Para continuar utilizando a Stankka, precisamos do seu consentimento para processar seus dados financeiros de acordo com a Lei Geral de Proteção de Dados.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="consent" 
              checked={agreed} 
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label 
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Eu concordo com os Termos de Uso e Política de Privacidade.
              </Label>
              <p className="text-sm text-muted-foreground">
                Autorizo o tratamento dos meus dados para fins de análise de crédito e propostas de renegociação.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAgree} disabled={loading}>
            Confirmar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
