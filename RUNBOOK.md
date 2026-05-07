# SchoolOS Runbook (Windows cmd.exe)

## 1) Prerequisites

- Node.js 18+ (recommended).
- npm available in `cmd.exe`.
- Ensure your `.env` values are set before starting backend.

From a `cmd.exe` window:

```bat
cd c:\Users\Twumg\OneDrive\Documents\schoolos-backend
copy .env.example .env
npm install
```

If port 3000 is occupied:

```bat
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

## 2) Backend start

```bat
cd c:\Users\Twumg\OneDrive\Documents\schoolos-backend
npm start
```

## 3) Frontend start

Open a new `cmd.exe` window:

```bat
cd c:\Users\Twumg\OneDrive\Documents\schoolos-backend\schoolos-frontend
set PORT=3001
npm start
```

## 4) Tests

Open another new `cmd.exe` window:

```bat
cd c:\Users\Twumg\OneDrive\Documents\schoolos-backend
npm test
```

Optional backend health check:

```bat
curl http://localhost:5000/health
```
