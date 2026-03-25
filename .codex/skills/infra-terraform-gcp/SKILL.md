---
name: infra-terraform-gcp
description: Use for changes in infrastructure/, deployment workflows, Docker, and GitHub Actions involving Terraform, GCP, container builds, and rollout safety checks.
---

# Infra Terraform GCP

## Scope
- Any task touching `infrastructure/`, `.github/workflows/`, `Dockerfile`, `docker-compose.yml`, or `deploy/`.
- Terraform bootstrap and environment modules, container publish flows, and deployment docs.

## Operating Rules
- Avoid destructive infrastructure operations by default.
- Keep environment-specific values separate from shared module logic.
- Prefer incremental Terraform and deployment changes with a clear blast radius.
- Preserve CI/CD assumptions around Docker image naming, registry targets, and deployment order.

## Implementation Flow
1. Identify the impacted module, workflow, or container boundary.
2. Apply the smallest safe configuration change.
3. Validate formatting and plan/build command paths.
4. Summarize rollout and rollback risk clearly.

## Required Validation
- `terraform fmt -check` in touched Terraform directories
- `terraform plan` for the changed environment when variables/state are available
- If image build inputs changed: `docker build -f Dockerfile .`

## Handoff Output
```text
Changed files:
Infra impact:
Risks:
Validation run:
```
