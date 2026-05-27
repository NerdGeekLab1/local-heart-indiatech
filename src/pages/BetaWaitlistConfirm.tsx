import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "ok"; email: string; full_name: string | null; plan_interest: string | null; status: string; confirmed_at: string | null }
  | { kind: "invalid" };

export default function BetaWaitlistConfirm() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) { setState({ kind: "missing" }); return; }
    (async () => {
      const { data, error } = await supabase.rpc("confirm_beta_waitlist", { _token: token });
      if (error || !data || data.length === 0) {
        setState({ kind: "invalid" });
        return;
      }
      const row = data[0] as any;
      setState({ kind: "ok", email: row.email, full_name: row.full_name, plan_interest: row.plan_interest, status: row.status, confirmed_at: row.confirmed_at });
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-xl">
        <div className="rounded-2xl border bg-card p-8 text-center">
          {state.kind === "loading" && (
            <><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" /><p>Confirming your spot…</p></>
          )}
          {state.kind === "missing" && (
            <>
              <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Missing confirmation token</h1>
              <p className="text-muted-foreground mb-6">This link doesn't include a confirmation token. Please use the link from your email.</p>
              <Button asChild><Link to="/beta-waitlist">Back to waitlist</Link></Button>
            </>
          )}
          {state.kind === "invalid" && (
            <>
              <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">Couldn't confirm your spot</h1>
              <p className="text-muted-foreground mb-6">That link is invalid or has expired. Try signing up again.</p>
              <Button asChild><Link to="/beta-waitlist">Join the waitlist</Link></Button>
            </>
          )}
          {state.kind === "ok" && (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="w-4 h-4" /><span className="text-xs font-medium">Beta access</span>
              </div>
              <CheckCircle2 className="w-14 h-14 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">You're confirmed{state.full_name ? `, ${state.full_name.split(" ")[0]}` : ""}!</h1>
              <p className="text-muted-foreground mb-6">We've confirmed <strong>{state.email}</strong> for the Travelista beta.</p>

              <div className="grid grid-cols-2 gap-3 text-left mb-6">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Plan tier</div>
                  <Badge variant="outline" className="capitalize">{state.plan_interest || "explorer"}</Badge>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <Badge variant="default" className="capitalize">{state.status}</Badge>
                </div>
                {state.confirmed_at && (
                  <div className="rounded-lg border p-3 col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Confirmed on</div>
                    <div className="text-sm">{new Date(state.confirmed_at).toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <Button asChild><Link to="/signup">Create your account</Link></Button>
                <Button asChild variant="outline"><Link to="/explore">Explore experiences</Link></Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
