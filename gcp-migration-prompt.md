# GCP Free Tier Infrastructure — Terraform Migration Prompt

> Copy this entire file as a prompt in a new Claude Code session with your other monorepo.
> Fill in the values in the **Configuration** section before running.

---

## Configuration

Fill these values before starting:

```
GCP_PROJECT_ID=         # e.g., my-project-prod
GCP_REGION=             # e.g., us-central1
BILLING_ACCOUNT_ID=     # from: gcloud billing accounts list
BILLING_CURRENCY=       # from: gcloud billing accounts describe ACCOUNT_ID (e.g., COP, USD)
GITHUB_REPO=            # e.g., owner/repo
CUSTOM_DOMAIN=          # e.g., mydomain.com
DNS_PROVIDER=           # e.g., Cloudflare, Hostinger, Namecheap
ALERT_EMAIL=            # email for budget/monitoring alerts
CONTAINER_PORT=         # e.g., 3000
HEALTH_CHECK_PATH=      # e.g., /api/health
```

---

## Task

Migrate this monorepo from VPS (Docker → GHCR → SSH) to GCP Cloud Run using Terraform. The infrastructure must stay within GCP's **Always Free tier** (permanent, not trial). Read the project's `.env`, `.env.production`, and existing `deploy.yml` to understand all environment variables and secrets.

## Architecture

```
GitHub Actions (CI/CD)
    │ Workload Identity Federation (keyless OIDC)
    ▼
Artifact Registry ──► Cloud Run (app service)
    (Docker images)      ├─ Secret Manager (JSON bundles)
                         ├─ HTTPS + custom domain (managed TLS)
                         ├─ WebSocket support (session affinity)
                         └─ Scale-to-zero (0 cost when idle)
```

## Secret Management Strategy

**Problem**: Many env vars but only 6 free Secret Manager versions.

**Solution**: Bundle secrets into max 3 JSON blobs grouped by concern (auth, api-keys, storage). Leaves 3 spare versions for rotation. Non-sensitive config (NODE_ENV, public URLs, email domains) stays as plain Cloud Run env vars.

Read `.env.production` or `.env` to identify all secrets. Group them into logical bundles:

| Secret Name | Example Contents |
|---|---|
| `auth-secrets` | Auth tokens, OAuth client IDs/secrets, JWT secrets |
| `api-keys` | Database URLs, API keys for external services |
| `storage-secrets` | Storage credentials (S3/R2 keys, bucket config) |

A `start.sh` entrypoint parses JSON files into env vars before starting the app:

```sh
#!/usr/bin/env sh
set -e
parse_secret_file() {
  local file="$1"
  if [ -f "$file" ]; then
    eval "$(node -e "
      const secrets = JSON.parse(require('fs').readFileSync('$file', 'utf8'));
      for (const [key, value] of Object.entries(secrets)) {
        console.log('export ' + key + '=' + JSON.stringify(String(value)));
      }
    ")"
  fi
}
parse_secret_file "/secrets/auth-secrets/secrets.json"
parse_secret_file "/secrets/api-keys/secrets.json"
parse_secret_file "/secrets/storage-secrets/secrets.json"
exec node apps/frontend/server.js  # Adjust path to your app's entrypoint
```

## File Structure to Create

```
infrastructure/terraform/
├── .gitignore                          # *.tfstate*, .terraform/, terraform.tfvars
├── bootstrap/                          # One-time setup (local state)
│   ├── main.tf                         # GCS bucket + API enablement
│   ├── variables.tf
│   └── outputs.tf
├── environments/
│   └── prod/
│       ├── main.tf                     # Root module composition
│       ├── variables.tf
│       ├── outputs.tf
│       ├── backend.tf                  # GCS remote state
│       ├── providers.tf                # Google provider config
│       └── terraform.tfvars.example
├── modules/
│   ├── iam/                            # Service accounts + WIF
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── artifact-registry/              # Docker image registry
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloud-run/                      # App deployment + domain
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── secrets/                        # Secret Manager
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/                     # Budget + alerts
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── scripts/
    ├── bootstrap.sh
    └── upload-secrets.sh
```

## Critical Implementation Details (Learned from Production)

### 1. Provider — MUST include billing project override

```hcl
provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}
```

Without this, billing budget API calls fail with 403 quota errors.

### 2. Billing Budget — Use project NUMBER not ID, match currency

```hcl
data "google_project" "current" {
  project_id = var.project_id
}

resource "google_billing_budget" "free_tier" {
  budget_filter {
    projects = ["projects/${data.google_project.current.number}"]  # NUMBER, not ID
  }
  amount {
    specified_amount {
      currency_code = "COP"  # MUST match billing account currency
      units         = "5000"
    }
  }
}
```

### 3. Secrets — Upload placeholders BEFORE first terraform apply

Cloud Run fails if secret volumes reference secrets with no versions:

```bash
# Run AFTER terraform creates the secret containers but BEFORE Cloud Run can start
echo '{}' | gcloud secrets versions add auth-secrets --data-file=- --project=PROJECT_ID
echo '{}' | gcloud secrets versions add api-keys --data-file=- --project=PROJECT_ID
echo '{}' | gcloud secrets versions add storage-secrets --data-file=- --project=PROJECT_ID
```

### 4. Secret Manager metrics — Don't exist until real traffic

The metric `secretmanager.googleapis.com/secret/access_count` doesn't exist in a new project. Use audit log metric instead:

```hcl
filter = "resource.type = \"audited_resource\" AND metric.type = \"logging.googleapis.com/log_entry_count\" AND metric.labels.log = \"cloudaudit.googleapis.com%2Fdata_access\" AND resource.labels.service = \"secretmanager.googleapis.com\""
```

### 5. DNS — Must be "DNS only" for SSL certificate provisioning

If using Cloudflare, records MUST be grey cloud (DNS only, not proxied). GCP cannot issue SSL certificate through Cloudflare proxy. After SSL is active, you can optionally re-enable proxy with SSL mode "Full (strict)".

Remove any existing A records pointing to the old VPS before adding Google's IPs.

### 6. Cloud Run — Free tier optimization

```hcl
resource "google_cloud_run_v2_service" "app" {
  template {
    scaling {
      min_instance_count = 0  # Scale to zero
      max_instance_count = 2  # Cost cap
    }
    containers {
      resources {
        cpu_idle          = true   # CPU off between requests (free tier savings)
        startup_cpu_boost = true   # Faster cold starts
      }
    }
    timeout          = "3600s"     # WebSocket support
    session_affinity = true        # WebSocket sticky sessions
  }
  lifecycle {
    ignore_changes = [template[0].containers[0].image]  # Updated by CI/CD
  }
}
```

### 7. Git push — SSH aliases may not work

If the repo uses SSH host aliases, push via HTTPS:

```bash
git push https://USERNAME:$(gh auth token)@github.com/OWNER/REPO.git main
```

### 8. ADC quota project — Set before terraform apply

```bash
gcloud auth application-default set-quota-project PROJECT_ID
```

## Implementation Order

**Phase 1 — Create files (no GCP interaction yet)**

1. Create `infrastructure/terraform/.gitignore`
2. Create `bootstrap/` module (GCS bucket + 10 APIs)
3. Create `modules/iam/` (2 service accounts + WIF scoped to GitHub repo)
4. Create `modules/artifact-registry/` (Docker repo, keep 3 latest, delete after 7d)
5. Create `modules/secrets/` (3 secret containers + per-secret IAM to Cloud Run SA)
6. Create `modules/cloud-run/` (v2 service, scale-to-zero, WebSocket, probes, domain mapping, public access)
7. Create `modules/monitoring/` (budget + 4 alert policies: requests, CPU, storage, secret access)
8. Create `environments/prod/` (root composition wiring all modules)
9. Create `scripts/bootstrap.sh` and `scripts/upload-secrets.sh`
10. Create `start.sh` in project root
11. Modify `Dockerfile` — add `COPY start.sh` and change CMD to `sh start.sh`
12. Create health check endpoint (e.g., `apps/frontend/app/api/health/route.ts`)
13. Create `.github/workflows/deploy-gcp.yml`
14. Validate: `terraform init -backend=false && terraform validate` for both bootstrap/ and environments/prod/

**Phase 2 — Deploy infrastructure**

15. Run bootstrap: `./scripts/bootstrap.sh PROJECT_ID`
16. Set quota project: `gcloud auth application-default set-quota-project PROJECT_ID`
17. Create `terraform.tfvars` from example
18. Init with remote backend: `terraform init -reconfigure`
19. Upload placeholder secrets (echo '{}' to all 3)
20. Apply: `terraform apply`
21. Upload real secrets from `.env.production` values
22. Disable placeholder versions: `gcloud secrets versions disable 1 --secret=SECRET_NAME`

**Phase 3 — Deploy app**

23. Set GitHub secrets: `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_DEPLOYER_SA_EMAIL` (from terraform output)
24. Set GitHub variables: `NEXT_PUBLIC_APP_URL` and any other public vars
25. Disable old VPS workflow: `gh workflow disable "WORKFLOW_NAME"`
26. Commit all files, push to main
27. Monitor: `gh run watch RUN_ID`

**Phase 4 — DNS**

28. Add 4 A records from `terraform output domain_mapping_records` (DNS only, not proxied)
29. Remove old VPS A record
30. Wait 5-20 min for SSL certificate provisioning
31. Verify: `curl https://DOMAIN/api/health`

## Verification Checklist

```bash
# All should pass
curl -s https://DOMAIN/api/health                    # {"status":"ok"}
dig DOMAIN A +short                                   # 216.239.x.x IPs
gcloud run services list --project=PROJECT_ID         # Service running
gcloud secrets versions list SECRET --filter=state=ENABLED  # Versions active
terraform state list                                  # All resources in state
gh run list --limit 1                                 # Workflow succeeded
```

## GCP Console URLs

After deployment, view your services at:

- **Cloud Run**: https://console.cloud.google.com/run?project=PROJECT_ID
- **Artifact Registry**: https://console.cloud.google.com/artifacts?project=PROJECT_ID
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=PROJECT_ID
- **Monitoring**: https://console.cloud.google.com/monitoring/alerting?project=PROJECT_ID
- **Billing**: https://console.cloud.google.com/billing?project=PROJECT_ID
- **IAM**: https://console.cloud.google.com/iam-admin/iam?project=PROJECT_ID
- **Logs**: https://console.cloud.google.com/logs?project=PROJECT_ID

## Cost

Everything within GCP Always Free tier (permanent, not trial):

| Service | Free Limit | Expected Usage |
|---|---|---|
| Cloud Run | 2M req, 360K vCPU-sec/mo | Well under with scale-to-zero |
| Artifact Registry | 500 MB | ~150 MB (cleanup policies) |
| Secret Manager | 6 versions, 10K accesses | 3 versions, ~100 accesses |
| GCS (state) | 5 GB | ~1 KB |
| Monitoring | Free for GCP metrics | Only basic alerts |

Expected monthly cost: **$0** for low-moderate traffic.
