// Client-side image compression + responsive resize before uploading to storage.
// Keeps original aspect ratio; downscales to max dimension and encodes as WebP.

export interface CompressOptions {
  maxDimension?: number; // longest edge in px
  quality?: number; // 0..1
  mimeType?: "image/webp" | "image/jpeg";
}

export async function compressImage(
  file: File,
  { maxDimension = 1280, quality = 0.82, mimeType = "image/webp" }: CompressOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), mimeType, quality),
  );
  if (!blob || blob.size >= file.size) return file;

  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.${ext}`, { type: mimeType });
}
