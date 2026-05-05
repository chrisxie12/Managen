import { useState, useEffect } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import { Login } from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Exams from './pages/Exams';
import Timetable from './pages/Timetable';
import Library from './pages/Library';
import FeeManagement from './pages/FeeManagement';
import Payroll from './pages/Payroll';
import FeeReports from './pages/FeeReports';
import Dashboard from './pages/Dashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function AuthenticatedApp() {
  const { authSession } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const role = (authSession?.user?.role || authSession?.role || authSession?.kind || 'admin').toLowerCase();

  // Unified Modules Mapping
  const modules = {
    // Platform Level (Superadmin)
    'superadmin-dashboard': <SuperAdminDashboard onNavigate={setActiveModule} />,
    schools: <SuperAdminDashboard onNavigate={setActiveModule} />, // Placeholder for institutions list
    subscriptions: <SuperAdminDashboard onNavigate={setActiveModule} />, // Placeholder for billing list
    
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
    payroll: <Payroll onNavigate={setActiveModule} />,
    'fee-reports': <FeeReports onNavigate={setActiveModule} />,
    settings: <Settings onNavigate={setActiveModule} />,
  };

  // Logic to determine initial landing page after login
  useEffect(() => {
    if (role === 'superadmin' && activeModule === 'dashboard') {
      setActiveModule('superadmin-dashboard');
    }
  }, [role, activeModule]);

  // Accountant specialized root
  if (role === 'accountant' && activeModule === 'dashboard') {
    return <AccountantDashboard onNavigate={setActiveModule} />;
  }

  // Fallback to Dashboard if module not found
  return modules[activeModule] || (role === 'superadmin' 
    ? <SuperAdminDashboard onNavigate={setActiveModule} />
    : <Dashboard onNavigate={setActiveModule} />);
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
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
