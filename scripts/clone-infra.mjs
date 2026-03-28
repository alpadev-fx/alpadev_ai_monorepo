#!/usr/bin/env node

/**
 * clone-infra.mjs
 *
 * Generates a complete GCP Cloud Run infrastructure (Terraform, Docker, CI/CD)
 * for any Turborepo + Next.js monorepo. Zero dependencies -- uses only Node.js built-ins.
 *
 * Usage: node scripts/clone-infra.mjs
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { mkdirSync, writeFileSync, chmodSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function kebabToDisplay(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function kebabToSnake(str) {
  return str.replace(/-/g, "_");
}

async function ask(rl, label, defaultVal, validator) {
  const suffix = defaultVal != null ? ` [${defaultVal}]` : "";
  while (true) {
    const answer =
      (await rl.question(`  ${label}${suffix}: `)).trim() || defaultVal || "";
    if (!answer && defaultVal == null) {
      console.log("    (required)");
      continue;
    }
    if (validator && !validator(answer)) {
      console.log("    (invalid format -- try again)");
      continue;
    }
    return answer;
  }
}

function writeFile(base, relPath, content) {
  const full = join(base, relPath);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, content, "utf8");
}

function writeExec(base, relPath, content) {
  writeFile(base, relPath, content);
  chmodSync(join(base, relPath), 0o755);
}

// ---------------------------------------------------------------------------
// Phase 1: Interactive Prompts
// ---------------------------------------------------------------------------

async function collectConfig() {
  const rl = createInterface({ input: stdin, output: stdout });

  console.log("");
  console.log("=== Infrastructure Generator for GCP Cloud Run ===");
  console.log("Generates Terraform, Docker, CI/CD for a Turborepo + Next.js monorepo.");
  console.log("");

  const c = {};

  c.project_name = await ask(
    rl,
    "Project name (kebab-case, e.g. acme-ai)",
    null,
    (v) => /^[a-z][a-z0-9-]*$/.test(v)
  );
  c.project_display = await ask(
    rl,
    "Display name",
    kebabToDisplay(c.project_name)
  );
  c.gcp_project_id = await ask(
    rl,
    "GCP project ID",
    `${c.project_name}-prod`
  );
  c.gcp_region = await ask(rl, "GCP region", "us-central1");
  c.github_repo = await ask(
    rl,
    "GitHub repo (owner/repo)",
    null,
    (v) => /^[\w.-]+\/[\w.-]+$/.test(v)
  );
  c.custom_domain = await ask(
    rl,
    "Custom domain",
    null,
    (v) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(v)
  );
  c.alert_email = await ask(
    rl,
    "Alert email",
    null,
    (v) => /^[^@]+@[^@]+\.[^@]+$/.test(v)
  );
  c.billing_account_id = await ask(
    rl,
    "Billing account ID (XXXXXX-XXXXXX-XXXXXX)",
    null,
    (v) => /^[\w]{6}-[\w]{6}-[\w]{6}$/.test(v)
  );
  c.budget_amount = await ask(rl, "Budget amount", "5000");
  c.budget_currency = await ask(rl, "Budget currency code", "COP");
  c.turbo_scope = await ask(rl, "Turbo scope (apps/frontend package name)", "next-app-template");
  c.frontend_dir = await ask(rl, "Frontend app directory (under apps/)", "frontend");
  c.container_port = await ask(rl, "Container port", "3000");
  c.max_instances = await ask(rl, "Max Cloud Run instances", "2");
  c.secret_categories = await ask(
    rl,
    "Secret categories (comma-separated)",
    "auth-secrets,api-keys,storage-secrets"
  );
  c.db_name = await ask(
    rl,
    "MongoDB database name",
    `${kebabToSnake(c.project_name)}_db`
  );
  c.output_dir = await ask(rl, "Output directory", "./infra-output");

  rl.close();
  return c;
}

// ---------------------------------------------------------------------------
// Phase 2: Derived Values
// ---------------------------------------------------------------------------

function deriveConfig(c) {
  c.state_bucket = `${c.project_name}-tf-state`;
  c.service_name = `${c.project_name}-frontend`;
  c.ar_repository = `${c.project_name}-docker`;
  c.container_frontend = `${c.project_name}-frontend`;
  c.container_mongo = `${c.project_name}-mongo`;
  c.container_redis = `${c.project_name}-redis`;
  c.secrets = c.secret_categories.split(",").map((s) => s.trim());
  return c;
}

// ---------------------------------------------------------------------------
// Phase 3: Templates
// ---------------------------------------------------------------------------

// ---- Terraform: Bootstrap ----

function tpl_bootstrap_main() {
  return `terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Local state intentional -- solves chicken-and-egg problem
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# GCS bucket for remote Terraform state
resource "google_storage_bucket" "tf_state" {
  name     = var.state_bucket_name
  location = var.region
  project  = var.project_id

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 5
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      days_since_noncurrent_time = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Enable required GCP APIs
locals {
  required_apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "billingbudgets.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "sts.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.required_apis)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}
`;
}

function tpl_bootstrap_variables(c) {
  return `variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "${c.gcp_region}"
}

variable "state_bucket_name" {
  description = "Name for the Terraform state GCS bucket"
  type        = string
  default     = "${c.state_bucket}"
}
`;
}

function tpl_bootstrap_outputs() {
  return `output "state_bucket_name" {
  description = "GCS bucket name for Terraform remote state"
  value       = google_storage_bucket.tf_state.name
}

output "state_bucket_url" {
  description = "GCS bucket URL for Terraform remote state"
  value       = google_storage_bucket.tf_state.url
}

output "enabled_apis" {
  description = "List of enabled GCP APIs"
  value       = [for api in google_project_service.apis : api.service]
}
`;
}

// ---- Terraform: IAM ----

function tpl_iam_main() {
  return `# Cloud Run runtime service account
resource "google_service_account" "cloud_run_app" {
  account_id   = "cloud-run-app"
  display_name = "Cloud Run Application"
  description  = "Runtime service account for Cloud Run services"
  project      = var.project_id
}

# Cloud Run SA roles
resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:\${google_service_account.cloud_run_app.email}"
}

resource "google_project_iam_member" "cloud_run_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:\${google_service_account.cloud_run_app.email}"
}

resource "google_project_iam_member" "cloud_run_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:\${google_service_account.cloud_run_app.email}"
}

# GitHub Actions deployer service account
resource "google_service_account" "github_deployer" {
  account_id   = "github-deployer"
  display_name = "GitHub Actions Deployer"
  description  = "CI/CD service account for GitHub Actions deployments"
  project      = var.project_id
}

# Deployer SA roles
resource "google_project_iam_member" "deployer_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:\${google_service_account.github_deployer.email}"
}

resource "google_project_iam_member" "deployer_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:\${google_service_account.github_deployer.email}"
}

resource "google_project_iam_member" "deployer_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:\${google_service_account.github_deployer.email}"
}

# Workload Identity Federation -- GitHub Actions OIDC
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github-actions"
  display_name              = "GitHub Actions"
  description               = "Identity pool for GitHub Actions OIDC"
  project                   = var.project_id
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc"
  display_name                       = "GitHub OIDC"
  description                        = "GitHub Actions OIDC provider"
  project                            = var.project_id

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == \\"\${var.github_repo}\\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Allow GitHub Actions to impersonate the deployer SA
resource "google_service_account_iam_member" "github_wif_binding" {
  service_account_id = google_service_account.github_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/\${google_iam_workload_identity_pool.github.name}/attribute.repository/\${var.github_repo}"
}
`;
}

function tpl_iam_variables() {
  return `variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
}
`;
}

function tpl_iam_outputs() {
  return `output "cloud_run_sa_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloud_run_app.email
}

output "cloud_run_sa_name" {
  description = "Cloud Run service account full name"
  value       = google_service_account.cloud_run_app.name
}

output "github_deployer_sa_email" {
  description = "GitHub deployer service account email"
  value       = google_service_account.github_deployer.email
}

output "workload_identity_provider" {
  description = "Workload Identity Provider resource name (for GitHub Actions auth)"
  value       = google_iam_workload_identity_pool_provider.github.name
}
`;
}

// ---- Terraform: Artifact Registry ----

function tpl_ar_main(c) {
  return `resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = var.repository_id
  description   = "Docker images for ${c.project_display}"
  format        = "DOCKER"
  project       = var.project_id

  cleanup_policies {
    id     = "keep-latest-3"
    action = "KEEP"

    most_recent_versions {
      keep_count = 3
    }
  }

  cleanup_policies {
    id     = "delete-old-images"
    action = "DELETE"

    condition {
      older_than = "604800s" # 7 days
    }
  }
}
`;
}

function tpl_ar_variables(c) {
  return `variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "repository_id" {
  description = "Artifact Registry repository ID"
  type        = string
  default     = "${c.ar_repository}"
}
`;
}

function tpl_ar_outputs() {
  return `output "repository_id" {
  description = "Artifact Registry repository ID"
  value       = google_artifact_registry_repository.docker.repository_id
}

output "repository_url" {
  description = "Full Docker image registry URL"
  value       = "\${var.region}-docker.pkg.dev/\${var.project_id}/\${google_artifact_registry_repository.docker.repository_id}"
}
`;
}

// ---- Terraform: Secrets ----

function tpl_secrets_main() {
  return `# Secret containers -- versions uploaded out-of-band via gcloud CLI
resource "google_secret_manager_secret" "secrets" {
  for_each = toset(var.secret_names)

  secret_id = each.value
  project   = var.project_id

  replication {
    auto {}
  }
}

# Per-secret IAM binding -- only Cloud Run SA can access
resource "google_secret_manager_secret_iam_member" "cloud_run_access" {
  for_each = toset(var.secret_names)

  secret_id = google_secret_manager_secret.secrets[each.value].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:\${var.cloud_run_sa_email}"
}
`;
}

function tpl_secrets_variables(c) {
  const defaultList = c.secrets.map((s) => `"${s}"`).join(", ");
  return `variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "cloud_run_sa_email" {
  description = "Cloud Run service account email for secret access"
  type        = string
}

variable "secret_names" {
  description = "List of secret names to create"
  type        = list(string)
  default     = [${defaultList}]
}
`;
}

function tpl_secrets_outputs() {
  return `output "secret_ids" {
  description = "Map of secret name to secret ID"
  value       = { for name, secret in google_secret_manager_secret.secrets : name => secret.id }
}

output "secret_names" {
  description = "Map of secret name to fully qualified secret name"
  value       = { for name, secret in google_secret_manager_secret.secrets : name => secret.name }
}
`;
}

// ---- Terraform: Cloud Run ----

function tpl_cloudrun_main() {
  return `resource "google_cloud_run_v2_service" "app" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  ingress = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = var.cloud_run_sa_email

    scaling {
      min_instance_count = 0
      max_instance_count = var.max_instances
    }

    timeout = "3600s" # WebSocket support

    session_affinity = true # WebSocket sticky sessions

    containers {
      image = var.image

      ports {
        container_port = var.container_port
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle          = true  # Throttle CPU between requests (free tier)
        startup_cpu_boost = true  # Faster cold starts for Next.js
      }

      # Non-sensitive env vars
      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # Secret volumes mounted as JSON files
      dynamic "volume_mounts" {
        for_each = var.secret_names
        content {
          name       = volume_mounts.key
          mount_path = "/secrets/\${volume_mounts.key}"
        }
      }

      startup_probe {
        http_get {
          path = "/api/health"
          port = var.container_port
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/api/health"
          port = var.container_port
        }
        period_seconds  = 30
        timeout_seconds = 5
      }
    }

    # Secret volumes
    dynamic "volumes" {
      for_each = var.secret_names
      content {
        name = volumes.key
        secret {
          secret = volumes.value
          items {
            version = "latest"
            path    = "secrets.json"
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image, # Updated by CI/CD
    ]
  }
}

# Public access
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Custom domain mapping
resource "google_cloud_run_domain_mapping" "custom" {
  location = var.region
  name     = var.custom_domain
  project  = var.project_id

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.app.name
  }
}
`;
}

function tpl_cloudrun_variables(c) {
  return `variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "${c.service_name}"
}

variable "image" {
  description = "Docker image URL (full path including tag)"
  type        = string
}

variable "cloud_run_sa_email" {
  description = "Service account email for the Cloud Run service"
  type        = string
}

variable "secret_names" {
  description = "Map of secret category to fully qualified secret name"
  type        = map(string)
}

variable "custom_domain" {
  description = "Custom domain for the Cloud Run service"
  type        = string
  default     = "${c.custom_domain}"
}

variable "env_vars" {
  description = "Non-sensitive environment variables for Cloud Run"
  type        = map(string)
  default     = {}
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = ${c.max_instances}
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = ${c.container_port}
}
`;
}

function tpl_cloudrun_outputs() {
  return `output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.app.uri
}

output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_v2_service.app.name
}

output "domain_mapping_records" {
  description = "DNS records required for custom domain"
  value       = google_cloud_run_domain_mapping.custom.status[0].resource_records
}
`;
}

// ---- Terraform: Monitoring ----

function tpl_monitoring_main(c) {
  return `# Email notification channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "${c.project_display} Alert Email"
  type         = "email"
  project      = var.project_id

  labels = {
    email_address = var.alert_email
  }
}

# Billing budget
resource "google_billing_budget" "free_tier" {
  billing_account = var.billing_account_id
  display_name    = "${c.project_display} Free Tier Budget"

  budget_filter {
    projects = ["projects/\${var.project_number}"]
  }

  amount {
    specified_amount {
      currency_code = "${c.budget_currency}"
      units         = "${c.budget_amount}"
    }
  }

  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }

  all_updates_rule {
    monitoring_notification_channels = [
      google_monitoring_notification_channel.email.name,
    ]
    schema_version = "1.0"
  }
}

# Cloud Run request rate alert (>50K/day = 1.5M/month pace vs 2M limit)
resource "google_monitoring_alert_policy" "cloud_run_requests" {
  display_name = "Cloud Run High Request Rate"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Request count > 50K/day"

    condition_threshold {
      filter          = "resource.type = \\"cloud_run_revision\\" AND resource.labels.service_name = \\"\${var.cloud_run_service_name}\\" AND metric.type = \\"run.googleapis.com/request_count\\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 35 # ~50K/day = ~35/min sustained

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Cloud Run CPU utilization alert (>80% sustained)
resource "google_monitoring_alert_policy" "cloud_run_cpu" {
  display_name = "Cloud Run High CPU Utilization"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "CPU utilization > 80%"

    condition_threshold {
      filter          = "resource.type = \\"cloud_run_revision\\" AND resource.labels.service_name = \\"\${var.cloud_run_service_name}\\" AND metric.type = \\"run.googleapis.com/container/cpu/utilizations\\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_99"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Artifact Registry storage alert (>400MB vs 500MB limit)
resource "google_monitoring_alert_policy" "artifact_registry_storage" {
  display_name = "Artifact Registry High Storage"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Storage > 400MB"

    condition_threshold {
      filter          = "resource.type = \\"artifactregistry.googleapis.com/Repository\\" AND metric.type = \\"artifactregistry.googleapis.com/repository/size\\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 419430400 # 400MB in bytes

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Secret Manager access rate alert (>250/day = 7.5K/month pace vs 10K limit)
resource "google_monitoring_alert_policy" "secret_manager_access" {
  display_name = "Secret Manager High Access Rate"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Secret access > 250/day pace"

    condition_threshold {
      filter          = "resource.type = \\"audited_resource\\" AND metric.type = \\"logging.googleapis.com/log_entry_count\\" AND metric.labels.log = \\"cloudaudit.googleapis.com%2Fdata_access\\" AND resource.labels.service = \\"secretmanager.googleapis.com\\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.17 # ~250/day = ~0.17/min

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}
`;
}

function tpl_monitoring_variables() {
  return `variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "billing_account_id" {
  description = "GCP billing account ID"
  type        = string
}

variable "alert_email" {
  description = "Email address for budget and monitoring alerts"
  type        = string
}

variable "cloud_run_service_name" {
  description = "Cloud Run service name for monitoring"
  type        = string
}

variable "project_number" {
  description = "GCP project number (numeric)"
  type        = string
}
`;
}

function tpl_monitoring_outputs() {
  return `output "notification_channel_name" {
  description = "Monitoring notification channel name"
  value       = google_monitoring_notification_channel.email.name
}

output "budget_name" {
  description = "Billing budget name"
  value       = google_billing_budget.free_tier.display_name
}
`;
}

// ---- Terraform: Environments/Prod ----

function tpl_prod_main() {
  return `module "iam" {
  source = "../../modules/iam"

  project_id  = var.project_id
  github_repo = var.github_repo
}

module "artifact_registry" {
  source = "../../modules/artifact-registry"

  project_id = var.project_id
  region     = var.region
}

module "secrets" {
  source = "../../modules/secrets"

  project_id         = var.project_id
  cloud_run_sa_email = module.iam.cloud_run_sa_email
}

module "cloud_run" {
  source = "../../modules/cloud-run"

  project_id         = var.project_id
  region             = var.region
  image              = var.initial_image
  cloud_run_sa_email = module.iam.cloud_run_sa_email
  secret_names       = module.secrets.secret_names
  custom_domain      = var.custom_domain

  env_vars = {
    NODE_ENV             = "production"
    NEXTAUTH_URL         = "https://\${var.custom_domain}"
    NEXT_PUBLIC_APP_URL  = "https://\${var.custom_domain}"
    NEXT_PUBLIC_APP_ENV  = "production"
    RESEND_EMAIL_DOMAIN  = var.custom_domain
  }
}

data "google_project" "current" {
  project_id = var.project_id
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_id             = var.project_id
  project_number         = data.google_project.current.number
  billing_account_id     = var.billing_account_id
  alert_email            = var.alert_email
  cloud_run_service_name = module.cloud_run.service_name
}
`;
}

function tpl_prod_variables(c) {
  return `variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "${c.gcp_region}"
}

variable "github_repo" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
}

variable "billing_account_id" {
  description = "GCP billing account ID for budget alerts"
  type        = string
}

variable "alert_email" {
  description = "Email for budget and monitoring alerts"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain for Cloud Run"
  type        = string
  default     = "${c.custom_domain}"
}

variable "initial_image" {
  description = "Initial Docker image for Cloud Run (replaced by CI/CD after first deploy)"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}
`;
}

function tpl_prod_providers() {
  return `terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
  billing_project       = var.project_id
}
`;
}

function tpl_prod_backend(c) {
  return `terraform {
  backend "gcs" {
    bucket = "${c.state_bucket}"
    prefix = "prod"
  }
}
`;
}

function tpl_prod_outputs() {
  return `output "cloud_run_url" {
  description = "Cloud Run service URL"
  value       = module.cloud_run.service_url
}

output "cloud_run_service_name" {
  description = "Cloud Run service name"
  value       = module.cloud_run.service_name
}

output "artifact_registry_url" {
  description = "Docker image registry URL"
  value       = module.artifact_registry.repository_url
}

output "workload_identity_provider" {
  description = "Workload Identity Provider for GitHub Actions"
  value       = module.iam.workload_identity_provider
}

output "github_deployer_sa_email" {
  description = "GitHub deployer service account email"
  value       = module.iam.github_deployer_sa_email
}

output "domain_mapping_records" {
  description = "DNS records to configure for custom domain"
  value       = module.cloud_run.domain_mapping_records
}
`;
}

function tpl_prod_tfvars(c) {
  return `project_id         = "${c.gcp_project_id}"
region             = "${c.gcp_region}"
github_repo        = "${c.github_repo}"
billing_account_id = "${c.billing_account_id}"
alert_email        = "${c.alert_email}"
custom_domain      = "${c.custom_domain}"
`;
}

function tpl_prod_tfvars_example(c) {
  return `project_id         = "${c.gcp_project_id}"
region             = "${c.gcp_region}"
github_repo        = "${c.github_repo}"
billing_account_id = "XXXXXX-XXXXXX-XXXXXX"
alert_email        = "${c.alert_email}"
custom_domain      = "${c.custom_domain}"
`;
}

// ---- Terraform: Scripts ----

function tpl_bootstrap_sh() {
  return `#!/usr/bin/env bash
set -euo pipefail

# Bootstrap script -- run once to create GCS state bucket and enable APIs
# Usage: ./bootstrap.sh <project-id>

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
BOOTSTRAP_DIR="$SCRIPT_DIR/../bootstrap"

PROJECT_ID="\${1:?Usage: $0 <project-id>}"

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
`;
}

function tpl_upload_secrets_sh(c) {
  const secretBlocks = c.secrets
    .map((name) => {
      const desc = {
        "auth-secrets":
          "Authentication credentials (NextAuth, Google OAuth, GitHub OAuth)",
        "api-keys":
          "API keys and service URLs (MongoDB, Redis, AI, Email)",
        "storage-secrets": "Cloud storage credentials (e.g. Cloudflare R2)",
      };
      const templates = {
        "auth-secrets": `{
  "NEXTAUTH_SECRET": "...",
  "GOOGLE_CLIENT_ID": "...",
  "GOOGLE_CLIENT_SECRET": "...",
  "GOOGLE_REFRESH_TOKEN": "...",
  "GITHUB_CLIENT_ID": "...",
  "GITHUB_CLIENT_SECRET": "..."
}`,
        "api-keys": `{
  "MONGO_URL": "...",
  "RESEND_KEY": "...",
  "REDIS_URL": "...",
  "DEEPSEEK_API_KEY": "...",
  "MISTRAL_API_KEY": "...",
  "GOOGLE_AI_API_KEY": "..."
}`,
        "storage-secrets": `{
  "R2_ACCESS_KEY": "...",
  "R2_ACCOUNT_ID": "...",
  "R2_ACCOUNT_TOKEN": "...",
  "R2_SECRET_KEY": "...",
  "R2_BUCKET_NAME": "...",
  "R2_PUBLIC_DOMAIN": "...",
  "S3_API": "..."
}`,
      };
      const description =
        desc[name] || `Secrets for ${name}`;
      const template =
        templates[name] || `{\n  "KEY": "..."\n}`;
      return `# ${name}
cat << 'TEMPLATE'
${name}.json format:
${template}
TEMPLATE
upload_secret "${name}" "${description}"`;
    })
    .join("\n\n");

  return `#!/usr/bin/env bash
set -euo pipefail

# Uploads secret JSON blobs to GCP Secret Manager
# Usage: ./upload-secrets.sh <project-id>
#
# Reads from stdin or prompts for each secret category.
# Secret versions are created out-of-band (never stored in Terraform state).

PROJECT_ID="\${1:?Usage: $0 <project-id>}"

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
    echo "    Found $secret_name.json -- using it."
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

  gcloud secrets versions add "$secret_name" \\
    --project="$PROJECT_ID" \\
    --data-file="$tmp_file"

  echo "    Uploaded new version for $secret_name"
}

echo "==> Uploading secrets to project: $PROJECT_ID"
echo ""
echo "You can either:"
echo "  1. Place ${c.secrets.map((s) => s + ".json").join(", ")} in the current directory"
echo "  2. Paste JSON content interactively when prompted"
echo ""

${secretBlocks}

echo ""
echo "==> All secrets uploaded successfully!"
echo ""
echo "IMPORTANT: Delete any local .json files containing secrets:"
echo "  rm -f ${c.secrets.map((s) => s + ".json").join(" ")}"
`;
}

// ---- Docker ----

function tpl_dockerfile(c) {
  return `FROM node:22-alpine AS base

# 1. Prune necessary files
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN turbo prune --scope=${c.turbo_scope} --docker

# 2. Build the project
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy prisma schema so postinstall works
COPY --from=pruner /app/out/full/packages/db/prisma/schema.prisma /app/packages/db/prisma/schema.prisma

# Install dependencies using pnpm
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

# Build the project
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

RUN pnpm turbo build --filter=${c.turbo_scope}

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

USER nextjs

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/${c.frontend_dir}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${c.frontend_dir}/.next/static ./apps/${c.frontend_dir}/.next/static

# Copy public folder explicitly to correct location with permissions
COPY --from=pruner --chown=nextjs:nodejs /app/apps/${c.frontend_dir}/public ./apps/${c.frontend_dir}/public
COPY --from=pruner --chown=nextjs:nodejs /app/apps/${c.frontend_dir}/public ./public

# Copy start.sh entrypoint (parses GCP Secret Manager JSON into env vars)
COPY --from=pruner --chown=nextjs:nodejs /app/start.sh ./start.sh

# Environment variables must be redefined at run time
ENV NODE_ENV=production
ENV PORT=${c.container_port}

CMD ["sh", "start.sh"]
`;
}

function tpl_start_sh(c) {
  const parseLines = c.secrets
    .map((s) => `parse_secret_file "/secrets/${s}/secrets.json"`)
    .join("\n");

  return `#!/usr/bin/env sh
set -e

# Parses JSON secret files (mounted by Cloud Run Secret Manager volumes)
# into environment variables, then starts the Node.js application.
#
# Secret volumes are mounted at /secrets/{category}/secrets.json
# Each JSON file contains key-value pairs that become env vars.

parse_secret_file() {
  local file="$1"
  if [ -f "$file" ]; then
    # Use node to parse JSON and export each key-value pair
    eval "$(node -e "
      const secrets = JSON.parse(require('fs').readFileSync('$file', 'utf8'));
      for (const [key, value] of Object.entries(secrets)) {
        console.log('export ' + key + '=' + JSON.stringify(String(value)));
      }
    ")"
  fi
}

# Parse all secret categories
${parseLines}

# Start the application
exec node apps/${c.frontend_dir}/server.js
`;
}

function tpl_docker_compose(c) {
  return `# Local development only. Do not use in production.

services:
  frontend:
    container_name: ${c.container_frontend}
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "${c.container_port}:${c.container_port}"
    environment:
      - MONGO_URL=mongodb://root:root@mongo:27017/${c.db_name}?authSource=admin
      - NEXTAUTH_URL=http://localhost:${c.container_port}
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_APP_URL=http://localhost:${c.container_port}
      - NODE_ENV=production
      - RESEND_KEY=\${RESEND_KEY}
      - RESEND_EMAIL_DOMAIN=\${RESEND_EMAIL_DOMAIN}
      - GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}
      - GITHUB_CLIENT_ID=\${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=\${GITHUB_CLIENT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    container_name: ${c.container_mongo}
    image: mongo:latest
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  redis:
    container_name: ${c.container_redis}
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
`;
}

function tpl_docker_compose_dev(c) {
  return `# Development with hot-reload

services:
  frontend:
    container_name: ${c.container_frontend}-dev
    build:
      context: .
      dockerfile: Dockerfile
      target: base
    ports:
      - "${c.container_port}:${c.container_port}"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.turbo
      - /app/apps/${c.frontend_dir}/.next
    command: sh -c "pnpm install && pnpm dev"
    environment:
      - MONGO_URL=mongodb://root:root@mongo:27017/${c.db_name}?authSource=admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    container_name: ${c.container_mongo}
    image: mongo:latest
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  redis:
    container_name: ${c.container_redis}
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
`;
}

function tpl_mongo_init(c) {
  return `db = db.getSiblingDB("${c.db_name}");

db.createUser({
  user: "root",
  pwd: "root",
  roles: [{ role: "readWrite", db: "${c.db_name}" }],
});

db.createCollection("users");
`;
}

function tpl_dockerignore() {
  return `node_modules
.next
.turbo
.git
.env
.env.*
!.env.example
*.md
dist
build
coverage
.DS_Store
`;
}

// ---- CI/CD ----

function tpl_deploy_gcp(c) {
  return `name: Deploy to GCP Cloud Run

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-gcp-\${{ github.ref }}
  cancel-in-progress: true

env:
  PROJECT_ID: ${c.gcp_project_id}
  REGION: ${c.gcp_region}
  SERVICE_NAME: ${c.service_name}
  REPOSITORY: ${c.ar_repository}

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      should_deploy: \${{ steps.filter.outputs.app }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            app:
              - 'apps/${c.frontend_dir}/**'
              - 'packages/**'
              - 'Dockerfile'
              - 'start.sh'
              - 'pnpm-lock.yaml'
              - 'turbo.json'
              - '.dockerignore'
              - '.github/workflows/deploy-gcp.yml'

  build-and-deploy:
    needs: changes
    if: needs.changes.outputs.should_deploy == 'true' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    environment: production

    permissions:
      contents: read
      id-token: write # Required for Workload Identity Federation

    steps:
      - uses: actions/checkout@v4

      # Authenticate to GCP via Workload Identity Federation (keyless)
      - id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: \${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: \${{ secrets.GCP_DEPLOYER_SA_EMAIL }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      # Configure Docker to push to Artifact Registry
      - name: Configure Docker
        run: gcloud auth configure-docker \${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          target: runner
          push: true
          tags: |
            \${{ env.REGION }}-docker.pkg.dev/\${{ env.PROJECT_ID }}/\${{ env.REPOSITORY }}/\${{ env.SERVICE_NAME }}:\${{ github.sha }}
            \${{ env.REGION }}-docker.pkg.dev/\${{ env.PROJECT_ID }}/\${{ env.REPOSITORY }}/\${{ env.SERVICE_NAME }}:latest
          build-args: |
            NEXT_PUBLIC_APP_URL=\${{ vars.NEXT_PUBLIC_APP_URL }}
            NEXT_PUBLIC_GA_MEASUREMENT_ID=\${{ vars.NEXT_PUBLIC_GA_MEASUREMENT_ID }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: \${{ env.SERVICE_NAME }}
          region: \${{ env.REGION }}
          image: \${{ env.REGION }}-docker.pkg.dev/\${{ env.PROJECT_ID }}/\${{ env.REPOSITORY }}/\${{ env.SERVICE_NAME }}:\${{ github.sha }}

      - name: Show deployment URL
        run: |
          echo "Deployed to: $(gcloud run services describe \${{ env.SERVICE_NAME }} --region=\${{ env.REGION }} --format='value(status.url)')"
`;
}

// ---- Health Check ----

function tpl_health_route() {
  return `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
`;
}

// ---- .env.example ----

function tpl_env_example(c) {
  return `# ============================================================
# ${c.project_display} -- Environment Variables
# ============================================================
# Copy this file to .env and fill in your values.
# NEVER commit .env to version control.

# ----- App -----
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:${c.container_port}

# ----- Authentication (NextAuth) -----
NEXTAUTH_URL=http://localhost:${c.container_port}
NEXTAUTH_SECRET=YOUR_SECRET_HERE

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ----- Database & Cache -----
MONGO_URL=mongodb://root:root@localhost:27017/${c.db_name}?authSource=admin
REDIS_URL=redis://localhost:6379

# ----- AI APIs -----
DEEPSEEK_API_KEY=
MISTRAL_API_KEY=
GOOGLE_AI_API_KEY=

# ----- Email (Resend) -----
RESEND_KEY=
RESEND_EMAIL_DOMAIN=onboarding@resend.dev

# ----- Cloud Storage (Cloudflare R2) -----
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_ACCOUNT_ID=
R2_ACCOUNT_TOKEN=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=
S3_API=

# ----- Messaging (Twilio) -----
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ----- Analytics (optional) -----
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_FB_PIXEL_ID=

# ----- Misc (optional) -----
NEXT_PUBLIC_CANNY_BOARD_TOKEN=
PASSWORD_PROTECTED=false
PASSWORD_PROTECTED_USER=
PASSWORD_PROTECTED_PASSWORD=
`;
}

// ---- DEPLOY.md ----

function tpl_deploy_md(c) {
  return `# ${c.project_display} -- GCP Cloud Run Deployment Guide

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (\`gcloud\`)
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- Node.js >= 22 and pnpm
- A GCP project: \`${c.gcp_project_id}\`
- A GitHub repository: \`${c.github_repo}\`

## Step 1: Bootstrap (one-time)

Creates the GCS state bucket and enables required GCP APIs.

\`\`\`bash
gcloud auth login
cd infrastructure/terraform/scripts
chmod +x bootstrap.sh
./bootstrap.sh ${c.gcp_project_id}
\`\`\`

## Step 2: Provision Infrastructure

\`\`\`bash
cd infrastructure/terraform/environments/prod
terraform init
terraform plan
terraform apply
\`\`\`

Save the outputs -- you'll need them for GitHub secrets.

## Step 3: Upload Secrets

\`\`\`bash
cd infrastructure/terraform/scripts
chmod +x upload-secrets.sh
./upload-secrets.sh ${c.gcp_project_id}
\`\`\`

Prepare JSON files for each secret category (${c.secrets.join(", ")}) or paste interactively.

## Step 4: Configure DNS

After \`terraform apply\`, get the required DNS records:

\`\`\`bash
terraform output domain_mapping_records
\`\`\`

Add these records to your DNS provider for \`${c.custom_domain}\`.

## Step 5: GitHub Repository Secrets

In your repo Settings > Secrets and variables > Actions, add:

| Secret | Value (from terraform output) |
|--------|-------------------------------|
| \`GCP_WORKLOAD_IDENTITY_PROVIDER\` | \`terraform output workload_identity_provider\` |
| \`GCP_DEPLOYER_SA_EMAIL\` | \`terraform output github_deployer_sa_email\` |

Also add these as **variables** (Settings > Variables):

| Variable | Value |
|----------|-------|
| \`NEXT_PUBLIC_APP_URL\` | \`https://${c.custom_domain}\` |
| \`NEXT_PUBLIC_GA_MEASUREMENT_ID\` | Your GA ID (or leave empty) |

## Step 6: Application Requirements

1. **Health endpoint**: Ensure \`apps/${c.frontend_dir}/app/api/health/route.ts\` exists (a stub is included)
2. **Next.js config**: Set \`output: "standalone"\` in \`next.config.mjs\`
3. **Remote image patterns**: Update \`next.config.mjs\` to allow \`${c.custom_domain}\`

## Step 7: First Deploy

Push to \`main\` branch to trigger the GitHub Actions workflow:

\`\`\`bash
git push origin main
\`\`\`

Monitor: Actions tab in GitHub, or:

\`\`\`bash
gcloud run services describe ${c.service_name} --region=${c.gcp_region} --format='value(status.url)'
\`\`\`

## Architecture

\`\`\`
GitHub push main
    |
    v
GitHub Actions (deploy-gcp.yml)
    |-- Workload Identity Federation (keyless auth)
    |-- Docker build (multi-stage, turbo prune)
    |-- Push to Artifact Registry
    |-- Deploy to Cloud Run
    v
Cloud Run (0-${c.max_instances} instances, auto-scaling)
    |-- Secret Manager volumes -> start.sh -> env vars
    |-- Health probes on /api/health
    |-- Custom domain: ${c.custom_domain}
\`\`\`

## Cost (Free Tier)

- Cloud Run: 2M invocations/month, 360K GB-seconds
- Artifact Registry: 500MB (cleanup keeps latest 3 images)
- Secret Manager: 10K accesses/month
- Budget alert: ${c.budget_amount} ${c.budget_currency}
`;
}

// ---------------------------------------------------------------------------
// Phase 4: Write Files
// ---------------------------------------------------------------------------

function generateAll(c) {
  const out = resolve(c.output_dir);
  const tf = "infrastructure/terraform";

  const files = [
    // Bootstrap
    [`${tf}/bootstrap/main.tf`, tpl_bootstrap_main()],
    [`${tf}/bootstrap/variables.tf`, tpl_bootstrap_variables(c)],
    [`${tf}/bootstrap/outputs.tf`, tpl_bootstrap_outputs()],

    // IAM
    [`${tf}/modules/iam/main.tf`, tpl_iam_main()],
    [`${tf}/modules/iam/variables.tf`, tpl_iam_variables()],
    [`${tf}/modules/iam/outputs.tf`, tpl_iam_outputs()],

    // Artifact Registry
    [`${tf}/modules/artifact-registry/main.tf`, tpl_ar_main(c)],
    [`${tf}/modules/artifact-registry/variables.tf`, tpl_ar_variables(c)],
    [`${tf}/modules/artifact-registry/outputs.tf`, tpl_ar_outputs()],

    // Secrets
    [`${tf}/modules/secrets/main.tf`, tpl_secrets_main()],
    [`${tf}/modules/secrets/variables.tf`, tpl_secrets_variables(c)],
    [`${tf}/modules/secrets/outputs.tf`, tpl_secrets_outputs()],

    // Cloud Run
    [`${tf}/modules/cloud-run/main.tf`, tpl_cloudrun_main()],
    [`${tf}/modules/cloud-run/variables.tf`, tpl_cloudrun_variables(c)],
    [`${tf}/modules/cloud-run/outputs.tf`, tpl_cloudrun_outputs()],

    // Monitoring
    [`${tf}/modules/monitoring/main.tf`, tpl_monitoring_main(c)],
    [`${tf}/modules/monitoring/variables.tf`, tpl_monitoring_variables()],
    [`${tf}/modules/monitoring/outputs.tf`, tpl_monitoring_outputs()],

    // Environments/Prod
    [`${tf}/environments/prod/main.tf`, tpl_prod_main()],
    [`${tf}/environments/prod/variables.tf`, tpl_prod_variables(c)],
    [`${tf}/environments/prod/providers.tf`, tpl_prod_providers()],
    [`${tf}/environments/prod/backend.tf`, tpl_prod_backend(c)],
    [`${tf}/environments/prod/outputs.tf`, tpl_prod_outputs()],
    [`${tf}/environments/prod/terraform.tfvars`, tpl_prod_tfvars(c)],
    [
      `${tf}/environments/prod/terraform.tfvars.example`,
      tpl_prod_tfvars_example(c),
    ],

    // Docker & Root
    ["Dockerfile", tpl_dockerfile(c)],
    ["docker-compose.yml", tpl_docker_compose(c)],
    ["docker-compose.dev.yml", tpl_docker_compose_dev(c)],
    ["mongo-init.js", tpl_mongo_init(c)],
    [".dockerignore", tpl_dockerignore()],
    [".env.example", tpl_env_example(c)],

    // CI/CD
    [".github/workflows/deploy-gcp.yml", tpl_deploy_gcp(c)],

    // App stubs
    [
      `apps/${c.frontend_dir}/app/api/health/route.ts`,
      tpl_health_route(),
    ],

    // Docs
    ["DEPLOY.md", tpl_deploy_md(c)],
  ];

  // Scripts (need +x)
  const scripts = [
    [`${tf}/scripts/bootstrap.sh`, tpl_bootstrap_sh()],
    [`${tf}/scripts/upload-secrets.sh`, tpl_upload_secrets_sh(c)],
    ["start.sh", tpl_start_sh(c)],
  ];

  for (const [rel, content] of files) {
    writeFile(out, rel, content);
  }

  for (const [rel, content] of scripts) {
    writeExec(out, rel, content);
  }

  return { files, scripts, out };
}

// ---------------------------------------------------------------------------
// Phase 5: Summary
// ---------------------------------------------------------------------------

function printSummary({ files, scripts, out }, c) {
  console.log("");
  console.log("=== Generation Complete ===");
  console.log(`Output: ${out}`);
  console.log("");
  console.log(`Files generated: ${files.length + scripts.length}`);
  console.log("");

  const allPaths = [...files, ...scripts].map(([p]) => p).sort();
  for (const p of allPaths) {
    console.log(`  ${p}`);
  }

  console.log("");
  console.log("=== Next Steps ===");
  console.log("");
  console.log("  1. Copy the generated files into your target project root");
  console.log(`  2. Run: cd infrastructure/terraform/scripts && ./bootstrap.sh ${c.gcp_project_id}`);
  console.log("  3. Run: cd ../environments/prod && terraform init && terraform apply");
  console.log(`  4. Run: ../../scripts/upload-secrets.sh ${c.gcp_project_id}`);
  console.log("  5. Configure DNS from: terraform output domain_mapping_records");
  console.log("  6. Set GitHub secrets: GCP_WORKLOAD_IDENTITY_PROVIDER, GCP_DEPLOYER_SA_EMAIL");
  console.log("  7. Ensure next.config.mjs has output: 'standalone'");
  console.log("  8. Push to main to trigger first deploy");
  console.log("");
  console.log("  See DEPLOY.md in the output for full details.");
  console.log("");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Support --json <file> for non-interactive usage
  const jsonIdx = process.argv.indexOf("--json");
  let raw;
  if (jsonIdx !== -1 && process.argv[jsonIdx + 1]) {
    const jsonFile = process.argv[jsonIdx + 1];
    raw = JSON.parse(readFileSync(jsonFile, "utf8"));
    // Fill defaults for optional fields
    raw.project_display ??= kebabToDisplay(raw.project_name);
    raw.gcp_project_id ??= `${raw.project_name}-prod`;
    raw.gcp_region ??= "us-central1";
    raw.budget_amount ??= "5000";
    raw.budget_currency ??= "COP";
    raw.turbo_scope ??= "next-app-template";
    raw.frontend_dir ??= "frontend";
    raw.container_port ??= "3000";
    raw.max_instances ??= "2";
    raw.secret_categories ??= "auth-secrets,api-keys,storage-secrets";
    raw.db_name ??= `${kebabToSnake(raw.project_name)}_db`;
    raw.output_dir ??= "./infra-output";
  } else {
    raw = await collectConfig();
  }
  const config = deriveConfig(raw);
  const result = generateAll(config);
  printSummary(result, config);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
