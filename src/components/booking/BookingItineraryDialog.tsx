import { CalendarDays, MapPin, Users, Receipt, Sparkles, CheckCircle2, Printer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { requestIcon } from "@/components/booking/SpecialRequestEditor";

export interface ItineraryBooking {
  id: string;
  start_date: string;
  end_date: string;
  status?: string | null;
  guests?: number | null;
  services?: string[] | null;
  special_requests?: string[] | null;
  provided_requests?: string[] | null;
  host_proposed_requests?: string[] | null;
  message?: string | null;
  total_price?: number | null;
  platform_fee?: number | null;
  handling_charge?: number | null;
  gst_amount?: number | null;
}

const money = (value?: number | null) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const dayList = (start: string, end: string) => {
  const from = new Date(start);
  const to = new Date(end);
  const days: Date[] = [];
  for (let d = new Date(from); d <= to && days.length < 30; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days.length ? days : [from];
};

/** Parses "Type: detail" special-request strings back into an icon + label pair. */
const parseRequest = (value: string) => {
  const [head, ...rest] = value.split(":");
  const detail = rest.join(":").trim();
  return detail ? { type: head.trim(), detail } : { type: "Other", detail: value };
};

/**
 * Full itinerary for a confirmed booking: day-by-day plan, included services,
 * agreed special requests and the price breakdown — printable from the dialog.
 */
const BookingItineraryDialog = ({
  booking,
  hostName,
  open,
  onOpenChange,
}: {
  booking: ItineraryBooking | null;
  hostName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!booking) return null;
  const days = dayList(booking.start_date, booking.end_date);
  const services = booking.services || [];
  const requested = booking.special_requests || [];
  const provided = booking.provided_requests || [];
  const proposed = booking.host_proposed_requests || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="booking-itinerary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Your itinerary · Booking #{booking.id.slice(0, 8)}
          </DialogTitle>
          <DialogDescription>
            {new Date(booking.start_date).toLocaleDateString("en-IN", { dateStyle: "medium" })} →{" "}
            {new Date(booking.end_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            {hostName ? ` · hosted by ${hostName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Days", value: days.length, icon: CalendarDays },
              { label: "Guests", value: booking.guests || 1, icon: Users },
              { label: "Status", value: booking.status || "pending", icon: CheckCircle2 },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-secondary/40 p-3 text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground capitalize">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Day-by-day plan
            </h4>
            <ol className="space-y-2">
              {days.map((day, i) => (
                <li key={i} className="rounded-lg border border-border p-3 flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] leading-none">Day</span>
                    <span className="text-xs font-bold leading-none">{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {day.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {i === 0
                        ? `Arrival & welcome${hostName ? ` with ${hostName}` : ""}${services.length ? ` · ${services.join(", ")}` : ""}`
                        : i === days.length - 1
                          ? "Wrap-up, checkout and departure support"
                          : services.length
                            ? `Planned: ${services.join(", ")}`
                            : "Experience day — your host shares the detailed plan on arrival"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {(requested.length > 0 || provided.length > 0 || proposed.length > 0) && (
            <div>
              <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Special arrangements
              </h4>
              <ul className="space-y-1.5">
                {requested.map((value, i) => {
                  const { type, detail } = parseRequest(value);
                  const Icon = requestIcon(type);
                  const done = provided.includes(value);
                  return (
                    <li key={`r-${i}`} className="flex items-center gap-2 text-xs">
                      <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-foreground">{detail}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${done ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>
                        {done ? "confirmed by host" : "awaiting host"}
                      </span>
                    </li>
                  );
                })}
                {proposed.filter(p => !requested.includes(p)).map((value, i) => {
                  const { type, detail } = parseRequest(value);
                  const Icon = requestIcon(type);
                  return (
                    <li key={`p-${i}`} className="flex items-center gap-2 text-xs">
                      <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-foreground">{detail}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">host suggestion</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {booking.message && (
            <div className="rounded-xl bg-secondary/40 p-3">
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5"><Clock className="w-3 h-3" /> Notes shared with your host</p>
              <p className="text-xs text-muted-foreground mt-1">{booking.message}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" /> Price breakdown
            </h4>
            <div className="rounded-xl bg-secondary/40 p-3 space-y-1.5 text-xs">
              {[
                ["Platform fee", booking.platform_fee],
                ["Handling charge", booking.handling_charge],
                ["GST", booking.gst_amount],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground">{money(value as number)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                <span className="text-foreground">Total paid</span>
                <span className="text-foreground">{money(booking.total_price)}</span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full rounded-full gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print / save itinerary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingItineraryDialog;
