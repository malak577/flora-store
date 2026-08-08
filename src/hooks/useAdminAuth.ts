import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async (s: Session | null) => {
    if (!s) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    // First signed-in account bootstraps itself as admin; afterwards this
    // simply reports whether the current account already has the admin role.
    const { data } = await supabase.rpc("claim_admin");
    setIsAdmin(data === true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      void check(s);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void check(data.session);
    });
    return () => sub.subscription.unsubscribe();
  }, [check]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }, []);

  return { session, isAdmin, loading, signOut };
}
