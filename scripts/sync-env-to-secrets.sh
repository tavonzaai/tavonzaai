#!/usr/bin/env bash
# ==============================================================================
# Script: sync-env-to-secrets.sh
# Description: Syncs environment variables from a local .env file directly to
#              AWS Secrets Manager for Tavonza AI (prod or live).
#
# Usage:
#   ./scripts/sync-env-to-secrets.sh                      # Interactive wizard
#   ./scripts/sync-env-to-secrets.sh prod                 # Sync .env to prod
#   ./scripts/sync-env-to-secrets.sh live                 # Sync .env to live
#   ./scripts/sync-env-to-secrets.sh prod path/to/.env   # Custom file
#   ./scripts/sync-env-to-secrets.sh --help               # View all options
# ==============================================================================

set -euo pipefail

# Default Configurations
DEFAULT_REGION="eu-west-2"
DEFAULT_PROFILE="milkey-dev"
DEFAULT_ENV_FILE=".env"
PROJECT_NAME="tavonzaai"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}${BOLD}=====================================================${NC}"
echo -e "${BLUE}${BOLD}   Tavonza AI — AWS Secrets Manager Env Sync         ${NC}"
echo -e "${BLUE}${BOLD}=====================================================${NC}"

# Help message
show_help() {
  cat << EOF
Usage: $(basename "$0") [ENVIRONMENT] [ENV_FILE] [OPTIONS]

Environments:
  prod                  Sync to /prod/tavonzaai/backend (ECS Fargate test environment)
  live                  Sync to /live/tavonzaai/backend (Production EC2 live environment)

Options:
  -e, --env <name>      Target environment: 'prod' or 'live'
  -f, --file <path>     Path to source .env file (default: .env)
  -s, --secret-id <id>  Custom secret name/ID in Secrets Manager
  -r, --region <region> AWS Region (default: eu-west-2 or \$AWS_REGION)
  -p, --profile <prof>  AWS CLI Profile (default: milkey-dev or \$AWS_PROFILE)
  --replace             Completely overwrite remote secrets instead of merging
  --dry-run             Preview parsed variables without uploading to AWS
  -h, --help            Show this help message

Examples:
  $(basename "$0") prod
  $(basename "$0") live
  $(basename "$0") prod .env.production
  $(basename "$0") --env live --file .env --dry-run
EOF
  exit 0
}

# Parse Arguments
TARGET_ENV=""
ENV_FILE=""
SECRET_ID=""
REGION="${AWS_REGION:-$DEFAULT_REGION}"
PROFILE="${AWS_PROFILE:-$DEFAULT_PROFILE}"
MERGE_MODE="true"
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    prod|live)
      TARGET_ENV="$1"
      shift
      ;;
    -e|--env)
      TARGET_ENV="$2"
      shift 2
      ;;
    -f|--file)
      ENV_FILE="$2"
      shift 2
      ;;
    -s|--secret-id)
      SECRET_ID="$2"
      shift 2
      ;;
    -r|--region)
      REGION="$2"
      shift 2
      ;;
    -p|--profile)
      PROFILE="$2"
      shift 2
      ;;
    --replace)
      MERGE_MODE="false"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    -h|--help)
      show_help
      ;;
    *)
      if [[ -z "$ENV_FILE" && -f "$1" ]]; then
        ENV_FILE="$1"
        shift
      else
        echo -e "${RED}Unknown option or argument: $1${NC}"
        show_help
      fi
      ;;
  esac
done

# Interactive prompts if environment not specified
if [[ -z "$TARGET_ENV" && -z "$SECRET_ID" ]]; then
  echo -e "\n${BOLD}Select Target AWS Environment:${NC}"
  echo "  1) prod   (/prod/${PROJECT_NAME}/backend - ECS Fargate)"
  echo "  2) live   (/live/${PROJECT_NAME}/backend - Live Production EC2)"
  echo "  3) custom (Enter a custom Secret Name)"
  read -rp "Enter choice [1-3]: " env_choice

  case "$env_choice" in
    1|prod)
      TARGET_ENV="prod"
      ;;
    2|live)
      TARGET_ENV="live"
      ;;
    3|custom)
      read -rp "Enter Secret Name/ID: " SECRET_ID
      ;;
    *)
      echo -e "${RED}Invalid selection. Aborting.${NC}"
      exit 1
      ;;
  esac
fi

# Set default Secret ID if not provided
if [[ -z "$SECRET_ID" ]]; then
  SECRET_ID="/${TARGET_ENV}/${PROJECT_NAME}/backend"
fi

# Check .env file path
if [[ -z "$ENV_FILE" ]]; then
  if [[ -f ".env" ]]; then
    ENV_FILE=".env"
  elif [[ -f "../.env" ]]; then
    ENV_FILE="../.env"
  else
    read -rp "Path to .env file [default: .env]: " user_file
    ENV_FILE="${user_file:-.env}"
  fi
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${RED}Error: File not found at: $ENV_FILE${NC}"
  exit 1
fi

echo -e "\n${BOLD}Configuration Summary:${NC}"
echo -e "  • Target Secret: ${GREEN}${SECRET_ID}${NC}"
echo -e "  • Source File:   ${GREEN}${ENV_FILE}${NC}"
echo -e "  • AWS Region:    ${GREEN}${REGION}${NC}"
echo -e "  • AWS Profile:   ${GREEN}${PROFILE}${NC}"
echo -e "  • Sync Mode:     ${GREEN}$([ "$MERGE_MODE" = "true" ] && echo "Merge (preserve existing remote keys)" || echo "Replace (complete overwrite)")${NC}"

# Check AWS CLI prerequisites
if ! command -v aws >/dev/null 2>&1; then
  echo -e "${RED}Error: 'aws' CLI is not installed or not in PATH.${NC}"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Error: 'node' runtime is required to parse .env safely.${NC}"
  exit 1
fi

# Build AWS CLI profile argument
AWS_CLI_ARGS=(--region "$REGION")
if aws configure list-profiles 2>/dev/null | grep -q "^${PROFILE}$"; then
  AWS_CLI_ARGS+=(--profile "$PROFILE")
elif [[ -n "${AWS_PROFILE:-}" ]]; then
  AWS_CLI_ARGS+=(--profile "$AWS_PROFILE")
fi

# Parse .env file to clean JSON using Node.js
PARSED_LOCAL_JSON=$(node -e '
const fs = require("fs");
const file = process.argv[1];
const content = fs.readFileSync(file, "utf8");
const env = {};
for (const line of content.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const match = trimmed.match(/^(?:export\s+)?([A-Za-z_0-9]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("\x27") && val.endsWith("\x27"))) {
      val = val.slice(1, -1);
    }
    // Unescape escaped newlines if any
    val = val.replace(/\\n/g, "\n");
    env[key] = val;
  }
}
console.log(JSON.stringify(env));
' "$ENV_FILE")

KEY_COUNT=$(node -e 'console.log(Object.keys(JSON.parse(process.argv[1])).length)' "$PARSED_LOCAL_JSON")
echo -e "\n${GREEN}✓ Parsed ${KEY_COUNT} variables from ${ENV_FILE}${NC}"

# Fetch existing remote secret if merging
FINAL_JSON="$PARSED_LOCAL_JSON"
if [[ "$MERGE_MODE" == "true" && "$DRY_RUN" == "false" ]]; then
  echo -e "Fetching current secret from AWS Secrets Manager for safe merging..."
  CURRENT_REMOTE_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_ID" \
    "${AWS_CLI_ARGS[@]}" \
    --query "SecretString" \
    --output text 2>/dev/null || echo "{}")

  # Merge using Node: Local .env variables update or add to remote variables
  FINAL_JSON=$(node -e '
    const remote = JSON.parse(process.argv[1] || "{}");
    const local = JSON.parse(process.argv[2] || "{}");
    const merged = { ...remote, ...local };
    console.log(JSON.stringify(merged));
  ' "$CURRENT_REMOTE_JSON" "$PARSED_LOCAL_JSON")
fi

# Print preview of keys (masking sensitive values)
echo -e "\n${BOLD}Variables to be synced:${NC}"
node -e '
  const obj = JSON.parse(process.argv[1]);
  for (const [k, v] of Object.entries(obj)) {
    const isSensitive = /secret|password|key|token|auth|url|smtp/i.test(k);
    const masked = isSensitive && v.length > 6 
      ? v.slice(0, 3) + "..." + v.slice(-3) 
      : (isSensitive && v ? "******" : v);
    console.log(`  • ${k.padEnd(25)} = ${masked}`);
  }
' "$FINAL_JSON"

if [[ "$DRY_RUN" == "true" ]]; then
  echo -e "\n${YELLOW}Dry-run mode active. No changes made to AWS Secrets Manager.${NC}"
  exit 0
fi

# Confirm upload if running in an interactive TTY
if [[ -t 0 && -z "${CI:-}" ]]; then
  echo ""
  read -rp "Are you sure you want to push these secrets to AWS Secrets Manager? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo -e "${YELLOW}Sync cancelled by user.${NC}"
    exit 0
  fi
fi

# Upload to AWS Secrets Manager
echo -e "\nPushing secrets to ${BOLD}${SECRET_ID}${NC} in AWS Secrets Manager..."
RESULT=$(aws secretsmanager put-secret-value \
  --secret-id "$SECRET_ID" \
  --secret-string "$FINAL_JSON" \
  "${AWS_CLI_ARGS[@]}" \
  --output json)

VERSION_ID=$(echo "$RESULT" | node -e '
  const stdin = fs.readFileSync(0, "utf-8");
  try {
    const data = JSON.parse(stdin);
    console.log(data.VersionId || "unknown");
  } catch (e) {
    console.log("unknown");
  }
')

echo -e "\n${GREEN}${BOLD}✓ Successfully synced secrets to AWS Secrets Manager!${NC}"
echo -e "  • Secret Name: ${BOLD}${SECRET_ID}${NC}"
echo -e "  • Version ID:  ${BOLD}${VERSION_ID}${NC}"
echo -e "  • Total Keys:  ${BOLD}$(node -e 'console.log(Object.keys(JSON.parse(process.argv[1])).length)' "$FINAL_JSON")${NC}"

# Optional reminder for running services
if [[ "$TARGET_ENV" == "prod" ]]; then
  echo -e "\n${YELLOW}${BOLD}Tip:${NC} For ECS containers to pick up updated secrets, trigger a rolling deployment:"
  echo -e "  ${BOLD}aws ecs update-service --cluster tavonzaai-prod-cluster --service tavonzaai-prod-backend --force-new-deployment --region ${REGION}${NC}"
elif [[ "$TARGET_ENV" == "live" ]]; then
  echo -e "\n${YELLOW}${BOLD}Tip:${NC} For EC2 containers on live to pick up updated secrets, restart the container:"
  echo -e "  ${BOLD}git push origin main${NC} (or trigger .github/workflows/deploy-live.yml)"
fi
