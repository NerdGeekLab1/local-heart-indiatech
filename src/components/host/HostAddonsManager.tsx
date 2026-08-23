import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HostAddon {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  price: number;
  is_active: boolean;
}

const blank = { name: "", emoji: "🍷", description: "", price: 0 };

/** Ready-made add-ons hosts can drop in with one tap, then tweak price/description. */
export const addonPresets = [
  { emoji: "🍷", name: "Wine bottle", description: "A chilled local wine waiting in the room", price: 1500 },
  { emoji: "🎂", name: "Celebration cake", description: "Fresh cake for a birthday or anniversary", price: 900 },
  { emoji: "💐", name: "Fresh flowers", description: "Hand-tied seasonal bouquet on arrival", price: 600 },
  { emoji: "🍮", name: "Dessert platter", description: "Regional sweets and desserts for the table", price: 750 },
  { emoji: "🚗", name: "Airport pickup", description: "Private pickup and drop from the airport or station", price: 1200 },
  { emoji: "🍳", name: "Home-cooked breakfast", description: "Traditional breakfast made by the host family", price: 400 },
  { emoji: "📸", name: "Photo session", description: "One-hour local photoshoot with edited photos", price: 2500 },
  { emoji: "💆", name: "Ayurvedic massage", description: "In-house relaxation massage after your travel day", price: 1800 },
] as const;

/**
 * Hosts curate the special-request add-ons (wine, cake, photography…) travelers
 * can pick during booking. Prices here drive the booking total — no demo values.
 */
export default function HostAddonsManager({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [addons, setAddons] = useState<HostAddon[]>([]);
  const [draft, setDraft] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("host_addons").select("*").eq("host_id", userId).order("created_at");
    setAddons((data as HostAddon[]) || []);
  };

  useEffect(() => {
    void load();
    const channel = supabase.channel(`host-addons-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "host_addons", filter: `host_id=eq.${userId}` }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const add = async () => {
    if (!draft.name.trim()) { toast({ title: "Name the add-on first", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("host_addons").insert({
      host_id: userId,
      name: draft.name.trim(),
      emoji: draft.emoji || "✨",
      description: draft.description.trim() || null,
      price: Number(draft.price) || 0,
    });
    setSaving(false);
    if (error) { toast({ title: "Couldn't add", description: error.message, variant: "destructive" }); return; }
    setDraft(blank);
    toast({ title: "Add-on published ✅", description: "Travelers can now request it while booking." });
    void load();
  };

  const patch = async (id: string, values: Partial<HostAddon>) => {
    setAddons(current => current.map(a => (a.id === id ? { ...a, ...values } : a)));
    const { error } = await supabase.from("host_addons").update(values).eq("id", id);
    if (error) toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("host_addons").delete().eq("id", id);
    if (error) { toast({ title: "Couldn't delete", description: error.message, variant: "destructive" }); return; }
    setAddons(current => current.filter(a => a.id !== id));
  };

  return (
    <section className="space-y-5" data-testid="host-addons-manager">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" /> Special requests &amp; add-ons
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Offer extras like a wine bottle, birthday cake or airport pickup. Travelers see these — with your prices — on the booking page.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="grid gap-3 sm:grid-cols-[70px_1fr_140px_120px]">
          <Input aria-label="Emoji" value={draft.emoji} onChange={e => setDraft(p => ({ ...p, emoji: e.target.value }))} className="text-center" />
          <Input aria-label="Add-on name" placeholder="Wine bottle" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} />
          <Input aria-label="Price" type="number" min={0} placeholder="Price ₹" value={draft.price} onChange={e => setDraft(p => ({ ...p, price: Number(e.target.value) }))} />
          <Button onClick={add} disabled={saving} className="rounded-full gap-1"><Plus className="h-4 w-4" /> Add</Button>
        </div>
        <Input className="mt-3" aria-label="Description" placeholder="Short description travelers will read (optional)"
          value={draft.description} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} />
      </div>

      {addons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No add-ons yet — travelers will see no special requests for you.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Add-on</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 text-right">Price (₹)</th>
                <th className="px-4 py-2 text-center">Offered</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {addons.map(addon => (
                <tr key={addon.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">
                    <span className="mr-2">{addon.emoji}</span>
                    <input className="bg-transparent outline-none" value={addon.name}
                      onChange={e => patch(addon.id, { name: e.target.value })} aria-label={`${addon.name} name`} />
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    <input className="w-full bg-transparent outline-none" value={addon.description || ""} placeholder="—"
                      onChange={e => patch(addon.id, { description: e.target.value })} aria-label={`${addon.name} description`} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <input type="number" min={0} className="w-24 bg-transparent text-right outline-none" value={Number(addon.price)}
                      onChange={e => patch(addon.id, { price: Number(e.target.value) })} aria-label={`${addon.name} price`} />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Switch checked={addon.is_active} onCheckedChange={value => patch(addon.id, { is_active: value })} aria-label={`Offer ${addon.name}`} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(addon.id)} aria-label={`Delete ${addon.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Save className="h-3 w-3" /> Edits save as you type.</p>
    </section>
  );
}
