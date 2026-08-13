import { useEffect, useState } from "react";
import { CheckCircle, Circle, Clock, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type OnboardingStatus = {
  application_status: string | null;
  application_submitted: boolean;
  email_confirmed: boolean;
  admin_approved: boolean;
  onboarding_complete: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  assigned_role: string | null;
  role_matches_approval: boolean | null;
};


const HostOnboarding = () => {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: requestError } = await (supabase.rpc as any)("get_host_onboarding_status");
      if (!active) return;
      setStatus(Array.isArray(data) ? data[0] ?? null : data ?? null);
      setError(requestError?.message ?? "");
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const steps = [
    { label: "Application submitted", done: status?.application_submitted },
    { label: "Email confirmed", done: status?.email_confirmed },
    { label: "Application approved", done: status?.admin_approved },
    { label: "Onboarding complete", done: status?.onboarding_complete },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-24">
      <section className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold text-primary">Host portal</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Your onboarding status</h1>
        <p className="mt-2 text-muted-foreground">Follow your host application from submission to portal activation.</p>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card">
          {loading ? (
            <div className="flex items-center gap-3 text-muted-foreground"><Clock className="h-5 w-5 animate-pulse" /> Loading your status…</div>
          ) : error ? (
            <p className="text-destructive">We couldn't load your application status. {error}</p>
          ) : !status ? (
            <div>
              <p className="font-semibold text-foreground">No host application found</p>
              <Button asChild className="mt-4"><Link to="/become-host">Start an application</Link></Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                <span className="font-semibold text-foreground">Current status</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium capitalize text-primary">{status.application_status?.replace(/_/g, " ")}</span>
              </div>
              <ol className="mt-6 space-y-5">
                {steps.map((step, index) => (
                  <li key={step.label} className="flex items-center gap-3">
                    {step.done ? <CheckCircle className="h-6 w-6 text-accent" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                    <div>
                      <p className={step.done ? "font-medium text-foreground" : "text-muted-foreground"}>{step.label}</p>
                      {!step.done && index === steps.findIndex(item => !item.done) && <p className="text-xs text-muted-foreground">In progress</p>}
                    </div>
                  </li>
                ))}
              </ol>
              {status.admin_approved && !status.onboarding_complete && (
                <Button asChild className="mt-8 w-full"><Link to="/dashboard/host">Continue in Host portal</Link></Button>
              )}
            </>
          )}
        </div>
        <Button asChild variant="ghost" className="mt-4"><Link to="/login/host"><LogIn className="mr-2 h-4 w-4" />Host sign in</Link></Button>
      </section>
    </main>
  );
};

export default HostOnboarding;