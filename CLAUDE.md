# Maro Shopping Platform — CLAUDE.md

## Project overview
Self-hosted Medusa v2 e-commerce platform for maro.shopping.
B2C retail initially; B2B wholesale in Phase 2.
Managed by epiSolve LLC (claude@episolve.com).

## Repo
github.com/epi-claude/maro-shopping-web

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
- Cloudflare R2 requires `additional_client_config: { forcePathStyle: true }` in the S3 provider config

## Local development
```bash
# Terminal 1 — Backend (http://localhost:9000, admin at /app)
cd backend && cp .env.example .env   # fill in values
npm install && npm run dev

# Terminal 2 — Storefront (http://localhost:8000)
cd storefront && cp .env.example .env
npm install && npm run dev
```

## Migrations
```bash
# Local
cd backend && npx medusa db:migrate

# Production (Railway CLI)
railway run --service backend npx medusa db:migrate
```

## Deployment
Push to main → Railway auto-deploys both services via railway.toml.
