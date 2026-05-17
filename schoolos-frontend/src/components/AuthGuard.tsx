import { Navigate } from "react-router";
import { useUser } from "@clerk/react";
import { useAuth } from "../app/contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || loading) return <div>Loading...</div>;

  if (!isSignedIn) return <Navigate to="/auth" replace />;

  if (!user) return <div>Loading...</div>;

  return <>{children}</>;
}
