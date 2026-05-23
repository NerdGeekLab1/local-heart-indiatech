import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface Step { label: string; href: string; phase: string; }

const STEPS: Record<string, Step[]> = {
  admin: [
    { phase: "Phase 0", label: "Configure tracking scripts & secrets", href: "/dashboard/admin?tab=configuration" },
    { phase: "Phase 1", label: "Review host eligibility queue", href: "/dashboard/admin?tab=hosts" },
    { phase: "Phase 2", label: "Approve pending experiences", href: "/dashboard/admin?tab=experiences" },
    { phase: "Phase 2", label: "Set up feature flags for beta users", href: "/admin/feature-flags" },
    { phase: "Phase 3", label: "Publish subscription plans", href: "/dashboard/admin?tab=plans" },
  ],
  host: [
    { phase: "Phase 1", label: "Complete host eligibility application", href: "/host-eligibility" },
    { phase: "Phase 1", label: "Create your profile & bio", href: "/dashboard/host?tab=profile" },
    { phase: "Phase 2", label: "Add your first experience", href: "/dashboard/host?tab=experiences" },
    { phase: "Phase 2", label: "Upload a wedding event (optional)", href: "/dashboard/host?tab=weddings" },
    { phase: "Phase 3", label: "Respond to first booking request", href: "/dashboard/host?tab=bookings" },
  ],
  traveler: [
    { phase: "Phase 0", label: "Complete your traveler profile", href: "/dashboard/traveler?tab=profile" },
    { phase: "Phase 1", label: "Explore destinations & experiences", href: "/explore" },
    { phase: "Phase 2", label: "Book your first experience", href: "/experiences" },
    { phase: "Phase 3", label: "Join the Beta Wanderer program", href: "/beta-wanderer-apply" },
    { phase: "Phase 4", label: "Share a video review", href: "/dashboard/traveler?tab=reviews" },
  ],
};

export default function OnboardingChecklist() {
  const { user, userRole, loading } = useAuth();
  const [dismissed, setDismissed] = useLocalStorage<boolean>(`onboarding_dismissed_${user?.id ?? "x"}`, false);
  const [completed, setCompleted] = useLocalStorage<string[]>(`onboarding_completed_${user?.id ?? "x"}`, []);
  const [open, setOpen] = useState(true);

  if (loading || !user || dismissed) return null;
  const role = (userRole ?? "traveler") as keyof typeof STEPS;
  const steps = STEPS[role] ?? STEPS.traveler;
  const done = steps.filter(s => completed.includes(s.href)).length;
  if (done === steps.length) return null;

  const toggle = (href: string) => {
    setCompleted(completed.includes(href) ? completed.filter(h => h !== href) : [...completed, href]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border bg-card shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Getting started · {done}/{steps.length}</h3></div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>−</Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDismissed(true)}><X className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
          <div className="p-3 max-h-80 overflow-auto space-y-1">
            {steps.map(step => {
              const isDone = completed.includes(step.href);
              return (
                <div key={step.href} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50">
                  <button onClick={() => toggle(step.href)} className="mt-0.5 shrink-0">
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{step.phase}</div>
                    <Link to={step.href} className={`text-sm ${isDone ? "line-through text-muted-foreground" : "hover:text-primary"}`}>{step.label}</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      {!open && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-2 text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Setup ({done}/{steps.length})
        </motion.button>
      )}
    </AnimatePresence>
  );
}
