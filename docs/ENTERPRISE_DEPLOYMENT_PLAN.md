# Tavonza AI Backend — Established Enterprise Deployment Specification

> **Document Version**: 2.0.0  
> **Status**: APPROVED & LOCKED  
> **Scope**: Concrete operational guide for deploying the standalone NestJS backend using the project's established AWS infrastructure and GitHub Actions pipelines.

---

## 1. The Established Infrastructure Stack

Your platform is already architected and provisioned in Terraform ([`infra/environments/live/`](file:///home/siam/Documents/Projects/tavonzaai/infra/environments/live/)) and GitHub Actions:

```
                                INTERNET
                                   │
                         ┌─────────▼─────────┐
                         │ Route 53 DNS      │ (api.tavonza.com)
                         └─────────┬─────────┘
                                   │
                         ┌─────────▼─────────┐
                         │ AWS ALB + ACM TLS │ (HTTPS 443 -> Forward to EC2:5000)
                         └─────────┬─────────┘
                                   │ (Private VPC Peering)
  ┌────────────────────────────────┴───────────────────────────────┐
  │ AWS EC2 INSTANCE: tavonzaai-live-backend (eu-west-2)          │
  │ Deployed via: AWS Systems Manager (SSM) — Zero open SSH ports │
  │                                                               │
  │  ┌───────────────────────────┐    ┌────────────────────────┐  │
  │  │ tavonzaai-backend         │    │ tavonzaai-worker       │  │
  │  │ (Docker Container)        │    │ (Docker Container)     │  │
  │  │ • Web API & Sockets       │    │ • Headless Worker      │  │
  │  │ • Ports 5000 / 3000       │    │ • BullMQ Queues        │  │
  │  │ • Healthcheck: /health    │    │ • Outbox Publisher     │  │
  │  └─────────────┬─────────────┘    └───────────┬────────────┘  │
  └────────────────┼──────────────────────────────┼───────────────┘
                   │                              │
  ┌────────────────┴──────────────────────────────┴───────────────┐
  │ PRIVATE AWS DATA INFRASTRUCTURE                               │
  │                                                               │
  │  • AWS RDS PostgreSQL 16 (Multi-AZ, Private DB Subnets)      │
  │  • Redis / Valkey (ElastiCache / Cloud Queues)                │
  │  • AWS S3 (tavonzaai-live-storage-bucket)                     │
  │  • AWS SES (Transactional emails via mail.tavonza.com)        │
  │  • AWS Secrets Manager (/live/tavonzaai/backend)              │
  └───────────────────────────────────────────────────────────────┘
```

---

## 2. Environments Overview

| Environment | Purpose | Hosting | Deploy Mechanism | Workflow File |
| :--- | :--- | :--- | :--- | :--- |
| **Live (Production)** | Production customer & staff traffic | AWS EC2 behind ALB + RDS Postgres | **AWS Systems Manager (SSM)** (No SSH required) | [`.github/workflows/deploy-live.yml`](file:///home/siam/Documents/Projects/tavonzaai/.github/workflows/deploy-live.yml) |
| **Dev (Staging)** | Staging & integration testing | VPS (`/home/admin/server`) with Caddy SSL | **SSH Action** on push to `main` | [`.github/workflows/deploy-dev.yaml`](file:///home/siam/Documents/Projects/tavonzaai/.github/workflows/deploy-dev.yaml) |
| **Local Dev** | Local workstation development | Docker (`docker/docker-compose.yml`) | Local shell: `pnpm dev` / `pnpm dev:worker` | [`docker/docker-compose.yml`](file:///home/siam/Documents/Projects/tavonzaai/docker/docker-compose.yml) |

---

## 3. How Deployments Work (Step-by-Step)

### A. Live / Production Deployment (`deploy-live.yml`)
Triggered manually via GitHub Actions **Run workflow** (`workflow_dispatch`):
1. **Build & Push**: Builds the multi-stage [`docker/Dockerfile`](file:///home/siam/Documents/Projects/tavonzaai/docker/Dockerfile) and pushes images to GitHub Container Registry:
   - `ghcr.io/tavonzaai/tavonzaai-live-backend:latest`
   - `ghcr.io/tavonzaai/tavonzaai-live-worker:latest`
2. **AWS SSM Dispatch**: Discovers the running EC2 instance with tag `Name=tavonzaai-live-backend` and sends shell commands via AWS Systems Manager:
   - Pulls the latest image from GHCR.
   - Restarts `tavonzaai-backend` with `--env-file /opt/tavonzaai/backend.env`, log limits (`--log-opt max-size=20m --log-opt max-file=3`), and binds port `5000:5000` (ALB listener) and `3000:5000`.
   - Restarts `tavonzaai-worker` headless with the same environment.
   - Automatically prunes stale Docker images.
3. **Database Migrations**:
   - `DatabaseModule` automatically applies any pending Drizzle migrations in `drizzle/` on boot before accepting traffic.

### B. Syncing Production Secrets to AWS Secrets Manager
To update production credentials (JWT secrets, Stripe keys, database passwords):
```bash
# 1. Edit your local .env.production file
# 2. Run the established sync script:
./scripts/sync-env-to-secrets.sh live .env.production
```
This updates `/live/tavonzaai/backend` in AWS Secrets Manager directly.

### C. Dev / Staging Deployment (`deploy-dev.yaml`)
Triggered automatically on push to `main`:
1. Builds `ghcr.io/tavonzaai/tavonzaai-dev-api` and `tavonzaai-dev-worker`.
2. Connects via SSH to `/home/admin/server`.
3. Pulls new images and restarts `api`, `worker`, and `caddy` reverse proxy.

---

## 4. Key Hardening Features in Place

1. **Native Docker Healthchecks**:
   - Integrated into `docker/Dockerfile`:
     ```dockerfile
     HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
       CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
     ```
2. **Dual Liveness & Readiness Probes** ([`src/app.controller.ts`](file:///home/siam/Documents/Projects/tavonzaai/src/app.controller.ts)):
   - `GET /health`: Liveness probe (uptime, status).
   - `GET /health/readiness`: Deep readiness probe checking database connection (`SELECT 1`). Returns `503` if DB connection pool is down.
3. **Disk Protection via Log Rotation**:
   - Docker container logs capped at `max-size=20m` and `max-file=3` across both live and dev.
4. **Credential Isolation**:
   - `.dockerignore` excludes `.env*` to prevent local secrets from ever baking into images.
