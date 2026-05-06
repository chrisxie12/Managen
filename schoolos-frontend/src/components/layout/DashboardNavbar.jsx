import React from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../ui/Logo';

const DashboardNavbar = ({ activeItem = 'Dashboard', onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { authSession } = useAuth();

  return (
    <nav 
      className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-40 px-6 flex items-center justify-between transition-all"
      style={{
        background: "var(--bg-primary)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid var(--border)`,
      }}
    >
      {/* Left: Menu Toggle + Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          <Menu size={22} />
        </button>
        <div className="hidden lg:block">
          <h2 
            style={{ 
              fontFamily: "'Playfair Display', serif", 
              color: "var(--text-primary)", 
              fontSize: "1.1rem", 
              fontWeight: 800,
              lineHeight: 1.1 
            }}
          >
            {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 600 }}>
            Term 2, 2025/2026 Academic Year
          </p>
        </div>
        <div className="lg:hidden">
          <Logo size={32} />
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div 
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all border group"
          style={{ 
            background: "var(--card-bg)", 
            borderColor: "var(--border)",
            width: 240 
          }}
        >
          <Search size={15} className="text-muted group-focus-within:scale-110 transition-transform" />
          <input 
            placeholder="Search students, fees..." 
            className="bg-transparent outline-none text-xs flex-1 font-medium"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button 
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all border hover:scale-105 active:scale-95"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            <Bell size={16} className="text-primary" style={{ color: "var(--text-primary)" }} />
            <span 
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm"
              style={{ background: "#EF4444", color: "white" }}
            >
              3
            </span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border hover:scale-105 active:scale-95"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            {isDarkMode ? <Sun size={16} color="#F59E0B" /> : <Moon size={16} color="#381932" />}
          </button>

          <div className="w-px h-6 bg-black/5 mx-1 hidden sm:block" />

          {/* Avatar */}
          <div className="flex items-center gap-3 pl-1">
            <div className="hidden sm:block text-right">
              <div style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 800 }}>
                {authSession?.user?.name || 'Admin'}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 700 }} className="flex items-center justify-end gap-1 uppercase tracking-tighter">
                <Sparkles size={8} /> Active
              </div>
            </div>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105 border-2 border-white"
              style={{ background: isDarkMode ? "#FFF3E6" : "#381932" }}
            >
              <span style={{ color: isDarkMode ? "#381932" : "#FFF3E6", fontSize: "0.85rem", fontWeight: 800 }}>
                {(authSession?.user?.name || 'A').substring(0, 1).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
