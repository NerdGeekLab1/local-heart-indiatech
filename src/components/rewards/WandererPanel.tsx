import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Trophy, Video, MapPin, Plus, Clock, CheckCircle2, Compass, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { APPROVED_WANDERER_STATUSES, useMyMissions, useMyWanderer, useRequestMission } from "@/hooks/useWanderer";

const MISSION_STATUS_STYLES: Record<string, string> = {
  requested: "bg-primary/10 text-primary",
  assigned: "bg-chart-4/10 text-chart-4",
  in_progress: "bg-chart-4/10 text-chart-4",
  completed: "bg-accent/10 text-accent",
  cancelled: "bg-destructive/10 text-destructive",
};

const BADGE_EMOJI: Record<string, string> = { explorer: "🧭", trailblazer: "🔥", pioneer: "🚀", legend: "👑" };

/**
 * Traveler dashboard Beta Wanderer panel. Before approval it shows the programme pitch
 * and application status; once approved it becomes the wanderer's mission cockpit with
 * score, badge, mission list and a mission request form that reaches the admin queue.
 */
const WandererPanel = () => {
  const { toast } = useToast();
  const { data: wanderer, isLoading } = useMyWanderer();
  const approved = !!wanderer && APPROVED_WANDERER_STATUSES.includes(wanderer.status);
  const { data: missions = [] } = useMyMissions(approved ? wanderer!.id : null);
  const requestMission = useRequestMission();
  const [form, setForm] = useState({ title: "", destination: "", description: "", deadline: "" });
  const [showForm, setShowForm] = useState(false);

  const submit = async () => {
    if (!wanderer) return;
    if (!form.title.trim() || !form.destination.trim()) {
      toast({ title: "Add a title and destination", variant: "destructive" });
      return;
    }
    try {
      await requestMission.mutateAsync({
        wandererId: wanderer.id,
        title: form.title.trim(),
        destination: form.destination.trim(),
        description: form.description.trim(),
        deadline: form.deadline || undefined,
      });
      toast({ title: "Mission requested", description: "Our team reviews requests within 48 hours." });
      setForm({ title: "", destination: "", description: "", deadline: "" });
      setShowForm(false);
    } catch (e: any) {
      toast({ title: "Request failed", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="mt-6 text-sm text-muted-foreground">Loading your wanderer profile…</p>;

  if (!approved) {
    return (
      <div className="mt-6" data-testid="wanderer-panel">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-8 text-center mb-6">
          <div className="text-4xl mb-3">🧭</div>
          <h2 className="text-2xl font-bold text-foreground">Beta Wanderer Program</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Travel to unexplored destinations, shoot videos, share feedback, and earn rewards as a community explorer.
          </p>
          {wanderer ? (
            <div className="mt-4 inline-flex flex-col items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-card text-primary capitalize">
                Application {wanderer.status}
              </span>
              <p className="text-xs text-muted-foreground max-w-md">
                {wanderer.status === "pending"
                  ? "We're reviewing your application — missions unlock as soon as you're approved."
                  : wanderer.admin_notes || "Reach out to support if you think this status is wrong."}
              </p>
            </div>
          ) : (
            <div className="flex gap-3 justify-center mt-4">
              <Link to="/beta-wanderer-apply"><Button className="rounded-full gap-2"><Target className="w-4 h-4" /> Apply Now</Button></Link>
              <Link to="/beta-wanderers"><Button variant="outline" className="rounded-full">View All Wanderers</Button></Link>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📸", title: "Shoot Videos", desc: "Document your travels with authentic video content" },
            { icon: "🗺️", title: "Explore Places", desc: "Visit new and offbeat destinations across India" },
            { icon: "🏆", title: "Earn Rewards", desc: "Build your score, earn badges, and get featured" },
          ].map(b => (
            <div key={b.title} className="rounded-xl bg-card p-5 shadow-card text-center">
              <span className="text-3xl">{b.icon}</span>
              <h3 className="font-bold text-foreground mt-2">{b.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completed = missions.filter(m => m.status === "completed");
  const active = missions.filter(m => ["assigned", "in_progress"].includes(m.status));
  const requested = missions.filter(m => m.status === "requested");

  return (
    <div className="mt-6 space-y-5" data-testid="wanderer-panel">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-card border-2 border-primary flex items-center justify-center text-2xl">
            {BADGE_EMOJI[wanderer!.badge || "explorer"] || "🧭"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{wanderer!.full_name}</h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">
                {wanderer!.badge || "explorer"}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-card text-primary">Approved Wanderer</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {wanderer!.city}
              {wanderer!.travel_styles?.length ? ` · ${wanderer!.travel_styles.slice(0, 3).join(", ")}` : ""}
            </p>
          </div>
          <Link to={`/beta-wanderer/${wanderer!.id}`}>
            <Button variant="outline" size="sm" className="rounded-full text-xs gap-1"><Compass className="w-3 h-3" /> Public profile</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Wanderer score", value: wanderer!.score || 0, icon: Trophy },
            { label: "Missions done", value: completed.length, icon: CheckCircle2 },
            { label: "Active missions", value: active.length, icon: Target },
            { label: "Videos shared", value: wanderer!.total_videos || 0, icon: Video },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-card p-3 text-center shadow-card">
              <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> My missions ({missions.length})</h3>
          <Button size="sm" className="rounded-full text-xs gap-1" onClick={() => setShowForm(v => !v)} data-testid="request-mission-toggle">
            <Plus className="w-3 h-3" /> Request a mission
          </Button>
        </div>

        {showForm && (
          <div className="rounded-xl bg-secondary/40 p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Mission title (e.g. Spiti winter trail)" className="h-9 text-sm" />
              <Input value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} placeholder="Destination (e.g. Kaza, Himachal)" className="h-9 text-sm" />
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What will you cover?" className="h-9 text-sm" />
              <Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="h-9 text-sm" />
            </div>
            <Button size="sm" className="rounded-full text-xs gap-1" disabled={requestMission.isPending} onClick={submit}>
              <Send className="w-3 h-3" /> Send request to admin
            </Button>
          </div>
        )}

        {missions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No missions yet — request one and our team will assign points and a deadline.</p>
        ) : (
          <div className="space-y-2">
            {missions.map(m => (
              <div key={m.id} className="rounded-lg border border-border p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    <MapPin className="w-3 h-3 inline mr-1" />{m.destination}
                    {m.deadline ? ` · due ${new Date(m.deadline).toLocaleDateString()}` : ""}
                    {m.reward_points ? ` · +${m.reward_points} pts` : ""}
                  </p>
                  {m.description && <p className="text-[11px] text-muted-foreground mt-0.5">{m.description}</p>}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MISSION_STATUS_STYLES[m.status] || "bg-secondary text-muted-foreground"}`}>
                  {m.status === "requested" ? <><Clock className="w-3 h-3 inline mr-1" />awaiting approval</> : m.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
        {requested.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-3">
            {requested.length} request{requested.length > 1 ? "s" : ""} pending with the Travelista beta team.
          </p>
        )}
      </div>
    </div>
  );
};

export default WandererPanel;
