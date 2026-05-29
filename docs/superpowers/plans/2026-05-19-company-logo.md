# Company Logo Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable `<SadexLogo />` component representing the Sadex Innovations vector emblem, and integrate it into the public Landing Page footer and the internal Super Admin Sidebar layout.

**Architecture:** A reusable React component with inline SVG vectors that accepts size and variant props for versatile theme rendering, verified by a React component unit test and type checks.

**Tech Stack:** React, TypeScript, Jest, React Testing Library, TailwindCSS.

---

### Task 1: Create Reusable `<SadexLogo />` Component

**Files:**
- Create: `schoolos-frontend/src/app/components/SadexLogo.tsx`

- [ ] **Step 1: Write the component implementation**

Write the code for `<SadexLogo />` in `schoolos-frontend/src/app/components/SadexLogo.tsx`:

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
        <div className="flex flex-col" style={{ lineHeight: 1 }}>
          <span
            style={{
              fontSize: `${size * 0.38}px`,
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: color,
              fontFamily: 'sans-serif',
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
              fontFamily: 'sans-serif',
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

- [ ] **Step 2: Save the file**
Save the file at `schoolos-frontend/src/app/components/SadexLogo.tsx`.

---

### Task 2: Write Component Unit Tests

**Files:**
- Create: `schoolos-frontend/src/app/components/SadexLogo.test.tsx`

- [ ] **Step 1: Write unit tests verifying rendering of SadexLogo**

Create `schoolos-frontend/src/app/components/SadexLogo.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';
import { SadexLogo } from './SadexLogo';

describe('SadexLogo Component', () => {
  test('renders logo text correctly by default', () => {
    render(<SadexLogo />);
    expect(screen.getByText('SADEX')).toBeInTheDocument();
    expect(screen.getByText('Innovations')).toBeInTheDocument();
  });

  test('renders without text when showText is false', () => {
    render(<SadexLogo showText={false} />);
    expect(screen.queryByText('SADEX')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test suite**

Run: `npm run test` or `pnpm test` inside `schoolos-frontend` to verify the tests pass.

---

### Task 3: Integrate into Landing Page Footer

**Files:**
- Modify: `schoolos-frontend/src/app/pages/LandingPage.tsx`

- [ ] **Step 1: Import the SadexLogo component**

Add import statement around line 20:
```tsx
import { SadexLogo } from '../components/SadexLogo';
```

- [ ] **Step 2: Update footer logo layout**

Locate lines 750-760:
```tsx
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
                <GraduationCap size={15} color="white" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700 }}>Managen</span>
            </div>
            <span className="text-gray-500 text-sm">School management that actually works.</span>
          </div>
```

Modify it to:
```tsx
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
                <GraduationCap size={15} color="white" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700 }}>Managen</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm hidden sm:inline">School management that actually works.</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50/50">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">A Product of</span>
                <SadexLogo size={18} variant={dark ? "dark" : "light"} />
              </div>
            </div>
          </div>
```

---

### Task 4: Integrate into Super Admin Layout Sidebar

**Files:**
- Modify: `schoolos-frontend/src/app/pages/SuperAdminLayout.tsx`

- [ ] **Step 1: Import SadexLogo component**

Add import statement around line 4:
```tsx
import { SadexLogo } from '../components/SadexLogo';
```

- [ ] **Step 2: Update the bottom panel in SidebarContent**

Locate lines 54-59:
```tsx
      <div style={{ margin: "0 12px 12px", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>
        <button onClick={() => { document.cookie = "schoolos_admin_token=; path=/api/superadmin; max-age=0"; navigate("/auth"); }}
          className="flex items-center gap-2 w-full text-left hover:opacity-70" style={{ color: "#64748b", fontSize: "0.82rem" }}>
          <LogOut size={14} /> Back to App
        </button>
      </div>
```

Modify it to:
```tsx
      <div style={{ margin: "0 12px 12px", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: "12px" }}>
        <button onClick={() => { document.cookie = "schoolos_admin_token=; path=/api/superadmin; max-age=0"; navigate("/auth"); }}
          className="flex items-center gap-2 w-full text-left hover:opacity-70" style={{ color: "#64748b", fontSize: "0.82rem" }}>
          <LogOut size={14} /> Back to App
        </button>
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "12px", display: "flex", justifyContent: "center" }}>
          <SadexLogo size={22} variant="dark" />
        </div>
      </div>
```

---

### Task 5: Verification & Build

- [ ] **Step 1: Run frontend tests**
Run: `npm run test` or `pnpm test` in the frontend directory.
Verify all tests pass successfully.

- [ ] **Step 2: Compile & Build**
Run: `npm run build` or `pnpm build` in the frontend directory.
Verify the build completes with no TypeScript or linting errors.
