# Backend Setup

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

## 1. Install Dependencies

```bash
npm install
```

## 2. Verify PostgreSQL

Check PostgreSQL is running:

```bash
ps aux | grep postgres
```

Check listening port:

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep postgres
```

Expected port:

```
5432
```

## 3. Configure Environment

Create `.env`:

```env
PORT=5100

DATABASE_URL="postgresql://<username>:<password>@localhost:5432/sumitai"

OPENAI_API_KEY=<your_openai_api_key>
```

## 4. Generate Prisma Client

```bash
npx prisma generate
```

## 5. Reset Database (Development)

```bash
npx prisma migrate reset
```

Confirm with `y`.

## 6. Seed Database

```bash
npx tsx prisma/seed.ts
```

Expected output:

```
✅ Consultants seeded successfully.
```

## 7. Open Prisma Studio

```bash
npx prisma studio
```

Open:

```
http://localhost:51212
```

If Studio opens correctly, `ERR_STREAM_PREMATURE_CLOSE` messages in the terminal can be ignored.

## 8. Start Backend

```bash
npm run dev
```

---

# Useful Commands

Generate client:

```bash
npx prisma generate
```

Migration status:

```bash
npx prisma migrate status
```

Reset database:

```bash
npx prisma migrate reset
```

Seed:

```bash
npx tsx prisma/seed.ts
```

Open Studio:

```bash
npx prisma studio
```

List tables:

```bash
psql -d sumitai -c "\dt"
```

Describe Consultant table:

```bash
psql -d sumitai -c '\d "Consultant"'
```

---

# Common Issues

## Connection refused

PostgreSQL is not running or the configured port is incorrect.

## P1010

Database credentials or permissions are incorrect.

## P4001

Connected to an empty database.

## Missing column error

Example:

```
The column `isActive` does not exist
```

This means the Prisma schema and database schema are out of sync.

Run:

```bash
npx prisma migrate reset
npx tsx prisma/seed.ts
```

---

# First-Time Setup

```bash
npm install
npx prisma generate
npx prisma migrate reset
npx tsx prisma/seed.ts
npm run dev
```
