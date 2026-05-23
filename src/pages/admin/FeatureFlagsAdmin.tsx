import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus, Trash2, UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Flag { id: string; flag_key: string; label: string; description: string | null; enabled_globally: boolean; }
interface Grant { id: string; user_id: string; flag_key: string; }

export default function FeatureFlagsAdmin() {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [newFlag, setNewFlag] = useState({ flag_key: "", label: "", description: "" });
  const [grantInputs, setGrantInputs] = useState<Record<string, string>>({});

  const load = async () => {
    const { data: f } = await supabase.from("feature_flags").select("*").order("created_at");
    const { data: g } = await supabase.from("user_feature_flags").select("*");
    setFlags((f ?? []) as Flag[]);
    setGrants((g ?? []) as Grant[]);
  };

  useEffect(() => { load(); }, []);

  if (loading) return null;
  if (userRole !== "admin") return <Navigate to="/" replace />;

  const toggleGlobal = async (flag: Flag) => {
    await supabase.from("feature_flags").update({ enabled_globally: !flag.enabled_globally }).eq("id", flag.id);
    load();
  };
  const createFlag = async () => {
    if (!newFlag.flag_key || !newFlag.label) return;
    const { error } = await supabase.from("feature_flags").insert(newFlag);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { setNewFlag({ flag_key: "", label: "", description: "" }); load(); }
  };
  const deleteFlag = async (id: string) => {
    await supabase.from("feature_flags").delete().eq("id", id);
    load();
  };
  const grantToUser = async (flag_key: string) => {
    const userId = grantInputs[flag_key]?.trim();
    if (!userId || !user) return;
    const { error } = await supabase.from("user_feature_flags").insert({ user_id: userId, flag_key, granted_by: user.id });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { setGrantInputs({ ...grantInputs, [flag_key]: "" }); load(); toast({ title: "Granted" }); }
  };
  const revoke = async (id: string) => {
    await supabase.from("user_feature_flags").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Feature Flags</h1>
        <p className="text-muted-foreground mb-8">Control beta features per user or globally.</p>

        <section className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="font-semibold mb-3">Create flag</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div><Label>Key</Label><Input placeholder="my_beta_feature" value={newFlag.flag_key} onChange={e => setNewFlag({ ...newFlag, flag_key: e.target.value })} /></div>
            <div><Label>Label</Label><Input value={newFlag.label} onChange={e => setNewFlag({ ...newFlag, label: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={newFlag.description} onChange={e => setNewFlag({ ...newFlag, description: e.target.value })} /></div>
          </div>
          <Button onClick={createFlag} className="mt-3"><Plus className="w-4 h-4 mr-1" /> Add flag</Button>
        </section>

        <section className="space-y-4">
          {flags.map(f => {
            const flagGrants = grants.filter(g => g.flag_key === f.flag_key);
            return (
              <div key={f.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold">{f.label} <code className="text-xs text-muted-foreground ml-2">{f.flag_key}</code></h3>
                    {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2"><Label className="text-xs">Global</Label><Switch checked={f.enabled_globally} onCheckedChange={() => toggleGlobal(f)} /></div>
                    <Button size="icon" variant="ghost" onClick={() => deleteFlag(f.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1"><Label className="text-xs">Grant to user ID</Label><Input value={grantInputs[f.flag_key] ?? ""} onChange={e => setGrantInputs({ ...grantInputs, [f.flag_key]: e.target.value })} placeholder="uuid" /></div>
                  <Button onClick={() => grantToUser(f.flag_key)}><UserPlus className="w-4 h-4 mr-1" /> Grant</Button>
                </div>
                {flagGrants.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {flagGrants.map(g => (
                      <div key={g.id} className="flex items-center justify-between text-xs bg-muted/40 rounded px-2 py-1">
                        <code>{g.user_id}</code>
                        <Button size="sm" variant="ghost" onClick={() => revoke(g.id)}>Revoke</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}
