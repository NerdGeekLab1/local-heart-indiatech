import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { KeyRound, Loader2 } from "lucide-react";

const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (pwd.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters", variant: "destructive" });
      return;
    }
    if (pwd !== confirmPwd) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setBusy(false);
    if (error) {
      toast({ title: "Couldn't change password", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password updated ✅", description: "Use the new password next time you sign in." });
    setPwd(""); setConfirmPwd(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
          <KeyRound className="w-3 h-3" /> Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Change password</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">New password</label>
            <Input type="password" autoComplete="new-password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Confirm new password</label>
            <Input type="password" autoComplete="new-password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Update password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
