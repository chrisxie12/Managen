import { Navigate } from 'react-router';
import { useAuth } from '../app/contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}