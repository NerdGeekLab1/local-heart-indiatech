import { useEffect, useState } from "react";
import { Calendar, MessageCircle, Receipt, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
}: {
  booking: any | null;
  onOpenChange: (open: boolean) => void;
  onStatus: (id: string, status: string) => void;
  onInvoice: (booking: any) => void;
  onChat?: (travelerId: string, name: string) => void;
}) {
  const [traveler, setTraveler] = useState<{ first_name?: string; last_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    if (!booking?.traveler_id) { setTraveler(null); return; }
    let active = true;
    supabase.rpc("get_public_profile", { _id: booking.traveler_id }).then(({ data }) => {
      if (active) setTraveler((data as any[])?.[0] ?? null);
    });
    return () => { active = false; };
  }, [booking?.traveler_id]);

  if (!booking) return null;
  const days = dayCount(booking.start_date, booking.end_date);
  const requests: string[] = booking.special_requests || [];
  const travelerName = traveler ? `${traveler.first_name || ""} ${traveler.last_name || ""}`.trim() || "Traveler" : "Traveler";

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

          <div data-testid="host-booking-special-requests">
            <p className="text-xs text-muted-foreground">Special requests to prepare</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {requests.length
                ? requests.map(request => (
                    <span key={request} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{request}</span>
                  ))
                : <span className="text-muted-foreground">None requested</span>}
            </div>
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
