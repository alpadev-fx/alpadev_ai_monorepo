variable "project_id" {
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
  default     = ["auth-secrets", "api-keys", "storage-secrets"]
}
