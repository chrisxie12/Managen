import { useNavigate } from "react-router";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional second action for "or" alternatives */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = (a: { href?: string; onClick?: () => void }) => {
    if (a.onClick) a.onClick();
    else if (a.href) navigate(a.href);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-8 px-4" : "py-16 px-6"
      }`}
    >
      <div
        className="mb-4 rounded-2xl p-4 flex items-center justify-center"
        style={{ background: "rgba(10,36,114,0.05)" }}
      >
        <div style={{ color: MUTED, opacity: 0.7 }}>{icon}</div>
      </div>

      <h3
        style={{
          color: NAVY,
          fontWeight: 700,
          fontSize: compact ? "1rem" : "1.15rem",
          marginBottom: "0.5rem",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: MUTED,
          fontSize: "0.875rem",
          maxWidth: 360,
          lineHeight: 1.6,
          marginBottom: action ? "1.5rem" : 0,
        }}
      >
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              id={`empty-state-action-${title.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => handleAction(action)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:opacity-90"
              style={{
                background: NAVY,
                color: "white",
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={() => handleAction(secondaryAction)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 hover:opacity-70"
              style={{
                background: "transparent",
                color: NAVY,
                border: `1px solid rgba(10,36,114,0.2)`,
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
