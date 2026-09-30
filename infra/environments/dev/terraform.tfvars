# AWS Provider & Project Settings
aws_region   = "eu-west-1"
aws_profile  = "milkey-dev"
project_name = "tavonzaai"
environment  = "dev"

# Custom 3-Tier VPC Settings
vpc_cidr                 = "10.1.0.0/16"
public_subnet_cidrs      = ["10.1.1.0/24", "10.1.2.0/24"]
private_app_subnet_cidrs = ["10.1.10.0/24", "10.1.11.0/24"]
private_db_subnet_cidrs  = ["10.1.20.0/24", "10.1.21.0/24"]
enable_nat_gateway       = true
single_nat_gateway       = true # Cost-optimized: Single NAT Gateway for dev

# Domain & DNS
domain_name       = "tavonza.com"
api_subdomain     = "api"
ai_subdomain      = "ai"
kitchen_subdomain = "kitchen"
cashier_subdomain = "cashier"
admin_subdomain   = "admin"
enable_https      = true


# Custom DNS Records
extra_txt_records   = {}
extra_cname_records = {}


# AWS Simple Email Service (SES) Configuration
enable_ses                    = true
ses_enable_mail_from          = true
ses_mail_from_subdomain       = "mail"
ses_enable_dmarc              = true
ses_dmarc_policy              = "v=DMARC1; p=none; sp=none; aspf=r; adkim=r;"
ses_create_smtp_user          = true
ses_verified_email_identities = [] # Add your personal/team email address here (e.g. ["dev@example.com"]) to verify in SES for testing in sandbox mode

# Application Ports & Health Checks
backend_port              = 5000
nextjs_port               = 3000
ai_port                   = 8000
kitchen_port              = 3105
cashier_port              = 3104
admin_port                = 3043
backend_health_check_path = "/health"
nextjs_health_check_path  = "/"
ai_health_check_path      = "/health"
kitchen_health_check_path = "/"
cashier_health_check_path = "/"
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
s3_bucket_name = "tavonzaai-dev-storage-bucket"

# Secrets Manager Settings
secret_name = ""

# RDS PostgreSQL Database Settings (PostgreSQL 17)
rds_engine_version             = "17"
rds_instance_class             = "db.t3.micro"
rds_allocated_storage          = 20
rds_storage_type               = "gp3"
rds_db_name                    = "tavonzaai_db"
rds_db_username                = "tavonzaai_user"
rds_db_password                = "tavonzaaiPass2026Dev"
rds_publicly_accessible        = false
rds_skip_final_snapshot        = true
rds_deletion_protection        = false
rds_backup_retention_period    = 0
rds_auto_minor_version_upgrade = true
rds_apply_immediately          = true
rds_storage_encrypted          = true
rds_multi_az                   = false

# ElastiCache Redis / Valkey Settings (Serverless Capped at 1GB RAM)
elasticache_cache_name               = "tavonzaai-dev-cache"
elasticache_engine                   = "valkey"
elasticache_major_engine_version     = "8"
elasticache_max_storage_gb           = 1
elasticache_max_ecpu_per_second      = 1000
elasticache_snapshot_retention_limit = 0

# GitHub Actions CI/CD & ECR Role Settings
enable_github_actions_ecr_role = true
github_repository              = "tavonzaai/tavonzaai"
github_branches                = ["*"]
create_github_oidc_provider    = false

# Testing Stage - Restrict ALB Access to Whitelisted Client & Developer IPs
alb_ingress_cidr_blocks = [
  "0.0.0.0/0",
]