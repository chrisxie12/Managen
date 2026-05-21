# Dashboard Redesign - Implementation Checklist

## Phase 1: Core Components (Week 1)
- [x] **AdminOverviewV3.tsx** - Main dashboard component
  - [x] KPI Cards Grid (8 metrics)
  - [x] Alert Banner System
  - [x] Quick Actions (6 actions)
  - [x] Performance Charts
  - [x] Tasks Panel
  - [x] Header with Welcome & Filters
  - [x] Footer with Tips

- [x] **Component Extraction**
  - [x] KPICard - Individual metric card
  - [x] QuickActionCard - Action button
  - [x] AlertBanner - Alert display
  - [x] TaskItem - Task list item
  - [x] PerformanceChart - Chart visualization

- [x] **Supporting Components**
  - [x] DashboardSettings.tsx - Widget customization modal
  - [x] DashboardCalendar.tsx - Event calendar widget
  - [x] RecentActivity.tsx - Activity feed

---

## Phase 2: Integration (Week 2)

### Update Route Configuration
```typescript
// schoolos-frontend/src/app/routes.tsx

// OLD
import { AdminOverview } from './pages/dashboard/AdminOverview';

// NEW (Option 1: Direct replacement)
import { AdminOverviewV3 as AdminOverview } from './pages/dashboard/AdminOverviewV3';

// NEW (Option 2: Keep both versions, add v3 as new route)
import { AdminOverviewV3 } from './pages/dashboard/AdminOverviewV3';

export const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <AdminOverviewV3 />, // Updated
  },
  // OR add as alternative:
  {
    path: '/dashboard/v3',
    element: <AdminOverviewV3 />,
  },
];
```

### Update Navigation Links
```typescript
// If keeping old dashboard at /dashboard/v1:
// OLD dashboard
{
  path: '/dashboard/v1',
  element: <AdminOverview />, // Old component
}
// NEW dashboard (default)
{
  path: '/dashboard',
  element: <AdminOverviewV3 />,
}
```

### Update Sidebar/Menu
```typescript
// Update navigation to point to new dashboard
<Link to="/dashboard">
  <Icon name="dashboard" />
  <span>Dashboard</span>
</Link>
```

---

## Phase 3: Data Integration (Week 2-3)

### Hook Implementation
```typescript
// schoolos-frontend/src/app/hooks/useDashboardStats.ts
export function useDashboardStats() {
  return useQuery('dashboardStats', async () => {
    const response = await fetch('/api/dashboard/stats');
    return response.json();
  }, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### API Endpoints Required (Backend)

#### 1. Dashboard Statistics
**Endpoint:** `GET /api/dashboard/stats`
```typescript
Response: {
  stats: {
    totalStudents: number,
    totalTeachers: number,
    attendanceRate: number,
    activeClasses: number,
  },
  finance: {
    totalBilled: number,
    totalCollected: number,
  },
  defaulters: {
    count: number,
  },
  pendingCount: number,
}
```

**Backend Implementation:** `routes/dashboard.js` or add to `routes/school.js`
```javascript
app.get('/api/school/dashboard/stats', authenticate, async (req, res) => {
  const schoolId = req.tenant.id;
  
  const [students, teachers, attendance, finance] = await Promise.all([
    db.query('SELECT COUNT(*) as count FROM users WHERE school_id = $1 AND role = "student"', [schoolId]),
    db.query('SELECT COUNT(*) as count FROM users WHERE school_id = $1 AND role = "teacher"', [schoolId]),
    db.query('SELECT AVG(attendance_rate) as rate FROM attendance WHERE school_id = $1 AND date = CURRENT_DATE', [schoolId]),
    db.query('SELECT SUM(amount) as collected FROM payments WHERE school_id = $1', [schoolId]),
  ]);
  
  res.json({
    stats: {
      totalStudents: students.rows[0].count,
      totalTeachers: teachers.rows[0].count,
      attendanceRate: attendance.rows[0].rate,
      activeClasses: 0, // Calculate
    },
    finance: {
      totalBilled: 0, // Calculate from fee structure
      totalCollected: finance.rows[0].collected,
    },
    defaulters: { count: 0 }, // Calculate defaulters
    pendingCount: 0, // Count pending approvals
  });
});
```

#### 2. Dashboard Alerts
**Endpoint:** `GET /api/dashboard/alerts`
```typescript
Response: {
  alerts: Array<{
    type: "warning" | "error" | "info" | "success",
    title: string,
    description: string,
    action?: { label: string, url: string }
  }>
}
```

#### 3. Pending Tasks
**Endpoint:** `GET /api/dashboard/tasks`
```typescript
Response: {
  tasks: Array<{
    id: string,
    title: string,
    priority: "high" | "medium" | "low",
    status: "pending" | "in-progress" | "completed",
    dueDate: ISO8601,
    owner?: string,
  }>
}
```

#### 4. Recent Activity
**Endpoint:** `GET /api/dashboard/activity?limit=10`
```typescript
Response: {
  activities: Array<{
    id: string,
    type: string,
    title: string,
    description: string,
    user?: string,
    timestamp: ISO8601,
  }>
}
```

#### 5. Calendar Events
**Endpoint:** `GET /api/dashboard/calendar`
```typescript
Response: {
  events: Array<{
    date: number,
    title: string,
    type: "exam" | "holiday" | "event" | "deadline",
    color: string,
  }>
}
```

---

## Phase 4: Styling & Theming (Week 3)

### Tailwind Configuration
Ensure `tailwind.config.js` includes all colors:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4FB',
          500: '#0A2472',
          600: '#0C2D8A',
        },
        cream: '#F8F9FA',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
};
```

### CSS Variables (if using CSS-in-JS)
```css
:root {
  --color-primary: #0A2472;
  --color-primary-light: #0C2D8A;
  --color-secondary: #F8F9FA;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;
}
```

---

## Phase 5: Testing (Week 4)

### Unit Tests
```typescript
// schoolos-frontend/src/app/pages/dashboard/__tests__/AdminOverviewV3.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { AdminOverviewV3 } from '../AdminOverviewV3';

describe('AdminOverviewV3', () => {
  it('renders welcome message', () => {
    render(<AdminOverviewV3 />);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it('displays KPI cards with metrics', async () => {
    render(<AdminOverviewV3 />);
    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('Attendance Rate')).toBeInTheDocument();
    });
  });

  it('shows quick action buttons', () => {
    render(<AdminOverviewV3 />);
    expect(screen.getByText('Bulk Import Students')).toBeInTheDocument();
    expect(screen.getByText('Generate Report Cards')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// Test navigation from quick actions
it('navigates to bulk import on action click', async () => {
  render(<AdminOverviewV3 />);
  const importBtn = screen.getByText('Bulk Import Students');
  userEvent.click(importBtn);
  
  await waitFor(() => {
    expect(window.location.pathname).toContain('bulk-import');
  });
});
```

### Visual Regression Tests
```typescript
// Using Percy or similar
describe('AdminOverviewV3 Visual Regression', () => {
  it('matches dashboard snapshot', () => {
    render(<AdminOverviewV3 />);
    cy.percySnapshot('dashboard-overview');
  });
});
```

---

## Phase 6: Performance Optimization (Week 4)

### Code Splitting
```typescript
// Lazy load dashboard component
const AdminOverviewV3 = lazy(() => import('./pages/dashboard/AdminOverviewV3'));
```

### Bundle Analysis
```bash
npm run build -- --analyze
# or
npm install -g source-map-explorer
source-map-explorer 'dist/**/*.js'
```

### Performance Checklist
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Total bundle size < 500KB (gzipped)
- [ ] Images optimized (WebP/AVIF)

---

## Pre-Launch Checklist

### Frontend
- [ ] All components render without errors
- [ ] No console warnings or errors
- [ ] All quick action links work
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Dark mode (if applicable) works
- [ ] Accessibility checked with axe DevTools
- [ ] Cross-browser tested

### Backend
- [ ] All API endpoints implemented
- [ ] Database queries optimized
- [ ] Error handling in place
- [ ] Rate limiting configured
- [ ] Authentication/authorization verified

### Data
- [ ] Mock data in AdminOverviewV3 removed
- [ ] Real data fetching implemented
- [ ] Caching strategy in place
- [ ] Real-time updates working

### Documentation
- [ ] Dashboard guide created
- [ ] API documentation updated
- [ ] Team trained on new features
- [ ] User guide prepared for admins

---

## Post-Launch Monitoring

### Metrics to Track
- Dashboard load time
- Component render time
- API response times
- User interaction patterns
- Feature adoption (which quick actions are used most)

### Monitoring Setup
```javascript
// Add to performance monitoring
performanceMonitor.track('dashboard-load', startTime);
performanceMonitor.track('api-response-time', apiTime);
performanceMonitor.event('quick-action-click', { action: 'bulk-import' });
```

### Error Tracking
```javascript
// Integrate with error tracking (Sentry, etc)
Sentry.captureException(error, {
  tags: { component: 'AdminOverviewV3' },
});
```

---

## Rollback Plan

If issues arise, revert to old dashboard:

```typescript
// revert routes.tsx
import { AdminOverview } from './pages/dashboard/AdminOverview'; // Old version

export const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <AdminOverview />, // Back to old
  },
];
```

---

## Success Criteria

✅ Dashboard loads in < 2 seconds  
✅ All KPI cards show correct data  
✅ Quick actions navigate correctly  
✅ Alerts display appropriately  
✅ No console errors  
✅ Mobile responsive  
✅ Accessibility compliant (WCAG AA)  
✅ All admin users can access  

---

## Timeline

| Week | Tasks | Owner |
|------|-------|-------|
| 1 | Build components | Frontend Team |
| 2 | Integrate routes, setup API calls | Frontend + Backend |
| 3 | Backend API implementation, styling | Backend + Frontend |
| 4 | Testing, optimization, launch prep | QA + All |
| 5 | Launch, monitoring, support | All |

---

## Questions & FAQs

**Q: Should we keep the old dashboard?**  
A: Yes, initially add v3 as `/dashboard/v3` or keep old at `/dashboard/v1` for rollback capability.

**Q: How do we migrate user preferences?**  
A: Store dashboard widget preferences in `UserPreference` table or localStorage per session.

**Q: What if API is slow?**  
A: Implement caching (React Query, SWR) and show skeleton loaders while fetching.

**Q: Can users customize the dashboard?**  
A: Yes, via `DashboardSettings` modal - show/hide widgets, reorder them.

---

**Created:** May 21, 2026  
**Last Updated:** May 21, 2026  
**Status:** Ready for Implementation
