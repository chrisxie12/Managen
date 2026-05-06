import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';

const DashboardLayout = ({ children, activeModule, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-body transition-all duration-300">
      <Sidebar 
        activeItem={activeModule} 
        onNavigate={onNavigate} 
        isOpen={sidebarOpen} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onClose={() => setSidebarOpen(false)} 
      />
      
      <DashboardNavbar 
        activeItem={activeModule} 
        isCollapsed={isCollapsed}
        onMenuClick={() => setSidebarOpen(true)} 
      />

      <main className={`transition-all duration-300 pt-16 min-h-screen ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

