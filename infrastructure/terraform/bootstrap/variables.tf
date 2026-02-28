variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "state_bucket_name" {
  description = "Name for the Terraform state GCS bucket"
  type        = string
  default     = "alpadev-ai-tf-state"
}
