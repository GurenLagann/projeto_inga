# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 full-stack web application for a capoeira group (Inga Capoeira). Features public-facing content and a private members-only area with user authentication, registration, and member management.

**Tech Stack:** Next.js 15.5.4, React 19, TypeScript 5, Tailwind CSS 4, PostgreSQL, Radix UI, Next Auth (beta)

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
npm run migrate   # Execute database migrations (tsx src/lib/migrations.ts)
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (all client components use "use client")
- `src/components/ui/` - Reusable UI primitives (Button, Card, Input, Label, Badge, Tabs)
- `src/lib/` - Utilities: `db.ts` (PostgreSQL pool), `migrations.ts` (schema)
- `src/types/` - TypeScript type definitions

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)

### API Routes

- `POST /api/register` - Create user account (password hashed with bcryptjs)
- `POST /api/login` - Authenticate user credentials
- `GET /api/student?id={userId}` - Retrieve student information

### Database

PostgreSQL with `usuarios` table. Environment variable required:
```
DATABASE_URL=postgresql://user:password@localhost:5555/inga_capoeira
```

### UI Patterns

- Radix UI for base components with Class Variance Authority for variants
- `cn()` utility (from `src/components/ui/utils.ts`) for className merging
- Mobile-first responsive design with Tailwind breakpoints (sm, md, lg)
- Form state managed with React hooks (useState)

### Authentication

- Next Auth 5 configured in `auth.config.ts` (not fully integrated)
- Middleware in `middleware.ts` for route protection
- Passwords hashed with bcryptjs (10 salt rounds)
- `password_hash` never returned in API responses
