output "service_url" {
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
