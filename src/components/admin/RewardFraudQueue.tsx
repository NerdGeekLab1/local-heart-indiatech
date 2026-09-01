import { useMemo, useState } from "react";
import { ShieldAlert, Gavel, CheckCircle2, XCircle, Eye, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminPagination from "@/components/admin/AdminPagination";
import { APPEAL_STATUS_STYLES, BLOCK_REASON_LABELS } from "@/lib/rewardsEngine";
import { useAllClaimAttempts, useReviewAppeal, useRewardAppeals, type RewardAppealRow } from "@/hooks/useRewards";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const VIEWS = [
  { key: "appeals", label: "Appeals" },
  { key: "blocked", label: "Blocked attempts" },
] as const;

/**
 * Admin fraud-review queue: every blocked reward attempt with its full log, plus the
 * traveler appeals raised against them with one-click approve / deny.
 */
const RewardFraudQueue = ({ nameFor }: { nameFor: (id?: string | null) => string }) => {
  const { toast } = useToast();
  const { data: appeals = [], refetch: refetchAppeals, isLoading } = useRewardAppeals({ all: true });
  const { data: attempts = [], refetch: refetchAttempts } = useAllClaimAttempts();
  const reviewAppeal = useReviewAppeal();
  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("appeals");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<RewardAppealRow | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const blocked = useMemo(() => attempts.filter(a => !a.allowed), [attempts]);
  const rows: any[] = view === "appeals" ? appeals : blocked;
  const paged = rows.slice(page * pageSize, page * pageSize + pageSize);
  const attemptsFor = (userId: string) => attempts.filter(a => a.user_id === userId).slice(0, 6);

  const decide = async (appeal: RewardAppealRow, status: string) => {
    try {
      await reviewAppeal.mutateAsync({ id: appeal.id, status, notes: notes[appeal.id] });
      toast({ title: `Appeal ${status.replace("_", " ")}` });
      setDetail(null);
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3" data-testid="admin-fraud-queue">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" /> Fraud review queue
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {appeals.filter(a => a.status === "pending").length} appeals awaiting a decision · {blocked.length} blocked attempts logged.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {VIEWS.map(v => (
            <button key={v.key} onClick={() => { setView(v.key); setPage(0); }}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${view === v.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {v.label}
            </button>
          ))}
          <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs"
            onClick={() => { refetchAppeals(); refetchAttempts(); }}>
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading fraud queue…</p>}

      {view === "appeals" && paged.map((a: RewardAppealRow) => (
        <div key={a.id} className="rounded-lg bg-card p-3 shadow-card space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {nameFor(a.user_id)} · {a.reference_key || a.action}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatDate(a.created_at)} · blocked as {BLOCK_REASON_LABELS[a.block_reason || ""] || a.block_reason || "unknown"} · {a.points} pts at stake
              </p>
              <p className="text-xs text-foreground mt-1">“{a.reason}”</p>
              {a.evidence_url && (
                <a href={a.evidence_url} target="_blank" rel="noreferrer" className="text-[11px] text-primary inline-flex items-center gap-1 mt-1">
                  <ExternalLink className="w-3 h-3" /> Evidence link
                </a>
              )}
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${APPEAL_STATUS_STYLES[a.status] || "bg-secondary text-muted-foreground"}`}>
              {a.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input value={notes[a.id] || ""} onChange={e => setNotes(p => ({ ...p, [a.id]: e.target.value }))}
              placeholder="Decision note (shown to traveler)" className="h-8 text-xs max-w-sm" />
            <Button size="sm" variant="outline" className="h-8 rounded-full text-xs gap-1" onClick={() => setDetail(detail?.id === a.id ? null : a)}>
              <Eye className="w-3 h-3" /> Attempt log
            </Button>
            {a.status !== "under_review" && a.status !== "approved" && a.status !== "denied" && (
              <Button size="sm" variant="outline" className="h-8 rounded-full text-xs" onClick={() => decide(a, "under_review")}>
                Mark under review
              </Button>
            )}
            <Button size="sm" className="h-8 rounded-full text-xs gap-1" disabled={a.status === "approved" || reviewAppeal.isPending}
              onClick={() => decide(a, "approved")}>
              <CheckCircle2 className="w-3 h-3" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="h-8 rounded-full text-xs gap-1 text-destructive"
              disabled={a.status === "denied" || reviewAppeal.isPending} onClick={() => decide(a, "denied")}>
              <XCircle className="w-3 h-3" /> Deny
            </Button>
          </div>

          {detail?.id === a.id && (
            <div className="rounded-lg bg-secondary/40 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-foreground">Recent attempts by this traveler</p>
              <ul className="space-y-1">
                {attemptsFor(a.user_id).map(at => (
                  <li key={at.id} className="text-[11px] text-muted-foreground">
                    {formatDate(at.created_at)} · {at.action} · {at.reference_key || "—"} · {at.allowed ? "allowed" : `blocked (${at.reason || "n/a"})`}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] font-semibold text-foreground">Decision timeline</p>
              <ol className="space-y-1 border-l border-border pl-3">
                {a.timeline.map((step, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground">
                    <span className="capitalize font-semibold text-foreground">{step.status.replace("_", " ")}</span> · {formatDate(step.at)}
                    {step.note ? ` — ${step.note}` : ""}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}

      {view === "blocked" && paged.map((at: any) => (
        <div key={at.id} className="rounded-lg bg-card p-3 shadow-card flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{nameFor(at.user_id)} · {at.reference_key || at.action}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatDate(at.created_at)} · {at.action} · {at.points ?? 0} pts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
              {BLOCK_REASON_LABELS[at.reason || ""] || at.reason || "blocked"}
            </span>
            {appeals.some(a => a.attempt_id === at.id) && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1">
                <Gavel className="w-3 h-3" /> appealed
              </span>
            )}
          </div>
        </div>
      ))}

      {!isLoading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {view === "appeals" ? "No appeals raised yet." : "No blocked attempts — fraud checks are clean."}
        </p>
      )}
      <AdminPagination page={page} total={rows.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />
    </div>
  );
};

export default RewardFraudQueue;
