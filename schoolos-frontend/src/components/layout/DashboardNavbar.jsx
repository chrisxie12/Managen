import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Command,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardNavbar = ({ activeItem = 'Dashboard', onMenuClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { authSession, logout } = useAuth();

  const dropdownItemClasses = "flex items-center gap-3 px-5 py-3 text-slate-400 text-sm font-bold no-underline cursor-pointer transition-all hover:bg-white/5 hover:text-blue-500 rounded-xl";

  return (
    <nav className="fixed top-0 left-0 md:left-[280px] right-0 h-20 bg-[#030617]/60 backdrop-blur-3xl border-b border-white/5 z-40 px-4 sm:px-8 flex items-center justify-between">
      {/* Left Side: Context & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button 
          onClick={onMenuClick}
          className="p-2.5 rounded-xl bg-white/5 text-white md:hidden hover:bg-white/10 transition-colors border border-white/5"
        >
          <Menu size={20} />
        </button>
        <div className="hidden xs:block">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] mb-1">
            <Command size={10} className="text-blue-500" /> 
            <span className="hidden sm:inline">Platform</span>
            <span className="text-white/10 hidden sm:inline">/</span>
            <span className="text-blue-500">{activeItem}</span>
          </div>
          <h2 className="text-sm sm:text-lg font-black text-white tracking-tight font-headings leading-none italic uppercase">
            {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
          </h2>
        </div>
      </div>

      {/* Center Side: Global Search (Desktop) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-10 relative group">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
        <input 
          placeholder="Global System Command (Ctrl + K)"
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-14 pr-6 text-xs font-bold text-white placeholder:text-slate-700 outline-none focus:bg-white/[0.05] focus:border-blue-500/30 transition-all shadow-inner"
        />
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3">
           {/* Notifications */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-white/10 transition-all relative border border-white/5"
          >
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(45,125,250,0.8)]" />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-white/10 transition-all border border-white/5"
          >
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>
        </div>

        <div className="w-px h-8 bg-white/5 mx-2 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1 pr-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all shadow-lg backdrop-blur-md"
          >
            <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-blue-600/20">
              {(authSession?.user?.name || 'Admin').substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left">
               <div className="text-[11px] font-black text-white leading-none mb-0.5">{authSession?.user?.name || 'Admin User'}</div>
               <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={8} className="text-blue-500" /> Authorized Identity
               </div>
            </div>
            <ChevronDown 
              size={14} 
              className={`text-slate-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
            />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 w-64 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[28px] shadow-2xl z-50 overflow-hidden p-2"
                >
                  <div className="p-4 mb-2 bg-white/5 rounded-2xl border border-white/5">
                     <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Identity Scoped</div>
                     <div className="text-[11px] font-bold text-white truncate">{authSession?.user?.email || 'admin@schoolos.com'}</div>
                  </div>
                  <div className={dropdownItemClasses} onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> Identity Profile
                  </div>
                  <div className={dropdownItemClasses} onClick={() => setDropdownOpen(false)}>
                    <CreditCard size={16} /> Instance Billing
                  </div>
                  <div className={dropdownItemClasses} onClick={() => setDropdownOpen(false)}>
                    <Settings size={16} /> System Nodes
                  </div>
                  <div className="h-px bg-white/5 my-2 mx-4" />
                  <div className={`${dropdownItemClasses} text-rose-500 hover:bg-rose-500/10 hover:text-rose-400`} onClick={() => { logout(); setDropdownOpen(false); }}>
                    <LogOut size={16} /> Terminate Connection
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
