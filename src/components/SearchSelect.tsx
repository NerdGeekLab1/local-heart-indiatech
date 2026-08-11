import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface ComboProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  emptyText?: string;
  /** Allow free text when the option is not on the list. */
  allowCustom?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  ariaLabel?: string;
}

/** Searchable single-select with optional free-text entry. */
export const SearchSelect = ({
  value, onChange, options, placeholder = "Select…", emptyText = "No match found",
  allowCustom = true, disabled, invalid, id, ariaLabel,
}: ComboProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? options.filter(o => o.toLowerCase().includes(q)) : options;
    return list.slice(0, 200);
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-label={ariaLabel ?? placeholder}
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            invalid && "border-destructive",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search…" />
          <CommandList>
            <CommandEmpty>
              {allowCustom && query.trim()
                ? (
                  <button
                    type="button"
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded"
                    onClick={() => { onChange(query.trim()); setOpen(false); setQuery(""); }}
                  >
                    Use “{query.trim()}”
                  </button>
                )
                : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map(o => (
                <CommandItem key={o} value={o} onSelect={() => { onChange(o); setOpen(false); setQuery(""); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === o ? "opacity-100" : "opacity-0")} />
                  {o}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchSelect;
