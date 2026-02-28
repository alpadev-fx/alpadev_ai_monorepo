variable "project_id" {
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
  default     = "alpadev-frontend"
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
  default     = "alpadev.xyz"
}

variable "env_vars" {
  description = "Non-sensitive environment variables for Cloud Run"
  type        = map(string)
  default     = {}
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 2
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}
