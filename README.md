# Travel Agency Management System

Full-stack monorepo for a travel agency: clients browse and book trips, admins manage the catalog, reservations, feedback and watch KPIs.

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + React Query
- **Backend:** NestJS 10 (REST) with modular clean architecture
- **DB:** PostgreSQL 16
- **ORM:** Prisma
- **Auth:** JWT (access tokens) + bcrypt + RBAC (`CLIENT` / `ADMIN`)

## Layout

```
.
├── backend/       # NestJS API
├── frontend/      # Next.js app
├── docker-compose.yml
└── README.md
```

## Quick start

```bash
# 1. boot Postgres
docker compose up -d

# 2. backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed         # creates an admin: admin@agency.io / Admin123!
npm run start:dev    # http://localhost:4000

# 3. frontend (in a new shell)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev          # http://localhost:3000
```

## Environment

Backend `.env`:

```
DATABASE_URL=postgresql://agency:agency@localhost:5432/agency?schema=public
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
PORT=4000
FRONTEND_URL=http://localhost:3000
```

Frontend `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Architecture decisions

- **Clean separation:** controllers stay thin, services own the business rules, Prisma is wrapped behind a single `PrismaService` injected via a global module.
- **DTOs everywhere:** request payloads validated through `class-validator` + global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- **RBAC:** a `JwtAuthGuard` validates the token then a `RolesGuard` enforces the `@Roles()` decorator on each route.
- **Password reset:** a single-use token is hashed and stored on the user; the dev environment logs the reset link to the console instead of sending an email.
- **Frontend auth:** token is kept in `localStorage`, attached by an axios interceptor, and exposed through a React context. React Query caches every server fetch.

## Default admin

After running `npm run seed` in `backend/`:

- email: `admin@agency.io`
- password: `Admin123!`
