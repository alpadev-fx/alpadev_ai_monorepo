terraform {
  backend "gcs" {
    bucket = "alpadev-ai-tf-state"
    prefix = "prod"
  }
}
