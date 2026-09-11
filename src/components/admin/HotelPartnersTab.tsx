import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Building2, Hotel, Loader2, Plus } from "lucide-react";

interface HotelRow {
  id: string;
  hotel_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string;
  state: string | null;
  property_type: string;
  room_count: number;
  website: string | null;
  description: string | null;
  commission_pct: number;
  status: string;
  review_notes: string | null;
  created_at: string;
}

interface RateRow {
  id: string;
  hotel_id: string;
  room_type: string;
  occupancy: number;
  rate_inr: number;
  net_rate_inr: number | null;
  meal_plan: string;
  min_nights: number;
  cancellation_policy: string | null;
  terms: string | null;
  is_active: boolean;
}

interface LeadRow {
  id: string;
  hotel_id: string;
  guest_name: string;
  nights: number;
  guests: number;
  check_in: string | null;
  value_inr: number;
  commission_inr: number;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  under_review: "bg-accent/10 text-accent",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
  suspended: "bg-destructive/10 text-destructive",
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Admin queue for hotel partnership applications, their rates/terms and per-hotel performance. */
export default function HotelPartnersTab() {
  const { toast } = useToast();
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [rates, setRates] = useState<RateRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [commission, setCommission] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({ guest_name: "", nights: "2", guests: "2", check_in: "", value_inr: "" });

  const load = async () => {
    setLoading(true);
    const [{ data: h }, { data: r }, { data: l }] = await Promise.all([
      supabase.from("hotel_partners").select("*").order("created_at", { ascending: false }),
      supabase.from("hotel_rate_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("hotel_leads").select("*").order("created_at", { ascending: false }),
    ]);
    setHotels((h as HotelRow[]) || []);
    setRates((r as RateRow[]) || []);
    setLeads((l as LeadRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-hotel-partners")
      .on("postgres_changes", { event: "*", schema: "public", table: "hotel_partners" }, () => { void load(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "hotel_rate_plans" }, () => { void load(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "hotel_leads" }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const review = async (id: string, status: string) => {
    setBusy(id);
    const raw = commission[id];
    const { error } = await supabase.rpc("review_hotel_partner", {
      _hotel_id: id,
      _status: status,
      _notes: notes[id] || null,
      _commission: raw ? Number(raw) : null,
    });
    setBusy(null);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Hotel ${status.replace("_", " ")}` });
    void load();
  };

  const addLead = async (hotelId: string, commissionPct: number) => {
    if (!leadForm.guest_name.trim()) { toast({ title: "Guest name required", variant: "destructive" }); return; }
    const value = Math.max(0, Number(leadForm.value_inr) || 0);
    setBusy(hotelId);
    const { error } = await supabase.from("hotel_leads").insert({
      hotel_id: hotelId,
      guest_name: leadForm.guest_name.trim().slice(0, 120),
      nights: Math.max(1, Number(leadForm.nights) || 1),
      guests: Math.max(1, Number(leadForm.guests) || 1),
      check_in: leadForm.check_in || null,
      value_inr: value,
      commission_inr: Math.round((value * commissionPct) / 100),
      status: "enquiry",
    });
    setBusy(null);
    if (error) { toast({ title: "Could not add enquiry", description: error.message, variant: "destructive" }); return; }
    setLeadForm({ guest_name: "", nights: "2", guests: "2", check_in: "", value_inr: "" });
    toast({ title: "Enquiry sent to the hotel" });
    void load();
  };

  const visible = useMemo(() => hotels.filter(h =>
    (statusFilter === "all" || h.status === statusFilter) &&
    (!search.trim() || `${h.hotel_name} ${h.city} ${h.contact_email}`.toLowerCase().includes(search.toLowerCase()))
  ), [hotels, statusFilter, search]);

  const totals = useMemo(() => ({
    pending: hotels.filter(h => h.status === "pending").length,
    approved: hotels.filter(h => h.status === "approved").length,
    rooms: hotels.filter(h => h.status === "approved").reduce((s, h) => s + h.room_count, 0),
    commission: leads.filter(l => l.status === "confirmed" || l.status === "completed").reduce((s, l) => s + Number(l.commission_inr || 0), 0),
  }), [hotels, leads]);

  return (
    <section aria-labelledby="hotel-partners-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="hotel-partners-heading" className="text-xl font-bold text-foreground flex items-center gap-2">
            <Hotel className="w-5 h-5 text-primary" /> Hotel Partnerships ({totals.pending} pending)
          </h2>
          <p className="text-sm text-muted-foreground">Approve properties, set commission, review rates and send enquiries.</p>
        </div>
        <div className="flex gap-2">
          <Input className="h-9 w-48" placeholder="Search hotels…" value={search} onChange={e => setSearch(e.target.value)} />
          <select aria-label="Filter hotel status" className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="under_review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Pending", value: String(totals.pending) },
          { label: "Live partners", value: String(totals.approved) },
          { label: "Rooms on platform", value: String(totals.rooms) },
          { label: "Commission earned", value: inr(totals.commission) },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-card p-4 shadow-card">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 rounded-lg bg-card p-8 text-center shadow-card"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-lg bg-card p-8 text-center shadow-card">
          <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium text-foreground">No hotels here</p>
          <p className="text-sm text-muted-foreground">Applications appear as soon as a property applies.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map(h => {
            const hRates = rates.filter(r => r.hotel_id === h.id);
            const hLeads = leads.filter(l => l.hotel_id === h.id);
            const confirmed = hLeads.filter(l => l.status === "confirmed" || l.status === "completed");
            const open = expanded === h.id;
            return (
              <div key={h.id} className="rounded-lg bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{h.hotel_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.property_type} · {h.city}{h.state ? `, ${h.state}` : ""} · {h.room_count} rooms · {h.contact_name} · {h.contact_email}{h.contact_phone ? ` · ${h.contact_phone}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {hRates.length} rate plan(s) · {hLeads.length} enquiries · {confirmed.length} confirmed · commission {Number(h.commission_pct)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[h.status] || "bg-secondary text-muted-foreground"}`}>{h.status.replace("_", " ")}</span>
                    <Button size="sm" variant="outline" onClick={() => setExpanded(open ? null : h.id)}>{open ? "Hide" : "Details"}</Button>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 space-y-4">
                    {h.description && <p className="text-sm text-muted-foreground">{h.description}</p>}
                    {h.website && <a className="text-sm text-primary" href={h.website} target="_blank" rel="noopener noreferrer">{h.website}</a>}

                    <div>
                      <p className="text-sm font-semibold text-foreground">Rates & terms</p>
                      {hRates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No rates submitted yet.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {hRates.map(r => (
                            <div key={r.id} className="rounded-md bg-secondary/40 p-3 text-sm">
                              <p className="font-medium text-foreground">{r.room_type} · sleeps {r.occupancy} · {inr(Number(r.rate_inr))}/night{r.net_rate_inr ? ` (net ${inr(Number(r.net_rate_inr))})` : ""}</p>
                              <p className="text-xs text-muted-foreground">{r.meal_plan.replace("_", " ")} · min {r.min_nights} night(s) · {r.is_active ? "active" : "paused"}</p>
                              {r.cancellation_policy && <p className="text-xs text-muted-foreground">Cancellation: {r.cancellation_policy}</p>}
                              {r.terms && <p className="text-xs text-muted-foreground">Terms: {r.terms}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {h.status === "approved" && (
                      <div className="rounded-md bg-secondary/40 p-3">
                        <p className="text-sm font-semibold text-foreground">Send an enquiry to this hotel</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-5">
                          <Input className="h-9" placeholder="Guest name" value={leadForm.guest_name} onChange={e => setLeadForm({ ...leadForm, guest_name: e.target.value })} />
                          <Input className="h-9" type="date" aria-label="Check-in" value={leadForm.check_in} onChange={e => setLeadForm({ ...leadForm, check_in: e.target.value })} />
                          <Input className="h-9" type="number" min={1} aria-label="Nights" value={leadForm.nights} onChange={e => setLeadForm({ ...leadForm, nights: e.target.value })} />
                          <Input className="h-9" type="number" min={1} aria-label="Guests" value={leadForm.guests} onChange={e => setLeadForm({ ...leadForm, guests: e.target.value })} />
                          <Input className="h-9" type="number" min={0} placeholder="Stay value ₹" value={leadForm.value_inr} onChange={e => setLeadForm({ ...leadForm, value_inr: e.target.value })} />
                        </div>
                        <Button size="sm" className="mt-2" disabled={busy === h.id} onClick={() => addLead(h.id, Number(h.commission_pct))}>
                          <Plus className="w-4 h-4 mr-1" /> Add enquiry
                        </Button>
                      </div>
                    )}

                    {hLeads.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Enquiries</p>
                        <div className="mt-2 space-y-2">
                          {hLeads.map(l => (
                            <div key={l.id} className="rounded-md bg-secondary/40 p-3 text-sm flex flex-wrap items-center justify-between gap-2">
                              <span className="text-foreground">
                                {l.guest_name} · {l.check_in ? new Date(l.check_in).toLocaleDateString() : "flexible"} · {l.nights}n · {inr(Number(l.value_inr))} ({inr(Number(l.commission_inr))} commission)
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{l.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {h.review_notes && <p className="mt-3 text-sm text-muted-foreground">Notes: {h.review_notes}</p>}

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Input className="h-9" placeholder="Review notes (optional)…" value={notes[h.id] || ""} onChange={e => setNotes(p => ({ ...p, [h.id]: e.target.value }))} />
                  <Input className="h-9 sm:w-40" type="number" min={0} max={100} placeholder={`Commission % (${Number(h.commission_pct)})`}
                    value={commission[h.id] || ""} onChange={e => setCommission(p => ({ ...p, [h.id]: e.target.value }))} />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy === h.id} onClick={() => review(h.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" disabled={busy === h.id} onClick={() => review(h.id, "under_review")}>Under review</Button>
                    <Button size="sm" variant="destructive" disabled={busy === h.id} onClick={() => review(h.id, "rejected")}>Reject</Button>
                    {h.status === "approved" && <Button size="sm" variant="outline" disabled={busy === h.id} onClick={() => review(h.id, "suspended")}>Suspend</Button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
