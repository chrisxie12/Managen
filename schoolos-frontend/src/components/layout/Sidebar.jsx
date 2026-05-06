import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../ui/Logo';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  FileText, 
  BarChart3, 
  Calendar, 
  Wallet, 
  Banknote, 
  Receipt, 
  Library, 
  Building2, 
  MessageSquare, 
  Settings2,
  LogOut,
  X,
  BellRing,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  HardDrive,
  Database,
  LifeBuoy,
  Flag,
  CreditCard,
  History,
  Activity,
  Shield,
  Globe
} from 'lucide-react';

const Sidebar = ({ activeItem = 'dashboard', onNavigate, isOpen, isCollapsed, onToggleCollapse, onClose }) => {
  const { authSession, signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const role = (authSession?.user?.role || authSession?.role || 'admin').toLowerCase();

  const allSections = [
    {
      title: "Main",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant', 'teacher', 'headmaster', 'parent', 'student'] },
        { id: 'superadmin-dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['superadmin'] },
      ]
    },
    {
      title: "Management",
      items: [
        { id: 'schools', label: 'Schools', icon: Building2, roles: ['superadmin'] },
        { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'accountant', 'headmaster'] },
        { id: 'teachers', label: 'Teachers', icon: Users, roles: ['admin', 'headmaster'] },
        { id: 'classes', label: 'Classes', icon: BookOpen, roles: ['admin', 'teacher', 'headmaster'] },
        { id: 'global-users', label: 'Users', icon: Users, roles: ['superadmin'] },
      ]
    },
    {
      title: "Finance",
      items: [
        { id: 'fees', label: 'Fees', icon: Wallet, roles: ['admin', 'accountant', 'headmaster'] },
        { id: 'fees', label: 'Pay via MoMo', icon: Zap, roles: ['parent'] },
        { id: 'billing', label: 'Billing', icon: CreditCard, roles: ['superadmin'] },
        { id: 'subscriptions', label: 'Subscriptions', icon: History, roles: ['superadmin'] },
      ]
    },
    {
      title: "Academic",
      items: [
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['admin', 'teacher', 'headmaster', 'parent', 'student'] },
        { id: 'exams', label: 'Exams', icon: FileText, roles: ['admin', 'teacher', 'headmaster'] },
        { id: 'results', label: 'Results', icon: BarChart3, roles: ['admin', 'teacher', 'headmaster', 'parent', 'student'] },
        { id: 'timetable', label: 'Timetable', icon: Calendar, roles: ['admin', 'teacher', 'headmaster', 'parent', 'student'] },
      ]
    },
    {
        title: "Analytics",
        items: [
           { id: 'global-reports', label: 'Reports', icon: BarChart3, roles: ['superadmin'] },
           { id: 'usage-stats', label: 'Usage', icon: Activity, roles: ['superadmin'] },
        ]
    },
    {
      title: "Platform",
      items: [
        { id: 'communication', label: 'Communication', icon: MessageSquare, roles: ['admin', 'superadmin', 'teacher', 'parent'] },
        { id: 'system-config', label: 'System', icon: Settings2, roles: ['superadmin'] },
        { id: 'security', label: 'Security', icon: ShieldAlert, roles: ['superadmin'] },
        { id: 'support', label: 'Support', icon: LifeBuoy, roles: ['superadmin'] },
      ]
    }
  ];

  const navSections = allSections.map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || item.roles.includes(role))
  })).filter(section => section.items.length > 0);

  const sidebarContent = (
    <div 
      className={`flex flex-col h-full overflow-hidden transition-all duration-300 relative`} 
      style={{ 
        background: "#1E1B4B", // Deep Indigo
        color: "#E2E8F0",
        width: isCollapsed ? '80px' : '260px'
      }}
    >
      {/* Branding Section */}
      <div className={`px-6 py-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <Logo size={32} light />}
        {isCollapsed && <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black">S</div>}
      </div>

      {/* Collapse Toggle (Desktop only) */}
      <button 
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute top-10 -right-3 w-6 h-6 bg-[#4338CA] rounded-full items-center justify-center border border-white/20 shadow-lg text-white hover:bg-[#4F46E5] transition-all z-[60]"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto no-scrollbar px-3 pb-6 flex flex-col gap-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <p
                className="px-4 mb-2 uppercase tracking-widest font-black opacity-40"
                style={{ fontSize: "0.6rem" }}
              >
                {section.title}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (isOpen) onClose();
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl w-full text-left transition-all active:scale-95 group ${isCollapsed ? 'justify-center' : ''}`}
                    style={{
                      background: active ? "rgba(255,255,255,0.1)" : "transparent",
                      color: active ? "#FFF" : "rgba(255,255,255,0.6)",
                    }}
                    title={isCollapsed ? item.label : ''}
                  >
                    <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                    {!isCollapsed && (
                      <span style={{ fontSize: "0.85rem", fontWeight: active ? 700 : 500 }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Card */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div
          className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div
            className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-white/10"
          >
            <span className="text-white text-xs font-black">
              {(authSession?.user?.name || 'AD').substring(0, 2).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-bold truncate">
                {authSession?.user?.name || 'Super Admin'}
              </div>
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">{role}</div>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={signOut}
              className="text-white/40 hover:text-rose-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full flex flex-col"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-1 rounded-full bg-white/10"
              >
                <X size={20} className="text-white" />
              </button>
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
