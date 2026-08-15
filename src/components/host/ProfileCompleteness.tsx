import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import type { CompletenessResult } from "@/lib/hostCompleteness";

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

export default function ProfileCompleteness({ result, onJump }: { result: CompletenessResult; onJump?: () => void }) {
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
              : `${result.missing.length} item${result.missing.length === 1 ? "" : "s"} left to stand out in Explore.`}
          </p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {result.items.map(item => (
          <li key={item.key} className="flex items-start gap-2 text-sm">
            {item.done
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
              {item.label}
              {!item.done && <span className="block text-xs text-muted-foreground">{item.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      {onJump && result.missing.length > 0 && (
        <button onClick={onJump} className="mt-4 text-xs font-semibold text-primary underline-offset-2 hover:underline">
          Complete my profile →
        </button>
      )}
    </section>
  );
}
