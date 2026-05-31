import { Skeleton } from "./skeleton";

type SkeletonVariant = "card" | "table" | "form" | "chart" | "text" | "metric";

interface SkeletonLoaderProps {
  variant: SkeletonVariant;
  count?: number;
  rows?: number;
}

function CardSkeleton() {
  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-11 h-11 rounded-2xl" />
      </div>
      <Skeleton className="h-7 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <Skeleton className="w-11 h-11 rounded-2xl mb-4" />
      <Skeleton className="h-8 w-20 mb-1" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <div className="p-4 border-b" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
        <div className="flex gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-8 p-4"
          style={{ borderBottom: i < rows - 1 ? "1px solid rgba(10,36,114,0.05)" : "none" }}
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="flex items-end gap-2 h-40">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    </div>
  );
}

function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

export function SkeletonLoader({ variant, count = 1, rows = 5 }: SkeletonLoaderProps) {
  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "metric") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return <TableSkeleton rows={rows} />;
  }

  if (variant === "form") {
    return <FormSkeleton />;
  }

  if (variant === "chart") {
    return <ChartSkeleton />;
  }

  if (variant === "text") {
    return <TextSkeleton lines={rows} />;
  }

  return null;
}
