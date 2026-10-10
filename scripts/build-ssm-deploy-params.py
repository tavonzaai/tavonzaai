#!/usr/bin/env python3
"""
build-ssm-deploy-params.py
Generates the JSON payload for `aws ssm send-command --parameters`.
Reads config from environment variables so the GitHub Actions workflow
stays clean with no quoting/escaping nightmares.

Usage (from GitHub Actions run: block):
  python3 scripts/build-ssm-deploy-params.py
"""
import json
import os
import sys

service   = os.environ.get("SERVICE", "backend")      # backend | frontend app name
registry  = os.environ.get("REGISTRY", "ghcr.io")
image     = os.environ["IMAGE"]
region    = os.environ.get("REGION", "eu-west-2")
secret_id = os.environ.get("SECRET_ID", f"/live/tavonzaai/{service}")
env_file  = os.environ.get("ENV_FILE", f"/opt/tavonzaai/{service}.env")
container = os.environ.get("CONTAINER", f"tavonzaai-{service}")
port      = os.environ.get("PORT", "5000")

# Converts Secrets Manager JSON -> KEY=VALUE lines using python3 (no jq needed)
fetch_secret_cmd = (
    f"aws secretsmanager get-secret-value"
    f" --secret-id {secret_id}"
    f" --region {region}"
    f" --query SecretString"
    f" --output text"
    f" | python3 -c "
    f'"import sys,json; [print(k + chr(61) + str(v)) for k, v in json.load(sys.stdin).items()]"'
    f" > {env_file}"
)

commands = [
    # 1. Pull latest image from public registry
    f"docker pull {image}",
    # 3. Ensure config dir exists
    f"mkdir -p {os.path.dirname(env_file)}",
    # 4. Dump all secrets to env file
    fetch_secret_cmd,
    # 5. Append static runtime vars (overrides any from secrets)
    f"{{ echo PORT={port}; echo API_PORT={port}; echo NODE_ENV=production; }} >> {env_file}",
    # 6. Stop + remove old container gracefully
    f"docker stop {container} 2>/dev/null || true",
    f"docker rm   {container} 2>/dev/null || true",
    # 7. Start new container
    f"docker run -d --name {container} --restart always --env-file {env_file} -p {port}:{port} {image}",
    # 8. Health check
    f"sleep 5 && docker ps --filter name={container} --format 'table {{{{.Names}}}}\\t{{{{.Status}}}}\\t{{{{.Ports}}}}'",
]

print(json.dumps({"commands": commands}))
