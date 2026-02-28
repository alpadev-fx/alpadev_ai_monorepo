# Email notification channel
resource "google_monitoring_notification_channel" "email" {
  display_name = "Alpadev Alert Email"
  type         = "email"
  project      = var.project_id

  labels = {
    email_address = var.alert_email
  }
}

# Billing budget — alerts at $0.50, $0.80, $1.00
resource "google_billing_budget" "free_tier" {
  billing_account = var.billing_account_id
  display_name    = "Alpadev Free Tier Budget"

  budget_filter {
    projects = ["projects/${var.project_number}"]
  }

  amount {
    specified_amount {
      currency_code = "COP"
      units         = "5000"
    }
  }

  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }

  all_updates_rule {
    monitoring_notification_channels = [
      google_monitoring_notification_channel.email.name,
    ]
    schema_version = "1.0"
  }
}

# Cloud Run request rate alert (>50K/day = 1.5M/month pace vs 2M limit)
resource "google_monitoring_alert_policy" "cloud_run_requests" {
  display_name = "Cloud Run High Request Rate"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Request count > 50K/day"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.cloud_run_service_name}\" AND metric.type = \"run.googleapis.com/request_count\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 35 # ~50K/day = ~35/min sustained

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Cloud Run CPU utilization alert (>80% sustained)
resource "google_monitoring_alert_policy" "cloud_run_cpu" {
  display_name = "Cloud Run High CPU Utilization"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "CPU utilization > 80%"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${var.cloud_run_service_name}\" AND metric.type = \"run.googleapis.com/container/cpu/utilizations\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_99"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Artifact Registry storage alert (>400MB vs 500MB limit)
resource "google_monitoring_alert_policy" "artifact_registry_storage" {
  display_name = "Artifact Registry High Storage"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Storage > 400MB"

    condition_threshold {
      filter          = "resource.type = \"artifactregistry.googleapis.com/Repository\" AND metric.type = \"artifactregistry.googleapis.com/repository/size\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 419430400 # 400MB in bytes

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}

# Secret Manager access rate alert (>250/day = 7.5K/month pace vs 10K limit)
# Note: Uses log-based metric. GCP Secret Manager metrics only appear after real traffic.
resource "google_monitoring_alert_policy" "secret_manager_access" {
  display_name = "Secret Manager High Access Rate"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Secret access > 250/day pace"

    condition_threshold {
      filter          = "resource.type = \"audited_resource\" AND metric.type = \"logging.googleapis.com/log_entry_count\" AND metric.labels.log = \"cloudaudit.googleapis.com%2Fdata_access\" AND resource.labels.service = \"secretmanager.googleapis.com\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.17 # ~250/day ≈ 0.17/min

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }
}
