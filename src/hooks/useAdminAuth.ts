import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkedFor = useRef<string | null>(null);

  const check = useCallback(async (s: Session | null) => {
    if (!s) {
      checkedFor.current = null;
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    // Only one role check per signed-in user — avoids a request on every
    // token refresh / tab focus.
    if (checkedFor.current === s.user.id) {
      setLoading(false);
      return;
    }
    checkedFor.current = s.user.id;
    // First signed-in account bootstraps itself as admin; afterwards this
    // simply reports whether the current account already has the admin role.
    const { data, error } = await supabase.rpc("claim_admin");
    if (error) checkedFor.current = null;
    setIsAdmin(data === true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "TOKEN_REFRESHED") return; // no identity change, nothing to re-check
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
