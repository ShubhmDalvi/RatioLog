
<p align="center">
  <img src="public/logo.svg" alt="Logo" width="100">
</p>

# RatioLog

Remember why you decided. A lightweight, personal decision log for people who build software: capture the context behind each architecture decision, link decisions that supersede older ones, and keep a running changelog of what changed — all in your own private space.

## Features

- Architecture decision records with Context, Decision, and Consequences sections
- Markdown writing with live preview
- Status lifecycle: proposed, accepted, deprecated, superseded, rejected
- Auto-generated changelog entries from decision events
- Link decisions that supersede earlier ones
- Pin important decisions to the sidebar
- Searchable command palette (Cmd/Ctrl + K)
- Per-user isolation — every account sees only its own data
- Dark, native-feeling UI

## Tech stack

- Next.js (App Router), React 19, TypeScript
- Prisma ORM with SQLite (file database locally, Turso/libSQL in production)
- Auth.js (NextAuth v5) with email/password credentials
- Tailwind CSS v4 and shadcn/ui

## Getting started

Prerequisites: Node.js 20+

1. Install dependencies: `npm install`
2. Create your environment file: `cp .env.example .env`
3. Set `AUTH_SECRET` in `.env` (generate with: `openssl rand -base64 32`)
4. Create the database and apply migrations: `npx prisma migrate deploy`
5. (Optional) Seed a demo user and sample decisions: `npx prisma db seed`
6. Run the dev server: `npm run dev`

Open http://localhost:3000 and sign in with the seeded demo account (demo@ratiolog.dev / password123), or create your own account.

## Environment variables

- `DATABASE_URL` — SQLite file for local development (default: `file:./dev.db`) or a Turso `libsql://` URL for production
- `TURSO_AUTH_TOKEN` — Turso database auth token (production)
- `AUTH_SECRET` — Auth.js signing secret (required)
- `AUTH_TRUST_HOST` — set to `true` for local development
- `SEED_EMAIL` / `SEED_PASSWORD` — credentials for the seeded demo user
- `ALLOW_SIGNUP` — set to `"false"` to make signups invite-only

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build the production bundle
- `npm run start` — run the production build
- `npm run lint` — run ESLint
- `prisma generate` — regenerates the Prisma client (runs automatically on install)

## Deployment

- **Local development** uses a SQLite file via the `better-sqlite3` driver adapter (`DATABASE_URL` starting with `file:`).
- **Production** runs on Vercel with a Turso/libSQL database. Set `DATABASE_URL` to the Turso `libsql://` URL, `TURSO_AUTH_TOKEN` to the database auth token, and a real `AUTH_SECRET`. The driver adapter is chosen automatically from the URL scheme.
