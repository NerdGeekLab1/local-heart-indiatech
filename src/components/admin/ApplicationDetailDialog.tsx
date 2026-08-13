import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Ban, Clock, Eye, ExternalLink, Mail, Search } from "lucide-react";


export interface AuditEntry {
  id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
  metadata?: Record<string, any> | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  record: Record<string, any> | null;
  title: string;
  /** Ordered field groups to render. */
  groups: { label: string; keys: string[] }[];
  photosKey?: string;
  socialKey?: string;
  onStatus?: (status: string) => void;
  statuses?: { value: string; label: string; icon?: "approve" | "review" | "wait" | "reject" }[];
  /** Admin actions recorded for this application, newest first. */
  auditEntries?: AuditEntry[];
  onResendEmail?: () => void;
}


const HIDDEN = new Set(["id", "user_id", "created_at", "updated_at", "reviewed_by", "reviewed_at", "admin_notes", "questionnaire_answers"]);

const prettyKey = (k: string) =>
  k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const renderValue = (v: any) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "object") {
    const entries = Object.entries(v).filter(([, val]) => val !== null && val !== "" && val !== undefined);
    if (!entries.length) return "—";
    return (
      <div className="space-y-0.5">
        {entries.map(([k, val]) => (
          <p key={k} className="text-xs">
            <span className="text-muted-foreground">{prettyKey(k)}:</span>{" "}
            <span className="text-foreground">{Array.isArray(val) ? val.join(", ") : String(val)}</span>
          </p>
        ))}
      </div>
    );
  }
  return String(v);
};

const icons = { approve: CheckCircle, review: Eye, wait: Clock, reject: Ban };

/** Full read-only view of a host application with inline verification actions. */
const ApplicationDetailDialog = ({ open, onClose, record, title, groups, photosKey = "photos", socialKey = "social_links", onStatus, statuses = [], auditEntries = [], onResendEmail }: Props) => {
  if (!record) return null;
  const photos: string[] = Array.isArray(record[photosKey]) ? record[photosKey] : [];
  const socials: Record<string, string> = record[socialKey] && typeof record[socialKey] === "object" ? record[socialKey] : {};
  const grouped = new Set(groups.flatMap(g => g.keys));
  const extraKeys = Object.keys(record).filter(k => !grouped.has(k) && !HIDDEN.has(k) && k !== photosKey && k !== socialKey);

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {title}
            {record.status && <Badge variant="outline" className="capitalize">{String(record.status).replace(/_/g, " ")}</Badge>}
          </DialogTitle>
          <DialogDescription>Complete submission as received from the public form.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {[...groups, ...(extraKeys.length ? [{ label: "Other details", keys: extraKeys }] : [])].map(group => {
            const keys = group.keys.filter(k => k in record);
            if (!keys.length) return null;
            return (
              <div key={group.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group.label}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {keys.map(k => (
                    <div key={k} className="rounded-lg border border-border bg-card/50 p-3">
                      <p className="text-[11px] text-muted-foreground">{prettyKey(k)}</p>
                      <div className="text-sm text-foreground mt-0.5 break-words">{renderValue(record[k])}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {Object.keys(socials).length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Social proof</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(socials).filter(([, v]) => v).map(([k, v]) => (
                  <a key={k} href={String(v)} target="_blank" rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-secondary">
                    {prettyKey(k)} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Photos ({photos.length})</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map(p => (
                  <a key={p} href={p} target="_blank" rel="noreferrer noopener">
                    <img src={p} alt="Application photo" loading="lazy" className="w-full aspect-square rounded-lg object-cover border border-border" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {record.admin_notes && (
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Admin notes</p>
              <p className="text-sm text-foreground mt-1">{record.admin_notes}</p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Admin activity timeline ({auditEntries.length})
            </p>
            {auditEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-3">
                No admin actions recorded yet. Review, waitlist, verify or approve actions will show up here with timestamps.
              </p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-3">
                {auditEntries.map(entry => (
                  <li key={entry.id} className="ml-4">
                    <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                    <div className="rounded-lg border border-border bg-card/50 p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="capitalize text-[11px]">{entry.action.replace(/_/g, " ")}</Badge>
                        {(entry.previous_status || entry.new_status) && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {(entry.previous_status || "—").replace(/_/g, " ")} → {(entry.new_status || "—").replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                      {entry.notes && <p className="text-sm text-foreground mt-1">{entry.notes}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>



          {onStatus && statuses.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {onResendEmail && (
                <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={onResendEmail}>
                  <Mail className="w-3.5 h-3.5 mr-1" /> Resend latest email
                </Button>
              )}
              {statuses.map(s => {
                const Icon = s.icon ? icons[s.icon] : CheckCircle;
                const destructive = s.icon === "reject";
                return (
                  <Button key={s.value} size="sm"
                    variant={s.icon === "approve" ? "default" : "outline"}
                    className={`rounded-full text-xs ${destructive ? "text-destructive" : ""}`}
                    onClick={() => { onStatus(s.value); onClose(); }}>
                    <Icon className="w-3.5 h-3.5 mr-1" /> {s.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailDialog;
