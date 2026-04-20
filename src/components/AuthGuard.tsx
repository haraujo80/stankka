import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "in" | "out" | "needs-onboarding">("loading");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const check = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", userId)
        .maybeSingle();
      if (!mounted) return;
      if (!data?.onboarding_complete) setStatus("needs-onboarding");
      else setStatus("in");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) check(session.user.id);
      else setStatus("out");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) check(session.user.id);
      else setStatus("out");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "out") return <Navigate to="/login" replace state={{ from: location }} />;
  if (status === "needs-onboarding" && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
