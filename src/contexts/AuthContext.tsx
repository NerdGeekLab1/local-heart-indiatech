import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
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

  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) {
      setUserRole("traveler");
      return "traveler";
    }
    const roles = (data ?? []).map((r: any) => r.role);
    // Priority: admin > host > traveler
    const role = roles.includes("admin")
      ? "admin"
      : roles.includes("host")
        ? "host"
        : roles[0] ?? "traveler";
    setUserRole(role);
    return role;
  };

  useEffect(() => {
    let mounted = true;

    const hydrateSession = async (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
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
        const isFreshAuth = event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED";
        if (isFreshAuth) setLoading(true);
        setTimeout(async () => {
          try {
            await fetchRole(session.user.id);
          } finally {
            if (mounted && isFreshAuth) setLoading(false);
          }
        }, 0);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => hydrateSession(session));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
      return result;
    }

    setSession(result.data.session);
    setUser(result.data.user);
    await fetchRole(result.data.user.id);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
