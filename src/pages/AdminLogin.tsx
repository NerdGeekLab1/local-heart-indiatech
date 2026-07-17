import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const safeAdminNext = (value: string | null) => {
  if (!value) return "/dashboard/admin";
  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith("/admin") || decoded.startsWith("/dashboard/admin") ? decoded : "/dashboard/admin";
  } catch {
    return "/dashboard/admin";
  }
};

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, userRole, loading, signIn, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => safeAdminNext(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    if (!loading && user && userRole === "admin") {
      navigate(nextPath, { replace: true });
    }
  }, [loading, navigate, nextPath, user, userRole]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: "Enter admin email and password", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data, error } = await signIn(email, password);
    setSubmitting(false);

    if (error || !data?.user) {
      toast({ title: "Admin sign-in failed", description: error?.message || "Please check your credentials.", variant: "destructive" });
      return;
    }

    const roles = await import("@/integrations/supabase/client").then(({ supabase }) =>
      supabase.from("user_roles").select("role").eq("user_id", data.user.id)
    );
    const isAdmin = (roles.data || []).some((row: any) => row.role === "admin");

    if (!isAdmin) {
      await signOut();
      toast({ title: "Admin access required", description: "Use a traveler or host dashboard for non-admin accounts.", variant: "destructive" });
      return;
    }

    toast({ title: "Admin signed in" });
    navigate(nextPath, { replace: true });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
              <p className="text-sm text-muted-foreground">Secure access for Travelista operations.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Admin email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={handleLogin} disabled={submitting || loading} className="w-full rounded-full">
              {submitting || loading ? "Checking access..." : "Sign in to Admin"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminLogin;