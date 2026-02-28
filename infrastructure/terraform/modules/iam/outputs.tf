output "cloud_run_sa_email" {
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
