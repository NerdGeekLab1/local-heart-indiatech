import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  userRoles: string[];
  /** True once a role lookup has settled for the signed-in user (even if it returned nothing). */
  roleLoaded: boolean;
  refreshRole: () => Promise<string | null>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const roleRequestRef = useRef<Promise<string | null> | null>(null);

  const fetchRole = useCallback(async (_userId: string) => {
    if (roleRequestRef.current) return roleRequestRef.current;
    const request = (async () => {
      try {
        const roleQuery = supabase.rpc("get_my_role");
        const timeout = new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Role lookup timed out")), 8_000));
        const { data, error } = await Promise.race([roleQuery, timeout]);
        if (error) throw error;
        const roles = data ? [data] : [];
        const role = roles[0] ?? null;
        setUserRoles(roles);
        setUserRole(role);
        return role;
      } catch {
        // Keep the last known role: clearing it made guards redirect hosts to
        // the traveler dashboard whenever a lookup timed out.
        return null;
      } finally {
        setRoleLoaded(true);
        roleRequestRef.current = null;
      }
    })();
    roleRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setUserRole(null);
        setUserRoles([]);
        setRoleLoaded(true);
        setLoading(false);
        return;
      }

      try {
        setUserRole(null);
        await fetchRole(nextSession.user.id);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Only show loading on real sign-in / initial hydrate; skip token refreshes to avoid flicker
        const isInitialAuth = event === "INITIAL_SESSION";
        if (isInitialAuth) setLoading(true);
        if (isInitialAuth) { setUserRole(null); setRoleLoaded(false); }
        setTimeout(async () => {
          try {
            await fetchRole(session.user.id);
          } finally {
            if (mounted && isInitialAuth) setLoading(false);
          }
        }, 0);
      } else {
        setUserRole(null);
        setUserRoles([]);
        setRoleLoaded(true);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => hydrateSession(session));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  useEffect(() => {
    if (!user?.id) return;

    const syncRole = () => { void fetchRole(user.id); };
    const channel = supabase
      .channel(`current-user-role-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        syncRole,
      )
      .subscribe();

    window.addEventListener("focus", syncRole);
    return () => {
      window.removeEventListener("focus", syncRole);
      void supabase.removeChannel(channel);
    };
  }, [fetchRole, user?.id]);

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error || !result.data.user) {
      setLoading(false);
      return { ...result, role: null as string | null };
    }

    setSession(result.data.session);
    setUser(result.data.user);
    const role = await fetchRole(result.data.user.id);
    setLoading(false);
    return { ...result, role };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserRoles([]);
    setRoleLoaded(true);
  };

  const refreshRole = async () => user ? fetchRole(user.id) : null;

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, userRoles, roleLoaded, signUp, signIn, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};
