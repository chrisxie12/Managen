import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../app/contexts/AuthContext";
import { useOnboardingStatus } from "../hooks/useOnboardingStatus";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const schoolId = user?.schoolId || user?.tenantId;
  const { onboardingCompleted, loading } = useOnboardingStatus(schoolId);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!user) return;
    if (user.role === "superadmin") return;
    if (!onboardingCompleted && window.location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [authLoading, loading, onboardingCompleted, user, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FFF3E6" }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#381932", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!onboardingCompleted && window.location.pathname !== "/onboarding") return null;

  return <>{children}</>;
}
