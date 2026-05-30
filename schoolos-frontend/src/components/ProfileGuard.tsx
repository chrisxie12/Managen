import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../app/contexts/AuthContext";
import { api } from "../app/services/api";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (user.role !== "school_admin") {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const checkProfile = async () => {
      try {
        const res = await api.get<any>("/school/profile/status");
        if (cancelled) return;
        const { completed, missing } = res.data;
        if (!completed) {
          navigate("/dashboard/settings", {
            replace: true,
            state: { missing },
          });
        } else {
          setChecking(false);
        }
      } catch {
        if (!cancelled) setChecking(false);
      }
    };

    checkProfile();
    return () => { cancelled = true; };
  }, [authLoading, user, navigate, location.pathname]);

  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#F8F9FA" }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#031B4E", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return <>{children}</>;
}
