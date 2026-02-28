variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
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
  default     = "alpadev.xyz"
}

variable "initial_image" {
  description = "Initial Docker image for Cloud Run (replaced by CI/CD after first deploy)"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}
