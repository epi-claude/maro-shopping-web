# C1 — Maro Shopping Platform: Project Initialization

## Context

You are initializing a **self-hosted Medusa v2 e-commerce platform** for Maro Shopping, a client project managed under epiSolve LLC.
This is a **monorepo** containing the Medusa backend (with admin UI) and a Next.js 15 storefront.

- **GitHub account**: claude@episolve.com
- **Repo name**: `maro-shopping-platform`
- **Railway project**: `Maro Shopping Web`
- **Hosting**: Railway (web services + PostgreSQL + Redis + MeiliSearch)
- **File storage**: Cloudflare R2 (S3-compatible — replaces MinIO from the boilerplate)
- **Email**: Resend — sending domain `notify.e-dmm.com`
- **Search**: MeiliSearch (keep from boilerplate)
- **Payment**: No payment processor in Phase 1 — wire Stripe-ready scaffold only
- **Store type**: B2C retail first; architecture must be B2B-extensible (Medusa's module system handles this cleanly)
- **Do NOT use Medusa Cloud** — this is fully self-hosted

---

## Step 0 — Read the Docs Before Writing Any Code

Fetch and read the following before touching any files:

```
https://docs.medusajs.com/resources/commerce-modules/file
https://docs.medusajs.com/resources/infrastructure-modules/workflow-engine/redis
https://docs.medusajs.com/learn/installation
```

Also review the boilerplate README carefully:
```
https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate
```

---

## Step 1 — Repository Setup

### 1a. Fork the Boilerplate

Fork `rpuls/medusajs-2.0-for-railway-boilerplate` into the epiSolve GitHub account (`claude@episolve.com`).
Rename the repo to: **`maro-shopping-platform`**

Clone the fork locally:
```bash
git clone git@github.com:episolve/maro-shopping-platform.git
cd maro-shopping-platform
```

### 1b. Initial Cleanup

Remove MinIO references throughout the project:
- `backend/src/modules/` — remove any MinIO-specific module config
- `docker-compose.yml` — remove the `minio` service block entirely
- Any environment variable references to `MINIO_*` in `.env.example` files
- Remove `minio` from Railway template config if present in `railway.toml`

Verify by running after cleanup:
```bash
grep -r "minio\|MINIO" . --include="*.ts" --include="*.js" --include="*.toml" --include="*.env*" --include="*.json"
```
Expected: zero results (outside this CLAUDE.md file).

**Do not remove**: Resend, MeiliSearch, Redis, or any Postgres references.

---

## Step 2 — Cloudflare R2 File Storage Module

Replace MinIO with Cloudflare R2. Medusa v2 supports S3-compatible providers natively.

### 2a. Install the S3 file module in `backend/`

```bash
cd backend
npm install @medusajs/file-s3
```

### 2b. Configure `backend/medusa-config.ts`

In the `modules` array, add the S3 file module configured for Cloudflare R2:

```typescript
import { defineConfig } from "@medusajs/framework/utils"

const IS_B2B_ENABLED = process.env.ENABLE_B2B === "true"

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    // File storage via Cloudflare R2
    {
      resolve: "@medusajs/file-s3",
      options: {
        file_url: process.env.R2_PUBLIC_URL,
        access_key_id: process.env.R2_ACCESS_KEY_ID,
        secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
        region: "auto",
        bucket: process.env.R2_BUCKET,
        endpoint: process.env.R2_ENDPOINT,
      },
    },
    // Redis workflow engine
    {
      resolve: "@medusajs/workflow-engine-redis",
      options: {
        connection: process.env.REDIS_URL,
      },
    },
    // Redis cache
    {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    // Redis event bus
    {
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    // MeiliSearch
    {
      resolve: "@medusajs/medusa-plugin-meilisearch",
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST,
          apiKey: process.env.MEILISEARCH_API_KEY,
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: ["title", "description", "variant_sku"],
              displayedAttributes: [
                "id", "title", "description", "handle", "thumbnail",
                "variant_sku", "variants", "options",
              ],
            },
            primaryKey: "id",
          },
        },
      },
    },
    // Resend notifications
    {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/notification-resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
  ],
})
```

**Important**: If any of these modules are already wired differently in the boilerplate, reconcile rather than duplicate. The boilerplate is authoritative for anything not explicitly overridden above.

---

## Step 3 — Environment Variables

### 3a. Create `backend/.env.example`

```env
# ─── Database ────────────────────────────────────────────────────
# Injected automatically by Railway — do not reconstruct manually
DATABASE_URL=postgresql://user:password@host:5432/dbname

# ─── Redis ───────────────────────────────────────────────────────
# Injected automatically by Railway
REDIS_URL=redis://default:password@host:6379

# ─── Auth & Security ─────────────────────────────────────────────
JWT_SECRET=change-me-to-a-random-64-char-string
COOKIE_SECRET=change-me-to-another-random-string
MEDUSA_ADMIN_ONBOARDING_TYPE=default

# ─── CORS ────────────────────────────────────────────────────────
# Comma-separated, no spaces
STORE_CORS=http://localhost:8000,https://maro.shopping
ADMIN_CORS=http://localhost:9000,https://api.maro.shopping
AUTH_CORS=http://localhost:9000,https://api.maro.shopping
BACKEND_URL=http://localhost:9000

# ─── File Storage: Cloudflare R2 ─────────────────────────────────
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=maroshopping-online
R2_ENDPOINT=https://f48abeb6e56f48b5508c6b27a25c390e.r2.cloudflarestorage.com
# Use custom domain or *.r2.dev preview URL from R2 bucket settings
# Temporary: use https://pub-[hash].r2.dev from bucket settings until custom domain is set
R2_PUBLIC_URL=https://media.maro.shopping

# ─── Email: Resend ───────────────────────────────────────────────
RESEND_API_KEY=re_...
# Sending domain verified in Resend: notify.e-dmm.com
RESEND_FROM_EMAIL=noreply@notify.e-dmm.com

# ─── Search: MeiliSearch ─────────────────────────────────────────
# Injected by Railway MeiliSearch service
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=

# ─── Feature Flags ───────────────────────────────────────────────
ENABLE_B2B=false

# ─── Payment (Phase 2 — leave blank for now) ─────────────────────
# STRIPE_API_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# ─── Admin Seed ──────────────────────────────────────────────────
MEDUSA_ADMIN_EMAIL=admin@maro.shopping
MEDUSA_ADMIN_PASSWORD=change-me-before-deploy
```

### 3b. Create `storefront/.env.example`

```env
# ─── Medusa Backend ──────────────────────────────────────────────
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=

# ─── Search: MeiliSearch ─────────────────────────────────────────
NEXT_PUBLIC_SEARCH_ENDPOINT=http://localhost:7700
NEXT_PUBLIC_SEARCH_API_KEY=

# ─── Base URL ────────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# ─── Feature flags ───────────────────────────────────────────────
NEXT_PUBLIC_ENABLE_B2B=false
```

---

## Step 4 — Railway Configuration

### 4a. Root `railway.toml`

```toml
[build]
  builder = "nixpacks"

[[services]]
  name = "backend"
  source = "./backend"

[[services]]
  name = "storefront"
  source = "./storefront"
```

### 4b. `backend/railway.toml`

```toml
[build]
  builder = "nixpacks"
  buildCommand = "npm run build"

[deploy]
  startCommand = "npm run start"
  healthcheckPath = "/health"
  healthcheckTimeout = 60
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3
```

### 4c. `storefront/railway.toml`

```toml
[build]
  builder = "nixpacks"
  buildCommand = "npm run build"

[deploy]
  startCommand = "npm run start"
  healthcheckPath = "/"
  healthcheckTimeout = 30
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 3
```

---

## Step 5 — B2B Extensibility Hooks

Scaffold only — no B2B logic in Phase 1.

Create these directories each with a `.gitkeep` and `README.md`:

```
backend/src/modules/b2b/
backend/src/workflows/b2b/
storefront/src/app/(b2b)/
```

Each README.md content:
```markdown
# B2B Module — Phase 2

Reserved for B2B wholesale functionality.
See ADR-004 in docs/decisions.md.

Activation: set ENABLE_B2B=true in Railway environment variables
and run the C2-B2B kickoff prompt.
```

---

## Step 6 — Project Documentation

### 6a. Create `CLAUDE.md` (repo root)

```markdown
# Maro Shopping Platform — CLAUDE.md

## Project overview
Self-hosted Medusa v2 e-commerce platform for maro.shopping.
B2C retail initially; B2B wholesale in Phase 2.
Managed by epiSolve LLC (claude@episolve.com).

## Repo
github.com/episolve/maro-shopping-platform

## Railway project
Maro Shopping Web
Services: backend, storefront, postgres, redis, meilisearch

## Stack
| Layer | Technology |
|-------|-----------|
| Backend | Medusa v2 (Node.js/TypeScript) |
| Storefront | Next.js 15 App Router |
| Database | Railway PostgreSQL |
| Cache/Events | Railway Redis |
| Search | MeiliSearch on Railway |
| Files | Cloudflare R2 (bucket: maroshopping-online) |
| Email | Resend (domain: notify.e-dmm.com) |
| Payment | Stripe — Phase 2 only |
| DNS/CDN | Cloudflare |

## Domains (target)
- Storefront: maro.shopping
- Backend/Admin: api.maro.shopping
- Media CDN: media.maro.shopping

## Key constraints
- Do NOT use Medusa Cloud — fully self-hosted
- Do NOT add MinIO — R2 is the file storage layer
- Do NOT implement payment in Phase 1 — Stripe env vars are scaffolded only
- B2B module in src/modules/b2b/ — do not implement until Phase 2 kickoff
- Railway injects DATABASE_URL and REDIS_URL automatically — never reconstruct them
- CORS values are comma-separated strings — no spaces between entries
- Resend sending address must use verified domain: notify.e-dmm.com

## Local development
\`\`\`bash
# Terminal 1 — Backend (http://localhost:9000, admin at /app)
cd backend && cp .env.example .env   # fill in values
npm install && npm run dev

# Terminal 2 — Storefront (http://localhost:8000)
cd storefront && cp .env.example .env
npm install && npm run dev
\`\`\`

## Migrations
\`\`\`bash
# Local
cd backend && npx medusa db:migrate

# Production (Railway CLI)
railway run --service backend npx medusa db:migrate
\`\`\`

## Deployment
Push to main → Railway auto-deploys both services via railway.toml.
```

### 6b. Create `MEMORY.md` (repo root)

```markdown
# Maro Shopping Platform — Agent Memory

## Session log
| Date | Agent | Summary |
|------|-------|---------|
| C1-INIT | C1 | Initialized monorepo from rpuls boilerplate. Replaced MinIO with R2. Scaffolded B2B hooks. Created all project documentation. |

## Pending before C2
- [ ] Get Cloudflare Account ID for R2 endpoint (dashboard → R2 → Overview page URL contains it)
- [ ] Create R2 API token (new one — rotate immediately if shared in chat) — Object Read & Write on maroshopping-online
- [ ] Set custom domain `media.maro.shopping` on R2 bucket `maroshopping-online` (or use *.r2.dev URL temporarily)
- [ ] Verify sending domain `notify.e-dmm.com` in Resend dashboard (DNS TXT + MX records)
- [ ] Create Railway project `Maro Shopping Web` and connect maro-shopping-platform repo
- [ ] Inject all env vars into Railway services (use Railway dashboard variables tab)
- [ ] Obtain Medusa publishable API key after first local seed (Admin → Settings → API Keys)
- [ ] Add publishable key to storefront env as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

## Known gotchas
- Resend: from address must use verified domain — notify.e-dmm.com needs DNS records in Cloudflare
- R2: public URL requires custom domain or *.r2.dev preview URL from bucket settings
- MeiliSearch: master key set at container startup — rotate via Railway env var change + redeploy
- Railway: DATABASE_URL and REDIS_URL are Railway reference variables — use ${{Postgres.DATABASE_URL}} syntax in service variable config
- CORS: STORE_CORS must include both localhost:8000 and the production storefront domain from day one
- After seeding locally: copy publishable API key from Admin → Settings → API Keys into storefront .env
- boilerplate may already have some modules configured — reconcile, do not duplicate
```

### 6c. Create `docs/decisions.md`

```markdown
# Architecture Decision Records — Maro Shopping Platform

## ADR-001 — Self-hosted over Medusa Cloud
**Date**: Phase 1
**Status**: Accepted
**Decision**: Deploy on Railway (project: Maro Shopping Web) instead of Medusa Cloud.
**Rationale**: epiSolve has established Railway patterns across active projects. Client retains infrastructure control. Cost is lower at current scale.

## ADR-002 — Cloudflare R2 over MinIO
**Date**: Phase 1
**Status**: Accepted
**Decision**: Cloudflare R2 for file/media storage (bucket: maroshopping-online).
**Rationale**: Zero egress fees. S3-compatible — works with @medusajs/file-s3 unchanged. Eliminates one Railway service. R2 endpoint: https://f48abeb6e56f48b5508c6b27a25c390e.r2.cloudflarestorage.com

## ADR-003 — MeiliSearch for product search
**Date**: Phase 1
**Status**: Accepted
**Decision**: MeiliSearch on Railway from day one.
**Rationale**: Table-stakes for B2C UX. Already in boilerplate. Straightforward Railway service addition.

## ADR-004 — B2C first, B2B extensible
**Date**: Phase 1
**Status**: Accepted
**Decision**: Ship B2C storefront; B2B module stubbed, not implemented.
**Rationale**: Medusa v2 module isolation makes B2B additive. Feature flag (ENABLE_B2B) and stub directories in place. Phase 2 activates without structural changes.

## ADR-005 — Payment deferred to Phase 2
**Date**: Phase 1
**Status**: Accepted
**Decision**: No Stripe integration in Phase 1.
**Rationale**: Client finalising Stripe account. Env var scaffold (STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET) in place for zero-friction Phase 2 activation.

## ADR-006 — Resend on notify.e-dmm.com
**Date**: Phase 1
**Status**: Accepted
**Decision**: Resend as transactional email provider; sending domain notify.e-dmm.com.
**Rationale**: epiSolve standard email infrastructure. notify.e-dmm.com is the verified transactional subdomain.
**From address**: noreply@notify.e-dmm.com
```

---

## Step 7 — Seed and Sanity Check

```bash
cd backend
npm install
npm run build
npx medusa db:migrate
npm run seed
npm run dev
```

Verify:
- Admin loads at `http://localhost:9000/app` — log in with `MEDUSA_ADMIN_EMAIL` / `MEDUSA_ADMIN_PASSWORD`
- Go to Settings → API Keys → create a publishable key
- Copy that key into `storefront/.env` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- Start storefront: `cd storefront && npm run dev`
- Storefront loads at `http://localhost:8000`

---

## Step 8 — Validation Checklist

- [ ] Repo exists: `github.com/episolve/maro-shopping-platform`
- [ ] `git status` — no `.env` files tracked
- [ ] Zero MinIO references: `grep -r "minio\|MINIO" . --include="*.ts" --include="*.toml" --include="*.env*"` → empty
- [ ] `backend/medusa-config.ts` has: R2 module, Redis (workflow + cache + events), MeiliSearch, Resend
- [ ] `backend/.env.example` has all R2 vars with TODO comment on ACCOUNT_ID
- [ ] `storefront/.env.example` present with NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY blank
- [ ] Both `railway.toml` files exist with valid `startCommand`
- [ ] `CLAUDE.md`, `MEMORY.md`, `docs/decisions.md` all created at repo root
- [ ] B2B stub directories: `backend/src/modules/b2b/`, `backend/src/workflows/b2b/`, `storefront/src/app/(b2b)/`
- [ ] Local dev: admin loads at `localhost:9000/app`
- [ ] Local dev: storefront loads at `localhost:8000`
- [ ] Initial commit pushed to `main` on GitHub

---

## What C1 Does NOT Do

Intentionally deferred to C2:

- Railway project creation and service wiring (`Maro Shopping Web`)
- Railway environment variable injection for all services
- Cloudflare R2 bucket creation (`maro-media`) and API token setup
- `media.maro.shopping` custom domain on R2 bucket
- DNS configuration in Cloudflare for maro.shopping and api.maro.shopping
- Resend DNS verification for notify.e-dmm.com
- MeiliSearch production index seeding
- B2B module implementation
- Custom storefront theme and branding for Maro Shopping
- Stripe integration

---

## C2 Prompt Trigger

Once C1 is complete, validated, and pushed to GitHub, open a new Claude Code session with:

> "We're continuing the Maro Shopping Platform project. Read CLAUDE.md and MEMORY.md in the maro-shopping-platform repo, then proceed with C2: Railway project setup for 'Maro Shopping Web', environment variable injection, and Cloudflare R2 bucket initialization for maro-media."
