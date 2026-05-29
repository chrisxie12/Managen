import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SectionErrorProps {
  name: string;
  onRetry: () => void;
  message?: string;
}

export const SectionError: React.FC<SectionErrorProps> = ({ name, onRetry, message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-100 rounded-xl">
      <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
      <h4 className="text-sm font-bold text-gray-800 mb-1">Failed to load {name}</h4>
      <p className="text-xs text-gray-500 mb-4">{message || 'An error occurred while fetching data.'}</p>
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
};
