import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { api } from '../app/services/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    api.get('/api/auth/me')
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}