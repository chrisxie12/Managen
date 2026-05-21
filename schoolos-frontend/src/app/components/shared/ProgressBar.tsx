import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  colorClass?: string; // e.g., 'bg-green-500'
  heightClass?: string; // e.g., 'h-1.5'
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  colorClass = 'bg-blue-500', 
  heightClass = 'h-1.5',
  showLabel = false
}) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-700">{safeProgress.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heightClass}`}>
        <div 
          className={`${heightClass} ${colorClass} transition-all duration-500 ease-in-out`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};
