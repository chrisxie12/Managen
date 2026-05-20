import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, FileText, ImageIcon } from "lucide-react";
import { cn } from "./utils";
import { Progress } from "./progress";
import { api } from "../../services/api";

interface UploadButtonProps {
  bucket: "student-photos" | "report-cards" | "documents";
  accept?: string;
  maxSize?: number;
  currentUrl?: string;
  onUploadComplete?: (result: { url: string; path: string }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function UploadButton({
  bucket,
  accept = "image/*,application/pdf",
  maxSize = 5 * 1024 * 1024,
  currentUrl,
  onUploadComplete,
  onError,
  className,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const simulateProgress = useCallback(() => {
    setProgress(10);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 20;
      });
    }, 300);
    return interval;
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      onError?.(`File exceeds ${maxSize / 1024 / 1024} MB limit.`);
      return;
    }

    setUploading(true);
    const interval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const res = await api.upload<{ url: string; path: string }>("/api/school/upload", formData);
      if (res.error) throw new Error(res.error);
      if (!res.data) throw new Error("Upload returned no data.");

      clearInterval(interval);
      setProgress(100);
      setPreview(res.data.url);
      setTimeout(() => {
        onUploadComplete?.(res.data!);
        setProgress(0);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setProgress(0);
      onError?.(err.message || "Upload failed.");
    } finally {
      setTimeout(() => setUploading(false), 600);
    }
  }, [bucket, maxSize, onUploadComplete, onError, simulateProgress]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const isImage = preview && (preview.match(/\.(jpe?g|png|webp|gif)/i) || !preview.includes("pdf"));

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center w-32 h-32 rounded-2xl cursor-pointer transition-all border-2 border-dashed",
          uploading ? "pointer-events-none opacity-60" : "hover:border-primary/40 hover:bg-primary/5",
          preview ? "border-transparent" : "border-muted-foreground/20",
        )}
        style={{ background: preview ? "transparent" : undefined }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Uploading...</span>
          </div>
        ) : preview ? (
          <>
            {isImage ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <FileText className="size-8 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground text-center px-2 break-all">PDF</span>
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <ImageIcon className="size-8 text-muted-foreground/50 mb-1" />
            <span className="text-[11px] text-muted-foreground/60 text-center px-1 leading-tight">Click or drop file</span>
            <span className="text-[9px] text-muted-foreground/40 mt-1">{accept.replace(/,/g, ", ")}</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                if (file.type.startsWith("image/")) setPreview(reader.result as string);
              };
              if (file.type.startsWith("image/")) reader.readAsDataURL(file);
              handleFile(file);
            }
          }}
        />
      </div>

      {uploading && progress > 0 && (
        <div className="w-full max-w-[128px]">
          <Progress value={progress} className="h-1" />
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}
