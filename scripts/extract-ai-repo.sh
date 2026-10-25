#!/usr/bin/env bash
set -e

# ==============================================================================
# Script: extract-ai-repo.sh
# Purpose: Extract apps/ai with complete Git commit history into a standalone repository
# Target: tavonza-ai
# ==============================================================================

TARGET_DIR="${1:-../tavonza-ai}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=================================================================="
echo "  🤖 Tavonza AI Repository Extraction"
echo "  Source directory: $REPO_ROOT/apps/ai"
echo "  Target directory: $TARGET_DIR"
echo "=================================================================="

cd "$REPO_ROOT"

# Ensure apps/ai exists
if [ ! -d "apps/ai" ]; then
  echo "❌ Error: apps/ai directory not found in $REPO_ROOT"
  exit 1
fi

SPLIT_BRANCH="standalone-ai-split"

# Delete split branch if it exists from previous run
git branch -D "$SPLIT_BRANCH" 2>/dev/null || true

echo "📦 Step 1: Performing git subtree split for apps/ai..."
git subtree split -P apps/ai -b "$SPLIT_BRANCH"

echo "📂 Step 2: Preparing target repository at $TARGET_DIR..."
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

if [ ! -d ".git" ]; then
  git init
fi

# Fetch and reset to the split branch
git pull "$REPO_ROOT" "$SPLIT_BRANCH" --allow-unrelated-histories

# Clean up branch in source repo
cd "$REPO_ROOT"
git branch -D "$SPLIT_BRANCH"

cd "$TARGET_DIR"

# Ensure standard Python .gitignore exists
if [ ! -f ".gitignore" ]; then
  cat << 'EOF' > .gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.venv/
venv/
ENV/
env.bak/
venv.bak/

# Environment files & secrets
.env
.env.local
*.pem
*.key

# IDEs & OS
.vscode/
.idea/
.DS_Store
*.swp
*.swo

# Test & coverage
.pytest_cache/
.coverage
htmlcov/
EOF
  git add .gitignore
  git commit -m "chore: add standalone Python .gitignore" || true
fi

echo ""
echo "=================================================================="
echo "  ✅ Tavonza AI repository extraction complete!"
echo "  Location: $(cd "$TARGET_DIR" && pwd)"
echo "=================================================================="
echo "Next steps for the AI Team:"
echo "  1. cd $TARGET_DIR"
echo "  2. python -m venv .venv && source .venv/bin/activate"
echo "  3. pip install -r requirements.txt"
echo "  4. cp .env.example .env"
echo "  5. uvicorn main:app --reload --port 8000"
echo "  6. git remote add origin <NEW_AI_GITHUB_REPO_URL>"
echo "  7. git push -u origin main"
echo "=================================================================="
