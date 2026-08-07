import { COUNTRY_CODES, splitPhone, joinPhone, isValidLocalPhone } from "@/lib/phone";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  showError?: boolean;
  id?: string;
}

/** Country code selector + 10-digit local number. Stores as "+91 9876543210". */
const PhoneInput = ({ value, onChange, className = "", showError, id }: PhoneInputProps) => {
  const parts = useMemo(() => splitPhone(value), [value]);
  const number = parts.number;
  const invalid = showError && number.length > 0 && !isValidLocalPhone(number);

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select value={parts.code} onValueChange={(c) => onChange(joinPhone(c, number))}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COUNTRY_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          id={id}
          inputMode="numeric"
          placeholder="10-digit number"
          value={number}
          maxLength={10}
          onChange={(e) => onChange(joinPhone(parts.code, e.target.value.replace(/\D/g, "").slice(0, 10)))}
          aria-invalid={invalid || undefined}
          className={invalid ? "border-destructive focus-visible:ring-destructive" : ""}
        />
      </div>
      {invalid && <p className="text-xs text-destructive mt-1">Enter a 10-digit phone number</p>}
    </div>
  );
};

export default PhoneInput;
