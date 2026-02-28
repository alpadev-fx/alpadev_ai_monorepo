output "state_bucket_name" {
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
