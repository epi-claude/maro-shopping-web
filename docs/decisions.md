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

## ADR-006 — Resend on notify.e-dmm.com
**Date**: Phase 1
**Status**: Accepted
**Decision**: Resend as transactional email provider; sending domain notify.e-dmm.com.
**Rationale**: epiSolve standard email infrastructure. notify.e-dmm.com is the verified transactional subdomain.
**From address**: noreply@notify.e-dmm.com
