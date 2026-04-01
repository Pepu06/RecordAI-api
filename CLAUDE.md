# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (all apps in parallel)
npm run dev

# Build all apps
npm run build

# Lint all apps
npm run lint

# Format with Prettier
npm run format

# Run a single app
cd apps/api && npm run dev
cd apps/web && npm run dev

# Database commands (from packages/db or root)
cd packages/db && npm run db:generate   # regenerate Prisma client
cd packages/db && npm run db:migrate    # run migrations
cd packages/db && npm run db:push       # push schema without migration
cd packages/db && npm run db:studio     # open Prisma Studio
```

There are no tests configured yet.

## Architecture

**RecordAI** is a multi-tenant SaaS for WhatsApp appointment confirmations. It uses a Turborepo monorepo with npm workspaces.

### Packages

| Package | Path | Role |
|---|---|---|
| `@recordai/db` | `packages/db/` | Prisma client singleton + schema |
| `@recordai/shared` | `packages/shared/` | Shared enums/constants (AppointmentStatus, JobName, etc.) |
| API | `apps/api/` | Express REST API + BullMQ workers |
| Web | `apps/web/` | Next.js 15 dashboard |

### Backend (apps/api)

The API is structured around multi-tenancy: every DB query scopes by `tenantId` from the JWT. Authentication middleware (`src/middleware/auth.js`) injects `req.tenantId`, `req.userId`, and `req.role`.

**Request lifecycle:**
1. `src/index.js` — starts Express, boots queue workers, listens on PORT
2. `src/app.js` — registers middleware (helmet, cors, json) and routes
3. `src/middleware/auth.js` — validates Bearer JWT on protected routes
4. `src/controllers/*.controller.js` — business logic, calls Prisma
5. `src/middleware/errorHandler.js` — catches `AppError` subclasses, returns JSON

**Error handling:** Throw from `src/errors/index.js` (`NotFoundError`, `ValidationError`, etc.) and the global error handler formats the response. Never throw plain `Error` objects in controllers.

**WhatsApp integration** (`src/services/whatsapp.js`): wraps Meta Cloud API v18.0. Each tenant stores its own `whatsappPhoneNumberId` and `whatsappAccessToken` on the `Tenant` model — these are passed as `tenantConfig` to every WhatsApp call.

**Job queue** (`src/workers/queue.js`): BullMQ queue named `'appointments'` backed by Redis. Three job types dispatched at appointment creation:
- `sendConfirmation` — immediate, sends interactive "Confirmar/Cancelar" buttons
- `sendReminder` — delayed until 24h before `scheduledAt`
- `sendFollowUp` — delayed until 2h after `scheduledAt`

### Frontend (apps/web)

Next.js 15 App Router with CSS Modules. Route groups:
- `(auth)/` — login and register pages, no auth required
- `(dashboard)/` — protected pages using `layout.jsx` which checks the JWT in localStorage

API calls go through `src/lib/api.js`, which reads `NEXT_PUBLIC_API_URL` and auto-attaches the Bearer token from localStorage.

### Database Schema

Key relationships:
- `Tenant` → has many `User`, `Contact`, `Service`, `Appointment`
- `Appointment` → belongs to `Contact`, `Service`, `User`; has many `MessageLog`
- `AvailabilityRule` → per-user weekly schedule

Phone numbers are stored in E.164 format. All content and messages are in Spanish (es locale).

### Environment Variables

See `.env.example`. The API reads from the root `.env` and validates with Zod on startup (will exit if required vars are missing). Key vars:

| Variable | Used by |
|---|---|
| `DATABASE_URL` | Prisma (Supabase PostgreSQL) |
| `JWT_SECRET` | API auth middleware |
| `REDIS_URL` | BullMQ (Upstash Redis) |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification handshake |
| `NEXT_PUBLIC_API_URL` | Web frontend API client |
