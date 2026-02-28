output "notification_channel_name" {
  description = "Monitoring notification channel name"
  value       = google_monitoring_notification_channel.email.name
}

output "budget_name" {
  description = "Billing budget name"
  value       = google_billing_budget.free_tier.display_name
}
