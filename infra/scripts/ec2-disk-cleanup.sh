#!/usr/bin/env bash
# ==============================================================================
# tavonzaai EC2 Disk Cleanup Utility
# Frees up disk space on EC2 instances by pruning unused Docker images,
# cleaning systemd journal logs, and clearing apt caches via AWS SSM.
# ==============================================================================

set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-west-2}"
AWS_PROFILE="${AWS_PROFILE:-}"
PROJECT_NAME="tavonzaai"
ENVIRONMENT="${2:-live}"

# Build profile argument if provided
PROFILE_ARG=()
if [ -n "${AWS_PROFILE}" ]; then
  PROFILE_ARG=(--profile "${AWS_PROFILE}")
fi

# Check for AWS CLI
if ! command -v aws &> /dev/null; then
  echo "❌ Error: 'aws' CLI is not installed."
  exit 1
fi

get_instance_id_by_name() {
  local target_name="$1"
  aws ec2 describe-instances \
    --region "${AWS_REGION}" \
    "${PROFILE_ARG[@]}" \
    --filters "Name=tag:Name,Values=${target_name}" "Name=instance-state-name,Values=running" \
    --query "Reservations[0].Instances[0].InstanceId" \
    --output text 2>/dev/null || echo "None"
}

TARGET="${1:-}"

if [ -z "${TARGET}" ]; then
  echo "========================================================"
  echo "  tavonzaai EC2 Disk Space Cleanup (${ENVIRONMENT})"
  echo "========================================================"
  echo "Select target instance to clean:"
  echo "  1) Frontend (${PROJECT_NAME}-${ENVIRONMENT}-frontend)"
  echo "  2) Backend  (${PROJECT_NAME}-${ENVIRONMENT}-backend)"
  echo "  3) Enter Instance ID manually"
  echo "========================================================"
  read -rp "Enter choice [1-3]: " choice

  case "${choice}" in
    1) TARGET="frontend" ;;
    2) TARGET="backend" ;;
    3)
      read -rp "Enter EC2 Instance ID (e.g. i-0900505326bfc946f): " manual_id
      TARGET="${manual_id}"
      ;;
    *)
      echo "Invalid choice. Exiting."
      exit 1
      ;;
  esac
fi

INSTANCE_ID=""
if [[ "${TARGET}" =~ ^i-[0-9a-fA-F]+$ ]]; then
  INSTANCE_ID="${TARGET}"
elif [ "${TARGET}" == "frontend" ]; then
  INSTANCE_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend"
  echo "🔍 Looking up instance: ${INSTANCE_NAME}..."
  INSTANCE_ID=$(get_instance_id_by_name "${INSTANCE_NAME}")
elif [ "${TARGET}" == "backend" ]; then
  INSTANCE_NAME="${PROJECT_NAME}-${ENVIRONMENT}-backend"
  echo "🔍 Looking up instance: ${INSTANCE_NAME}..."
  INSTANCE_ID=$(get_instance_id_by_name "${INSTANCE_NAME}")
else
  INSTANCE_ID="${TARGET}"
fi

if [ -z "${INSTANCE_ID}" ] || [ "${INSTANCE_ID}" == "None" ]; then
  echo "❌ Could not find a running EC2 instance for target '${TARGET}'."
  exit 1
fi

echo "🧹 Running disk cleanup on ${INSTANCE_ID} (${AWS_REGION})..."

COMMAND_ID=$(aws ssm send-command \
  --instance-ids "${INSTANCE_ID}" \
  --document-name "AWS-RunShellScript" \
  --region "${AWS_REGION}" \
  "${PROFILE_ARG[@]}" \
  --parameters 'commands=[
    "echo \"=== Disk Before Cleanup ===\"",
    "df -h /",
    "echo \"=== Pruning Docker System (unused images, stopped containers, build cache) ===\"",
    "docker system prune -af --volumes=false",
    "echo \"=== Vacuuming journal logs ===\"",
    "journalctl --vacuum-time=1d 2>/dev/null || true",
    "echo \"=== Cleaning apt cache ===\"",
    "apt-get clean 2>/dev/null || true",
    "echo \"=== Disk After Cleanup ===\"",
    "df -h /"
  ]' \
  --query "Command.CommandId" \
  --output text)

echo "⏳ Waiting for SSM command execution (Command ID: ${COMMAND_ID})..."
aws ssm wait command-executed \
  --command-id "${COMMAND_ID}" \
  --instance-id "${INSTANCE_ID}" \
  --region "${AWS_REGION}" \
  "${PROFILE_ARG[@]}"

echo "📋 Cleanup Results:"
aws ssm get-command-invocation \
  --command-id "${COMMAND_ID}" \
  --instance-id "${INSTANCE_ID}" \
  --region "${AWS_REGION}" \
  "${PROFILE_ARG[@]}" \
  --query "StandardOutputContent" \
  --output text

echo "✅ Disk cleanup complete!"
