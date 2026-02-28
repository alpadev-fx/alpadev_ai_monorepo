variable "project_id" {
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
