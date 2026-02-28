resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = var.repository_id
  description   = "Docker images for Alpadev AI"
  format        = "DOCKER"
  project       = var.project_id

  cleanup_policies {
    id     = "keep-latest-3"
    action = "KEEP"

    most_recent_versions {
      keep_count = 3
    }
  }

  cleanup_policies {
    id     = "delete-old-images"
    action = "DELETE"

    condition {
      older_than = "604800s" # 7 days
    }
  }
}
