#!/usr/bin/env bash
# ==============================================================================
# tavonzaai AWS ElastiCache Valkey / Redis Tunnel
# Connects your local development environment directly to the live AWS ElastiCache
# Valkey cache via secure AWS SSM port forwarding.
#
# Usage:
#   ./infra/scripts/connect-live-redis.sh [local_port]
#   pnpm run redis:connect
# ==============================================================================

set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-west-2}"
AWS_PROFILE="${AWS_PROFILE:-milkey-dev}"
LOCAL_PORT="${1:-6379}"
PROJECT_NAME="tavonzaai"
ENVIRONMENT="live"

# Check prerequisites
if ! command -v aws &> /dev/null; then
  echo "❌ Error: 'aws' CLI is not installed."
  exit 1
fi

if ! command -v session-manager-plugin &> /dev/null; then
  echo "❌ Error: AWS Session Manager Plugin is not installed."
  echo "   Install on macOS: brew install --cask session-manager-plugin"
  exit 1
fi

PROFILE_ARG=()
if [ -n "${AWS_PROFILE}" ]; then
  PROFILE_ARG=(--profile "${AWS_PROFILE}")
fi

echo "🔍 Finding live backend EC2 bastion..."
INSTANCE_ID=$(aws ec2 describe-instances \
  --region "${AWS_REGION}" \
  "${PROFILE_ARG[@]}" \
  --filters "Name=tag:Name,Values=${PROJECT_NAME}-${ENVIRONMENT}-backend" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text 2>/dev/null || echo "None")

if [ "${INSTANCE_ID}" == "None" ] || [ -z "${INSTANCE_ID}" ]; then
  # Fallback to frontend instance
  INSTANCE_ID=$(aws ec2 describe-instances \
    --region "${AWS_REGION}" \
    "${PROFILE_ARG[@]}" \
    --filters "Name=tag:Name,Values=${PROJECT_NAME}-${ENVIRONMENT}-frontend" "Name=instance-state-name,Values=running" \
    --query "Reservations[0].Instances[0].InstanceId" \
    --output text 2>/dev/null || echo "None")
fi

if [ "${INSTANCE_ID}" == "None" ] || [ -z "${INSTANCE_ID}" ]; then
  echo "❌ Error: No running live EC2 instance found to proxy connection."
  exit 1
fi

echo "🔍 Looking up live ElastiCache Valkey endpoint..."
REMOTE_HOST=$(aws elasticache describe-serverless-caches \
  --region "${AWS_REGION}" \
  "${PROFILE_ARG[@]}" \
  --serverless-cache-name "${PROJECT_NAME}-${ENVIRONMENT}-cache" \
  --query "ServerlessCaches[0].Endpoint.Address" \
  --output text 2>/dev/null || echo "tavonzaai-live-cache-0wzrcb.serverless.euw2.cache.amazonaws.com")

REMOTE_PORT="6379"

echo "=================================================================="
echo "  🚀 Starting AWS ElastiCache Valkey Tunnel"
echo "=================================================================="
echo "  • AWS Instance Proxy: ${INSTANCE_ID}"
echo "  • Remote Host:        ${REMOTE_HOST}:${REMOTE_PORT}"
echo "  • Local Address:      127.0.0.1:${LOCAL_PORT}"
echo "------------------------------------------------------------------"
echo "  💡 In your local .env file or application configuration:"
echo "     REDIS_URL=rediss://127.0.0.1:${LOCAL_PORT}"
echo "------------------------------------------------------------------"
echo "  (Press Ctrl+C to close the tunnel when done)"
echo "=================================================================="

aws ssm start-session \
  --target "${INSTANCE_ID}" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --region "${AWS_REGION}" \
  "${PROFILE_ARG[@]}" \
  --parameters "{\"host\":[\"${REMOTE_HOST}\"],\"portNumber\":[\"${REMOTE_PORT}\"],\"localPortNumber\":[\"${LOCAL_PORT}\"]}"
