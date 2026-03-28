import { createContext, useContext, useState, ReactNode } from "react";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amountInINR: number) => string;
  symbol: string;
}

const rates: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

const symbols: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType);

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    try {
      return (localStorage.getItem("travelista_currency") as CurrencyCode) || "INR";
    } catch { return "INR"; }
  });

  const handleSet = (c: CurrencyCode) => {
    setCurrency(c);
    localStorage.setItem("travelista_currency", c);
  };

  const format = (amountInINR: number) => {
    const converted = amountInINR * rates[currency];
    if (currency === "INR") {
      return `₹${converted.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    }
    return `${symbols[currency]}${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSet, format, symbol: symbols[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
};
