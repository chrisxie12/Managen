interface TrendBadgeProps {
  value: number;
  inverse?: boolean;
}

export function TrendBadge({ value, inverse }: TrendBadgeProps) {
  const isPositive = inverse ? value < 0 : value > 0;
  const color = isPositive ? '#22c55e' : '#ef4444';

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold" style={{ color }}>
      {isPositive ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
}
