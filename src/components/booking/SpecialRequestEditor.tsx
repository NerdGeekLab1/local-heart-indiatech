import { useState } from "react";
import { Bed, Car, Check, ChevronDown, Gift, HeartHandshake, Plus, Sparkles, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface CustomRequest {
  type: string;
  detail: string;
}

/** Request categories the traveler can pick from the icon dropdown. */
export const requestTypes = [
  { key: "Transport", icon: Car, placeholder: "e.g. Airport pickup at 6am", description: "Pickups, drop-offs and local travel" },
  { key: "Food", icon: UtensilsCrossed, placeholder: "e.g. Jain thali, no onion or garlic", description: "Meals, allergies and dietary needs" },
  { key: "Stay", icon: Bed, placeholder: "e.g. Ground-floor room", description: "Room setup and accommodation needs" },
  { key: "Celebration", icon: Gift, placeholder: "e.g. Anniversary cake on day 2", description: "Birthdays, anniversaries and surprises" },
  { key: "Accessibility", icon: HeartHandshake, placeholder: "e.g. Step-free access", description: "Mobility and accessibility support" },
  { key: "Other", icon: Sparkles, placeholder: "Describe your request", description: "Anything else the host should know" },
] as const;

export const requestIcon = (type: string) =>
  requestTypes.find(item => item.key === type)?.icon ?? Sparkles;

/**
 * Traveler-facing special request builder: pick a type from the icon dropdown,
 * describe it, and preview exactly what the host is being asked to provide.
 */
export default function SpecialRequestEditor({
  hostName,
  addons,
  selectedAddonIds,
  onToggleAddon,
  customRequests,
  onChangeCustom,
  formatCurrency,
}: {
  hostName: string;
  addons: { id: string; name: string; emoji: string; description?: string | null; price: number }[];
  selectedAddonIds: string[];
  onToggleAddon: (id: string) => void;
  customRequests: CustomRequest[];
  onChangeCustom: (next: CustomRequest[]) => void;
  formatCurrency: (value: number) => string;
}) {
  const [type, setType] = useState<string>(requestTypes[0].key);
  const [detail, setDetail] = useState("");
  const ActiveIcon = requestIcon(type);
  const placeholder = requestTypes.find(item => item.key === type)?.placeholder || "Describe your request";
  const chosenAddons = addons.filter(addon => selectedAddonIds.includes(addon.id));

  const addRequest = () => {
    const value = detail.trim();
    if (!value) return;
    if (customRequests.some(item => item.type === type && item.detail.toLowerCase() === value.toLowerCase())) return;
    onChangeCustom([...customRequests, { type, detail: value }]);
    setDetail("");
  };

  return (
    <div data-testid="special-request-editor">
      <h2 className="text-2xl font-bold text-foreground">Special Requests</h2>
      <p className="mt-1 text-muted-foreground">
        {addons.length ? `Extras ${hostName} offers, plus anything else you need.` : `Tell ${hostName} what you need — they'll confirm what they can provide.`}
      </p>

      {addons.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="booking-addons">
          {addons.map(addon => {
            const active = selectedAddonIds.includes(addon.id);
            return (
              <Button key={addon.id} type="button" variant="outline" onClick={() => onToggleAddon(addon.id)}
                className={`relative h-auto min-h-36 flex-col items-start gap-2 whitespace-normal rounded-xl p-4 text-left ${active ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card hover:border-primary/30"}`}>
                <span className="text-2xl">{addon.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{addon.name}</span>
                <span className="line-clamp-2 text-xs font-normal text-muted-foreground">{addon.description || "Optional extra offered by your host"}</span>
                <span className="text-xs font-semibold text-primary">{formatCurrency(addon.price)}</span>
                {active && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
              </Button>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Add your own request</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between gap-2 rounded-full sm:w-44" aria-label="Choose request type">
                <span className="flex items-center gap-2"><ActiveIcon className="h-4 w-4 text-primary" />{type}</span>
                <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 bg-popover">
              {requestTypes.map(item => (
                <DropdownMenuItem key={item.key} onSelect={() => setType(item.key)} className="items-start gap-3 py-2">
                  <item.icon className="mt-0.5 h-4 w-4 text-primary" /><span><span className="block font-medium">{item.key}</span><span className="block text-xs text-muted-foreground">{item.description}</span></span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input value={detail} onChange={event => setDetail(event.target.value)}
            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addRequest(); } }}
            placeholder={placeholder} className="flex-1" />
          <Button type="button" variant="secondary" className="gap-2 rounded-full" onClick={addRequest}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4" data-testid="special-request-preview">
        <p className="text-sm font-semibold text-foreground">What {hostName} will be asked to provide</p>
        {chosenAddons.length === 0 && customRequests.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing added yet — this step is optional.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {chosenAddons.map(addon => (
              <li key={addon.id} className="flex items-center gap-2 text-sm text-foreground">
                <span>{addon.emoji}</span>
                <span className="flex-1"><span className="block font-medium">{addon.name}</span><span className="block text-xs text-muted-foreground">{addon.description || "Host-offered extra"}</span></span>
                <span className="text-xs font-semibold text-primary">{formatCurrency(addon.price)}</span>
              </li>
            ))}
            {customRequests.map(item => {
              const Icon = requestIcon(item.type);
              return (
                <li key={`${item.type}-${item.detail}`} className="flex items-center gap-2 text-sm text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="flex-1"><span className="font-medium">{item.type}:</span> {item.detail}</span>
                  <span className="text-xs text-muted-foreground">host to confirm</span>
                  <button type="button" aria-label={`Remove ${item.detail}`}
                    onClick={() => onChangeCustom(customRequests.filter(entry => entry !== item))}>
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
