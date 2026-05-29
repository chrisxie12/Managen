# Implementation Roadmap: Critical → Important → Strategic

## Quick Reference Matrix

```
TIER 1: CRITICAL (Blocks Deployment) — Fix IMMEDIATELY
├─ 🚨 CRITICAL_ASSESSMENT.md items (5 items, 2 weeks)
└─ Prevents production launch

TIER 2: IMPORTANT (Blocks Nigeria) — Fix Before Regional Expansion
├─ Multi-currency engine
├─ Curriculum plugin architecture  
├─ RBAC enforcement
├─ Load testing
├─ Offline mode edge cases
└─ 2-4 weeks of work

TIER 3: STRATEGIC (Blocks Fundraising) — Fix Before Investor Meetings
├─ Privacy policy + GDPR infrastructure
├─ API documentation
├─ Native app roadmap
└─ Quick wins (7 hours)
```

---

## The Two Paths

### Path A: Fix Production First (RECOMMENDED)

**Timeline**: Now → June 2026

```
THIS WEEK (May 20-24)
├─ Fix uptime claim (30 min)
├─ Enable backups (1 hour)
└─ Fix /health endpoint (2 hours)

NEXT WEEK (May 27 - June 2)
├─ Add Arkesel rate limiting (3 hours)
├─ Fix payment reconciliation UI (4 hours)
└─ Enable RLS policies (4 hours)

WEEK 3-4 (June 3-16)
├─ Multi-currency prep (research + schema)
├─ RBAC enforcement
└─ Load testing infrastructure

WEEK 5-6 (June 17-30)
├─ Curriculum plugin architecture
└─ Offline mode improvements

MONTH 2 (July)
└─ Nigeria expansion with multi-currency + WAEC curriculum
```

### Path B: Quick Fundraising (IF NEEDED NOW)

**Timeline**: This week → pitch in 2 weeks

```
THIS WEEK
├─ Create privacy policy (2 hours)
├─ Add API documentation (4 hours)
├─ Add audit log export (1 hour)
└─ Create investor pitch deck

NEXT WEEK
├─ Fix CRITICAL_ASSESSMENT items (priority only)
└─ Practice investor pitch
```

---

## Document Guide

| Document | Purpose | Read When |
|----------|---------|-----------|
| **CRITICAL_ASSESSMENT.md** | **5 blockers for production** | Planning fixes immediately |
| **CRITICAL_FIXES_CHECKLIST.md** | Day-by-day implementation plan | Executing fixes (P0, P1, P2) |
| **PRODUCTION_CODE_SAMPLES.md** | Copy-paste code for all 8 fixes | Implementing each item |
| **IMPORTANT_NIGERIA_EXPANSION.md** | What blocks Nigeria launch | Planning regional expansion |
| **STRATEGIC_FUNDRAISING.md** | What investors will ask | Preparing fundraising round |

---

## Decision Tree

### "I want to launch to production THIS MONTH"
→ Read: **CRITICAL_ASSESSMENT.md** + **CRITICAL_FIXES_CHECKLIST.md**
→ Effort: 50 hours (2 weeks)

### "I want to expand to Nigeria"
→ Read: **IMPORTANT_NIGERIA_EXPANSION.md**
→ Effort: 170 hours (4 weeks)
→ Dependencies: Finish CRITICAL first

### "I want to fundraise in 2 weeks"
→ Read: **STRATEGIC_FUNDRAISING.md**
→ Quick wins: 7 hours
→ But also fix CRITICAL items (shows competence)

### "I want to do ALL of it"
→ Timeline: 3 months (June, July, August)
→ Month 1: Fix critical + RBAC
→ Month 2: Multi-currency + curriculum
→ Month 3: Privacy + API docs + fundraise

---

## Key Numbers

| Task | Hours | Risk | Benefit |
|------|-------|------|---------|
| Fix critical items | 50 | CRITICAL | Production-ready |
| Multi-currency | 40 | HIGH | Nigeria launch |
| Curriculum plugin | 60 | HIGH | Regional expansion |
| RBAC enforcement | 24 | HIGH | Compliance |
| Load testing | 32 | MEDIUM | Scale confidence |
| Offline mode | 8 | MEDIUM | UX improvement |
| Privacy + GDPR | 16 | MEDIUM | Investor confidence |
| API docs | 12 | LOW | Enterprise readiness |
| **TOTAL** | **242 hours** | — | **Fundraisable** |

**Realistic pace**: 10 hours/week × 25 weeks = Ready by October 2026

---

## What NOT to Do

❌ **DON'T** start Nigeria expansion before fixing critical items
❌ **DON'T** add new features while blockers exist
❌ **DON'T** skip load testing — you'll crash at scale
❌ **DON'T** launch without RBAC enforcement — compliance risk
❌ **DON'T** fundraise without fixing uptime claim — trust issue

---

## Success Criteria

### By End of May (1 week)
- [ ] CRITICAL items P0 fixed (uptime, backups, health endpoint)
- [ ] No false claims on landing page
- [ ] Automated backups configured

### By Mid-June (4 weeks)
- [ ] All CRITICAL items fixed
- [ ] RBAC enforced frontend + backend
- [ ] Can deploy to production confidently

### By Early July (8 weeks)
- [ ] Multi-currency ready for Nigeria
- [ ] Curriculum abstraction layer complete
- [ ] WAEC grading system working

### By End of July (12 weeks)
- [ ] Nigeria expansion launched
- [ ] Load testing shows 99.5% uptime under 500 concurrent users
- [ ] Privacy policy + GDPR framework live

### By September (16 weeks)
- [ ] Investor-ready: audit logs, API docs, privacy
- [ ] Fundraising deck: "$X in revenue, $Y ARR, Z schools"

---

## Recommended Action

**Start here, right now:**

1. **Open** [CRITICAL_ASSESSMENT.md](CRITICAL_ASSESSMENT.md)
2. **Print** [CRITICAL_FIXES_CHECKLIST.md](CRITICAL_FIXES_CHECKLIST.md)
3. **Assign P0** items to your best backend developer
4. **Target**: Finish by May 27 (1 week)

Then come back for IMPORTANT + STRATEGIC phases.

---

## Questions?

- **"How long will multi-currency take?"** → 40 hours, but need to understand Paystack multi-currency API first
- **"Can we launch Nigeria without the curriculum plugin?"** → No, WAEC grading is required by law
- **"Do we need native app to fundraise?"** → No, but investors will ask "when?" — have a roadmap ready
- **"Can RBAC wait?"** → No, it's a compliance risk (data isolation mandatory)

---

## Files Created

✅ [CRITICAL_ASSESSMENT.md](CRITICAL_ASSESSMENT.md) — Executive summary + business impact
✅ [CRITICAL_FIXES_CHECKLIST.md](CRITICAL_FIXES_CHECKLIST.md) — Day-by-day implementation
✅ [PRODUCTION_CODE_SAMPLES.md](PRODUCTION_CODE_SAMPLES.md) — Copy-paste code fixes
✅ [IMPORTANT_NIGERIA_EXPANSION.md](IMPORTANT_NIGERIA_EXPANSION.md) — Nigeria blockers
✅ [STRATEGIC_FUNDRAISING.md](STRATEGIC_FUNDRAISING.md) — Investor readiness
✅ [ROADMAP.md](ROADMAP.md) — This file
