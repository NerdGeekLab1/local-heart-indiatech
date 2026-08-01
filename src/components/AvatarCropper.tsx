import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AvatarCropperProps {
  file: File | null;
  open: boolean;
  /** Output edge length in px (square). */
  size?: number;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

/**
 * Square client-side cropper for profile pictures.
 * Renders the source image into a fixed-size canvas with pan + zoom,
 * then exports a WebP square so every avatar has consistent dimensions.
 */
export default function AvatarCropper({ file, open, size = 512, onCancel, onCropped }: AvatarCropperProps) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const VIEW = 288; // preview box edge in CSS px

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Draw preview: cover-fit the image in the square view, then apply zoom/pan.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = VIEW;
    canvas.height = VIEW;
    ctx.clearRect(0, 0, VIEW, VIEW);
    const base = Math.max(VIEW / img.width, VIEW / img.height);
    const scale = base * zoom;
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (VIEW - w) / 2 + offset.x, (VIEW - h) / 2 + offset.y, w, h);
  }, [img, zoom, offset]);

  useEffect(() => { draw(); }, [draw]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setOffset({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y });
  };
  const onPointerUp = () => { dragging.current = null; };

  const apply = async () => {
    if (!img || !file) return;
    setBusy(true);
    try {
      const out = document.createElement("canvas");
      out.width = size;
      out.height = size;
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      const ratio = size / VIEW;
      const base = Math.max(VIEW / img.width, VIEW / img.height);
      const scale = base * zoom * ratio;
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2 + offset.x * ratio, (size - h) / 2 + offset.y * ratio, w, h);
      const blob: Blob | null = await new Promise((res) => out.toBlob((b) => res(b), "image/webp", 0.85));
      if (!blob) throw new Error("Could not encode cropped image");
      const basename = file.name.replace(/\.[^.]+$/, "");
      onCropped(new File([blob], `${basename}-avatar.webp`, { type: "image/webp" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative rounded-full overflow-hidden bg-muted touch-none cursor-grab active:cursor-grabbing"
            style={{ width: VIEW, height: VIEW }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <canvas ref={canvasRef} className="block" />
          </div>
          <div className="w-full px-2">
            <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={([v]) => setZoom(v)} />
            <p className="mt-2 text-center text-xs text-muted-foreground">Drag to reposition · slide to zoom</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={apply} disabled={!img || busy}>{busy ? "Processing…" : "Use photo"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
