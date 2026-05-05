import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[2000] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className="pointer-events-auto"
          >
            <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const types = {
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  };

  const config = types[toast.type] || types.info;
  const Icon = config.icon;

  return (
    <div className={`min-w-[320px] max-w-md p-4 rounded-2xl border ${config.bg} ${config.border} shadow-lg shadow-black/5 flex items-start gap-3 relative overflow-hidden group`}>
      <div className={`mt-0.5 ${config.color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-text-primary leading-tight mb-1">{toast.title}</h4>
        <p className="text-xs text-text-secondary font-medium leading-normal">{toast.message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors p-1"
      >
        <X size={16} />
      </button>
      
      {/* Auto-dismiss progress bar */}
      <motion.div 
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${config.color.replace('text', 'bg')}`}
      />
    </div>
  );
};
