interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max, color = '#6366f1', height = 6 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, height, backgroundColor: color }}
      />
    </div>
  );
}
