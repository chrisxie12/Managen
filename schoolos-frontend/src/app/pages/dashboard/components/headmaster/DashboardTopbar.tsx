import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Settings, Search, Menu, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { CommandPalette } from '../../../../components/CommandPalette';
import { getInitials, getCurrentTerm } from '../../../../utils/formatters';

interface DashboardTopbarProps {
  onToggleSidebar: () => void;
  unreadAlerts?: number;
  overdueFeesCount?: number;
}

export function DashboardTopbar({ onToggleSidebar, unreadAlerts = 0, overdueFeesCount = 0 }: DashboardTopbarProps) {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  const userName = user?.fullName || 'Admin';
  const role = user?.role || 'school_admin';
  const roleLabel = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const initials = getInitials(userName);
  const schoolName = school?.name || 'School';

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(schoolName)}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-tight">{schoolName}</h1>
              <span className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700 leading-tight">
                {getCurrentTerm()}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div
            onClick={() => setCommandOpen(true)}
            className="w-full flex items-center gap-2 bg-muted rounded-lg px-3 py-2 cursor-pointer text-xs text-muted-foreground hover:bg-muted/70 transition-colors"
          >
            <Search size={14} className="text-muted-foreground" />
            <span>Search menu, students, pages...</span>
            <span className="ml-auto text-[9px] text-muted-foreground bg-background px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadAlerts > 0 && (
            <button className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500 text-white animate-pulse">
              <AlertTriangle size={10} />
              UPDATES {unreadAlerts > 0 && `(${unreadAlerts})`}
            </button>
          )}

          {overdueFeesCount > 0 && (
            <button
              onClick={() => navigate('/dashboard/fee-reminders')}
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-500 text-white"
            >
              Fees Reminder {overdueFeesCount > 0 && `(${overdueFeesCount})`}
            </button>
          )}

          <button className="relative text-muted-foreground hover:text-foreground p-1.5">
            <Bell size={18} />
            {unreadAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadAlerts > 9 ? '9+' : unreadAlerts}
              </span>
            )}
          </button>

          <button onClick={() => navigate('/dashboard/settings')} className="text-muted-foreground hover:text-foreground p-1.5">
            <Settings size={18} />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-medium text-foreground leading-tight">{userName.split(' ')[0]}</div>
              <div className="text-[9px] text-muted-foreground">{roleLabel}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <CommandPalette />
    </>
  );
}
