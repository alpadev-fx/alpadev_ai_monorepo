module "iam" {
  source = "../../modules/iam"

  project_id  = var.project_id
  github_repo = var.github_repo
}

module "artifact_registry" {
  source = "../../modules/artifact-registry"

  project_id = var.project_id
  region     = var.region
}

module "secrets" {
  source = "../../modules/secrets"

  project_id         = var.project_id
  cloud_run_sa_email = module.iam.cloud_run_sa_email
}

module "cloud_run" {
  source = "../../modules/cloud-run"

  project_id         = var.project_id
  region             = var.region
  image              = var.initial_image
  cloud_run_sa_email = module.iam.cloud_run_sa_email
  secret_names       = module.secrets.secret_names
  custom_domain      = var.custom_domain

  env_vars = {
    NODE_ENV             = "production"
    NEXTAUTH_URL         = "https://${var.custom_domain}"
    NEXT_PUBLIC_APP_URL  = "https://${var.custom_domain}"
    NEXT_PUBLIC_APP_ENV  = "production"
    RESEND_EMAIL_DOMAIN  = var.custom_domain
  }
}

data "google_project" "current" {
  project_id = var.project_id
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_id             = var.project_id
  project_number         = data.google_project.current.number
  billing_account_id     = var.billing_account_id
  alert_email            = var.alert_email
  cloud_run_service_name = module.cloud_run.service_name
}
