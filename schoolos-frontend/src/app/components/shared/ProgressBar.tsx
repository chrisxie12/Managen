import React from 'react';

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  color?: string;
  heightClass?: string;
  size?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  colorClass,
  color,
  heightClass = 'h-1.5',
  size,
  showLabel = false
}) => {
  const resolvedColorClass = colorClass || (color ? '' : 'bg-blue-500');
  const resolvedHeightClass = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-3' : heightClass;
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-700">{safeProgress.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${resolvedHeightClass}`}>
        <div
          className={`${resolvedHeightClass} ${resolvedColorClass} transition-all duration-500 ease-in-out`}
          style={{ width: `${safeProgress}%`, ...(color ? { background: color } : {}) }}
        />
      </div>
    </div>
  );
};
