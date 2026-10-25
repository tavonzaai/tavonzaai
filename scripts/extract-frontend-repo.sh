#!/usr/bin/env bash
set -e

# ==============================================================================
# Script: extract-frontend-repo.sh
# Purpose: Extract frontend/ with complete Git commit history into a standalone repository
# Target: tavonza-frontend
# ==============================================================================

TARGET_DIR="${1:-../tavonza-frontend}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=================================================================="
echo "  🎨 Tavonza Frontend Repository Extraction"
echo "  Source directory: $REPO_ROOT/frontend"
echo "  Target directory: $TARGET_DIR"
echo "=================================================================="

cd "$REPO_ROOT"

if [ ! -d "frontend" ]; then
  echo "❌ Error: frontend directory not found in $REPO_ROOT"
  exit 1
fi

SPLIT_BRANCH="standalone-frontend-split"
git branch -D "$SPLIT_BRANCH" 2>/dev/null || true

echo "📦 Step 1: Performing git subtree split for frontend/..."
git subtree split -P frontend -b "$SPLIT_BRANCH"

echo "📂 Step 2: Preparing target repository at $TARGET_DIR..."
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

if [ ! -d ".git" ]; then
  git init
fi

git pull "$REPO_ROOT" "$SPLIT_BRANCH" --allow-unrelated-histories

cd "$REPO_ROOT"
git branch -D "$SPLIT_BRANCH"

cd "$TARGET_DIR"

echo "⚙️  Step 3: Configuring standalone monorepo files for Frontend Team..."

# 1. Root pnpm-workspace.yaml
cat << 'EOF' > pnpm-workspace.yaml
packages:
  - 'admin'
  - 'cashier'
  - 'customer'
  - 'kitchen'
  - 'manager'
  - 'superadmin'
  - 'waiter'
  - 'packages/*'
EOF

# 2. Root package.json
cat << 'EOF' > package.json
{
  "name": "tavonza-frontend-monorepo",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@9.1.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean",
    "dev:customer": "pnpm --filter @frontend/customer dev",
    "dev:admin": "pnpm --filter @frontend/admin dev",
    "dev:cashier": "pnpm --filter @frontend/cashier dev",
    "dev:kitchen": "pnpm --filter @frontend/kitchen dev",
    "dev:manager": "pnpm --filter @frontend/manager dev",
    "dev:waiter": "pnpm --filter @frontend/waiter dev",
    "dev:superadmin": "pnpm --filter @frontend/superadmin dev"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.5"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
EOF

# 3. Root turbo.json
cat << 'EOF' > turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# 4. Root tsconfig.base.json (for app tsconfig extends)
cat << 'EOF' > tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  }
}
EOF

# 5. Fix tsconfig extends path in child apps (change ../../tsconfig.base.json to ../tsconfig.base.json)
for app in admin cashier customer kitchen manager superadmin waiter; do
  if [ -f "$app/tsconfig.json" ]; then
    sed -i 's|"../../tsconfig.base.json"|"../tsconfig.base.json"|g' "$app/tsconfig.json"
  fi
done

# 6. Copy self-contained packages/shared and packages/contracts
echo "📦 Step 4: Providing standalone contracts and shared utilities..."
mkdir -p packages/shared/src packages/contracts/src

# packages/shared
cp "$REPO_ROOT/packages/shared/src/index.ts" packages/shared/src/index.ts
cat << 'EOF' > packages/shared/package.json
{
  "name": "@tavonza/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
EOF

# packages/contracts (clean standalone interfaces without backend database ORM dependency)
cat << 'EOF' > packages/contracts/src/index.ts
export * from './query';
EOF

cat << 'EOF' > packages/contracts/src/query.ts
export interface PaginationParams {
  page?: number | string | null;
  limit?: number | string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalPage?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BaseQueryParams extends PaginationParams {
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC' | null;
  includeDeleted?: boolean;
}

export interface ApiResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta | any;
}
EOF

cat << 'EOF' > packages/contracts/package.json
{
  "name": "@tavonza/contracts",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
EOF

# 7. Root .gitignore
cat << 'EOF' > .gitignore
node_modules
.pnpm-store
.next
out
dist
.turbo
*.log
.DS_Store
.env.local
.env.production.local
.env
EOF

# 8. Commit the monorepo configuration
git add .
git commit -m "feat(frontend): configure standalone frontend monorepo workspace" || true

echo ""
echo "=================================================================="
echo "  ✅ Tavonza Frontend repository extraction complete!"
echo "  Location: $(cd "$TARGET_DIR" && pwd)"
echo "=================================================================="
echo "Next steps for the Frontend Team:"
echo "  1. cd $TARGET_DIR"
echo "  2. pnpm install"
echo "  3. pnpm dev:customer   (Run customer app on http://localhost:3000)"
echo "  4. pnpm dev:admin      (Run admin portal on http://localhost:3043)"
echo "  5. git remote add origin <NEW_FRONTEND_GITHUB_REPO_URL>"
echo "  6. git push -u origin main"
echo "=================================================================="
