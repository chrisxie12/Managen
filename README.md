# SchoolOS Backend

## Quick start

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies:

```bash
npm install
```

3. Run the API:

```bash
npm start
```

4. Run the smoke tests:

```bash
npm test
```

## Key environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `TENANT_BASE_URL`
- `PAYSTACK_SECRET_KEY`
- `DEMO_WEBHOOK_URL` (optional, for forwarding demo leads after storing them)
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `MAILGUN_API_KEY` / `MAILGUN_DOMAIN` (optional email delivery)
- `ARKESEL_API_KEY` (optional SMS delivery)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` (optional WhatsApp delivery)

## Notes

- `server.js` exposes the API on `/health`, `/api/onboard`, `/api/auth`, `/api/school`, `/api/superadmin`, and `/api/billing`.
- Paystack webhooks are accepted at `POST /webhooks/paystack` with signature verification.
- `POST /api/onboard/demo-request` stores landing-page demo leads in Supabase (`demo_leads` table).
- Tenant resolution supports subdomains and `x-tenant-subdomain` for local development.

## Fee reminder dispatch

- `POST /api/school/fees/reminders/send` triggers due-fee reminders for the current tenant.
- Request body supports `{ "limit": 100, "dryRun": true }`.
- Channel order is configurable with `FEE_REMINDER_CHANNEL_ORDER` (default: `whatsapp,sms,email`).

## Quick helper test

```bash
npm run test:fees
```

