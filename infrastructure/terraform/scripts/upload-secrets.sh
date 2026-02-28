#!/usr/bin/env bash
set -euo pipefail

# Uploads secret JSON blobs to GCP Secret Manager
# Usage: ./upload-secrets.sh <project-id>
#
# Reads from stdin or prompts for each secret category.
# Secret versions are created out-of-band (never stored in Terraform state).

PROJECT_ID="${1:?Usage: $0 <project-id>}"

gcloud config set project "$PROJECT_ID"

upload_secret() {
  local secret_name="$1"
  local description="$2"

  echo ""
  echo "==> Secret: $secret_name"
  echo "    $description"
  echo ""

  local tmp_file
  tmp_file=$(mktemp)
  trap "rm -f $tmp_file" RETURN

  if [[ -f "$secret_name.json" ]]; then
    echo "    Found $secret_name.json — using it."
    cp "$secret_name.json" "$tmp_file"
  else
    echo "    Paste the JSON content for '$secret_name', then press Ctrl+D:"
    cat > "$tmp_file"
  fi

  # Validate JSON
  if ! python3 -m json.tool "$tmp_file" > /dev/null 2>&1; then
    echo "ERROR: Invalid JSON for $secret_name"
    return 1
  fi

  gcloud secrets versions add "$secret_name" \
    --project="$PROJECT_ID" \
    --data-file="$tmp_file"

  echo "    Uploaded new version for $secret_name"
}

echo "==> Uploading secrets to project: $PROJECT_ID"
echo ""
echo "You can either:"
echo "  1. Place auth-secrets.json, api-keys.json, storage-secrets.json in the current directory"
echo "  2. Paste JSON content interactively when prompted"
echo ""

# auth-secrets
cat << 'TEMPLATE'
auth-secrets.json format:
{
  "NEXTAUTH_SECRET": "...",
  "GOOGLE_CLIENT_ID": "...",
  "GOOGLE_CLIENT_SECRET": "...",
  "GOOGLE_REFRESH_TOKEN": "...",
  "GITHUB_CLIENT_ID": "...",
  "GITHUB_CLIENT_SECRET": "..."
}
TEMPLATE
upload_secret "auth-secrets" "Authentication credentials (NextAuth, Google OAuth, GitHub OAuth)"

# api-keys
cat << 'TEMPLATE'
api-keys.json format:
{
  "MONGO_URL": "...",
  "RESEND_KEY": "...",
  "REDIS_URL": "...",
  "DEEPSEEK_API_KEY": "...",
  "MISTRAL_API_KEY": "...",
  "GOOGLE_AI_API_KEY": "..."
}
TEMPLATE
upload_secret "api-keys" "API keys and service URLs (MongoDB, Redis, AI, Email)"

# storage-secrets
cat << 'TEMPLATE'
storage-secrets.json format:
{
  "R2_ACCESS_KEY": "...",
  "R2_ACCOUNT_ID": "...",
  "R2_ACCOUNT_TOKEN": "...",
  "R2_SECRET_KEY": "...",
  "R2_BUCKET_NAME": "...",
  "R2_PUBLIC_DOMAIN": "...",
  "S3_API": "..."
}
TEMPLATE
upload_secret "storage-secrets" "Cloudflare R2 storage credentials"

echo ""
echo "==> All secrets uploaded successfully!"
echo ""
echo "IMPORTANT: Delete any local .json files containing secrets:"
echo "  rm -f auth-secrets.json api-keys.json storage-secrets.json"
