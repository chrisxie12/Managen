import React from 'react';
import logo from '../../assets/app-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  FileText, 
  BarChart3, 
  Calendar, 
  BookMarked, 
  Wallet, 
  Banknote, 
  Receipt, 
  Library, 
  Building2, 
  Bus, 
  Megaphone, 
  MessageSquare, 
  Bell, 
  UserPlus, 
  Users2, 
  PieChart, 
  Settings2,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  Zap,
  ChevronDown
} from 'lucide-react';

const Sidebar = ({ activeItem = 'dashboard', onNavigate, isOpen, onClose }) => {
  const { authSession, signOut } = useAuth();
  const role = (authSession?.user?.role || authSession?.role || 'admin').toLowerCase();

  const allSections = [
    {
      title: "Platform",
      items: [
        { id: 'superadmin-dashboard', label: 'Platform Hub', icon: LayoutDashboard, roles: ['superadmin'] },
        { id: 'schools', label: 'Institutions', icon: Building2, roles: ['superadmin'] },
        { id: 'subscriptions', label: 'Billing', icon: Wallet, roles: ['superadmin'] },
      ]
    },
    {
      title: "Main",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant'] },
        { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'accountant'] },
        { id: 'teachers', label: 'Teachers', icon: Users, roles: ['admin'] },
      ]
    },
    {
      title: "Academic Hub",
      items: [
        { id: 'classes', label: 'Classes', icon: BookOpen, roles: ['admin'] },
        { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['admin'] },
        { id: 'exams', label: 'Exams', icon: FileText, roles: ['admin'] },
        { id: 'results', label: 'Results', icon: BarChart3, roles: ['admin'] },
        { id: 'timetable', label: 'Timetable', icon: Calendar, roles: ['admin'] },
        { id: 'library', label: 'Library', icon: Library, roles: ['admin'] },
      ]
    },
    {
      title: "Finance & HR",
      items: [
        { id: 'fees', label: 'Fee Management', icon: Wallet, roles: ['admin', 'accountant'] },
        { id: 'payroll', label: 'Payroll', icon: Banknote, roles: ['admin', 'accountant'] },
        { id: 'fee-reports', label: 'Reports', icon: Receipt, roles: ['admin', 'accountant'] },
      ]
    },
    {
      title: "Management",
      items: [
        { id: 'settings', label: 'Settings', icon: Settings2, roles: ['admin', 'superadmin'] },
      ]
    }
  ];

  const navSections = allSections.map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || item.roles.includes(role))
  })).filter(section => section.items.length > 0);

  const getItemClasses = (isActive) => `
    group relative flex items-center gap-3.5 px-4 py-3 mx-3 my-1 rounded-2xl cursor-pointer transition-all duration-300
    ${isActive 
      ? 'bg-accent-primary text-white shadow-lg shadow-black/20' 
      : 'opacity-70 hover:bg-white/5 hover:opacity-100'}
  `;

  const sidebarContent = (
    <div className="h-full flex flex-col bg-accent-primary text-white overflow-hidden">
      {/* Branding Section */}
      <div className="px-8 pt-10 pb-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/10">
             <img src={logo} alt="S" className="w-7 h-7 object-contain mix-blend-multiply" />
          </div>
          <span className="text-xl font-black tracking-tight">SchoolOS<span className="text-accent-secondary">.</span></span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto no-scrollbar px-3 pb-10">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <div className="px-6 mb-3 flex items-center justify-between text-[10px] font-bold uppercase text-slate-500 tracking-widest">
              {section.title}
            </div>
            {section.items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (isOpen) onClose();
                }}
                className={getItemClasses(activeItem === item.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${activeItem === item.id ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <item.icon size={18} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                {activeItem === item.id && (
                  <motion.div 
                    layoutId="activePill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* User & Logout */}
      <div className="mt-auto p-6 border-t border-white/5 bg-white/2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-white/5 p-1">
             <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-inner">
                {(authSession?.user?.name || 'Admin').substring(0, 1).toUpperCase()}
             </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{authSession?.user?.name || 'School Admin'}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{authSession?.user?.role || 'Administrator'}</div>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </div>
        <button 
          onClick={signOut}
          className="w-full py-3.5 px-4 bg-white/5 hover:bg-rose-500/10 rounded-2xl text-[10px] font-black text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center gap-2 group border border-white/5"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-[280px] bg-accent-primary z-50 hidden md:flex">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-accent-primary/80 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-accent-primary z-[70] shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
