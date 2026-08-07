import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormControl } from "@/hooks/useFormControl";

export default function FormAvailabilityGate({ formKey, children }: { formKey: string; children: ReactNode }) {
  const { enabled, loading, message } = useFormControl(formKey);
  if (loading) return <div className="min-h-screen bg-background" />;
  if (enabled) return <>{children}</>;
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-lg rounded-lg border border-border bg-card p-8 text-center shadow-card">
        <Lock className="mx-auto h-9 w-9 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Form temporarily unavailable</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <Button asChild className="mt-6"><Link to="/">Return home</Link></Button>
      </section>
    </main>
  );
}