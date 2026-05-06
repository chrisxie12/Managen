import React from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun,
  Sparkles,
  Activity,
  Globe,
  User
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/Logo';

const DashboardNavbar = ({ activeItem = 'Dashboard', onMenuClick, isCollapsed }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { authSession } = useAuth();

  return (
    <nav 
      className={`fixed top-0 right-0 z-40 h-16 transition-all duration-300 border-b flex items-center px-8 backdrop-blur-md bg-white/70`}
      style={{ 
        left: '0px',
        paddingLeft: 'calc(2rem + ' + (window.innerWidth >= 1024 ? (isCollapsed ? '80px' : '260px') : '0px') + ')',
        borderColor: "rgba(0,0,0,0.05)"
      }}
    >
      <div className="flex-1 flex items-center gap-6">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition-colors text-slate-800"
        >
          <Menu size={20} />
        </button>

        {/* Global Search */}
        <div className="hidden md:flex items-center gap-3 bg-black/5 px-4 py-2 rounded-2xl w-96 border border-transparent focus-within:border-indigo-500/20 focus-within:bg-white transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search schools, users, transactions..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* System Health */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
           <Activity size={14} className="text-emerald-500" />
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Healthy</span>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl hover:bg-black/5 transition-all relative text-slate-500">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-black/5 transition-all text-slate-500"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-black/5 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-slate-800 leading-none mb-1">{authSession?.user?.name || 'Super Admin'}</div>
            <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">Platform Root</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
             <User size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
