import { ReactNode } from "react";

interface PageTemplateProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function PageTemplate({ title, description, children, actions, breadcrumb }: PageTemplateProps) {
  return (
    <div className="w-full min-w-0">
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm overflow-hidden">
          {breadcrumb.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 min-w-0">
              {idx > 0 && <span className="text-muted-foreground flex-shrink-0">/</span>}
              {item.href ? (
                <a href={item.href} className="text-primary font-medium hover:underline truncate">{item.label}</a>
              ) : (
                <span className="text-foreground font-medium truncate">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1
            className="text-foreground font-bold"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.2 }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">{actions}</div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
