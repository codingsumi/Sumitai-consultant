# Sumit AI

AI consultant platform with specialized health experts, ChatGPT-style email OTP / guest auth, and per-user chat history.

## Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL + Prisma
- **Auth:** Email OTP (Resend) + guest sessions (HTTP-only cookies)
- **AI:** OpenAI + LangChain

## Features

- Email OTP sign-in / registration (no passwords)
- Continue as guest with a display name
- Per-user profiles (name, avatar, account type)
- Guest → registered account conversion (preserves chats)
- Consultant chat with streaming responses

## Backend setup

```bash
cd backend
npm install
cp .env.example .env   # fill DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET, OTP_PEPPER
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

Backend runs on `http://localhost:5100` by default.

### Auth environment variables

| Variable | Purpose |
|----------|---------|
| `SESSION_SECRET` | Session token hashing |
| `OTP_PEPPER` | OTP hashing pepper |
| `FRONTEND_ORIGIN` | Allowed CORS / CSRF origin (e.g. `http://localhost:3000`) |
| `COOKIE_SECURE` | Set `true` in production (HTTPS) |
| `RESEND_API_KEY` | Resend API key (optional locally — OTP is logged to console) |
| `EMAIL_FROM` | From address for OTP emails |
| `SESSION_DAYS` / `GUEST_SESSION_DAYS` | Session lifetimes (default 30) |

### Auth API

- `POST /api/auth/send-otp` `{ email }`
- `POST /api/auth/verify-otp` `{ email, code }`
- `POST /api/auth/guest` `{ name }`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/claim-guest` `{ email, code }` (guest only)
- `GET|PATCH /api/profile`, `POST /api/profile/avatar`, `DELETE /api/profile`

### Tests

```bash
cd backend
npm test
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Use `NEXT_PUBLIC_API_URL=/api` so the browser talks same-origin and session cookies work via the Next.js rewrite to the backend (`API_REWRITE_ORIGIN`).

Open `http://localhost:3000` — unauthenticated users are redirected to `/login`.

## Useful commands

```bash
# Backend
npx prisma generate
npx prisma migrate status
npx prisma migrate reset
npx tsx prisma/seed.ts
npx prisma studio
npm test

# Frontend
npm run dev
npm run build
```

## Common issues

- **401 on chat APIs:** Sign in or continue as guest first; cookies require `withCredentials` / `credentials: "include"`.
- **CORS / Invalid origin:** Set `FRONTEND_ORIGIN` to the exact frontend origin.
- **OTP not arriving:** In local dig, check backend logs for `[dev] OTP for ...`. In production, configure Resend + `EMAIL_FROM`.
- **Schema out of sync:** Run `npx prisma migrate deploy` (or `migrate reset` in development).
