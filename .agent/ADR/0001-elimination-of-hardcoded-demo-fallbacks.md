# ADR 0001: Elimination of Hardcoded Demo Data & Fallback Session Mappings

## Status
Accepted & Implemented

## Date
2026-10-08

## Context
During initial frontend prototyping and UX scaffolding, various client applications (`@frontend/customer`, `@frontend/waiter`, `@frontend/cashier`, `@frontend/kitchen`, `@frontend/manager`, `@frontend/admin`) introduced hardcoded placeholder UUIDs, fallback mock user objects, static table lookup maps, and offline fallback login bypasses. Examples included:
- `DEFAULT_FALLBACK_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27'` in customer cart, dish detail, and menu query APIs.
- `DEFAULT_FALLBACK_TABLE_ID = '34489e98-b165-4f29-bc3e-38be762dedb3'` in customer cart and order submission contexts.
- `TABLE_NUMBER_MAP` dictionary mapping table labels ('t-01', 'table 1', etc.) to static hardcoded table UUIDs.
- Hardcoded dish UUID fallbacks (e.g. `'4455110d-...'`, `'ba394e24-...'`).
- Demo mock staff profiles (`DEMO_WAITER_USER`, `DEMO_CASHIER_USER`, `DEMO_BRANCH_MANAGER_USER`, `DEMO_ADMIN_USER`, dummy IDs like `'00000001-0000-0000-0000-000000000001'`).
- Hardcoded organization fallback IDs (e.g. `'a1b2c3d4-0000-4000-a000-000000000001'`) in admin restaurant creation modals.
- Login screen catch blocks that silently injected mock offline sessions when the backend was unreachable or returned errors.

## Problems Identified
1. **Violation of Tenant Isolation (Rule 6)**: Hardcoded branch and organization UUIDs bypass multi-tenant scoping and risk cross-tenant data contamination or query pollution.
2. **Violation of Backend Security Authority (Rule 4)**: Mock login bypasses and fallback roles undermine backend authentication and capability-based authorization.
3. **Breach of Dynamic Session Lifecycle (Rule 12 & Flow Specs)**: Customers must strictly derive session context from genuine opaque QR scan tokens (`token`), verified table sessions (`tableSessionId`), and guest sessions (`guestSessionId`), not arbitrary static fallbacks.
4. **False Confidence in Testing**: Mock data masks broken API contracts, unhandled null states, and dynamic routing defects during QA.

## Decision
All hardcoded fallback constants, static table number maps, mock staff users, and client-side bypass mechanisms are completely eradicated from all frontend applications. The frontends must dynamically resolve all tenant, session, and user identifiers as follows:

### 1. Customer Application (`@frontend/customer`)
- **Cart & Order Context (`CartContext.tsx`, `/cart/page.tsx`)**: Removed `DEFAULT_FALLBACK_BRANCH_ID`, `DEFAULT_FALLBACK_TABLE_ID`, and `TABLE_NUMBER_MAP`.
- **Dynamic Identification**: Implemented dynamic resolvers (`resolveDynamicBranchId()`, `resolveDynamicTableId()`) that read live state from cookies (`branchId`, `tableId`) or URL query parameters.
- **Session Guards**: Direct backend cart mutations (`syncAddItemToBackend`) and order submissions are strictly conditional upon having an active `tableSessionId` or valid dynamic `branchId`. If absent, items stay in local client cart until the session is joined or scanned.
- **Menu API Queries (`menuCategoryApi.ts`, `menuItemApi.ts`)**: Dynamically resolves the active branch from cookies. If no branch context exists, queries are skipped and return empty sets rather than querying arbitrary fallback branches.
- **Dish Detail (`dish-detail/page.tsx`)**: Removed static mock burger item fallbacks; gracefully renders empty/not found states when an item ID is missing or invalid.

### 2. Waiter Application (`@frontend/waiter`)
- Removed `DEMO_WAITER_USER` and static fallback branch UUIDs from `waiterApi.ts`, `OrdersView.tsx`, `BottomDock.tsx`, and `ProfileView.tsx`.
- Removed one-click demo login buttons and offline fallback catch-blocks in `NewWaiterLoginMobileView.tsx`.
- Replaced dummy fallback user IDs (`00000001-...`) with `user?.id || '—'`.

### 3. Cashier Application (`@frontend/cashier`)
- Removed `DEMO_CASHIER_USER` and static fallback branch UUIDs from `cashierApi.ts` and `auth.ts`.
- `getActiveBranchId()` dynamically derives branch context from authenticated session cookies or Redux auth state (`user.assignedBranchId`). API service calls guard against empty branch IDs.
- Profile views display real user profile data rather than static names ('Nobin Mille') or fake UUIDs.

### 4. Kitchen & KDS Application (`@frontend/kitchen`)
- Removed `DEMO_KITCHEN_USER` and hardcoded branch UUIDs.
- `KitchenQueueView.tsx` and `kitchenApi.ts` query live tickets using `getActiveBranchId()`. If unassigned, services return empty ticket lists without querying arbitrary foreign branches.
- Profile views display authenticated user credentials.

### 5. Restaurant & Branch Manager Application (`@frontend/manager`)
- Removed `DEMO_BRANCH_MANAGER_USER` and static branch fallback constants from `auth.ts` and `branchManagerApi.ts`.
- Dynamic resolution of assigned branch from user assignments or cookies.

### 6. Admin Portal Application (`@frontend/admin`)
- Removed `DEMO_ADMIN_USER` and static organization UUIDs (`a1b2c3d4-...`) from restaurant creation modals.
- Restaurant creation verifies that a valid organization ID exists in the tenant dropdown; if missing, displays clear user-facing error guidance.
- Removed demo login buttons and offline bypass handlers from `LoginView.tsx`.

## Consequences
- **Security & Integrity**: Strict adherence to architectural Rule 4 and Rule 6. Zero risk of mock data polluting production databases or staging environments.
- **Deterministic UX**: Frontends consistently handle empty, unauthenticated, or unassigned states without masking underlying integration gaps.
- **Full Monorepo Build Health**: All 27 packages pass `pnpm turbo run typecheck` and `pnpm turbo run build` with zero TypeScript or bundling errors.
