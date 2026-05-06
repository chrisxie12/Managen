import React from 'react';
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
  Wallet, 
  Banknote, 
  Receipt, 
  Library, 
  Building2, 
  MessageSquare, 
  Settings2,
  LogOut,
  X,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const SIDEBAR_BG = "#F9F1E7";
const MUTED = "#7D6077";

const Sidebar = ({ activeItem = 'dashboard', onNavigate, isOpen, onClose }) => {
  const { authSession, signOut } = useAuth();
  const role = (authSession?.user?.role || authSession?.role || 'admin').toLowerCase();

  const allSections = [
    {
      title: "Main Menu",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'accountant'] },
        { id: 'superadmin-dashboard', label: 'Platform Hub', icon: LayoutDashboard, roles: ['superadmin'] },
        { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'accountant'] },
        { id: 'teachers', label: 'Teachers', icon: Users, roles: ['admin'] },
        { id: 'schools', label: 'Institutions', icon: Building2, roles: ['superadmin'] },
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
        { id: 'subscriptions', label: 'Billing', icon: Wallet, roles: ['superadmin'] },
      ]
    },
    {
      title: "Support",
      items: [
        { id: 'communication', label: 'Communication', icon: MessageSquare, roles: ['admin', 'accountant'] },
        { id: 'settings', label: 'Settings', icon: Settings2, roles: ['admin', 'superadmin'] },
      ]
    }
  ];

  const navSections = allSections.map(section => ({
    ...section,
    items: section.items.filter(item => !item.roles || item.roles.includes(role))
  })).filter(section => section.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: SIDEBAR_BG, borderRight: `1px solid rgba(56,25,50,0.07)` }}>
      {/* Branding Section */}
      <div className="flex items-center gap-2 px-6 py-8 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}
        >
          <GraduationCap size={18} color={MILK} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              color: PLUM,
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1.1,
            }}
          >
            SchoolOS
          </div>
          <div style={{ color: MUTED, fontSize: "0.7rem", fontWeight: 600 }}>Accra Ridge School</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-grow overflow-y-auto no-scrollbar px-3 pb-6 flex flex-col gap-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <p
              className="px-4 mb-2 uppercase tracking-widest font-black"
              style={{ color: MUTED, fontSize: "0.65rem" }}
            >
              {section.title}
            </p>
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
                    className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl w-full text-left transition-all active:scale-95 group"
                    style={{
                      background: active ? PLUM : "transparent",
                      color: active ? MILK : PLUM_LIGHT,
                    }}
                  >
                    <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                    <span style={{ fontSize: "0.9rem", fontWeight: active ? 700 : 500 }}>
                      {item.label}
                    </span>
                    {item.id === 'communication' && !active && (
                      <span
                        className="ml-auto px-1.5 py-0.5 rounded-full text-xs font-black"
                        style={{ background: `rgba(56,25,50,0.1)`, color: PLUM, fontSize: "0.7rem" }}
                      >
                        3
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
      <div className="p-4 border-t border-black/5" style={{ background: 'rgba(56,25,50,0.02)' }}>
        <div
          className="p-3 rounded-2xl flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.5)",
            border: `1px solid rgba(56,25,50,0.05)`,
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}
          >
            <span style={{ color: MILK, fontSize: "0.85rem", fontWeight: 800 }}>
              {(authSession?.user?.name || 'AD').substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div
              style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 700 }}
              className="truncate"
            >
              {authSession?.user?.name || 'School Admin'}
            </div>
            <div style={{ color: MUTED, fontSize: "0.72rem", fontWeight: 600 }}>{authSession?.user?.role || 'Administrator'}</div>
          </div>
          <button
            onClick={signOut}
            className="hover:text-red-500 transition-colors p-1"
          >
            <LogOut size={16} color={MUTED} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-50">
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
                <X size={20} color={PLUM} />
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
