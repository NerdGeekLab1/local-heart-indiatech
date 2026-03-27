import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Plus, Clock, CheckCircle, MessageCircle, Shield, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const categories = [
  { id: "service", label: "Service Quality", emoji: "🛎️" },
  { id: "payment", label: "Payment Dispute", emoji: "💳" },
  { id: "safety", label: "Safety Concern", emoji: "🛡️" },
  { id: "cancellation", label: "Cancellation Issue", emoji: "❌" },
  { id: "other", label: "Other", emoji: "📋" },
];

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  investigating: "bg-accent/10 text-accent",
  resolved: "bg-accent/10 text-accent",
  closed: "bg-secondary text-muted-foreground",
};

const Grievances = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "service", subject: "", description: "", against: "" });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("grievances")
        .select("*")
        .order("created_at", { ascending: false });
      setGrievances(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("grievances").insert({
      filed_by: user!.id,
      against: form.against || user!.id,
      category: form.category,
      subject: form.subject,
      description: form.description,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Grievance filed", description: "Our team will review and respond within 48 hours." });
      setShowForm(false);
      setForm({ category: "service", subject: "", description: "", against: "" });
      // Refetch
      const { data } = await supabase.from("grievances").select("*").order("created_at", { ascending: false });
      setGrievances(data || []);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto text-center">
          <div className="bg-card rounded-2xl p-10 shadow-card">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Grievance Resolution Center</h1>
            <p className="mt-2 text-muted-foreground">Sign in to file or track grievances</p>
            <Link to="/signup"><Button className="mt-6 rounded-full px-8">Sign In</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" /> Grievance Resolution
              </h1>
              <p className="mt-1 text-muted-foreground">File and track disputes for fair resolution</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="rounded-full gap-2">
              <Plus className="w-4 h-4" /> File Grievance
            </Button>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: FileText, title: "1. File", desc: "Describe your issue with details" },
              { icon: MessageCircle, title: "2. Review", desc: "Admin investigates both parties" },
              { icon: CheckCircle, title: "3. Resolve", desc: "Fair resolution within 48-72 hours" },
            ].map(s => (
              <div key={s.title} className="rounded-xl bg-card p-5 shadow-card text-center">
                <s.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-bold text-foreground text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="bg-card rounded-2xl p-6 shadow-card mb-8 space-y-4">
              <h2 className="text-lg font-bold text-foreground">File a New Grievance</h2>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setForm(p => ({ ...p, category: c.id }))}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                        form.category === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>{c.emoji} {c.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Subject *</label>
                <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of the issue" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Details *</label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Provide full details..." rows={5} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={submitting} className="rounded-full gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Submit Grievance
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-full">Cancel</Button>
              </div>
            </motion.div>
          )}

          {/* List */}
          <h2 className="text-xl font-bold text-foreground mb-4">Your Grievances ({grievances.length})</h2>
          {loading ? (
            <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl shadow-card">
              <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
              <p className="text-foreground font-medium">No grievances filed</p>
              <p className="text-sm text-muted-foreground mt-1">That's great! No disputes to resolve.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {grievances.map(g => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="rounded-xl bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {categories.find(c => c.id === g.category)?.emoji} {g.category}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[g.status] || statusColors.open}`}>
                          {g.status}
                        </span>
                        {g.priority === "high" && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">⚠️ High Priority</span>}
                      </div>
                      <h3 className="font-bold text-foreground mt-2">{g.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{g.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(g.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {g.resolution && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Resolution</p>
                      <p className="text-sm text-foreground">{g.resolution}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Grievances;
