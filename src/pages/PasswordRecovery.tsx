import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(8, "Use at least 8 characters").max(128);

export default function PasswordRecovery() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isReset = pathname === "/reset-password";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(!isReset);

  useEffect(() => {
    if (!isReset) return;
    setRecoveryReady(hash.includes("type=recovery"));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
    });
    return () => subscription.unsubscribe();
  }, [hash, isReset]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    if (!isReset) {
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) {
        setSubmitting(false);
        toast({ title: "Enter a valid email", variant: "destructive" });
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${window.location.origin}/reset-password` });
      setSubmitting(false);
      if (error) toast({ title: "Reset request failed", description: error.message, variant: "destructive" });
      else toast({ title: "Check your email", description: "We sent a secure password reset link if an account exists for that address." });
      return;
    }
    const parsed = passwordSchema.safeParse(password);
    if (!recoveryReady || !parsed.success || password !== confirm) {
      setSubmitting(false);
      toast({ title: "Password not updated", description: !recoveryReady ? "Open the latest reset link from your email." : password !== confirm ? "Passwords do not match." : parsed.error?.issues[0]?.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setSubmitting(false);
    if (error) toast({ title: "Password update failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); navigate("/login/traveler", { replace: true }); }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-card">
        <Link to="/login/traveler" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
        <KeyRound className="mt-6 h-9 w-9 text-primary" />
        <h1 className="mt-3 text-2xl font-bold">{isReset ? "Set a new password" : "Forgot your password?"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{isReset ? "Choose a new password for your RoamYoo account." : "Enter your account email and we’ll send a secure reset link."}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {!isReset ? <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" maxLength={255} /> : <>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" autoComplete="new-password" maxLength={128} />
            <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" maxLength={128} />
          </>}
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Please wait…" : isReset ? "Update password" : "Send reset link"}</Button>
        </form>
      </section>
    </main>
  );
}