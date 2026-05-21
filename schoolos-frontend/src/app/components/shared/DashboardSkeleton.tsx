import React from 'react';

interface DashboardSkeletonProps {
  layout: 'cards' | 'chart' | 'table' | 'list' | 'timeline';
  count?: number;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ layout, count = 1 }) => {
  const elements = Array.from({ length: count });

  if (layout === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {elements.map((_, i) => (
          <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-xl p-5 h-[140px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="w-8 h-4 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="w-24 h-6 bg-gray-200 rounded mb-2" />
              <div className="w-32 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'chart') {
    return (
      <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-5 h-[300px] flex flex-col">
        <div className="w-48 h-6 bg-gray-200 rounded mb-6" />
        <div className="flex-1 w-full bg-gray-100 rounded-lg" />
      </div>
    );
  }

  if (layout === 'table') {
    return (
      <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-5">
        <div className="w-48 h-6 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {elements.map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
              <div className="w-24 h-3 bg-gray-100 rounded" />
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return <div className="animate-pulse bg-gray-200 rounded-xl h-32 w-full" />;
};
