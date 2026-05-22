import React from 'react';
import { FileQuestion } from 'lucide-react';

interface SectionEmptyProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SectionEmpty: React.FC<SectionEmptyProps> = ({ 
  title = 'No Data', 
  message, 
  icon = <FileQuestion className="w-8 h-8 text-gray-400" />,
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-xl text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-gray-700 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-4 max-w-sm">{message}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="px-4 py-2 bg-[#1a6b4a] text-white rounded-lg text-sm font-medium hover:bg-[#0f3d2b] transition-colors shadow-sm hover:shadow"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
