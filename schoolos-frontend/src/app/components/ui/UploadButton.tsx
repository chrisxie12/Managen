import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, FileText, ImageIcon } from "lucide-react";
import { cn } from "./utils";
import { Progress } from "./progress";
import { api } from "../../services/api";

interface UploadButtonProps {
  bucket: "student-photos" | "report-cards" | "documents";
  entityType?: string;
  entityId?: string;
  currentUrl?: string;
  onUploadComplete?: (result: { url: string; key: string }) => void;
  onError?: (error: string) => void;
  className?: string;
}

const BUCKET_ACCEPT: Record<string, string> = {
  "student-photos": "image/jpeg,image/png,image/webp,image/gif",
  "report-cards": "application/pdf",
  "documents": "image/jpeg,image/png,image/webp,image/gif,application/pdf",
};

const BUCKET_MAX_SIZE: Record<string, number> = {
  "student-photos": 2 * 1024 * 1024,
  "report-cards": 5 * 1024 * 1024,
  "documents": 10 * 1024 * 1024,
};

export function UploadButton({
  bucket,
  entityType,
  entityId,
  currentUrl,
  onUploadComplete,
  onError,
  className,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const handleFile = useCallback(async (file: File) => {
    const maxSize = BUCKET_MAX_SIZE[bucket] || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      onError?.(`File exceeds ${maxSize / 1024 / 1024} MB limit.`);
      return;
    }

    const acceptTypes = BUCKET_ACCEPT[bucket] || "image/*,application/pdf";
    const allowed = acceptTypes.split(",").map((t) => t.trim());
    const isAllowed = allowed.some((t) => {
      if (t.endsWith("/*")) return file.type.startsWith(t.replace("/*", "/"));
      return file.type === t;
    });
    if (!isAllowed) {
      onError?.(`File type ${file.type} is not supported for ${bucket}.`);
      return;
    }

    setUploading(true);
    setProgress(5);

    try {
      const res = await api.post<{ uploadUrl: string; key: string }>("/api/school/upload", {
        bucket,
        entity_type: entityType || bucket,
        entity_id: entityId || "",
        filename: file.name,
        content_type: file.type,
        file_size: file.size,
      });
      if (res.error) throw new Error(res.error);
      if (!res.data) throw new Error("Failed to get upload URL.");

      const { uploadUrl, key } = res.data;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 85) + 5);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(90);
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(file);
      });

      const confirmRes = await api.post("/api/school/upload/confirm", {
        key,
        bucket,
        entity_type: entityType || bucket,
        entity_id: entityId || "",
      });
      if (confirmRes.error) throw new Error(confirmRes.error);

      setProgress(100);
      setPreview(confirmKey);
      setTimeout(() => {
        onUploadComplete?.({ url: confirmKey, key: confirmKey });
        setProgress(0);
      }, 500);
    } catch (err: any) {
      setProgress(0);
      onError?.(err.message || "Upload failed.");
    } finally {
      setTimeout(() => setUploading(false), 600);
    }
  }, [bucket, entityType, entityId, onUploadComplete, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

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
            <img
              src={preview.startsWith("http") ? preview : `/api/school/files/${preview}`}
              alt="Preview"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
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
            <span className="text-[9px] text-muted-foreground/40 mt-1">{bucket.replace(/-/g, " ")}</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={BUCKET_ACCEPT[bucket] || "image/*,application/pdf"}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
              }
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
