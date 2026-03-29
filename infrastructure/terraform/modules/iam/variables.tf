variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
}

variable "billing_account_id" {
  description = "GCP billing account ID"
  type        = string
}
