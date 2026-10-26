# Tavonza AI — Frontend Monorepo Context & Deployment Specification

> **Audience**: AI Engineering Agents & Developers  
> **Repository Location**: `/home/siam/Documents/Projects/tavonza-frontend`  
> **Git Remote**: `git@github.com:DevMates01/tavonza-frontend.git`  
> **Sibling Backend Repository**: `/home/siam/Documents/Projects/tavonzaai` (NestJS Standalone)  
> **Status**: In Progress — Monorepo standalone extraction complete, build & deployment pipeline onboarding underway.

---

## 1. System Context & Separation History

The Tavonza AI Restaurant Platform was originally a single unified monorepo. It has been decomposed into three focused repositories:
1. **`tavonzaai`**: Standalone NestJS Backend (REST API, WebSocket Gateway, BullMQ Worker, Drizzle ORM).
2. **`tavonza-frontend`**: Standalone Turborepo Monorepo containing all 7 Next.js web applications.
3. **`tavonza-ai`**: Standalone Python / FastAPI Agent & Tool Gateway.

---

## 2. Frontend Repository Topography

```
/home/siam/Documents/Projects/tavonza-frontend/
├── package.json               # Root workspace scripts (turbo run dev, turbo run build)
├── pnpm-workspace.yaml        # Declares admin, cashier, customer, kitchen, manager, superadmin, waiter, packages/*
├── pnpm-lock.yaml             # Generated root lockfile (pnpm 9.1.0)
├── turbo.json                 # Turborepo task pipeline (build, lint, typecheck, dev, clean)
├── tsconfig.base.json         # Base TypeScript config extended by all 7 apps
│
├── customer/                  # Customer Dining & Ordering PWA (@frontend/customer, port 3000)
├── admin/                     # Organization & Restaurant Admin Portal (@frontend/admin, port 3043)
├── waiter/                    # Waiter Terminal & Order Dispatcher (@frontend/waiter, port 3101)
├── manager/                   # Branch Manager Command Center (@frontend/manager, port 3103)
├── cashier/                   # POS Billing & Cashier Desk (@frontend/cashier, port 3104)
├── kitchen/                   # Kitchen Display System (KDS) (@frontend/kitchen, port 3105)
├── superadmin/                # Platform Superadmin Console (@frontend/superadmin, port 3106)
│
└── packages/
    ├── contracts/             # Shared API contracts & pagination interfaces (@tavonza/contracts)
    └── shared/                # Shared utilities & helpers (@tavonza/shared)
```

---

## 3. Server Topography & Port Mapping

### A. Dev VPS Environment (`admin@ip-172-31-17-153`)
All services run as Docker containers under `/home/admin/server/docker-compose.dev.yaml` fronted by **Caddy SSL Reverse Proxy**:

| App / Service | Host / Internal Port | Docker Container Name | Caddy Upstream Route |
| :--- | :--- | :--- | :--- |
| **Customer App** | `3000:3000` | `tavonzaai-customer` | `customer.dev.tavonza.com` / `localhost:3000` |
| **Admin Dashboard** | `3043:3043` | `tavonzaai-admin` | `admin.dev.tavonza.com` |
| **Waiter Terminal** | `3101:3101` | `tavonzaai-waiter` | `waiter.dev.tavonza.com` |
| **Branch Manager** | `3103:3103` | `tavonzaai-manager` | `manager.dev.tavonza.com` |
| **Cashier Terminal** | `3104:3104` | `tavonzaai-cashier` | `cashier.dev.tavonza.com` |
| **Kitchen KDS** | `3105:3105` | `tavonzaai-kitchen` | `kitchen.dev.tavonza.com` |
| **Superadmin** | `3106:3106` | `tavonzaai-superadmin`| `superadmin.dev.tavonza.com` |
| **Backend API** | `5000:3000` | `tavonzaai-dev-api` | `api.dev.tavonza.com` |
| **Realtime Gateway** | `3001:3001` | `tavonzaai-dev-realtime`| WebSocket gateway |

> [!IMPORTANT]
> When deploying frontend updates to the Dev Server, **NEVER** overwrite the server's root `docker-compose.dev.yaml`. Only pull and restart the specific frontend service(s) being updated.

### B. Live Production Environment (AWS EC2)
- **Target Instance**: EC2 instance tagged `Name=tavonzaai-live-frontend` in AWS region `eu-west-2`.
- **Deployment Transport**: **AWS Systems Manager (SSM)** — zero open SSH ports.
- **Reverse Proxy**: Nginx / Caddy running on the frontend EC2 instance routing subdomains to container ports.

---

## 4. Crucial Architectural Rules & Fixes Applied

### Rule 1: Next.js Standalone Tracing Root
In Next.js monorepos using `output: 'standalone'`, child apps must declare `outputFileTracingRoot` to allow Next.js to package hoisted dependencies from the workspace root.
- In the original monorepo, apps were nested at `frontend/<app>`, so they used `../../`.
- In this standalone frontend repo, apps are directly at the root (`<app>/`), so `outputFileTracingRoot` **must point to `path.join(__dirname, '../')`** inside `experimental: { ... }`:

```javascript
// <app>/next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  // ...
};

module.exports = nextConfig;
```
*(All 7 apps' `next.config.js` have already been updated with this).*

---

### Rule 2: Standalone Container Folder Structure
When Next.js compiles in standalone mode with root tracing:
- The compiled standalone bundle is output to `<app>/.next/standalone/`.
- Due to root tracing, the app's server is located at `<app>/.next/standalone/<app>/server.js`.
- Static files live at `<app>/.next/static/` and must be copied into `<app>/.next/standalone/<app>/.next/static/`.
- Public assets live at `<app>/public/` and must be copied into `<app>/.next/standalone/<app>/public/`.

---

## 5. Current Progress & Remaining Fixes in Apps

### ✅ `customer` (@frontend/customer) — FULLY WORKING
- **Fix Applied**: Removed duplicate `refreshAuthSession()` block in `customer/src/redux/api/baseApi.ts`.
- **Build Status**: Compiles cleanly (`pnpm --filter @frontend/customer build`).
- **Runtime Verification**: Tested and boots standalone in **44ms** on port 3000.

---

### ⚠️ `manager` (@frontend/manager) — PENDING MINOR COMPILATION FIXES
When running `pnpm --filter @frontend/manager build`, address the following:

1. **`branch-manager-dashboard/[tab]/page.tsx`**:
   - Needs:
     ```typescript
     import { cookies } from 'next/headers';
     import { redirect } from 'next/navigation';
     ```
   - *Status*: Applied.

2. **`src/lib/auth.ts`**:
   - Needs export of `isRoleAllowedForManager`:
     ```typescript
     export function isRoleAllowedForManager(user: any): boolean {
       if (!user) return false;
       const role = String(user.role || user.globalRole || '').toLowerCase();
       if (role === 'branch_manager' || role === 'manager' || role === 'super_admin' || role === 'org_admin') {
         return true;
       }
       if (Array.isArray(user.assignments)) {
         return user.assignments.some((a: any) => {
           const r = String(a?.role || '').toLowerCase();
           return r === 'branch_manager' || r === 'manager' || r === 'super_admin' || r === 'org_admin';
         });
       }
       return false;
     }
     ```
   - *Status*: Applied.

3. **`src/redux/features/branchManagerApi.ts`**:
   - Several UI components (`TableDetailView.tsx`, `BranchConfigView.tsx`, `TablesView.tsx`) call `buildCustomerTableUrl` and `buildTableQrCodeUrl`.
   - Ensure these exports are cleanly defined above line 450:
     ```typescript
     export function getCustomerTableUrl(token?: string | null): string {
       if (!token) return '';
       const base = getCustomerBaseUrl();
       return `${base}?qr=${encodeURIComponent(token)}`;
     }

     export const buildCustomerTableUrl = (token?: string | null, _tableId?: string): string =>
       getCustomerTableUrl(token);

     export function buildTableQrCodeUrl(token?: string | null, _tableId?: string): string {
       if (!token) return '';
       const targetUrl = getCustomerTableUrl(token);
       return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
     }
     ```

---

### 🔍 Remaining Apps to Validate
Once `manager` builds cleanly, run:
```bash
cd /home/siam/Documents/Projects/tavonza-frontend
pnpm --filter @frontend/admin build
pnpm --filter @frontend/waiter build
pnpm --filter @frontend/cashier build
pnpm --filter @frontend/kitchen build
pnpm --filter @frontend/superadmin build
```

---

## 6. Dockerfile Specification for Standalone Frontend

Place this file at `docker/Dockerfile` in `/home/siam/Documents/Projects/tavonza-frontend`:

```dockerfile
# ─── Multi-Target Frontend Dockerfile ─────────────────────────────────────────
ARG APP_NAME=customer
ARG APP_PORT=3000
ARG BASE_IMAGE=node:20-alpine

# Stage 1: Base Alpine Environment with pnpm
FROM ${BASE_IMAGE} AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

# Stage 2: Dependencies and Builder
FROM base AS builder
ARG APP_NAME
ARG NEXT_PUBLIC_API_URL=https://api.tavonza.com
ARG NEXT_PUBLIC_AI_API_URL=https://ai.tavonza.com
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AI_API_URL=${NEXT_PUBLIC_AI_API_URL}
WORKDIR /app

# Copy root manifest and lockfiles
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/

# Copy all application directories (for workspace dependency resolution)
COPY admin/ ./admin/
COPY cashier/ ./cashier/
COPY customer/ ./customer/
COPY kitchen/ ./kitchen/
COPY manager/ ./manager/
COPY superadmin/ ./superadmin/
COPY waiter/ ./waiter/

# Install dependencies using pnpm store caching
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build only the target application using Turborepo
RUN npx turbo run build --filter=@frontend/${APP_NAME}...

# Stage 3: Minimal Standalone Production Runner
FROM base AS runner
ARG APP_NAME
ARG APP_PORT=3000
ARG NEXT_PUBLIC_API_URL=https://api.tavonza.com
ARG NEXT_PUBLIC_AI_API_URL=https://ai.tavonza.com
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=${APP_PORT}
ENV APP_TARGET=${APP_NAME}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AI_API_URL=${NEXT_PUBLIC_AI_API_URL}
ENV API_BASE_URL=${NEXT_PUBLIC_API_URL}

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/${APP_NAME}/public ./${APP_NAME}/public
COPY --from=builder --chown=nextjs:nodejs /app/${APP_NAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/${APP_NAME}/.next/static ./${APP_NAME}/.next/static

USER nextjs
EXPOSE ${APP_PORT}
CMD ["sh", "-c", "node ${APP_TARGET}/server.js"]
```

---

## 7. GitHub Actions Workflows Specification

### A. CI Workflow (`.github/workflows/ci.yml`)
Runs on push and pull request to validate all packages:
```yaml
name: Frontend CI

on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main, dev]

jobs:
  quality-gate:
    name: Build & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9.1.0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm build
```

### B. Dev Deployment Workflow (`.github/workflows/deploy-dev.yaml`)
Triggers on push to `main` or manual trigger. Uses a matrix to build only modified or selected applications and deploys them to `/home/admin/server` on the dev server.

### C. Live Production Workflow (`.github/workflows/deploy-live.yml`)
Triggers via `workflow_dispatch` (manual button). Dispatches SSM commands to the `tavonzaai-live-frontend` EC2 instance in `eu-west-2`.

---

## 8. Quick Verification Checklist for the Next Agent

1. `cd /home/siam/Documents/Projects/tavonza-frontend`
2. Run `pnpm build` across the monorepo to confirm all 7 apps compile without errors.
3. Test a single container build:
   ```bash
   docker build --build-arg APP_NAME=customer --build-arg APP_PORT=3000 -t tavonzaai-customer:test -f docker/Dockerfile .
   ```
4. Verify GitHub Secrets needed on `DevMates01/tavonza-frontend`:
   - `HOST`: Dev server IP / domain
   - `USER`: `admin`
   - `KEY`: SSH private key
   - `AWS_ACCESS_KEY_ID`: For SSM live deployment
   - `AWS_SECRET_ACCESS_KEY`: For SSM live deployment
