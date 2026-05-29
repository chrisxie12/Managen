import { cn } from "./utils";

export function LiveIndicator({ connected, className }: { connected: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "relative inline-flex size-2 rounded-full",
          connected ? "bg-green-500" : "bg-gray-400",
        )}
      >
        {connected && (
          <span className="absolute inset-0 rounded-full bg-green-500 motion-safe:animate-ping opacity-75" />
        )}
      </span>
      <span className="text-[11px] font-medium text-muted-foreground">
        {connected ? "Live" : "Offline"}
      </span>
    </div>
  );
}
