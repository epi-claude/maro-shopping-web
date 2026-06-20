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
**Rationale**: Zero egress fees. S3-compatible — works with @medusajs/medusa/file-s3 provider unchanged. Eliminates one Railway service. R2 endpoint: https://f48abeb6e56f48b5508c6b27a25c390e.r2.cloudflarestorage.com

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

## ADR-007 — Upstream fork tracking strategy
**Date**: Phase 1
**Status**: Accepted
**Decision**: Track `rpuls/medusajs-2.0-for-railway-boilerplate` as a git `upstream` remote. Sync ad-hoc, triggered by GitHub Watch notifications (Releases only) on the upstream repo.
**Rationale**: The boilerplate evolves with Medusa v2. Periodic merges keep us current without the overhead of a fixed schedule.
**Rules**:
- `medusa-config.js` must remain a thin shell — it only imports from `src/config/custom-modules.ts`. Never add Maro logic directly to it.
- All Maro-specific code lives under `backend/src/modules/`, `backend/src/config/`, `backend/src/workflows/`, `storefront/src/modules/`. Never edit upstream-owned files directly.
- Adding a new payment provider = add a file in `src/modules/payment-{name}/` and one entry in `src/config/payments.ts`. Zero other files touched.
- Sync process: `git fetch upstream && git diff upstream/main -- medusa-config.js package.json` to review upstream changes, then merge selectively.

## ADR-008 — Payment providers: PayWise, COD, Bank Transfer
**Date**: Phase 1
**Status**: Accepted
**Decision**: Three payment providers for the TT market. No Stripe in Phase 1.
**Providers**:
- `payment-cod` — Cash on Delivery. Admin captures manually after delivery.
- `payment-bank-transfer` — Direct deposit. Shows bank details at checkout. Admin captures after confirming deposit reference.
- `payment-paywise` — PayWise wallet/card (TT-local gateway, licensed by Central Bank of TT). Pending: `fees` field structure to be confirmed with PayWise developer support.
**Rationale**: Stripe is not the dominant payment method in Trinidad. PayWise is a local licensed EMI. COD and bank transfer are standard for TT e-commerce.

## ADR-009 — ISR caching for product pages with on-demand revalidation
**Date**: 2026-06-20
**Status**: Accepted
**Decision**: Product detail pages use `export const revalidate = 3600` (1-hour ISR) plus a `/api/revalidate` endpoint for on-demand cache busting.
**Rationale**: Without ISR, every product page visit triggered 3 sequential backend roundtrips (region fetch → product fetch → related products fetch). ISR caches the fully-rendered HTML, eliminating backend calls for all but the first visitor per hour. The revalidation endpoint (POST `/api/revalidate?secret=REVALIDATE_SECRET&tag=products`) allows immediate cache busting after catalog changes so product updates don't wait up to an hour to appear.
**Usage**:
```bash
curl -X POST "https://maro-shopping.up.railway.app/api/revalidate?secret=REVALIDATE_SECRET&tag=products"
```
**Tags in use**: `products` (all product fetches), `regions` (region fetches).
**Env var required**: `REVALIDATE_SECRET` on Railway storefront service.

## ADR-006 — Resend on notify.e-dmm.com
**Date**: Phase 1
**Status**: Accepted
**Decision**: Resend as transactional email provider; sending domain notify.e-dmm.com.
**Rationale**: epiSolve standard email infrastructure. notify.e-dmm.com is the verified transactional subdomain.
**From address**: noreply@notify.e-dmm.com
