import React, { createContext, useContext, useState } from 'react';
import { buildUrl } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authSession, setAuthSession] = useState(() => {
    const saved = localStorage.getItem('schoolos_session');
    return saved ? JSON.parse(saved) : null;
  });

  const updateSession = (session) => {
    if (session) {
        localStorage.setItem('schoolos_session', JSON.stringify(session));
    } else {
        localStorage.removeItem('schoolos_session');
    }
    setAuthSession(session);
  };

  const signOut = async () => {
    try {
        if (authSession?.kind === 'tenant') {
            await fetch(buildUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
        }
    } catch(e) {}
    localStorage.removeItem('schoolosSuperAdminToken'); // Legacy
    updateSession(null);
  };

  return (
    <AuthContext.Provider value={{ authSession, setAuthSession: updateSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
