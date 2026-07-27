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
Note: the backend's actual Railway service name is `maro-shopping-web` (not `backend` — that's just the `railway.toml` key). Use `maro-shopping-web` with `railway` CLI commands (`--service maro-shopping-web`).

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
- All monetary `amount` fields (prices, totals, shipping costs) are stored as **decimal major-unit values** — Medusa v2's native convention, matching the stock Admin dashboard's own assumption — e.g. `unit_price: 473.00` means $473.00. **Never divide or multiply by 100 anywhere** (storefront, backend, one-off scripts, payment provider integrations): `amount: 1` means $1.00, not $0.01 and not $100. This was migrated 2026-07-27 from an earlier (wrong) cents-based convention that caused every Admin dashboard total to display 100x too high — see the `pricing-decimal-migration` memory before ever reintroducing a `/100` or `*100` on a money field.

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

# Production — see "Running one-off scripts against production" below;
# `railway run` does NOT work here since DATABASE_URL uses the
# internal-only *.railway.internal hostname.
railway ssh --service maro-shopping-web "npx medusa db:migrate"
```

## Running one-off scripts against production
`railway run --service maro-shopping-web ...` fails: `DATABASE_URL`/`REDIS_URL`/`MEILISEARCH_HOST` all resolve to internal-only `*.railway.internal` hostnames unreachable from outside Railway's network. Instead, write the script under `backend/src/scripts/`, then push it into the already-running container and execute it in one shot (no deploy needed, since the container already has `node_modules`/the Medusa CLI):
```bash
SCRIPT_CONTENT=$(cat backend/src/scripts/<name>.ts)
railway ssh --service maro-shopping-web "cat > src/scripts/<name>.ts << 'EOF'
$SCRIPT_CONTENT
EOF
npx medusa exec ./src/scripts/<name>.ts"
```
Commit + push the finished script afterward so the repo matches what actually ran in production.

## Deployment
Push to `master` → Railway auto-deploys both services via railway.toml.
