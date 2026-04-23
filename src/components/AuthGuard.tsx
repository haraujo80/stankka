import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type Status = "loading" | "in" | "out" | "needs-onboarding";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const location = useLocation();
  const reqIdRef = useRef(0);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const check = async (userId: string, force = false) => {
      // Skip redundant checks for the same user unless forced
      if (!force && lastUserIdRef.current === userId && status === "in") return;
      const myReq = ++reqIdRef.current;
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", userId)
        .maybeSingle();
      if (!mounted || myReq !== reqIdRef.current) return;
      if (error) {
        // On transient error, do not flip to out — keep prior state if any
        if (status === "loading") setStatus("needs-onboarding");
        return;
      }
      lastUserIdRef.current = userId;
      if (data?.onboarding_complete) setStatus("in");
      else setStatus("needs-onboarding");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        lastUserIdRef.current = null;
        setStatus("out");
        return;
      }
      // Only re-check profile on meaningful events
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
        check(session.user.id, true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) check(session.user.id, true);
      else setStatus("out");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  if (status === "in" && location.pathname === "/onboarding") {
    return <Navigate to="/diagnostico" replace />;
  }

  return <>{children}</>;
}
