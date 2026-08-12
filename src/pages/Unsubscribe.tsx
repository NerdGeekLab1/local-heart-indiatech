import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailX, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "valid" | "already" | "invalid" | "done" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const validate = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setState("invalid");
          return;
        }
        setEmail(data.email ?? null);
        setState(data.alreadyUnsubscribed || data.already_unsubscribed ? "already" : "valid");
      } catch {
        setState("error");
      }
    };
    validate();
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    setBusy(false);
    setState(error ? "error" : "done");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20 px-4 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-8 sm:p-10 shadow-card text-center"
        >
          {state === "loading" && (
            <>
              <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-foreground">Checking your link…</h1>
            </>
          )}

          {state === "valid" && (
            <>
              <MailX className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">Unsubscribe from emails?</h1>
              <p className="mt-3 text-muted-foreground">
                {email ? <>We'll stop sending notification emails to <strong>{email}</strong>.</> : "We'll stop sending you notification emails."}{" "}
                Essential account and security emails will still be delivered.
              </p>
              <Button className="mt-6 rounded-full px-8" onClick={confirm} disabled={busy}>
                {busy ? "Unsubscribing…" : "Confirm unsubscribe"}
              </Button>
            </>
          )}

          {state === "already" && (
            <>
              <Check className="w-12 h-12 text-accent mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">You're already unsubscribed</h1>
              <p className="mt-3 text-muted-foreground">
                {email ?? "This address"} no longer receives notification emails from us.
              </p>
            </>
          )}

          {state === "done" && (
            <>
              <Check className="w-12 h-12 text-accent mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">Unsubscribed</h1>
              <p className="mt-3 text-muted-foreground">
                You won't receive further notification emails from RoamYoo.
              </p>
            </>
          )}

          {(state === "invalid" || state === "error") && (
            <>
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground">
                {state === "invalid" ? "This link isn't valid" : "Something went wrong"}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {state === "invalid"
                  ? "The unsubscribe link may have expired or already been used."
                  : "Please try again in a moment."}
              </p>
            </>
          )}

          <div className="mt-8">
            <Link to="/" className="text-sm text-primary hover:underline">
              Back to RoamYoo
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
