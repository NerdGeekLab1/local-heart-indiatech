import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Plus, Save, Send, Trash2, Edit3, Eye, FileText, Bell, Power, Code2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  variables: string[] | null;
  is_active: boolean;
  description: string | null;
  updated_at: string;
}

interface EmailNotification {
  id: string;
  template_name: string | null;
  recipient_email: string;
  subject: string;
  status: string;
  trigger_event: string | null;
  sent_at: string | null;
  created_at: string;
  error: string | null;
}

const CATEGORIES = [
  { id: "welcome", label: "Welcome", color: "bg-accent/10 text-accent" },
  { id: "verify_email", label: "Verify Email", color: "bg-primary/10 text-primary" },
  { id: "booking_confirmed", label: "Booking Confirmed", color: "bg-accent/10 text-accent" },
  { id: "booking_pending", label: "Booking Pending", color: "bg-primary/10 text-primary" },
  { id: "invoice", label: "Invoice", color: "bg-primary/10 text-primary" },
  { id: "password_reset", label: "Password Reset", color: "bg-destructive/10 text-destructive" },
  { id: "trip_reminder", label: "Trip Reminder", color: "bg-accent/10 text-accent" },
  { id: "review_request", label: "Review Request", color: "bg-primary/10 text-primary" },
  { id: "host_approved", label: "Host Approved", color: "bg-accent/10 text-accent" },
  { id: "subscription", label: "Subscription", color: "bg-primary/10 text-primary" },
  { id: "custom", label: "Custom", color: "bg-secondary text-muted-foreground" },
];

// Documented variables available per template category. Use {{name}} placeholders in subject and body.
const VARIABLE_REFERENCE: Record<string, { name: string; description: string }[]> = {
  global: [
    { name: "first_name", description: "Recipient's first name" },
    { name: "last_name", description: "Recipient's last name" },
    { name: "email", description: "Recipient email address" },
    { name: "site_name", description: "Platform name (e.g. Travelista)" },
    { name: "site_url", description: "Public site URL" },
    { name: "current_year", description: "Current year for footer" },
  ],
  welcome: [
    { name: "first_name", description: "Recipient's first name" },
    { name: "verify_url", description: "Email verification link" },
  ],
  verify_email: [
    { name: "first_name", description: "Recipient's first name" },
    { name: "verify_url", description: "Verification link (expires in 24h)" },
    { name: "otp_code", description: "One-time numeric code" },
  ],
  booking_confirmed: [
    { name: "first_name", description: "Traveler's first name" },
    { name: "host_name", description: "Host's name" },
    { name: "destination", description: "Trip destination" },
    { name: "start_date", description: "Check-in / start date" },
    { name: "end_date", description: "Check-out / end date" },
    { name: "guests", description: "Number of guests" },
    { name: "total_price", description: "Total booking amount (₹)" },
    { name: "booking_url", description: "Link to booking detail page" },
  ],
  booking_pending: [
    { name: "first_name", description: "Traveler's first name" },
    { name: "host_name", description: "Host being notified" },
    { name: "destination", description: "Trip destination" },
    { name: "start_date", description: "Requested start date" },
    { name: "review_url", description: "Link for the host to review the request" },
  ],
  invoice: [
    { name: "first_name", description: "Recipient's first name" },
    { name: "invoice_number", description: "Unique invoice number" },
    { name: "amount", description: "Subtotal before tax" },
    { name: "tax_amount", description: "Tax (18% GST)" },
    { name: "total_amount", description: "Grand total" },
    { name: "due_date", description: "Payment due date" },
    { name: "invoice_url", description: "Hosted invoice / PDF link" },
  ],
  password_reset: [
    { name: "first_name", description: "Recipient's first name" },
    { name: "reset_url", description: "Password reset link (expires in 1h)" },
  ],
  trip_reminder: [
    { name: "first_name", description: "Traveler's first name" },
    { name: "destination", description: "Trip destination" },
    { name: "start_date", description: "Start date" },
    { name: "days_until", description: "Days remaining until trip" },
    { name: "host_name", description: "Trip host" },
  ],
  review_request: [
    { name: "first_name", description: "Traveler's first name" },
    { name: "host_name", description: "Host to review" },
    { name: "experience_title", description: "Experience name" },
    { name: "review_url", description: "Link to leave a video review" },
  ],
  host_approved: [
    { name: "first_name", description: "Host's first name" },
    { name: "badge", description: "Awarded badge tier" },
    { name: "dashboard_url", description: "Host dashboard link" },
  ],
  subscription: [
    { name: "first_name", description: "Subscriber's first name" },
    { name: "tier", description: "Plan name (Explorer, Adventurer, Nomad)" },
    { name: "amount", description: "Plan price (₹)" },
    { name: "renewal_date", description: "Next billing date" },
    { name: "manage_url", description: "Link to manage subscription" },
  ],
  custom: [],
};

const EmailTemplatesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"templates" | "log">("templates");
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [previewing, setPreviewing] = useState<EmailTemplate | null>(null);
  const [sending, setSending] = useState<EmailTemplate | null>(null);
  const [sendForm, setSendForm] = useState({ recipient: "", values: {} as Record<string, string> });

  const load = async () => {
    setLoading(true);
    const [{ data: t }, { data: n }] = await Promise.all([
      supabase.from("email_templates").select("*").order("category", { ascending: true }),
      supabase.from("email_notifications").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setTemplates((t ?? []) as EmailTemplate[]);
    setLogs((n ?? []) as EmailNotification[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => setEditing({
    id: "", name: "", category: "custom", subject: "", body_html: "<p>Hello {{first_name}}</p>",
    body_text: "", variables: ["first_name"], is_active: true, description: "", updated_at: ""
  });

  const saveTemplate = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.subject.trim() || !editing.body_html.trim()) {
      toast({ title: "Name, subject and body are required", variant: "destructive" }); return;
    }
    const payload = {
      name: editing.name.trim(),
      category: editing.category,
      subject: editing.subject,
      body_html: editing.body_html,
      body_text: editing.body_text,
      variables: editing.variables ?? [],
      is_active: editing.is_active,
      description: editing.description,
      updated_by: user?.id,
    };
    if (editing.id) {
      const { error } = await supabase.from("email_templates").update(payload).eq("id", editing.id);
      if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
      toast({ title: "Template updated ✓" });
    } else {
      const { error } = await supabase.from("email_templates").insert({ ...payload, created_by: user?.id });
      if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
      toast({ title: "Template created ✓" });
    }
    setEditing(null);
    load();
  };

  const toggleActive = async (t: EmailTemplate) => {
    await supabase.from("email_templates").update({ is_active: !t.is_active }).eq("id", t.id);
    setTemplates(p => p.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await supabase.from("email_templates").delete().eq("id", id);
    setTemplates(p => p.filter(x => x.id !== id));
    toast({ title: "Template deleted" });
  };

  const interpolate = (str: string, values: Record<string, string>) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? `{{${k}}}`);

  const triggerSend = async () => {
    if (!sending) return;
    if (!sendForm.recipient.trim()) return toast({ title: "Recipient email required", variant: "destructive" });
    const subject = interpolate(sending.subject, sendForm.values);
    const body_html = interpolate(sending.body_html, sendForm.values);
    const { error } = await supabase.from("email_notifications").insert({
      template_id: sending.id,
      template_name: sending.name,
      recipient_email: sendForm.recipient.trim(),
      subject,
      body_html,
      payload: sendForm.values,
      status: "queued",
      trigger_event: "admin_manual_send",
      sent_by: user?.id,
    });
    if (error) return toast({ title: "Failed to queue", description: error.message, variant: "destructive" });
    toast({ title: "Notification queued 📨", description: `${sending.name} → ${sendForm.recipient}` });
    setSending(null);
    setSendForm({ recipient: "", values: {} });
    load();
  };

  const catColor = (c: string) => CATEGORIES.find(x => x.id === c)?.color || "bg-secondary text-muted-foreground";

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Email Templates & Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage transactional templates and trigger notifications. Use <code className="px-1 rounded bg-secondary text-xs">{"{{variable}}"}</code> for dynamic values.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={view === "templates" ? "default" : "outline"} onClick={() => setView("templates")} className="rounded-full gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Templates
          </Button>
          <Button size="sm" variant={view === "log" ? "default" : "outline"} onClick={() => setView("log")} className="rounded-full gap-1.5">
            <Bell className="w-3.5 h-3.5" /> Log ({logs.length})
          </Button>
          {view === "templates" && (
            <Button size="sm" onClick={startNew} className="rounded-full gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : view === "templates" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-card p-4 shadow-card flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground truncate">{t.name}</h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${catColor(t.category)}`}>
                      {t.category.replace("_", " ")}
                    </span>
                    {!t.is_active && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">paused</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.subject}</p>
                  {t.description && <p className="text-[11px] text-muted-foreground mt-1 italic">{t.description}</p>}
                  {t.variables && t.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.variables.map(v => (
                        <code key={v} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{`{{${v}}}`}</code>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                <Button size="sm" variant="ghost" onClick={() => setPreviewing(t)} className="rounded-full gap-1 text-xs h-7"><Eye className="w-3 h-3" /> Preview</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(t)} className="rounded-full gap-1 text-xs h-7"><Edit3 className="w-3 h-3" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSending(t); setSendForm({ recipient: "", values: {} }); }} className="rounded-full gap-1 text-xs h-7 text-primary"><Send className="w-3 h-3" /> Send</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(t)} className="rounded-full gap-1 text-xs h-7"><Power className="w-3 h-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => deleteTemplate(t.id)} className="rounded-full gap-1 text-xs h-7 text-destructive ml-auto"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </motion.div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">No templates yet — click "New" to create one.</div>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-card shadow-card overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No notifications triggered yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map(l => (
                <div key={l.id} className="p-3 flex items-center gap-3 text-sm">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    l.status === "sent" ? "bg-accent/10 text-accent" :
                    l.status === "failed" ? "bg-destructive/10 text-destructive" :
                    "bg-primary/10 text-primary"
                  }`}>{l.status}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{l.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {l.template_name} → {l.recipient_email}
                      {l.trigger_event && <> · <em>{l.trigger_event}</em></>}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{new Date(l.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl shadow-elevated max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">{editing.id ? "Edit" : "New"} Template</h3>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Name *</label>
                  <Input className="mt-1" value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : p)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    value={editing.category} onChange={e => setEditing(p => p ? { ...p, category: e.target.value } : p)}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Subject *</label>
                <Input className="mt-1" value={editing.subject} onChange={e => setEditing(p => p ? { ...p, subject: e.target.value } : p)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Input className="mt-1" value={editing.description ?? ""} onChange={e => setEditing(p => p ? { ...p, description: e.target.value } : p)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Variables (comma separated)</label>
                <Input className="mt-1 font-mono text-xs"
                  value={(editing.variables ?? []).join(", ")}
                  onChange={e => setEditing(p => p ? { ...p, variables: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } : p)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Body (HTML) *</label>
                <Textarea className="mt-1 font-mono text-xs min-h-[200px]" value={editing.body_html}
                  onChange={e => setEditing(p => p ? { ...p, body_html: e.target.value } : p)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Plain text fallback</label>
                <Textarea className="mt-1 text-xs" value={editing.body_text ?? ""}
                  onChange={e => setEditing(p => p ? { ...p, body_text: e.target.value } : p)} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing(p => p ? { ...p, is_active: e.target.checked } : p)} className="accent-primary" />
                <span className="text-foreground">Active (eligible for triggers)</span>
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={saveTemplate} className="rounded-full gap-1.5"><Save className="w-3.5 h-3.5" /> Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full">Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {previewing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewing(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl shadow-elevated max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Preview</p>
            <h3 className="text-lg font-bold text-foreground mb-1">{previewing.subject}</h3>
            <p className="text-xs text-muted-foreground mb-4">From: Travelista &lt;notify@travelista.app&gt;</p>
            <div className="border border-border rounded-lg p-4 bg-background prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: previewing.body_html }} />
            <Button variant="outline" onClick={() => setPreviewing(null)} className="rounded-full mt-4">Close</Button>
          </motion.div>
        </div>
      )}

      {/* Send Modal */}
      {sending && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSending(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl shadow-elevated max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground mb-1">Trigger: {sending.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">Queue this notification for the chosen recipient.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Recipient email *</label>
                <Input type="email" className="mt-1" value={sendForm.recipient} onChange={e => setSendForm(p => ({ ...p, recipient: e.target.value }))} placeholder="user@example.com" />
              </div>
              {(sending.variables ?? []).map(v => (
                <div key={v}>
                  <label className="text-xs font-medium text-muted-foreground">{v}</label>
                  <Input className="mt-1" value={sendForm.values[v] ?? ""}
                    onChange={e => setSendForm(p => ({ ...p, values: { ...p.values, [v]: e.target.value } }))} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={triggerSend} className="rounded-full gap-1.5"><Send className="w-3.5 h-3.5" /> Queue Notification</Button>
              <Button variant="outline" onClick={() => setSending(null)} className="rounded-full">Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplatesTab;
