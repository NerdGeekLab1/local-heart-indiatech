import { Calendar, Mail, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPagination from "@/components/admin/AdminPagination";
import { Skeleton } from "@/components/ui/skeleton";

export interface BookingRow {
  id: string;
  ref: string;
  host: string;
  traveler: string;
  dates: string;
  guests: number | string;
  total: number;
  status: string;
}

interface Props {
  rows: BookingRow[];
  loading: boolean;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
  formatCurrency: (n: number) => string;
  onStatusChange: (id: string, status: string) => void;
  onResendEmail?: (id: string) => void;
  onRefresh: () => void;
}

/** Admin bookings table with explicit loading and empty states. */
const BookingsPanel = ({ rows, loading, page, pageSize, onPage, onPageSize, formatCurrency, onStatusChange, onResendEmail, onRefresh }: Props) => {
  if (loading && rows.length === 0) {
    return (
      <div data-testid="bookings-loading" className="rounded-2xl border border-border bg-card shadow-card p-4 space-y-3">
        {[0, 1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div data-testid="bookings-empty" className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
        <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="font-medium text-foreground">No bookings yet</p>
        <p className="text-sm text-muted-foreground mt-1">Real bookings appear here as soon as travelers confirm a stay, trip or experience.</p>
        <Button size="sm" variant="outline" className="mt-4 rounded-full text-xs gap-1.5" onClick={onRefresh}>
          <TrendingUp className="w-3.5 h-3.5" /> Refresh live data
        </Button>
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const paged = rows.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div data-testid="bookings-table" className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Booking</th>
              <th className="text-left font-semibold px-4 py-3">Traveler</th>
              <th className="text-left font-semibold px-4 py-3">Host</th>
              <th className="text-left font-semibold px-4 py-3">Dates</th>
              <th className="text-left font-semibold px-4 py-3">Guests</th>
              <th className="text-right font-semibold px-4 py-3">Total</th>
              <th className="text-right font-semibold px-4 py-3">Status</th>
              <th className="text-right font-semibold px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map(r => (
              <tr key={r.id} data-testid="booking-row" className="hover:bg-secondary/20">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.ref}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.traveler || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.host || "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{r.dates}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.guests}</td>
                <td className="px-4 py-3 text-right font-bold text-foreground whitespace-nowrap">{formatCurrency(r.total)}</td>
                <td className="px-4 py-3 text-right">
                  <select aria-label={`Status for ${r.ref}`} className="text-xs rounded-md border border-input bg-background px-2 py-1"
                    value={r.status}
                    onChange={e => onStatusChange(r.id, e.target.value)}>
                    <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" className="rounded-full text-xs gap-1" disabled={!onResendEmail} onClick={() => onResendEmail?.(r.id)}>
                    <Mail className="w-3 h-3" /> Resend
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-3">
        <AdminPagination alwaysShow page={safePage} total={rows.length} pageSize={pageSize} onPage={onPage} onPageSize={onPageSize} />
      </div>
    </div>
  );
};

export default BookingsPanel;
