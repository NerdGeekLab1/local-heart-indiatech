import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, Sparkles, Wrench } from "lucide-react";
import type { CompletenessFix, CompletenessItem, CompletenessResult } from "@/lib/hostCompleteness";

export function CompletenessRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={5} className="fill-none stroke-border" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={5} strokeLinecap="round"
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * Math.min(score, 100)) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{score}%</span>
    </div>
  );
}

export default function ProfileCompleteness({
  result,
  onJump,
  onFix,
}: {
  result: CompletenessResult;
  onJump?: () => void;
  onFix?: (fix: CompletenessFix, item: CompletenessItem) => void;
}) {
  const [open, setOpen] = useState<string | null>(result.missing[0]?.key ?? null);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card" data-testid="host-completeness">
      <div className="flex items-center gap-4">
        <CompletenessRing score={result.score} />
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Profile completeness
          </h3>
          <p className="text-xs text-muted-foreground">
            {result.missing.length === 0
              ? "Your public host page is fully set up."
              : `${result.missingFields.length} field${result.missingFields.length === 1 ? "" : "s"} left across ${result.missing.length} section${result.missing.length === 1 ? "" : "s"}.`}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {result.items.map(item => {
          const expanded = open === item.key;
          return (
            <li key={item.key} className="rounded-xl border border-border/60 bg-background" data-testid={`completeness-item-${item.key}`}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : item.key)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm"
                aria-expanded={expanded}
              >
                {item.done
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                <span className={`flex-1 ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.label}</span>
                {!item.done && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {item.details.filter(detail => !detail.done).length} left
                  </span>
                )}
                <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
              {expanded && (
                <div className="border-t border-border/60 px-3 py-2">
                  <ul className="space-y-1">
                    {item.details.map(detail => (
                      <li key={detail.label} className="flex items-center gap-2 text-xs">
                        {detail.done
                          ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                          : <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        <span className={detail.done ? "text-muted-foreground line-through" : "text-foreground"}>{detail.label}</span>
                      </li>
                    ))}
                  </ul>
                  {!item.done && (
                    <>
                      <p className="mt-2 text-[11px] text-muted-foreground">{item.hint}</p>
                      {onFix && (
                        <button
                          type="button"
                          onClick={() => onFix(item.fix, item)}
                          className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
                          data-testid={`completeness-fix-${item.key}`}
                        >
                          <Wrench className="h-3 w-3" /> {item.fix.cta}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {onJump && result.missing.length > 0 && (
        <button onClick={onJump} className="mt-4 text-xs font-semibold text-primary underline-offset-2 hover:underline">
          Complete my profile →
        </button>
      )}
    </section>
  );
}
