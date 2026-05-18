import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../app/contexts/AuthContext";
import { api } from "../app/services/api";

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      return;
    }

    if (user.role === "superadmin") {
      setSetupCompleted(true);
      setChecking(false);
      return;
    }

    if (user.role === "school_admin" || user.role === "admin") {
      api.get<any>("/api/school/setup/status")
        .then((res) => {
          const completed = res.data?.setup_completed === true;
          setSetupCompleted(completed);
          if (!completed && window.location.pathname !== "/setup") {
            navigate("/setup", { replace: true });
          }
        })
        .catch(() => {
          setSetupCompleted(false);
          navigate("/setup", { replace: true });
        })
        .finally(() => setChecking(false));
    } else {
      setSetupCompleted(true);
      setChecking(false);
    }
  }, [user, authLoading, navigate]);

  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FFF3E6" }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#381932", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!setupCompleted) return null;

  return <>{children}</>;
}
