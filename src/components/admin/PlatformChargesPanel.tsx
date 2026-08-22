import { useState } from "react";
import { BadgeCheck, IndianRupee, Loader2, Percent, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

/** Admin controls for GST, platform fee, handling charges and host verification milestones. */
export default function PlatformChargesPanel() {
  const { settings, setSettings, loading, reload } = usePlatformSettings();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const save = async () => {
    setSaving(true);
    const payload = {
      gst_percent: Number(settings.gst_percent) || 0,
      platform_fee_percent: Number(settings.platform_fee_percent) || 0,
      handling_charge: Number(settings.handling_charge) || 0,
      verification_min_profile_score: Number(settings.verification_min_profile_score) || 0,
      verification_min_listings: Number(settings.verification_min_listings) || 0,
      verification_min_completed_bookings: Number(settings.verification_min_completed_bookings) || 0,
      verification_min_rating: Number(settings.verification_min_rating) || 0,
      verification_auto_approve: settings.verification_auto_approve,
      verification_applications_enabled: settings.verification_applications_enabled,
    };
    const { error } = settings.id
      ? await supabase.from("platform_settings").update(payload).eq("id", settings.id)
      : await supabase.from("platform_settings").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Couldn't save settings", description: error.message, variant: "destructive" }); return; }
    await reload();
    toast({ title: "Platform charges updated" });
  };

  const numberField = (label: string, key: keyof typeof settings, suffix?: string, step = "1") => (
    <div key={String(key)}>
      <label className="text-sm font-medium text-foreground">{label}{suffix ? ` (${suffix})` : ""}</label>
      <Input
        type="number"
        step={step}
        className="mt-1"
        value={String(settings[key] ?? "")}
        onChange={e => setSettings(current => ({ ...current, [key]: Number(e.target.value) }))}
      />
    </div>
  );

  return (
    <div className="space-y-6" data-testid="platform-charges-panel">
      <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2"><IndianRupee className="w-4 h-4 text-primary" /> Taxes &amp; charges</h3>
        <p className="text-xs text-muted-foreground">Applied live on the booking summary and at checkout.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {numberField("GST", "gst_percent", "%", "0.5")}
          {numberField("Platform fee", "platform_fee_percent", "%", "0.5")}
          {numberField("Handling charge", "handling_charge", "₹")}
        </div>
      </div>

      <div className="rounded-lg bg-card p-5 shadow-card space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-primary" /> Host verification milestones</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {numberField("Minimum profile score", "verification_min_profile_score", "%")}
          {numberField("Minimum approved listings", "verification_min_listings")}
          {numberField("Minimum completed bookings", "verification_min_completed_bookings")}
          {numberField("Minimum rating", "verification_min_rating", "★", "0.1")}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
          <div><p className="text-sm font-medium text-foreground">Accept applications</p><p className="text-xs text-muted-foreground">Turn off to close verification applications.</p></div>
          <Switch checked={settings.verification_applications_enabled} onCheckedChange={value => setSettings(c => ({ ...c, verification_applications_enabled: value }))} />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
          <div><p className="text-sm font-medium text-foreground">Auto-approve on milestone</p><p className="text-xs text-muted-foreground">Verify instantly when every milestone is met.</p></div>
          <Switch checked={settings.verification_auto_approve} onCheckedChange={value => setSettings(c => ({ ...c, verification_auto_approve: value }))} />
        </div>
      </div>

      <Button size="sm" className="rounded-full gap-2" disabled={saving || loading} onClick={save}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save platform charges"}
      </Button>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Percent className="w-3 h-3" /> GST is calculated on subtotal + platform fee + handling charge.</p>
    </div>
  );
}
