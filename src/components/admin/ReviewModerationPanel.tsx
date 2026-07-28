import { useMemo, useState } from "react";
import { Star, Flag, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import AdminPagination from "@/components/admin/AdminPagination";

interface Props {
  /** Live reviews from the database (optional — falls back to demo rows). */
  dbReviews: any[];
  /** Demo reviews from src/lib/data.ts used when the DB has none. */
  mockReviews: any[];
  /** Resolve a user_id to a display name. */
  getUserName: (id: string) => string;
  /** Resolve a mock hostId to a display name. */
  getMockHostName: (hostId: string) => string;
}

const PAGE_SIZE = 8;

/**
 * Review moderation queue with pagination.
 * Note: the reviews table denies UPDATE/DELETE via RLS, so flag/remove are
 * soft-actions recorded in local storage (and surfaced in the audit view).
 */
const ReviewModerationPanel = ({ dbReviews, mockReviews, getUserName, getMockHostName }: Props) => {
  const { toast } = useToast();
  const [flaggedReviews, setFlaggedReviews] = useLocalStorage<string[]>("admin_flagged_reviews", []);
  const [removedReviews, setRemovedReviews] = useLocalStorage<string[]>("admin_removed_reviews", []);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<"all" | "flagged" | "removed">("all");

  const rows = useMemo(() => {
    const live = dbReviews.map(r => ({
      id: r.id as string,
      reviewer: getUserName(r.traveler_id) || "Traveler",
      target: r.host_id ? getUserName(r.host_id) : (r.experience_id ? "Experience" : "—"),
      rating: r.rating as number,
      text: (r.text || "") as string,
      date: r.created_at as string,
      source: "live" as const,
    }));
    const demo = live.length === 0
      ? mockReviews.map(r => ({
          id: r.id as string,
          reviewer: r.travelerName as string,
          target: getMockHostName(r.hostId),
          rating: r.rating as number,
          text: r.text as string,
          date: r.date as string,
          source: "demo" as const,
        }))
      : [];
    return [...live, ...demo];
  }, [dbReviews, mockReviews, getUserName, getMockHostName]);

  const visible = rows.filter(r => !removedReviews.includes(r.id));
  const filtered = visible.filter(r => {
    if (filter === "flagged") return flaggedReviews.includes(r.id);
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const flag = (id: string) => { setFlaggedReviews(p => [...p, id]); toast({ title: "Review flagged" }); };
  const unflag = (id: string) => setFlaggedReviews(p => p.filter(x => x !== id));
  const remove = (id: string) => {
    setRemovedReviews(p => [...p, id]);
    setFlaggedReviews(p => p.filter(x => x !== id));
    toast({ title: "Review removed", variant: "destructive" });
  };
  const restore = (id: string) => { setRemovedReviews(p => p.filter(x => x !== id)); toast({ title: "Review restored" }); };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Review Queue ({filtered.length})</h3>
        <select value={filter} onChange={e => { setFilter(e.target.value as any); setPage(0); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs">
          <option value="all">All reviews</option>
          <option value="flagged">Flagged only</option>
          <option value="removed">Removed (restore)</option>
        </select>
      </div>

      {filter === "removed" ? (
        removedReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No removed reviews.</p>
        ) : (
          <div className="space-y-3">
            {rows.filter(r => removedReviews.includes(r.id)).map(r => (
              <div key={r.id} className="rounded-xl border border-destructive/20 bg-background p-4 flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.reviewer} → {r.target}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.text || "No text"}</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1 shrink-0" onClick={() => restore(r.id)}>
                  <RotateCcw className="w-3 h-3" /> Restore
                </Button>
              </div>
            ))}
          </div>
        )
      ) : paged.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No reviews in this view.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-3 py-2.5">Reviewer</th>
                <th className="text-left font-semibold px-3 py-2.5">Target</th>
                <th className="text-left font-semibold px-3 py-2.5">Rating</th>
                <th className="text-left font-semibold px-3 py-2.5">Review</th>
                <th className="text-left font-semibold px-3 py-2.5">Date</th>
                <th className="text-right font-semibold px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map(r => {
                const isFlagged = flaggedReviews.includes(r.id);
                return (
                  <tr key={r.id} className={isFlagged ? "bg-destructive/5" : "hover:bg-secondary/20"}>
                    <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{r.reviewer}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{r.target}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-primary">
                        {r.rating} <Star className="w-3 h-3 fill-primary text-primary" />
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[280px]">
                      <span className="line-clamp-2">{r.text || "—"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {!isFlagged ? (
                        <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => flag(r.id)}>
                          <Flag className="w-3 h-3 mr-1" /> Flag
                        </Button>
                      ) : (
                        <div className="flex gap-1.5 justify-end">
                          <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => unflag(r.id)}>Unflag</Button>
                          <Button variant="outline" size="sm" className="text-xs rounded-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => remove(r.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filter !== "removed" && <AdminPagination page={safePage} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />}
    </div>
  );
};

export default ReviewModerationPanel;
