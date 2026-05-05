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
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`

## Notes

- `server.js` exposes the API on `/health`, `/api/onboard`, `/api/auth`, `/api/school`, `/api/superadmin`, and `/api/billing`.
- Tenant resolution supports subdomains and `x-tenant-subdomain` for local development.

