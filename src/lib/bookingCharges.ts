import type { PlatformSettings } from "@/hooks/usePlatformSettings";

export type BookingCharges = {
  subtotal: number;
  platformFee: number;
  handlingCharge: number;
  gstAmount: number;
  total: number;
};

/** Applies admin-managed platform fee, handling charge and GST on top of a booking subtotal. */
export function computeBookingCharges(subtotal: number, settings: PlatformSettings): BookingCharges {
  const base = Math.max(0, Math.round(subtotal));
  const platformFee = Math.round((base * Number(settings.platform_fee_percent || 0)) / 100);
  const handlingCharge = base > 0 ? Math.round(Number(settings.handling_charge || 0)) : 0;
  const taxable = base + platformFee + handlingCharge;
  const gstAmount = Math.round((taxable * Number(settings.gst_percent || 0)) / 100);
  return { subtotal: base, platformFee, handlingCharge, gstAmount, total: taxable + gstAmount };
}

/** Platform earning (commission) for a booking row. */
export function bookingCommission(booking: { platform_fee?: number | null; handling_charge?: number | null }) {
  return Number(booking.platform_fee || 0) + Number(booking.handling_charge || 0);
}

/** Host payout for a booking row: total minus platform charges and GST. */
export function bookingHostPayout(booking: {
  total_price?: number | null;
  platform_fee?: number | null;
  handling_charge?: number | null;
  gst_amount?: number | null;
}) {
  return Math.max(
    0,
    Number(booking.total_price || 0) -
      Number(booking.platform_fee || 0) -
      Number(booking.handling_charge || 0) -
      Number(booking.gst_amount || 0),
  );
}
