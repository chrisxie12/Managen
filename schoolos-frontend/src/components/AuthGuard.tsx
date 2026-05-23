import { Navigate, useLocation } from "react-router";
import { useUser } from "@clerk/react";
import { useAuth } from "../app/contexts/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#F8F9FA" }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#0A2472", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const from = encodeURIComponent(location.pathname + location.search);

  if (!isSignedIn && !user) {
    return <Navigate to={`/auth?redirect=${from}`} replace />;
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${from}`} replace />;
  }

  return <>{children}</>;
}
