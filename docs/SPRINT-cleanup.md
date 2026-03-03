# Sprint: Architecture Cleanup — COMPLETED

**Owner:** Head of Dev
**Branch:** `feature/ux-redesign`
**Baseline:** 338KB gzip, 415 tests green, 6 providers, 36 cross-feature violations
**Result:** 338KB gzip, 415 tests green, 6 providers, 0 cross-feature violations

---

## Final Status

| Track | Status | Notes |
|-------|--------|-------|
| Track A: Extract shared modules (A1–A8) | **Done** | 36 → 0 violations. ~50 files moved/updated. |
| Track B: Provider flattening (B1–B2) | **Deferred** | KISS decision — providers work, not violations. No value in rewriting. |
| Track C: Verification (C1–C3) | **Done** | C1 skipped (no ESLint config exists). C2 all green. C3 PRD updated. |

---

## What Moved

| Source | Destination | Violations Killed |
|--------|-------------|-------------------|
| `features/jobs/` (entire dir) | `shared/quests/` | 13 (biggest single win) |
| `features/apps/hooks.ts` | `shared/hooks/app-queries.ts` | 4 |
| `features/system/hooks.ts` | `shared/hooks/system-queries.ts` | 3 |
| `features/marketplace/hooks.ts` | `shared/hooks/marketplace-queries.ts` | 2 |
| `features/apps/types.ts` | `shared/types/app.ts` | 3 |
| `features/marketplace/types.ts` | `shared/types/marketplace.ts` | 1 |
| `features/system/api/instances/instance.tsx` | `shared/api/instances.ts` | 2 |
| `features/marketplace/api/ProductService.ts` | `shared/api/product-service.ts` | 2 |
| `features/marketplace/api/VersionService.ts` | `shared/api/version-service.ts` | 1 |
| `features/marketplace/api/MarketplaceAuthService.ts` | `shared/api/marketplace-auth-service.ts` | 1 |
| `features/system/api/InstanceDetailsService.ts` | `shared/api/instance-details-service.ts` | 1 |
| `features/system/api/InstanceLogService.ts` | `shared/api/instance-log-service.ts` | 1 |
| `features/auth/providers/DeviceActivationContext.tsx` | `shared/contexts/DeviceActivationContext.tsx` | 1 |
| `features/auth/utils/authprovider-utils.ts` | `shared/utils/auth-provider-utils.ts` | 1 |
| App action buttons + editors | `shared/components/app-actions/` | — |
| Installation components | `shared/components/installation/` | — |
| DeviceActivation + button | `shared/components/device/` | — |
| MarketplaceLogin | `shared/components/marketplace/` | — |
| Export + Import | `shared/components/data-transfer/` | — |

Feature barrel files (`index.ts`) re-export from shared for backward compatibility.

---

## Exit Criteria

- [x] 0 cross-feature import violations
- [ ] ~~ESLint rule enforcing boundary~~ — skipped, no existing ESLint config (KISS)
- [ ] ~~4 providers (down from 6)~~ — deferred, 6 providers work fine (KISS)
- [x] 415 tests green
- [x] Bundle = 338KB gzip (identical to baseline)
- [x] PRD updated
