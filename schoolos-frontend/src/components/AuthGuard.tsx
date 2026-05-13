import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(response => {
        if (response.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch(() => {
        setIsAuth(false);
      });
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}