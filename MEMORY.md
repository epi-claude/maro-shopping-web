# Maro Shopping Platform — Agent Memory

## Session log
| Date | Agent | Summary |
|------|-------|---------|
| 2026-05-13 | C1 | Initialized monorepo from rpuls boilerplate. Replaced MinIO with Cloudflare R2 (file-s3 provider). Scaffolded B2B hooks. Created all project documentation and railway.toml files. |

## Pending before C2
- [x] Cloudflare Account ID confirmed: f48abeb6e56f48b5508c6b27a25c390e — R2 endpoint already set correctly in .env.example
- [x] R2 API token — already set in Railway environment variables
- [ ] TODO: Configure `media.maro.shopping` custom domain on R2 bucket `maroshopping-online`, then update R2_PUBLIC_URL + NEXT_PUBLIC_R2_PUBLIC_URL in Railway env vars from https://pub-8b8c3738041342d3af2fe8919277877d.r2.dev → https://media.maro.shopping
- [x] Resend sending domain `notify.e-dmm.com` verified in Cloudflare DNS
- [ ] Create Railway project `Maro Shopping Web` and connect maro-shopping-web repo
- [ ] Inject all env vars into Railway services (use Railway dashboard variables tab)
- [x] Publishable API key created (title: Storefront) — set in Railway storefront service as NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

## Upstream tracking
- Upstream remote: `git remote add upstream https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate.git`
- Sync trigger: GitHub Watch (Releases only) on upstream repo
- Before merging: `git diff upstream/main -- medusa-config.js package.json` to review changes
- Rule: never add Maro logic directly to medusa-config.js — use src/config/custom-modules.ts

## PayWise integration status
- API key + merchant key set in Railway ✅
- Full request structure discovered via API probing ✅
- fees field blocked — requires PayWise developer support to confirm merchant fee key structure
- TODO: contact PayWise support or check sandbox dashboard for fee category keys

## Bank transfer env vars needed in Railway
- BANK_TRANSFER_BANK_NAME
- BANK_TRANSFER_ACCOUNT_NAME
- BANK_TRANSFER_ACCOUNT_NUMBER
- BANK_TRANSFER_ROUTING_NUMBER
- BANK_TRANSFER_INSTRUCTIONS

## Known gotchas
- Resend: from address must use verified domain — notify.e-dmm.com needs DNS records in Cloudflare
- R2: public URL requires custom domain or *.r2.dev preview URL from bucket settings
- R2: S3 provider requires `additional_client_config: { forcePathStyle: true }` — already set in medusa-config.js
- MeiliSearch: master key set at container startup — rotate via Railway env var change + redeploy
- Railway: DATABASE_URL and REDIS_URL are Railway reference variables — use ${{Postgres.DATABASE_URL}} syntax in service variable config
- CORS: STORE_CORS must include both localhost:8000 and the production storefront domain from day one
- After seeding locally: copy publishable API key from Admin → Settings → API Keys into storefront .env
- MeiliSearch env var in this codebase is MEILISEARCH_ADMIN_KEY (not MEILISEARCH_API_KEY)
- File provider resolve path: `@medusajs/medusa/file-s3` (bundled with @medusajs/medusa — no separate install)
