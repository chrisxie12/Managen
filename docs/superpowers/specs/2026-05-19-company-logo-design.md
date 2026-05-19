# Design Specification: Sadex Innovations Company Logo Integration
**Date:** 2026-05-19
**Status:** Approved

## 1. Overview
This specification details the integration of the **Sadex Innovations** company logo into the Managen platform. Sadex Innovations is the operating company behind Managen. This integration establishes high-quality company presence on public-facing pages and internal administrative views.

---

## 2. Goals & Scope
- **Vector Emblem:** Translate the raster company logo into a clean, precise, responsive, and reusable SVG component.
- **Landing Page Footer Integration:** Add a "A Product of Sadex Innovations" branding element to the footer of the public-facing landing page.
- **Super Admin Layout Integration:** Embed the company logo in the sidebar footer of the Super Admin console, reinforcing internal company ownership.
- **Responsive Layout:** Ensure perfect rendering on both light and dark backgrounds, across desktop and mobile form factors.

---

## 3. SVG Specifications
A reusable `<SadexLogo />` React component will be created in `schoolos-frontend/src/app/components/SadexLogo.tsx` containing the SVG path definitions.

```tsx
import React from 'react';

interface SadexLogoProps {
  size?: number;
  variant?: 'light' | 'dark' | 'currentColor';
  className?: string;
  showText?: boolean;
}

export function SadexLogo({
  size = 24,
  variant = 'currentColor',
  className = '',
  showText = true,
}: SadexLogoProps) {
  const color = 
    variant === 'light' ? '#000000' :
    variant === 'dark' ? '#ffffff' :
    'currentColor';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <g fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          {/* Top Hook */}
          <path d="M 85 45 C 130 45, 175 75, 155 110 C 142 128, 120 135, 110 135" />
          {/* Central Bolt 1 */}
          <path d="M 85 45 L 140 100 L 115 100 L 130 115" />
          {/* Bottom Hook */}
          <path d="M 115 155 C 70 155, 25 125, 45 90 C 58 72, 80 65, 90 65" />
          {/* Central Bolt 2 */}
          <path d="M 115 155 L 60 100 L 85 100 L 70 85" />
        </g>
      </svg>
      {showText && (
        <div className="flex flex-col line-height-1" style={{ lineHeight: 1 }}>
          <span
            style={{
              fontSize: `${size * 0.38}px`,
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: color,
            }}
          >
            SADEX
          </span>
          <span
            style={{
              fontSize: `${size * 0.22}px`,
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: variant === 'light' ? '#4b5563' : variant === 'dark' ? '#9ca3af' : 'inherit',
            }}
          >
            Innovations
          </span>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Proposed UI Placements

### 4.1 Landing Page Footer (`LandingPage.tsx`)
In the footer area (`<footer id="contact" ...>`), beside the `Managen` brand logo:
- Add a new "Powered/Product of" box on the right.
- Use `<SadexLogo size={20} variant={dark ? "dark" : "light"} />` inside a styled `div` container.
- Clean up any legacy placeholders in the copyright or footer sections.

### 4.2 Super Admin Console Sidebar (`SuperAdminLayout.tsx`)
In the sidebar component at the bottom of the navigation:
- Create a divider `border-t border-gray-800` or equivalent.
- Render the white version of the logo using `<SadexLogo size={24} variant="dark" />` to fit perfectly in the dark layout.

---

## 5. Verification Plan
- **Visual Check:** Launch frontend, browse to the public landing page footer to check responsiveness, placement, spacing, and styling in both light and dark themes.
- **Super Admin Check:** Browse to `/superadmin` and inspect sidebar bottom area to verify logo matches layout grid and aligns with theme parameters.
- **Build Integrity:** Run `npm run build` or `pnpm build` in the frontend directory to ensure zero compilation or TypeScript type errors.
