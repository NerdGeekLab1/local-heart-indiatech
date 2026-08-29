import { useState } from "react";
import { Check, Copy, RefreshCw, Share2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useReferralCodes, useRegenerateReferralCode } from "@/hooks/useRewards";

interface Props {
  /** Admins can manage another traveler's code by passing their id. */
  userId?: string;
  /** Hide the retired-code history list. */
  hideHistory?: boolean;
}

/** Referral code creation, regeneration and history — traveler settings and admin. */
const ReferralCodeCard = ({ userId, hideHistory }: Props) => {
  const { toast } = useToast();
  const { data: codes = [], isLoading } = useReferralCodes(userId);
  const regenerate = useRegenerateReferralCode();
  const [copied, setCopied] = useState(false);

  const active = codes.find(c => c.is_active);
  const history = codes.filter(c => !c.is_active);
  const link = active ? `${window.location.origin}/signup?ref=${active.code}` : "";

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: "Referral link copied 📋" });
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (link && navigator.share) navigator.share({ title: "Join RoamYoo!", text: "Use my referral code for bonus rewards", url: link });
    else copy();
  };

  const rotate = async () => {
    try {
      const row = await regenerate.mutateAsync(userId);
      toast({ title: active ? "New referral code issued" : "Referral code created", description: row?.code });
    } catch (e: any) {
      toast({ title: "Couldn't update code", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="rounded-xl bg-card p-5 shadow-card space-y-3" data-testid="referral-code-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /> Referral code</h3>
        <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" disabled={regenerate.isPending} onClick={rotate}>
          <RefreshCw className={`w-3 h-3 ${regenerate.isPending ? "animate-spin" : ""}`} />
          {active ? "Regenerate" : "Create code"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading referral code…</p>
      ) : !active ? (
        <p className="text-sm text-muted-foreground">No active code yet — create one to start inviting friends.</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 rounded-lg bg-secondary/50 border border-border px-4 py-3 font-mono text-sm text-foreground truncate">{link}</div>
            <div className="flex gap-2">
              <Button onClick={copy} variant="outline" className="rounded-lg gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied" : "Copy"}
              </Button>
              <Button onClick={share} className="rounded-lg gap-2"><Share2 className="w-4 h-4" /> Share</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Code <span className="font-semibold text-foreground">{active.code}</span> · {active.uses} sign-up{active.uses === 1 ? "" : "s"} ·
            created {new Date(active.created_at).toLocaleDateString()}
          </p>
        </>
      )}

      {!hideHistory && history.length > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs font-semibold text-foreground mb-1.5">Code history</p>
          <div className="space-y-1">
            {history.map(c => (
              <div key={c.id} className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-mono">{c.code}</span>
                <span>{c.uses} uses · retired {c.retired_at ? new Date(c.retired_at).toLocaleDateString() : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCodeCard;
