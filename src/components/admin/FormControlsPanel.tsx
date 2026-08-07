import { useEffect, useState } from "react";
import { ExternalLink, FileInput } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FormControlRow {
  id: string;
  form_key: string;
  label: string;
  route: string;
  category: string;
  audience: string;
  description: string | null;
  enabled: boolean;
}

export default function FormControlsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<FormControlRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("form_controls").select("*").order("category").order("label").then(({ data, error }) => {
      if (error) toast({ title: "Could not load form controls", description: error.message, variant: "destructive" });
      setRows((data ?? []) as FormControlRow[]);
      setLoading(false);
    });
  }, [toast]);

  const toggle = async (row: FormControlRow, enabled: boolean) => {
    const { error } = await supabase.from("form_controls").update({ enabled, updated_by: user?.id ?? null }).eq("id", row.id);
    if (error) { toast({ title: "Toggle failed", description: error.message, variant: "destructive" }); return; }
    setRows(current => current.map(item => item.id === row.id ? { ...item, enabled } : item));
    toast({ title: `${row.label} ${enabled ? "enabled" : "disabled"}` });
  };

  return (
    <section className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
      <header className="p-5 border-b border-border">
        <h3 className="font-bold flex items-center gap-2"><FileInput className="h-4 w-4 text-primary" /> Form availability</h3>
        <p className="mt-1 text-sm text-muted-foreground">Enable or pause public, account, beta, booking, and support forms without a deployment.</p>
      </header>
      {loading ? <p className="p-6 text-sm text-muted-foreground">Loading forms…</p> : (
        <div className="divide-y divide-border">
          {rows.map(row => (
            <div key={row.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">{row.label}</p>
                  <span className="text-[10px] uppercase font-bold rounded bg-secondary px-2 py-0.5 text-muted-foreground">{row.audience}</span>
                  <span className="text-[10px] uppercase font-bold rounded bg-primary/10 px-2 py-0.5 text-primary">{row.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{row.description}</p>
              </div>
              <Button asChild size="icon" variant="ghost" title={`Open ${row.label}`}><Link to={row.route.replace(":id", "")}><ExternalLink className="h-4 w-4" /></Link></Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{row.enabled ? "Enabled" : "Paused"}</span>
                <Switch checked={row.enabled} onCheckedChange={enabled => toggle(row, enabled)} aria-label={`Toggle ${row.label}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}