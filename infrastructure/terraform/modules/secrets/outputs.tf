output "secret_ids" {
  description = "Map of secret name to secret ID"
  value       = { for name, secret in google_secret_manager_secret.secrets : name => secret.id }
}

output "secret_names" {
  description = "Map of secret name to fully qualified secret name"
  value       = { for name, secret in google_secret_manager_secret.secrets : name => secret.name }
}
