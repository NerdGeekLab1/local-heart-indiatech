import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Crown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditDialog, { FieldConfig } from "@/components/EditDialog";

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_cycle: string;
  badge: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

const planFields: FieldConfig[] = [
  { key: "name", label: "Plan Name", required: true },
  { key: "slug", label: "Slug (unique)", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "price", label: "Price", type: "number", required: true },
  { key: "currency", label: "Currency", type: "select", options: ["INR", "USD", "EUR"] },
  { key: "billing_cycle", label: "Billing Cycle", type: "select", options: ["monthly", "quarterly", "yearly"] },
  { key: "badge", label: "Badge (e.g. Popular)" },
  { key: "features_csv", label: "Features (comma separated)", type: "textarea", required: true },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

const SubscriptionPlansTab = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; plan?: Plan }>({ open: false });

  const load = async () => {
    const { data } = await supabase.from("subscription_plans").select("*").order("sort_order");
    setPlans((data || []) as Plan[]);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: any) => {
    const features = (form.features_csv || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const payload = {
      slug: form.slug,
      name: form.name,
      description: form.description || null,
      price: Number(form.price) || 0,
      currency: form.currency || "INR",
      billing_cycle: form.billing_cycle || "monthly",
      badge: form.badge || null,
      features,
      sort_order: Number(form.sort_order) || 0,
    };
    if (dialog.plan) {
      const { error } = await supabase.from("subscription_plans").update(payload).eq("id", dialog.plan.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Plan updated ✓" });
    } else {
      const { error } = await supabase.from("subscription_plans").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Plan created ✓" });
    }
    load();
  };

  const handleDelete = async () => {
    if (!dialog.plan) return;
    await supabase.from("subscription_plans").delete().eq("id", dialog.plan.id);
    toast({ title: "Plan deleted" });
    load();
  };

  const toggleActive = async (p: Plan) => {
    await supabase.from("subscription_plans").update({ is_active: !p.is_active }).eq("id", p.id);
    setPlans(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" /> Subscription Plans
          </h2>
          <p className="text-sm text-muted-foreground">Create, edit and toggle the tiers shown on the Membership page.</p>
        </div>
        <Button className="rounded-full gap-2" onClick={() => setDialog({ open: true })}>
          <Plus className="w-4 h-4" /> New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.id} className={`rounded-xl bg-card p-5 shadow-card border ${p.is_active ? "border-border" : "border-dashed border-muted opacity-70"}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                  {p.badge && <Badge variant="secondary">{p.badge}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{p.slug} · {p.billing_cycle}</p>
              </div>
              <p className="text-xl font-bold text-primary">{p.currency} {p.price}</p>
            </div>
            {p.description && <p className="text-sm text-muted-foreground mb-3">{p.description}</p>}
            <ul className="text-xs text-muted-foreground space-y-1 mb-4 max-h-32 overflow-auto">
              {p.features.map((f, i) => <li key={i}>• {f}</li>)}
            </ul>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-full gap-1 flex-1"
                onClick={() => setDialog({ open: true, plan: p })}>
                <Edit className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" className="rounded-full gap-1"
                onClick={() => toggleActive(p)}>
                {p.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <EditDialog
        open={dialog.open}
        title={dialog.plan ? `Edit ${dialog.plan.name}` : "New Subscription Plan"}
        fields={planFields}
        initialData={dialog.plan ? {
          ...dialog.plan,
          features_csv: (dialog.plan.features || []).join(", "),
        } : { currency: "INR", billing_cycle: "monthly", sort_order: plans.length + 1 }}
        onSave={handleSave}
        onDelete={dialog.plan ? handleDelete : undefined}
        onClose={() => setDialog({ open: false })}
      />
    </div>
  );
};

export default SubscriptionPlansTab;
