import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/imageCompression";
import AvatarCropper from "@/components/AvatarCropper";

interface ImageUploadProps {
  bucket: "avatars" | "experience-images" | "trip-images";
  folder: string; // usually user id
  currentUrl?: string | null;
  onUpload: (url: string) => void | Promise<void>;
  className?: string;
  shape?: "circle" | "square";
  /** Show a square crop dialog before upload (recommended for profile pictures). */
  crop?: boolean;
}

/** Human-readable diagnostics for the most common storage/permission failures. */
const explainError = (error: unknown): string => {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const msg = raw.toLowerCase();
  if (msg.includes("row-level security") || msg.includes("row level security") || msg.includes("unauthorized")) {
    return "Storage permission denied — the file path must start with your user id. Try signing out and back in.";
  }
  if (msg.includes("bucket not found")) return "Storage bucket is missing. Please contact support.";
  if (msg.includes("payload too large") || msg.includes("exceeded")) return "Image is too large after compression. Try a smaller photo.";
  if (msg.includes("jwt") || msg.includes("token")) return "Your session expired. Please sign in again.";
  if (msg.includes("network") || msg.includes("failed to fetch")) return "Network problem while uploading. Check your connection and retry.";
  return raw || "Please try another image.";
};

const ImageUpload = ({ bucket, folder, currentUrl, onUpload, className = "", shape = "square", crop = false }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const doUpload = async (raw: File) => {
    // Ensure the auth session is loaded and the folder matches auth.uid so storage RLS passes.
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) console.error("[ImageUpload] auth.getUser failed", userError);
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in to upload.", variant: "destructive" });
      return;
    }
    // Storage access is scoped to auth.uid(); never trust a caller-provided path.
    const safeFolder = user.id;

    setUploading(true);
    let path = "";
    try {
      const file = await compressImage(raw, {
        maxDimension: bucket === "avatars" ? 512 : 1280,
        quality: 0.82,
      });
      const ext = (file.name.split(".").pop() || "webp").toLowerCase();
      path = `${safeFolder}/${Date.now()}.${ext}`;
      console.info("[ImageUpload] uploading", {
        bucket,
        path,
        userId: user.id,
        originalKB: Math.round(raw.size / 1024),
        compressedKB: Math.round(file.size / 1024),
        type: file.type,
      });

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      await onUpload(publicUrl);
      setPreview(publicUrl);
      console.info("[ImageUpload] upload complete", { bucket, path, publicUrl });
      toast({ title: "Image uploaded! 📸", description: `${(file.size / 1024).toFixed(0)}KB after compression` });
    } catch (error) {
      console.error("[ImageUpload] upload failed", { bucket, path, folder, error });
      toast({ title: "Upload failed", description: explainError(error), variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    if (raw.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (crop) {
      setPendingFile(raw);
      return;
    }
    await doUpload(raw);
  };

  const clear = () => {
    setPreview(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={`relative group ${className}`}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleSelect} className="hidden" />
      {crop && (
        <AvatarCropper
          open={!!pendingFile}
          file={pendingFile}
          onCancel={() => {
            setPendingFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          onCropped={async (file) => {
            setPendingFile(null);
            await doUpload(file);
          }}
        />
      )}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Upload"
            className={`w-full h-full object-cover ${shape === "circle" ? "rounded-full" : "rounded-lg"}`}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Remove image"
            onClick={clear}
            className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Change image"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 h-6 rounded-full text-[10px] px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Change"}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          aria-label="Upload image"
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
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
