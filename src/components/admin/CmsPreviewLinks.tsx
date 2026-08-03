import { useEffect, useState } from "react";
import { Link2, Plus, Copy, Ban, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TokenRow {
  id: string;
  token: string;
  label: string | null;
  expires_at: string;
  revoked: boolean;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
}

/** Admin panel for minting shareable, expiring draft-preview links. */
const CmsPreviewLinks = ({ baseUrl }: { baseUrl: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const origin = (baseUrl || window.location.origin).replace(/\/$/, "");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_preview_tokens")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Could not load preview links", description: error.message, variant: "destructive" });
    setRows((data ?? []) as TokenRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const linkFor = (t: TokenRow) => `${origin}/?preview_token=${t.token}`;

  const create = async () => {
    const expires = new Date(Date.now() + Math.max(1, days) * 86400000).toISOString();
    const { data, error } = await supabase
      .from("cms_preview_tokens")
      .insert({ label: label.trim() || "Draft preview", expires_at: expires, created_by: user?.id ?? null })
      .select()
      .single();
    if (error) return toast({ title: "Could not create link", description: error.message, variant: "destructive" });
    setLabel("");
    await navigator.clipboard.writeText(`${origin}/?preview_token=${(data as TokenRow).token}`).catch(() => undefined);
    toast({ title: "Preview link created", description: "Copied to your clipboard." });
    load();
  };

  const revoke = async (row: TokenRow) => {
    const { error } = await supabase.from("cms_preview_tokens").update({ revoked: !row.revoked }).eq("id", row.id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    load();
  };

  const remove = async (row: TokenRow) => {
    const { error } = await supabase.from("cms_preview_tokens").delete().eq("id", row.id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    load();
  };

  const status = (t: TokenRow) => {
    if (t.revoked) return { text: "revoked", cls: "bg-destructive/10 text-destructive" };
    if (new Date(t.expires_at) < new Date()) return { text: "expired", cls: "bg-secondary text-muted-foreground" };
    return { text: "active", cls: "bg-accent/10 text-accent" };
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card p-5 shadow-card space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" /> Shareable draft preview links
        </h3>
        <p className="text-sm text-muted-foreground">
          Anyone with the link sees the unpublished draft (site settings plus unpublished blogs, stories, tips and channels).
          Links expire automatically, can be revoked any time, and pages served through them are marked <code>noindex</code>,
          so unpublished content is never exposed publicly.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground">Label</label>
            <Input className="mt-1" placeholder="e.g. Monsoon campaign review" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div className="w-28">
            <label className="text-sm font-medium text-foreground">Valid (days)</label>
            <Input className="mt-1" type="number" min={1} max={90} value={days} onChange={e => setDays(Number(e.target.value))} />
          </div>
          <Button className="rounded-full gap-2" onClick={create}>
            <Plus className="w-4 h-4" /> Create link
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-card shadow-card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading links…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No preview links yet.</div>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Label</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Expires</th>
                <th className="text-left p-3">Views</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(t => {
                const s = status(t);
                return (
                  <tr key={t.id}>
                    <td className="p-3 text-foreground">{t.label || "Draft preview"}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${s.cls}`}>{s.text}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(t.expires_at).toLocaleDateString()}</td>
                    <td className="p-3 text-muted-foreground">{t.view_count}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" className="rounded-full gap-1.5"
                          onClick={async () => { await navigator.clipboard.writeText(linkFor(t)); toast({ title: "Link copied" }); }}>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full gap-1.5" asChild>
                          <a href={linkFor(t)} target="_blank" rel="noreferrer"><Eye className="w-3.5 h-3.5" /> Open</a>
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => revoke(t)}>
                          <Ban className="w-3.5 h-3.5" /> {t.revoked ? "Restore" : "Revoke"}
                        </Button>
                        <Button size="sm" variant="destructive" className="rounded-full" onClick={() => remove(t)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CmsPreviewLinks;
