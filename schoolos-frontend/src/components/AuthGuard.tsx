import { Navigate } from "react-router";
import { useUser } from "@clerk/react";
import { useAuth } from "../app/contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || loading) return <div>Loading...</div>;

  if (!isSignedIn && !user) return <Navigate to="/auth" replace />;

  // Clerk signed in but backend user not found — exchange/fetch failed
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
