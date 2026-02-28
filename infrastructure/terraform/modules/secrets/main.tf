# Secret containers — versions uploaded out-of-band via gcloud CLI
resource "google_secret_manager_secret" "secrets" {
  for_each = toset(var.secret_names)

  secret_id = each.value
  project   = var.project_id

  replication {
    auto {}
  }
}

# Per-secret IAM binding — only Cloud Run SA can access
resource "google_secret_manager_secret_iam_member" "cloud_run_access" {
  for_each = toset(var.secret_names)

  secret_id = google_secret_manager_secret.secrets[each.value].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.cloud_run_sa_email}"
}
