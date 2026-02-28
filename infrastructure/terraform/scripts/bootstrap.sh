#!/usr/bin/env bash
set -euo pipefail

# Bootstrap script — run once to create GCS state bucket and enable APIs
# Usage: ./bootstrap.sh <project-id>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOOTSTRAP_DIR="$SCRIPT_DIR/../bootstrap"

PROJECT_ID="${1:?Usage: $0 <project-id>}"

echo "==> Bootstrapping GCP project: $PROJECT_ID"

# Verify gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null 2>&1; then
  echo "ERROR: No active gcloud authentication. Run: gcloud auth login"
  exit 1
fi

# Set the project
gcloud config set project "$PROJECT_ID"

echo "==> Initializing Terraform bootstrap..."
cd "$BOOTSTRAP_DIR"

terraform init

echo "==> Planning bootstrap resources..."
terraform plan -var="project_id=$PROJECT_ID"

echo ""
read -rp "Apply bootstrap? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

terraform apply -var="project_id=$PROJECT_ID" -auto-approve

echo ""
echo "==> Bootstrap complete!"
echo "State bucket: $(terraform output -raw state_bucket_name)"
echo ""
echo "Next steps:"
echo "  1. cd ../environments/prod"
echo "  2. cp terraform.tfvars.example terraform.tfvars"
echo "  3. Edit terraform.tfvars with your values"
echo "  4. terraform init"
echo "  5. terraform plan"
echo "  6. terraform apply"
echo ""
echo "  Upload secrets:"
echo "  ../scripts/upload-secrets.sh $PROJECT_ID"
