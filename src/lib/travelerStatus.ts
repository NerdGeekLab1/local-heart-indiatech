/** Live trip statuses a traveler can broadcast to their host. */
export const travelerStatuses = [
  { key: "not_started", label: "Not started", emoji: "🕓", hint: "Trip has not begun yet" },
  { key: "checked_in", label: "Checked in", emoji: "🔑", hint: "Arrived and settled in" },
  { key: "sightseeing", label: "Away for sightseeing", emoji: "🧭", hint: "Out exploring right now" },
  { key: "dnd", label: "Do not disturb", emoji: "🌙", hint: "Resting — please avoid calls" },
  { key: "need_help", label: "Needs help", emoji: "🆘", hint: "Requesting host assistance" },
  { key: "checked_out", label: "Checked out", emoji: "👋", hint: "Trip completed and left" },
] as const;

export type TravelerStatusKey = (typeof travelerStatuses)[number]["key"];

export const travelerStatusMeta = (key?: string | null) =>
  travelerStatuses.find(item => item.key === key) || travelerStatuses[0];

export const travelerStatusClasses: Record<string, string> = {
  not_started: "bg-secondary text-muted-foreground",
  checked_in: "bg-accent/10 text-accent",
  sightseeing: "bg-primary/10 text-primary",
  dnd: "bg-muted text-muted-foreground",
  need_help: "bg-destructive/10 text-destructive",
  checked_out: "bg-secondary text-foreground",
};
