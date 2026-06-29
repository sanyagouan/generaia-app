# GeneraIA App — Development Contract

## Project
GeneraIA is a SaaS B2B multi-tenant platform providing AI assistants for hospitality (restaurants).
Each tenant (restaurant) gets a WhatsApp-connected AI assistant managed from a web dashboard.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + ShadCN/ui
- **Backend**: Next.js API Routes + FastAPI (Python) for AI orchestration
- **Database**: PostgreSQL 16 with Row-Level Security (multi-tenant isolation)
- **ORM**: Drizzle ORM
- **Auth**: Clerk (Organizations) — orgId in JWT used for tenant isolation
- **WhatsApp**: Evolution API (Baileys mode → Meta Cloud API migration path)
- **Payments**: Stripe Billing + Stripe Tax
- **Hosting**: Coolify (self-hosted) on Contabo VPS

## Multi-Tenancy Model
- Each tenant = 1 Clerk Organization
- `clerkOrgId` is the tenant identifier in our database
- All tenant-scoped data has a `tenant_id` column with RLS enabled
- Middleware extracts orgId from Clerk JWT and passes it through

## Coding Standards
- TypeScript strict mode
- Zod for all input validation
- Server Components by default, Client Components only when needed
- Conventional Commits (feat:, fix:, chore:, refactor:, test:)
- No secrets in code — use environment variables

## File Structure
```
src/
├── app/
│   ├── (public)/          # Landing, pricing, docs
│   ├── dashboard/         # Authenticated tenant dashboard
│   ├── onboarding/        # New tenant setup wizard
│   ├── api/               # API routes (webhooks, etc.)
│   ├── sign-in/           # Clerk sign-in
│   ├── sign-up/           # Clerk sign-up
│   ├── layout.tsx         # Root layout with ClerkProvider
│   ├── page.tsx           # Landing page
│   └── providers.tsx      # Client providers
├── components/
│   ├── ui/                # ShadCN components
│   └── features/          # Feature-specific components
├── db/
│   ├── schema.ts          # Drizzle schema (multi-tenant)
│   └── index.ts           # DB client
├── lib/
│   ├── utils.ts           # Shared utilities (cn, etc.)
│   └── ai/                # AI orchestration (future)
└── middleware.ts           # Clerk auth + route protection
```

## Database Conventions
- UUID primary keys
- `created_at` and `updated_at` on every table
- snake_case column names in DB, camelCase in TypeScript (Drizzle maps)
- RLS enabled on all tenant-scoped tables
