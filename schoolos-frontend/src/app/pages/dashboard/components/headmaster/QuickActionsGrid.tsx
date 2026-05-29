import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  href?: string;
  action?: 'openSmartFeeReminders';
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Collect Fees', icon: '💰', color: '#3b82f6', href: '/dashboard/finance/collect' },
  { label: 'Reports', icon: '📊', color: '#22c55e', href: '/dashboard/reports' },
  { label: 'Certificates', icon: '📜', color: '#f97316', href: '/dashboard/certificates' },
  { label: 'Designations', icon: '👤', color: '#8b5cf6', href: '/dashboard/hr/designations' },
  { label: 'Promote Students', icon: '📈', color: '#14b8a6', href: '/dashboard/students/promote' },
  { label: 'Fees Discount', icon: '💸', color: '#ef4444', href: '/dashboard/finance/discounts' },
  { label: 'Search Due Fees', icon: '🔍', color: '#6366f1', href: '/dashboard/finance/search-dues' },
  { label: 'Class Wise Attendance', icon: '📋', color: '#eab308', href: '/dashboard/attendance' },
  { label: 'Student Admission', icon: '🎓', color: '#ec4899', href: '/dashboard/admissions/new' },
  { label: 'Approve Leave', icon: '✅', color: '#16a34a', href: '/dashboard/hr/leave' },
  { label: 'Assign Fees', icon: '💳', color: '#2563eb', href: '/dashboard/finance/assign' },
  { label: 'Postal Records', icon: '📬', color: '#6b7280', href: '/dashboard/operations/postal' },
  { label: 'Enter Marks', icon: '📝', color: '#7c3aed', href: '/dashboard/gradebook' },
  { label: 'Report Cards', icon: '📄', color: '#0d9488', href: '/dashboard/report-cards' },
  { label: 'AI Fee Reminder', icon: '🤖', color: '#15803d', action: 'openSmartFeeReminders' },
  { label: 'Send Notice', icon: '📢', color: '#ea580c', href: '/dashboard/notices/new' },
];

interface QuickActionsGridProps {
  onOpenFeeReminders?: () => void;
}

export function QuickActionsGrid({ onOpenFeeReminders }: QuickActionsGridProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return QUICK_ACTIONS;
    const q = search.toLowerCase();
    return QUICK_ACTIONS.filter(a => a.label.toLowerCase().includes(q));
  }, [search]);

  const handleClick = (action: QuickAction) => {
    if (action.action === 'openSmartFeeReminders' && onOpenFeeReminders) {
      onOpenFeeReminders();
      return;
    }
    if (action.href) {
      navigate(action.href);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
        <span className="text-sm font-bold text-foreground">⚡ Quick Actions</span>
        <div className="flex-1 max-w-xs relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Find an app... (e.g. Fees)"
            className="w-full text-xs bg-muted border border-border rounded-md px-3 py-1.5 placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <a href="/dashboard/apps" className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">
          View All
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {filtered.map(action => (
          <button
            key={action.label}
            onClick={() => handleClick(action)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[11px] font-bold transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: action.color }}
          >
            <span className="text-sm">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 py-2">
            No apps match "{search}"
          </p>
        )}
      </div>
    </div>
  );
}
