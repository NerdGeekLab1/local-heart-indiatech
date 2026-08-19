import { useEffect, useState } from "react";
import { Calendar, Check, CircleCheck, MessageCircle, Plus, Receipt, Sparkles, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const inr = (value: unknown) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const dayCount = (start?: string, end?: string) => {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(diff / 86_400_000));
};

/** Pop-out detail view so a host sees exactly what to prepare for a booking. */
export default function BookingDetailDialog({
  booking,
  onOpenChange,
  onStatus,
  onInvoice,
  onChat,
  onRequestsSaved,
}: {
  booking: any | null;
  onOpenChange: (open: boolean) => void;
  onStatus: (id: string, status: string) => void;
  onInvoice: (booking: any) => void;
  onChat?: (travelerId: string, name: string) => void;
  onRequestsSaved?: (booking: any) => void;
}) {
  const [traveler, setTraveler] = useState<{ first_name?: string; last_name?: string; avatar_url?: string } | null>(null);
  const [proposed, setProposed] = useState<string[]>([]);
  const [provided, setProvided] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [savingRequests, setSavingRequests] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!booking?.traveler_id) { setTraveler(null); return; }
    let active = true;
    supabase.rpc("get_public_profile", { _id: booking.traveler_id }).then(({ data }) => {
      if (active) setTraveler((data as any[])?.[0] ?? null);
    });
    return () => { active = false; };
  }, [booking?.traveler_id]);

  useEffect(() => {
    setProposed(booking?.host_proposed_requests || []);
    setProvided(booking?.provided_requests || []);
    setDraft("");
  }, [booking?.id, booking?.host_proposed_requests, booking?.provided_requests]);

  if (!booking) return null;
  const days = dayCount(booking.start_date, booking.end_date);
  const requests: string[] = booking.special_requests || [];
  const travelerName = traveler ? `${traveler.first_name || ""} ${traveler.last_name || ""}`.trim() || "Traveler" : "Traveler";
  const toggleProvided = (request: string) => setProvided(current => current.includes(request) ? current.filter(item => item !== request) : [...current, request]);
  const addProposal = () => {
    const value = draft.trim();
    if (!value || proposed.includes(value)) return;
    setProposed(current => [...current, value]);
    setDraft("");
  };
  const saveRequests = async () => {
    setSavingRequests(true);
    const { error } = await supabase.from("bookings").update({
      host_proposed_requests: proposed,
      provided_requests: provided,
    } as any).eq("id", booking.id);
    setSavingRequests(false);
    if (error) {
      toast({ title: "Couldn't save preparation details", description: error.message, variant: "destructive" });
      return;
    }
    const updated = { ...booking, host_proposed_requests: proposed, provided_requests: provided };
    onRequestsSaved?.(updated);
    toast({ title: "Preparation details saved" });
  };

  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="host-booking-detail">
        <DialogHeader>
          <DialogTitle>Booking #{String(booking.id).slice(0, 8)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
            {traveler?.avatar_url
              ? <img src={traveler.avatar_url} alt={travelerName} className="h-10 w-10 rounded-full object-cover" />
              : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{travelerName.charAt(0)}</div>}
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{travelerName}</p>
              <p className="text-xs capitalize text-muted-foreground">Status: {booking.status}</p>
            </div>
            {onChat && booking.traveler_id && (
              <Button size="sm" variant="outline" className="ml-auto gap-1 rounded-full"
                onClick={() => onChat(booking.traveler_id, travelerName)}>
                <MessageCircle className="h-3.5 w-3.5" /> Chat
              </Button>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <div><dt className="text-xs text-muted-foreground">Dates</dt><dd className="font-medium text-foreground"><Calendar className="mr-1 inline h-3 w-3" />{booking.start_date} → {booking.end_date}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Days</dt><dd className="font-medium text-foreground">{days}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Guests</dt><dd className="font-medium text-foreground"><Users className="mr-1 inline h-3 w-3" />{booking.guests ?? 1}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Total</dt><dd className="font-bold text-foreground">{inr(booking.total_price)}</dd></div>
          </dl>

          <div>
            <p className="text-xs text-muted-foreground">Services booked</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {(booking.services || []).length
                ? (booking.services || []).map((service: string) => (
                    <span key={service} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{service}</span>
                  ))
                : <span className="text-muted-foreground">—</span>}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3" data-testid="host-booking-special-requests">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div><p className="font-semibold text-foreground">Preparation checklist</p><p className="text-xs text-muted-foreground">Tap each item you can provide.</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {requests.length
                ? requests.map(request => (
                    <Button key={request} type="button" size="sm" variant={provided.includes(request) ? "default" : "outline"} className="h-8 gap-1 rounded-full text-xs" onClick={() => toggleProvided(request)}>
                      {provided.includes(request) ? <CircleCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}{request}
                    </Button>
                  ))
                : <span className="text-muted-foreground">None requested</span>}
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-foreground">Propose an addition</p>
              <div className="mt-2 flex gap-2">
                <Input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addProposal(); } }} placeholder="e.g. Airport pickup" className="h-9" />
                <Button type="button" size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={addProposal} aria-label="Add proposed item"><Plus className="h-4 w-4" /></Button>
              </div>
              {proposed.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{proposed.map(item => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{item}<button type="button" onClick={() => setProposed(current => current.filter(value => value !== item))} aria-label={`Remove ${item}`}><X className="h-3 w-3" /></button></span>)}</div>}
            </div>
            <Button type="button" size="sm" className="w-full gap-2" disabled={savingRequests} onClick={saveRequests}>
              <Check className="h-4 w-4" />{savingRequests ? "Saving..." : "Confirm what will be provided"}
            </Button>
          </div>

          {booking.message && (
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Traveler note</p>
              <p className="mt-1 text-foreground">{booking.message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {booking.status === "pending" && (
              <>
                <Button size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onStatus(booking.id, "confirmed")}>Accept</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => onStatus(booking.id, "cancelled")}>Decline</Button>
              </>
            )}
            {booking.status === "confirmed" && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => onStatus(booking.id, "completed")}>Mark completed</Button>
            )}
            {(booking.status === "confirmed" || booking.status === "completed") && (
              <Button size="sm" variant="outline" className="gap-1 rounded-full" onClick={() => onInvoice(booking)}>
                <Receipt className="h-3.5 w-3.5" /> Generate invoice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
