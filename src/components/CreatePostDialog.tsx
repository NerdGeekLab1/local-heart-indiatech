import { useRef, useState } from "react";
import { Image as ImageIcon, Video, X, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const TAG_TYPES = [
  { value: "location", label: "Location" },
  { value: "adventure", label: "Adventure" },
  { value: "experience", label: "Experience" },
];

export const CreatePostDialog = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tagType, setTagType] = useState<string>("");
  const [tagValue, setTagValue] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { toast({ title: "Max 50MB", variant: "destructive" }); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    if (!file) { toast({ title: "Add a photo or video", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("feed-media").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("feed-media").getPublicUrl(path);
      const media_type = file.type.startsWith("video") ? "video" : "image";
      const { error: insErr } = await supabase.from("feed_posts").insert({
        user_id: user.id, media_url: pub.publicUrl, media_type,
        caption: caption.trim() || null,
        tag_type: tagType || null,
        tag_value: tagType ? (tagValue.trim() || null) : null,
        location: location.trim() || null,
      });
      if (insErr) throw insErr;
      toast({ title: "Posted to feed! 🎉" });
      onClose();
    } catch (e: any) {
      toast({ title: "Failed to post", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent font-extrabold">Share to Feed</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        {preview ? (
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            {file?.type.startsWith("video") ? <video src={preview} className="w-full h-full object-cover" controls /> : <img src={preview} alt="preview" className="w-full h-full object-cover" />}
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} className="w-full aspect-square rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all bg-gradient-to-br from-primary/5 to-pink-500/5">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-primary-foreground shadow-lg"><ImageIcon className="w-7 h-7" /></div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-primary-foreground shadow-lg"><Video className="w-7 h-7" /></div>
            </div>
            <p className="text-sm font-bold text-foreground">Tap to upload photo or video</p>
            <p className="text-xs text-muted-foreground">Max 50MB · jpg, png, mp4</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => handleFile(e.target.files?.[0] || null)} />

        <Textarea placeholder="Write a caption…" value={caption} onChange={e => setCaption(e.target.value)} maxLength={500} rows={3} className="rounded-xl" />

        <div className="grid grid-cols-2 gap-2">
          <Select value={tagType} onValueChange={setTagType}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Tag type" /></SelectTrigger>
            <SelectContent>
              {TAG_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="rounded-xl" placeholder={tagType === "location" ? "e.g. Manali" : tagType === "adventure" ? "e.g. Trekking" : "e.g. Homestay"} value={tagValue} onChange={e => setTagValue(e.target.value)} maxLength={50} />
        </div>

        <Input className="rounded-xl" placeholder="📍 Location (optional)" value={location} onChange={e => setLocation(e.target.value)} maxLength={100} />

        <Button onClick={submit} disabled={submitting || !file} className="w-full rounded-full bg-gradient-to-r from-primary via-orange-500 to-pink-500 text-primary-foreground border-0 shadow-lg shadow-primary/30 hover:opacity-95 h-11 font-bold">
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting…</> : <><Sparkles className="w-4 h-4 mr-1" /> Share Post</>}
        </Button>
      </div>
    </DialogContent>
  );
};

export default CreatePostDialog;
