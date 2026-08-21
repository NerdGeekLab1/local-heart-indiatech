import { Printer, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const money = (value: unknown) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function InvoiceDetail({ invoice, booking, hostName, onOpenChange }: { invoice: any | null; booking?: any; hostName: string; onOpenChange: (open: boolean) => void }) {
  if (!invoice) return null;
  const services: string[] = booking?.services || [];
  const requests: string[] = booking?.special_requests || [];
  const printInvoice = () => window.print();

  return (
    <Dialog open={Boolean(invoice)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto print:max-h-none print:max-w-none print:overflow-visible print:border-0 print:shadow-none" data-testid="invoice-detail">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" />Invoice {invoice.invoice_number}</DialogTitle>
          <DialogDescription>Itemized booking invoice from {hostName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 text-sm">
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-secondary/40 p-4">
            <div><p className="text-xs text-muted-foreground">Issued</p><p className="font-semibold">{new Date(invoice.issued_at || invoice.created_at).toLocaleDateString("en-IN")}</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p><p className="font-semibold capitalize">{invoice.status}</p></div>
            {booking && <><div><p className="text-xs text-muted-foreground">Travel dates</p><p className="font-semibold">{booking.start_date} – {booking.end_date}</p></div><div><p className="text-xs text-muted-foreground">Guests</p><p className="font-semibold">{booking.guests || 1}</p></div></>}
          </div>
          <div>
            <h3 className="font-semibold">Itemized details</h3>
            <div className="mt-2 divide-y divide-border rounded-lg border border-border">
              {services.length ? services.map(service => <div key={service} className="flex justify-between p-3"><span>{service}</span><span className="text-muted-foreground">Included</span></div>) : <div className="p-3 text-muted-foreground">Booking services</div>}
              {requests.map(request => <div key={request} className="flex justify-between gap-4 p-3"><span>Special request: {request}</span><span className="shrink-0 text-muted-foreground">Included</span></div>)}
            </div>
          </div>
          <dl className="ml-auto w-full max-w-xs space-y-2">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(invoice.amount)}</dd></div>
            <div className="flex justify-between text-muted-foreground"><dt>Tax (18%)</dt><dd>{money(invoice.tax_amount)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><dt>Total</dt><dd>{money(invoice.total_amount)}</dd></div>
          </dl>
        </div>
        <DialogFooter className="print:hidden"><Button onClick={printInvoice} className="gap-2"><Printer className="h-4 w-4" />Print / Save PDF</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}