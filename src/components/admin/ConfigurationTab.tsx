import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Save, Key, CreditCard, Mail, MessageCircle, Sparkles, Settings as SettingsIcon, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ConfigEntry {
  id: string;
  key: string;
  value: string | null;
  category: string;
  description: string | null;
  is_secret: boolean;
  updated_at: string;
}

const CATEGORY_META: Record<string, { label: string; icon: any; tone: string }> = {
  payments: { label: "Payments", icon: CreditCard, tone: "text-primary" },
  email: { label: "Email", icon: Mail, tone: "text-accent" },
  messaging: { label: "Messaging", icon: MessageCircle, tone: "text-primary" },
  ai: { label: "AI Models", icon: Sparkles, tone: "text-accent" },
  tracking: { label: "Analytics & Tracking", icon: BarChart3, tone: "text-primary" },
  general: { label: "General", icon: SettingsIcon, tone: "text-muted-foreground" },
};

const ConfigurationTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState({ key: "", category: "general", description: "", is_secret: false });
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("app_configuration")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });
    if (error) toast({ title: "Failed to load configuration", description: error.message, variant: "destructive" });
    else setEntries((data ?? []) as ConfigEntry[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (entry: ConfigEntry) => {
    if (!user) return;
    const value = drafts[entry.id] ?? entry.value ?? "";
    setSaving(entry.id);
    const { error } = await supabase
      .from("app_configuration")
      .update({ value, updated_by: user.id })
      .eq("id", entry.id);
    setSaving(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Saved ${entry.key}` });
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, value } : e));
      setDrafts(prev => { const n = { ...prev }; delete n[entry.id]; return n; });
    }
  };

  const addNew = async () => {
    if (!newKey.key.trim()) {
      toast({ title: "Key is required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("app_configuration").insert({
      key: newKey.key.trim().toUpperCase().replace(/\s+/g, "_"),
      category: newKey.category,
      description: newKey.description || null,
      is_secret: newKey.is_secret,
      updated_by: user?.id,
    });
    if (error) {
      toast({ title: "Could not add key", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configuration key added" });
      setNewKey({ key: "", category: "general", description: "", is_secret: false });
      setShowNew(false);
      load();
    }
  };

  const grouped = entries.reduce((acc, e) => {
    (acc[e.category] ||= []).push(e);
    return acc;
  }, {} as Record<string, ConfigEntry[]>);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" /> Platform Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API keys, integrations, and global settings. Secret values are masked and only readable by admins.
          </p>
        </div>
        <Button onClick={() => setShowNew(!showNew)} size="sm" className="rounded-full gap-2">
          <Plus className="w-4 h-4" /> Add Key
        </Button>
      </div>

      {showNew && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-card p-5 shadow-card space-y-3 border border-primary/20">
          <h3 className="font-bold text-foreground">New Configuration Key</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Key Name *</label>
              <Input className="mt-1" placeholder="e.g. CUSTOM_API_KEY" value={newKey.key}
                onChange={e => setNewKey(p => ({ ...p, key: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={newKey.category} onChange={e => setNewKey(p => ({ ...p, category: e.target.value }))}>
                {Object.entries(CATEGORY_META).map(([id, m]) => <option key={id} value={id}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input className="mt-1" placeholder="What this key is for" value={newKey.description}
              onChange={e => setNewKey(p => ({ ...p, description: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={newKey.is_secret}
              onChange={e => setNewKey(p => ({ ...p, is_secret: e.target.checked }))} className="accent-primary" />
            <span className="text-foreground">Mark as secret (mask value, admin-only)</span>
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={addNew} className="rounded-full">Create</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNew(false)} className="rounded-full">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Google OAuth quick access */}
      <div className="rounded-lg bg-card p-5 shadow-card border-l-4 border-primary">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Google Sign-In</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Google OAuth is fully managed by Lovable Cloud — no extra credentials required. To use your own Google client ID/secret for branding, manage it in the backend Authentication settings.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Add <code className="px-1 rounded bg-secondary">GOOGLE_CLIENT_ID</code> and <code className="px-1 rounded bg-secondary">GOOGLE_CLIENT_SECRET</code> below to override the managed credentials.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading configuration…</div>
      ) : (
        Object.entries(grouped).map(([category, list]) => {
          const meta = CATEGORY_META[category] || CATEGORY_META.general;
          const Icon = meta.icon;
          return (
            <div key={category} className="rounded-lg bg-card shadow-card overflow-hidden">
              <div className="px-5 py-3 bg-secondary/40 border-b border-border flex items-center gap-2">
                <Icon className={`w-4 h-4 ${meta.tone}`} />
                <h3 className="font-bold text-foreground">{meta.label}</h3>
                <span className="text-xs text-muted-foreground">({list.length})</span>
              </div>
              <div className="divide-y divide-border">
                {list.map(entry => {
                  const isRevealed = revealed[entry.id];
                  const draft = drafts[entry.id];
                  const display = draft !== undefined ? draft : (entry.value ?? "");
                  const dirty = draft !== undefined && draft !== (entry.value ?? "");
                  return (
                    <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-mono font-semibold text-foreground">{entry.key}</code>
                          {entry.is_secret && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                              secret
                            </span>
                          )}
                          {entry.value && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                              set
                            </span>
                          )}
                        </div>
                        {entry.description && <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-72">
                          {entry.key === "CUSTOM_HEAD_SCRIPTS" ? (
                            <Textarea
                              value={display}
                              placeholder={'<!-- e.g. <script>...</script> or <meta name="..." content="..."> -->'}
                              onChange={e => setDrafts(p => ({ ...p, [entry.id]: e.target.value }))}
                              className="font-mono text-xs min-h-[110px] sm:w-96"
                            />
                          ) : (
                            <Input
                              type={entry.is_secret && !isRevealed ? "password" : "text"}
                              value={display}
                              placeholder={entry.is_secret ? "••••••••" : "Not set"}
                              onChange={e => setDrafts(p => ({ ...p, [entry.id]: e.target.value }))}
                              className={entry.is_secret ? "pr-9 font-mono text-xs" : "font-mono text-xs"}
                            />
                          )}
                          {entry.is_secret && entry.key !== "CUSTOM_HEAD_SCRIPTS" && (
                            <button type="button"
                              onClick={() => setRevealed(p => ({ ...p, [entry.id]: !p[entry.id] }))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                        <Button size="sm" onClick={() => save(entry)} disabled={!dirty || saving === entry.id}
                          className="rounded-full gap-1.5">
                          <Save className="w-3.5 h-3.5" />
                          {saving === entry.id ? "Saving" : "Save"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">Note:</strong> Values stored here are accessible from edge functions via the
        <code className="mx-1 px-1 rounded bg-secondary">app_configuration</code> table. For production secrets used at
        runtime by Lovable Cloud (e.g. Stripe webhooks), continue to use the platform's secret manager.
      </div>
    </div>
  );
};

export default ConfigurationTab;
