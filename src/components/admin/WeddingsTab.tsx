import { useEffect, useState } from "react";
import { Heart, Plus, Edit, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EditDialog, { FieldConfig } from "@/components/EditDialog";

interface Wedding {
  id: string;
  host_id: string;
  couple_names: string;
  wedding_date: string;
  venue: string | null;
  city: string;
  description: string | null;
  highlights: string[];
  cover_image_url: string | null;
  cuisines: string[];
  guest_count: number;
  contact_phone: string | null;
  is_public: boolean;
  status: string;
}

const fields: FieldConfig[] = [
  { key: "couple_names", label: "Couple Names (e.g. Aanya & Rohan)", required: true },
  { key: "wedding_date", label: "Wedding Date", type: "text", required: true },
  { key: "venue", label: "Venue" },
  { key: "city", label: "City", required: true },
  { key: "description", label: "Description", type: "textarea" },
  { key: "highlights_csv", label: "Highlights (comma separated)", type: "textarea" },
  { key: "cuisines_csv", label: "Cuisines (comma separated)" },
  { key: "guest_count", label: "Guest Count", type: "number" },
  { key: "contact_phone", label: "Contact Phone" },
  { key: "cover_image_url", label: "Cover Image URL" },
  { key: "is_public", label: "Public Listing", type: "select", options: ["true", "false"] },
  { key: "status", label: "Status", type: "select", options: ["upcoming", "completed", "cancelled"] },
];

interface Props {
  /** When admin=true, show all weddings instead of only the current host's */
  admin?: boolean;
}

const WeddingsTab = ({ admin = false }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Wedding[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; item?: Wedding }>({ open: false });

  const load = async () => {
    let q = supabase.from("wedding_events").select("*").order("wedding_date", { ascending: true });
    if (!admin && user) q = q.eq("host_id", user.id);
    const { data } = await q;
    setItems((data || []) as Wedding[]);
  };

  useEffect(() => { load(); }, [user, admin]);

  const handleSave = async (form: any) => {
    if (!user) return;
    const payload = {
      host_id: user.id,
      couple_names: form.couple_names,
      wedding_date: form.wedding_date,
      venue: form.venue || null,
      city: form.city,
      description: form.description || null,
      highlights: (form.highlights_csv || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      cuisines: (form.cuisines_csv || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      guest_count: Number(form.guest_count) || 0,
      contact_phone: form.contact_phone || null,
      cover_image_url: form.cover_image_url || null,
      is_public: form.is_public === "true" || form.is_public === true,
      status: form.status || "upcoming",
    };
    if (dialog.item) {
      const { error } = await supabase.from("wedding_events").update(payload).eq("id", dialog.item.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Wedding updated ✓" });
    } else {
      const { error } = await supabase.from("wedding_events").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Wedding added 💖" });
    }
    load();
  };

  const handleDelete = async () => {
    if (!dialog.item) return;
    await supabase.from("wedding_events").delete().eq("id", dialog.item.id);
    toast({ title: "Removed" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" /> {admin ? "All Weddings" : "Upcoming Weddings"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {admin ? "Wedding events across all hosts." : "Add wedding events you can host or coordinate for travelers."}
          </p>
        </div>
        {!admin && (
          <Button className="rounded-full gap-2" onClick={() => setDialog({ open: true })}>
            <Plus className="w-4 h-4" /> Add Wedding
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-card p-10 text-center shadow-card">
          <Heart className="w-10 h-10 text-primary/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No wedding events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(w => (
            <div key={w.id} className="rounded-xl bg-card shadow-card overflow-hidden">
              {w.cover_image_url && (
                <div className="h-32 w-full bg-secondary" style={{ backgroundImage: `url(${w.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{w.couple_names}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {w.wedding_date}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {w.city}</span>
                      {w.guest_count > 0 && <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {w.guest_count}</span>}
                    </div>
                  </div>
                  <Badge variant={w.is_public ? "default" : "secondary"}>{w.is_public ? "Public" : "Private"}</Badge>
                </div>
                {w.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{w.description}</p>}
                {w.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {w.highlights.slice(0, 4).map((h, i) => (
                      <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{h}</span>
                    ))}
                  </div>
                )}
                {!admin && (
                  <Button size="sm" variant="outline" className="rounded-full gap-1"
                    onClick={() => setDialog({ open: true, item: w })}>
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <EditDialog
        open={dialog.open}
        title={dialog.item ? "Edit Wedding" : "Add Wedding Event"}
        fields={fields}
        initialData={dialog.item ? {
          ...dialog.item,
          highlights_csv: (dialog.item.highlights || []).join(", "),
          cuisines_csv: (dialog.item.cuisines || []).join(", "),
          is_public: String(dialog.item.is_public),
        } : { status: "upcoming", is_public: "false" }}
        onSave={handleSave}
        onDelete={dialog.item ? handleDelete : undefined}
        onClose={() => setDialog({ open: false })}
      />
    </div>
  );
};

export default WeddingsTab;
