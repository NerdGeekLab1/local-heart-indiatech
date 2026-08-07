import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FeatureGate from "@/components/FeatureGate";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  title: string;
  status: string;
  host_id: string | null;
  created_at: string;
}

/**
 * Beta moderation tools — only visible when `advanced_moderation` flag is enabled
 * globally or granted to the current user. Admins can fast-approve, reject, or
 * shadow-hide experience requests. Hosts only see their own pending items.
 */
function BetaModerationToolsInner({ scope }: { scope: "admin" | "host" }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("experiences")
      .select("id,title,status,host_id,created_at")
      .in("status", ["pending", "suspended"])
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data ?? []) as Item[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, status: string, action: string) => {
    const prev = items.find((i) => i.id === id);
    const { error } = await supabase.from("experiences").update({ status }).eq("id", id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        entity_type: "experience",
        entity_id: id,
        action,
        previous_status: prev?.status ?? null,
        new_status: status,
        metadata: { via: "beta_moderation_tools", scope },
      });
    }
    toast({ title: `Marked ${status}` });
    load();
  };

  return (
    <section className="rounded-xl border border-primary/30 bg-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Beta Moderation Tools</h3>
        <Badge variant="outline" className="text-xs">Beta</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Fast-track approve, reject, or shadow-hide pending experiences. Every action is recorded in the audit log.
      </p>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nothing pending right now.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 rounded-md border bg-background p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{i.title}</div>
                <div className="text-xs text-muted-foreground">Status: {i.status}</div>
              </div>
              {scope === "admin" && (
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => update(i.id, "approved", "approve")}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update(i.id, "suspended", "suspend")}>
                    <EyeOff className="w-3.5 h-3.5 mr-1" /> Suspend
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => update(i.id, "rejected", "reject")}>
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function BetaModerationTools(props: { scope: "admin" | "host" }) {
  return (
    <FeatureGate flag="advanced_moderation">
      <BetaModerationToolsInner {...props} />
    </FeatureGate>
  );
}
