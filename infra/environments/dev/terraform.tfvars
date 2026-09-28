# AWS Provider & Project Settings
aws_region   = "eu-west-2"
aws_profile  = "tom"
project_name = "backlyst"
environment  = "dev"

# Custom 3-Tier VPC Settings
vpc_cidr                 = "10.1.0.0/16"
public_subnet_cidrs      = ["10.1.1.0/24", "10.1.2.0/24"]
private_app_subnet_cidrs = ["10.1.10.0/24", "10.1.11.0/24"]
private_db_subnet_cidrs  = ["10.1.20.0/24", "10.1.21.0/24"]
enable_nat_gateway       = true
single_nat_gateway       = true # Cost-optimized: Single NAT Gateway for dev

# Domain & DNS
domain_name     = "backlyst.co.uk"
api_subdomain   = "api"
admin_subdomain = "admin"

# Zoho Mail & DNS Configuration
enable_zoho_mail = true
zoho_mx_records = [
  "10 mx.zoho.com",
  "20 mx2.zoho.com",
  "50 mx3.zoho.com"
]
zoho_spf_record     = "v=spf1 include:dc-8e814c8572._spfm.backlyst.co.uk include:amazonses.com ~all"
extra_txt_records   = {}
extra_cname_records = {}


# AWS Simple Email Service (SES) Configuration
enable_ses              = true
ses_enable_mail_from    = true
ses_mail_from_subdomain = "mail"
ses_enable_dmarc        = true
ses_dmarc_policy        = "v=DMARC1; p=none; sp=none; aspf=r; adkim=r;"
ses_create_smtp_user    = true

# Application Ports & Health Checks
backend_port              = 5000
nextjs_port               = 3000
admin_port                = 3043
backend_health_check_path = "/health"
nextjs_health_check_path  = "/"
admin_health_check_path   = "/"

# EC2 Compute Settings (Rightsized for Cost Optimization)
backend_instance_type     = "t3.small"
frontend_instance_type    = "t3.small"
backend_ami_id            = ""
frontend_ami_id           = ""
ssh_key_name              = "tom-london"
backend_root_volume_size  = 20
frontend_root_volume_size = 20

# S3 Storage Settings
s3_bucket_name = "backlyst-dev-storage-bucket"

# Secrets Manager Settings
secret_name = ""

# RDS PostgreSQL Database Settings (PostgreSQL 17)
rds_engine_version             = "17"
rds_instance_class             = "db.t3.micro"
rds_allocated_storage          = 20
rds_storage_type               = "gp3"
rds_db_name                    = "backlyst_db"
rds_db_username                = "backlyst_user"
rds_db_password                = "BacklystPass2026Dev"
rds_publicly_accessible        = false
rds_skip_final_snapshot        = true
rds_deletion_protection        = false
rds_backup_retention_period    = 0
rds_auto_minor_version_upgrade = true
rds_apply_immediately          = true
rds_storage_encrypted          = true
rds_multi_az                   = false

# ElastiCache Redis / Valkey Settings (Serverless Capped at 1GB RAM)
elasticache_cache_name               = "backlyst-dev-cache"
elasticache_engine                   = "valkey"
elasticache_major_engine_version     = "8"
elasticache_max_storage_gb           = 1
elasticache_max_ecpu_per_second      = 1000
elasticache_snapshot_retention_limit = 0

# GitHub Actions CI/CD & ECR Role Settings
enable_github_actions_ecr_role = true
github_repository              = "*backlystapp"
github_branches                = ["*"]
create_github_oidc_provider    = true

# Testing Stage - Restrict ALB Access to Whitelisted Client & Developer IPs
alb_ingress_cidr_blocks = [
  "83.110.227.12/32", # Client IP 1
  "94.201.232.22/32", # Client IP 2
  "10.10.24.74/32",   # Developer IP 1 (devops)
  "10.10.24.20/32",   # Developer IP 2 (backend)
  "10.10.24.18/32",   # Developer IP 3 (backend)
  "10.10.23.25/32"    # Developer IP 4 (frontend)
]