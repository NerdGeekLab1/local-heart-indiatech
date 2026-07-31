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
  onUpload: (url: string) => void | Promise<void>;
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
    // Storage access is scoped to auth.uid(); never trust a caller-provided path.
    const safeFolder = user.id;

    setUploading(true);
    try {
      const file = await compressImage(raw, { maxDimension: 1280, quality: 0.82 });
      const ext = (file.name.split(".").pop() || "webp").toLowerCase();
      const path = `${safeFolder}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      await onUpload(publicUrl);
      setPreview(publicUrl);
      toast({ title: "Image uploaded! 📸", description: `${(file.size / 1024).toFixed(0)}KB after compression` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try another image.";
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
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
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
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
