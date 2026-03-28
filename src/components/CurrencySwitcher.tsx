import { useCurrency, CurrencyCode } from "@/contexts/CurrencyContext";
import { Globe } from "lucide-react";
import { useState } from "react";

const currencies: { code: CurrencyCode; label: string; flag: string }[] = [
  { code: "INR", label: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", label: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", flag: "🇬🇧" },
];

const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const current = currencies.find(c => c.code === currency)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all"
      >
        <span>{current.flag}</span>
        <span>{current.code}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-card shadow-elevated border border-border overflow-hidden">
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${currency === c.code ? "bg-primary/5 text-primary font-semibold" : "text-foreground"}`}
              >
                <span>{c.flag}</span>
                <span>{c.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{c.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySwitcher;
