import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;            // 0-indexed
  total: number;           // total rows
  pageSize: number;
  onPage: (page: number) => void;
  /** When provided, renders a rows-per-page selector. */
  onPageSize?: (size: number) => void;
  pageSizeOptions?: number[];
  /** Keep the summary line visible even when everything fits on one page. */
  alwaysShow?: boolean;
}

/** Compact pager for admin tables: « 1 2 3 » with result summary and page size. */
const AdminPagination = ({ page, total, pageSize, onPage, onPageSize, pageSizeOptions = [10, 25, 50, 100], alwaysShow }: Props) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize && !alwaysShow && !onPageSize) return null;
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  const pages: number[] = [];
  const start = Math.max(0, Math.min(page - 2, pageCount - 5));
  for (let i = start; i < Math.min(pageCount, start + 5); i++) pages.push(i);

  return (
    <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground">Showing <span className="font-medium text-foreground">{from}–{to}</span> of <span className="font-medium text-foreground">{total}</span></p>
        {onPageSize && (
          <label className="text-xs text-muted-foreground flex items-center gap-1.5">
            Rows
            <select aria-label="Rows per page" value={pageSize}
              onChange={e => { onPageSize(Number(e.target.value)); onPage(0); }}
              className="h-7 rounded-md border border-input bg-background px-1.5 text-xs text-foreground">
              {pageSizeOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        )}
        <p className="text-xs text-muted-foreground">Page <span className="font-medium text-foreground">{Math.min(page, pageCount - 1) + 1}</span> of <span className="font-medium text-foreground">{pageCount}</span></p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`h-8 min-w-8 px-2 rounded-md text-xs font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
            {p + 1}
          </button>
        ))}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= pageCount - 1} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AdminPagination;
