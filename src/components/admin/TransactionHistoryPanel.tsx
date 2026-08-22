import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { bookingCommission, bookingHostPayout } from "@/lib/bookingCharges";

type Props = {
  bookings: any[];
  getUserName: (id?: string | null) => string;
  formatCurrency: (value: number) => string;
};

/** Commission and earning ledger built from live booking rows. */
export default function TransactionHistoryPanel({ bookings, getUserName, formatCurrency }: Props) {
  const rows = useMemo(() => bookings.map(booking => ({
    id: booking.id as string,
    ref: `#${String(booking.id).slice(0, 8)}`,
    date: booking.created_at ? new Date(booking.created_at).toLocaleDateString("en-IN") : "—",
    traveler: getUserName(booking.traveler_id),
    host: getUserName(booking.host_id),
    status: booking.status || "pending",
    total: Number(booking.total_price || 0),
    gst: Number(booking.gst_amount || 0),
    fee: Number(booking.platform_fee || 0),
    handling: Number(booking.handling_charge || 0),
    commission: bookingCommission(booking),
    payout: bookingHostPayout(booking),
  })), [bookings, getUserName]);

  const totals = rows.reduce((acc, row) => ({
    total: acc.total + row.total,
    gst: acc.gst + row.gst,
    commission: acc.commission + row.commission,
    payout: acc.payout + row.payout,
  }), { total: 0, gst: 0, commission: 0, payout: 0 });

  if (!rows.length) {
    return (
      <div data-testid="transactions-empty" className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
        <Wallet className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="font-medium text-foreground">No transactions yet</p>
        <p className="text-sm text-muted-foreground mt-1">Commission, GST and host payouts appear here once bookings come in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="transaction-history">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Gross volume", value: formatCurrency(totals.total) },
          { label: "Platform commission", value: formatCurrency(totals.commission) },
          { label: "GST collected", value: formatCurrency(totals.gst) },
          { label: "Host payouts", value: formatCurrency(totals.payout) },
        ].map(card => (
          <div key={card.label} className="rounded-lg bg-card p-4 shadow-card text-center">
            <p className="text-lg font-bold text-primary">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Booking</th>
              <th className="text-left font-semibold px-4 py-3">Date</th>
              <th className="text-left font-semibold px-4 py-3">Traveler</th>
              <th className="text-left font-semibold px-4 py-3">Host</th>
              <th className="text-right font-semibold px-4 py-3">Total</th>
              <th className="text-right font-semibold px-4 py-3">Platform fee</th>
              <th className="text-right font-semibold px-4 py-3">Handling</th>
              <th className="text-right font-semibold px-4 py-3">GST</th>
              <th className="text-right font-semibold px-4 py-3">Commission</th>
              <th className="text-right font-semibold px-4 py-3">Host payout</th>
              <th className="text-right font-semibold px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(row => (
              <tr key={row.id} data-testid="transaction-row" className="hover:bg-secondary/20">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{row.ref}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{row.date}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.traveler || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.host || "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">{formatCurrency(row.total)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">{formatCurrency(row.fee)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">{formatCurrency(row.handling)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">{formatCurrency(row.gst)}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary whitespace-nowrap">{formatCurrency(row.commission)}</td>
                <td className="px-4 py-3 text-right font-semibold text-accent whitespace-nowrap">{formatCurrency(row.payout)}</td>
                <td className="px-4 py-3 text-right text-xs capitalize text-muted-foreground">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
