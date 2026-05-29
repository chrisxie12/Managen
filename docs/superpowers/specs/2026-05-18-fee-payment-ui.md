# Online Fee Payment UI

## Overview
Add a fee payment page for `parent` and `student` roles to view outstanding invoices and pay online via Paystack (Card + Mobile Money).

## Backend Changes

### New Endpoints in `routes/billing.js`

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| `POST` | `/api/billing/paystack-initialize` | Initialize Paystack transaction | `protect` (any logged-in user) |
| `GET` | `/api/billing/paystack-callback` | Handle Paystack redirect after payment | none (uses `reference` query param) |

### Existing Endpoints Used

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| `GET` | `/api/school/invoices?student_id=...` | Fetch invoices for a student | `protect` + modified to allow self-service |
| `GET` | `/api/school/parent/children` | Get parent's linked children | `protect` |
| `POST` | `/api/school/payments` | Record completed payment | `protect` (admin; also called by callback) |

### `POST /api/billing/paystack-initialize`
- Body: `{ invoice_id, email, amount }`
- Calls `billingService.initializePayment(email, amount)` which calls Paystack API
- Paystack returns `{ authorization_url, reference }`
- Also create a `payments` row with `status: 'pending'` to track the transaction
- Returns `{ authorization_url, reference }` to frontend so it can redirect/open Paystack popup

### `GET /api/billing/paystack-callback?reference=...&invoice_id=...`
- Called by Paystack redirect (or frontend after inline popup completes)
- Verifies transaction via `GET https://api.paystack.co/transaction/verify/:reference`
- If verified + amount matches: updates payment record to `completed`, updates invoice `paid_amount` and `status`
- Redirects to frontend `/fees?payment=success` or `/fees?payment=cancelled`

### Modified `GET /api/school/invoices`
- Currently requires `fees.view` permission (admin-only)
- Add logic: if user is `student`, filter by `student_id = user.id` (self). If user is `parent`, allow with `student_id` query param (child is verified via `parent/children` relationship).

### Modified `GET /api/school/payments`
- Same: allow student to see own payments, parent to see children's payments.

## Frontend Components

### `FeePayment.tsx` (page)
- Accessible at `/dashboard/fees`
- Roles: `parent`, `student`
- **Parent view**: Tabs — one per child, each showing that child's invoices
- **Student view**: Single list of own invoices
- Two sections per child: "Outstanding" and "Paid" invoices
- Invoice row: invoice number, due date, amount, status badge, "Pay Now" button
- "Pay Now" opens `CheckoutModal`

### `CheckoutModal.tsx` (component)
- Invoice summary at top (amount, due date, invoice number)
- Payment method selector: Card, Mobile Money (MTN, Vodafone, AirtelTigo)
- Email input (pre-filled from user profile)
- "Pay Now" button:
  1. Calls `POST /api/billing/paystack-initialize`
  2. Opens Paystack popup with `authorization_url`
  3. Paystack handles card/mobile money entry
  4. On success: Paystack redirects to callback URL; frontend refreshes invoice list
  5. On failure/cancel: show error toast, user can retry
- Loading state during Paystack initialization
- Close modal button

### Mobile Money Flow via Paystack
- Paystack's standard popup supports all three mobile money providers in Ghana
- User selects "Mobile Money" in our payment method selector
- When "Pay Now" clicked, Paystack popup opens with the user's phone number pre-filled
- User receives prompt on phone to enter PIN
- No separate SDK needed — Paystack inline popup handles everything

## Data Flow

```
[FeePayment Page]
    │
    ├─ GET /api/school/parent/children  (if parent)
    ├─ GET /api/school/invoices?student_id=X
    └─ Renders invoice rows
         │
         └─ [Pay Now] → opens CheckoutModal
              │
              ├─ User selects payment method + enters email
              ├─ POST /api/billing/paystack-initialize
              │    └─ returns { authorization_url, reference }
              ├─ Opens Paystack popup
              ├─ User completes payment on Paystack
              └─ Paystack redirects to /fees?reference=X
                   └─ Page refreshes → invoice shows as paid
```

## Route Registration
- Add `/dashboard/fees` route in `routes.tsx` → `FeePayment`
- Add "Pay Fees" nav item in `DashboardLayout.tsx` for `parent` and `student` roles
- Add `pagePermissions` entry

## Error Handling
- Network errors: toast via sonner
- Paystack initialization failure: toast error, enable retry
- Payment verification failure: toast error, "Contact support" message
- Empty state: "No outstanding fees" with checkmark illustration
