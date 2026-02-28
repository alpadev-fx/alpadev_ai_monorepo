output "cloud_run_url" {
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
