import { useState, useRef, useCallback } from "react";
import { Video, Upload, Square, Circle, Play, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoRecorderProps {
  onVideoReady: (videoUrl: string, type: "recorded" | "uploaded") => void;
  label?: string;
  required?: boolean;
}

const VideoRecorder = ({ onVideoReady, label = "Video", required = false }: VideoRecorderProps) => {
  const [mode, setMode] = useState<"choose" | "record" | "upload" | "preview">("choose");
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setMode("record");
    } catch {
      setError("Camera access denied. Please allow camera permissions or upload a video file instead.");
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setMode("preview");
      stopCamera();
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { setError("Please select a video file"); return; }
    if (file.size > 50 * 1024 * 1024) { setError("Video must be under 50MB"); return; }
    setError(null);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setMode("preview");
  }, []);

  const confirmVideo = useCallback(() => {
    if (videoUrl) onVideoReady(videoUrl, mode === "record" ? "recorded" : "uploaded");
  }, [videoUrl, mode, onVideoReady]);

  const reset = useCallback(() => {
    stopCamera();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setMode("choose");
    setError(null);
  }, [videoUrl, stopCamera]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {required && <span className="text-xs text-destructive">*Required</span>}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>
      )}

      {mode === "choose" && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={startCamera}
            className="rounded-lg border-2 border-dashed border-border p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors">
            <Circle className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium text-foreground">Record Video</span>
            <span className="text-xs text-muted-foreground">Use your camera</span>
          </button>
          <label className="rounded-lg border-2 border-dashed border-border p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium text-foreground">Upload Video</span>
            <span className="text-xs text-muted-foreground">MP4, WebM (max 50MB)</span>
            <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {mode === "record" && (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-foreground/5">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {recording && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                <div className="w-2 h-2 rounded-full bg-destructive-foreground" /> REC
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-center">
            {!recording ? (
              <Button onClick={startRecording} className="gap-2 rounded-full">
                <Circle className="w-4 h-4" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="gap-2 rounded-full">
                <Square className="w-4 h-4" /> Stop
              </Button>
            )}
            <Button onClick={() => { stopCamera(); setMode("choose"); }} variant="outline" className="rounded-full">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {mode === "preview" && videoUrl && (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-foreground/5">
            <video src={videoUrl} className="w-full h-full object-cover" controls />
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={confirmVideo} className="gap-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Check className="w-4 h-4" /> Use This Video
            </Button>
            <Button onClick={reset} variant="outline" className="gap-2 rounded-full">
              <X className="w-4 h-4" /> Re-do
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
