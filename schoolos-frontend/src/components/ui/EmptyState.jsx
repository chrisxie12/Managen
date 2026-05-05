import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({ 
  icon: Icon = Inbox, 
  title = "No records found", 
  description = "There are no entries to display at the moment.", 
  actionLabel, 
  onAction,
  isSearch = false 
}) => {
  const ActiveIcon = isSearch ? SearchX : Icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-20 text-center"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-100 shadow-inner">
        <ActiveIcon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight">{title}</h3>
      <p className="text-text-muted text-sm max-w-[280px] leading-relaxed mb-8">
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
