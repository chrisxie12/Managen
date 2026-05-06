import React, { useState, useEffect, Suspense, lazy } from 'react';
import './index.css';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Settings = lazy(() => import('./pages/Settings'));
const Students = lazy(() => import('./pages/Students'));
const Teachers = lazy(() => import('./pages/Teachers'));
const Classes = lazy(() => import('./pages/Classes'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Results = lazy(() => import('./pages/Results'));
const Exams = lazy(() => import('./pages/Exams'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Library = lazy(() => import('./pages/Library'));
const FeeManagement = lazy(() => import('./pages/FeeManagement'));
const Payroll = lazy(() => import('./pages/Payroll'));
const FeeReports = lazy(() => import('./pages/FeeReports'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Communication = lazy(() => import('./pages/Communication'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const AccountantDashboard = lazy(() => import('./pages/AccountantDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const FeeReminders = lazy(() => import('./pages/FeeReminders'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
    <div className="w-12 h-12 border-4 border-plum/10 border-t-plum rounded-full animate-spin"></div>
  </div>
);

function AuthenticatedApp() {
  const { authSession } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const role = (authSession?.user?.role || authSession?.role || authSession?.kind || 'admin').toLowerCase();

  // Unified Modules Mapping
  const modules = {
    // Platform Level (Superadmin)
    'superadmin-dashboard': <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    schools: <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    subscriptions: <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    billing: <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    'global-users': <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    'system-config': <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    'audit-logs': <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    support: <SuperAdminDashboard activeModule={activeModule} onNavigate={setActiveModule} />,
    
    // School Level (Admin/Accountant)
    dashboard: <Dashboard onNavigate={setActiveModule} />,
    students: <Students onNavigate={setActiveModule} />,
    teachers: <Teachers onNavigate={setActiveModule} />,
    classes: <Classes onNavigate={setActiveModule} />,
    attendance: <Attendance onNavigate={setActiveModule} />,
    exams: <Exams onNavigate={setActiveModule} />,
    results: <Results onNavigate={setActiveModule} />,
    timetable: <Timetable onNavigate={setActiveModule} />,
    library: <Library onNavigate={setActiveModule} />,
    fees: <FeeManagement onNavigate={setActiveModule} />,
    'fee-reminders': <FeeReminders onNavigate={setActiveModule} />,
    payroll: <Payroll onNavigate={setActiveModule} />,
    'fee-reports': <FeeReports onNavigate={setActiveModule} />,
    communication: <Communication onNavigate={setActiveModule} />,
    settings: <Settings onNavigate={setActiveModule} />,
  };

  useEffect(() => {
    if (role === 'superadmin' && activeModule === 'dashboard') {
      setActiveModule('superadmin-dashboard');
    }
  }, [role, activeModule]);

  const content = modules[activeModule] || (role === 'superadmin' 
    ? <SuperAdminDashboard onNavigate={setActiveModule} />
    : <Dashboard onNavigate={setActiveModule} />);

  // Use DashboardLayout for all authenticated views
  return (
    <DashboardLayout activeModule={activeModule} onNavigate={setActiveModule}>
      {content}
    </DashboardLayout>
  );
}

function AppContent() {
  const { authSession } = useAuth();
  const [view, setView] = useState('landing'); // landing, login, onboarding

  // If logged in, show the appropriate dashboard
  if (authSession) {
    return <AuthenticatedApp />;
  }

  // Auth/Landing Routing
  if (view === 'login') {
    return <Login onNavigate={setView} />;
  }

  if (view === 'onboarding') {
    return <Signup setActiveTab={(tab) => setView(tab)} />;
  }

  // Default to Landing Page
  return (
    <LandingPage 
      onNavigate={(v) => {
        if (v === 'signup') setView('onboarding');
        else setView(v);
      }}
    />
  );
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <AppContent />
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
