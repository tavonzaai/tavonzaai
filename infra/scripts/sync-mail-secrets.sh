#!/usr/bin/env bash
# ==============================================================================
# Backlyst AWS SES - Secrets Manager & Backend Mail Synchronizer
# Extracts SES SMTP credentials from Terraform and updates Secrets Manager
# ==============================================================================

set -euo pipefail

ENV="${1:-dev}"
AWS_REGION="${AWS_REGION:-eu-west-2}"
AWS_PROFILE="${AWS_PROFILE:-tom}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform/environments/$ENV"
SECRET_NAME="/$ENV/backlyst/backend"

echo "========================================================"
echo "  Backlyst Mail Service Sync ($ENV)"
echo "========================================================"

# Profile flag
PROFILE_ARG=""
if [ -n "${AWS_PROFILE}" ]; then
  PROFILE_ARG="--profile ${AWS_PROFILE}"
fi

# 1. Read Terraform outputs
echo "📋 Reading SES SMTP outputs from Terraform ($ENV)..."
cd "$TERRAFORM_DIR"

SMTP_HOST=$(terraform output -raw ses_smtp_host 2>/dev/null || echo "")
SMTP_PORT=$(terraform output -raw ses_smtp_port 2>/dev/null || echo "587")
SMTP_USER=$(terraform output -raw ses_smtp_username 2>/dev/null || echo "")
SMTP_PASS=$(terraform output -raw ses_smtp_password_v4 2>/dev/null || echo "")

if [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ]; then
  echo "❌ Error: Could not read SES SMTP credentials from Terraform output."
  echo "   Please ensure SES is enabled and 'terraform apply' has been executed in $TERRAFORM_DIR."
  exit 1
fi

echo "✅ Retrieved SES credentials:"
echo "   Host: $SMTP_HOST"
echo "   Port: $SMTP_PORT"
echo "   User: $SMTP_USER"
echo "   Pass: [REDACTED]"

# 2. Fetch existing secret JSON
echo "🔐 Fetching current secret from AWS Secrets Manager ($SECRET_NAME)..."
CURRENT_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$AWS_REGION" \
  ${PROFILE_ARG} \
  --query SecretString \
  --output text)

# 3. Merge SMTP fields
UPDATED_SECRET=$(python3 -c "
import json, sys
current = json.loads(sys.argv[1])
current['SMTP_HOST'] = sys.argv[2]
current['SMTP_PORT'] = sys.argv[3]
current['SMTP_USER'] = sys.argv[4]
current['SMTP_PASS'] = sys.argv[5]
if 'SMTP_FROM' not in current or not current['SMTP_FROM']:
    current['SMTP_FROM'] = 'noreply@backlyst.co.uk'
if 'SMTP_SECURE' not in current or not current['SMTP_SECURE']:
    current['SMTP_SECURE'] = 'false'
if 'COMPANY_NAME' not in current or not current['COMPANY_NAME']:
    current['COMPANY_NAME'] = 'Backlyst'
print(json.dumps(current))
" "$CURRENT_SECRET" "$SMTP_HOST" "$SMTP_PORT" "$SMTP_USER" "$SMTP_PASS")

# 4. Put updated secret back
echo "💾 Updating Secrets Manager ($SECRET_NAME)..."
aws secretsmanager put-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$AWS_REGION" \
  ${PROFILE_ARG} \
  --secret-string "$UPDATED_SECRET" > /dev/null

echo "✅ Secrets Manager updated successfully with SMTP credentials."

# 5. Optionally restart backend container
read -rp "Would you like to restart the backend container via SSM now to apply new mail settings? [y/N]: " RESTART
if [[ "$RESTART" =~ ^[Yy]$ ]]; then
  INSTANCE_ID=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    ${PROFILE_ARG} \
    --filters "Name=tag:Name,Values=backlyst-$ENV-backend" "Name=instance-state-name,Values=running" \
    --query "Reservations[0].Instances[0].InstanceId" \
    --output text 2>/dev/null || echo "")

  if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
    echo "🚀 Restarting backend container on $INSTANCE_ID..."
    aws ssm send-command \
      --region "$AWS_REGION" \
      ${PROFILE_ARG} \
      --instance-ids "$INSTANCE_ID" \
      --document-name "AWS-RunShellScript" \
      --parameters "commands=[\"sudo bash /opt/backlyst/backend/start-backend.sh\"]" \
      --comment "Restart backend with new mail settings" > /dev/null
    echo "✅ Restart command sent to backend EC2 instance."
  else
    echo "⚠️  Could not find running backend EC2 instance. Please restart manually."
  fi
fi

echo "🎉 Done! Mail service is configured and ready."
