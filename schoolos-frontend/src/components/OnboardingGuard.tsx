import { Navigate, useLocation } from "react-router";
import { useAuth } from "../app/contexts/AuthContext";
import { useOnboardingStatus } from "../hooks/useOnboardingStatus";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, school, loading: authLoading } = useAuth();
  const location = useLocation();
  const { onboardingCompleted, loading } = useOnboardingStatus(school?.slug);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#F8F9FA" }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#031B4E", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!user) return <>{children}</>;
  if (user.role === "superadmin") return <>{children}</>;
  if (!onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
