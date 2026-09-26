terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Remote backend configuration to be specified per environment
  # backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = "production"
      Project     = "restaurant-platform"
      ManagedBy   = "terraform"
    }
  }
}
