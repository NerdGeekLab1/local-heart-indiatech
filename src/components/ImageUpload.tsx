import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/imageCompression";

interface ImageUploadProps {
  bucket: "avatars" | "experience-images" | "trip-images";
  folder: string; // usually user id
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  className?: string;
  shape?: "circle" | "square";
}

const ImageUpload = ({ bucket, folder, currentUrl, onUpload, className = "", shape = "square" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    if (raw.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      return;
    }

    // Ensure the auth session is loaded and the folder matches auth.uid so storage RLS passes.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in to upload.", variant: "destructive" });
      return;
    }
    const safeFolder = folder || user.id;
    if (safeFolder !== user.id) {
      // Storage RLS requires the first path segment to be the user id.
      // Fall through with warning; some buckets allow admin overrides.
      console.warn("[ImageUpload] folder does not match auth.uid; storage RLS may reject upload");
    }

    setUploading(true);
    const file = await compressImage(raw, { maxDimension: 1280, quality: 0.82 });
    const ext = (file.name.split(".").pop() || "webp").toLowerCase();
    const path = `${safeFolder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: "31536000", // 1 year CDN cache
      contentType: file.type,
    });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded! 📸", description: `${(file.size / 1024).toFixed(0)}KB after compression` });
  };

  const clear = () => {
    setPreview(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={`relative group ${className}`}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Upload"
            className={`w-full h-full object-cover ${shape === "circle" ? "rounded-full" : "rounded-lg"}`}
          />
          <button
            onClick={clear}
            className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full h-full border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors ${
            shape === "circle" ? "rounded-full" : "rounded-lg"
          } bg-muted/30`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </>
          )}
        </button>
      )}
      {!preview && !uploading && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        />
      )}
    </div>
  );
};

export default ImageUpload;
