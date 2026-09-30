# Remote S3 Backend Configuration with Native S3 State Locking
terraform {
  backend "s3" {
    bucket       = "tavonzaai-prod-tfstate"
    key          = "prod/terraform.tfstate"
    region       = "eu-west-1"
    profile      = "milkey-dev"
    encrypt      = true
    use_lockfile = true
  }
}
