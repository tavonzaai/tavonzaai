# AWS Provider & Project Settings
aws_region   = "eu-west-2"
aws_profile  = "milkey-dev"
project_name = "tavonzaai"
environment  = "live"

# Custom 3-Tier VPC Settings (10.2.0.0/16 to isolate from prod 10.0.0.0/16 and dev 10.1.0.0/16)
vpc_cidr                 = "10.2.0.0/16"
public_subnet_cidrs      = ["10.2.1.0/24", "10.2.2.0/24"]
private_app_subnet_cidrs = ["10.2.10.0/24", "10.2.11.0/24"]
private_db_subnet_cidrs  = ["10.2.20.0/24", "10.2.21.0/24"]
enable_nat_gateway       = true
single_nat_gateway       = true # Single NAT Gateway

# Domain & DNS Configuration (Actual Live: No prefix)
domain_name        = "tavonza.com"
customer_subdomain = "" # Apex domain tavonza.com and www.tavonza.com
api_subdomain      = "api"
ai_subdomain       = "ai"
kitchen_subdomain  = "kitchen"
cashier_subdomain  = "cashier"
admin_subdomain    = "admin"
enable_https       = true

# Custom DNS Records
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
nextjs_port               = 3000
nextjs_health_check_path  = "/"
backend_port              = 5000
backend_health_check_path = "/health"
ai_port                   = 8000
ai_health_check_path      = "/health"
kitchen_port              = 3105
kitchen_health_check_path = "/"
cashier_port              = 3104
cashier_health_check_path = "/"
admin_port                = 3043
admin_health_check_path   = "/"

# Health Check Timings (AWS ALB enforces maximum interval of 300 seconds / 5 minutes)
health_check_interval            = 300
health_check_timeout             = 5
health_check_healthy_threshold   = 2
health_check_unhealthy_threshold = 3

# EC2 Compute Settings (Rightsized for Cost & Performance)
backend_instance_type     = "t3.small"
frontend_instance_type    = "t3.small"
backend_ami_id            = ""
frontend_ami_id           = ""
ssh_key_name              = ""
backend_root_volume_size  = 20
frontend_root_volume_size = 20

# S3 Storage Settings
s3_bucket_name = "tavonzaai-live-storage-bucket"

# Secrets Manager Settings
secret_name = ""

# RDS PostgreSQL Database Settings (Live Production High Availability)
rds_engine_version             = "17"
rds_instance_class             = "db.t3.micro"
rds_allocated_storage          = 20
rds_storage_type               = "gp3"
rds_db_name                    = "tavonzaai_db"
rds_db_username                = "tavonzaai_user"
rds_db_password                = "tavonzaaiPass2026Live"
rds_publicly_accessible        = false
rds_skip_final_snapshot        = false
rds_deletion_protection        = true
rds_backup_retention_period    = 1
rds_auto_minor_version_upgrade = true
rds_apply_immediately          = false
rds_storage_encrypted          = true
rds_multi_az                   = false

# ElastiCache Redis / Valkey Settings
elasticache_cache_name               = "tavonzaai-live-cache"
elasticache_engine                   = "valkey"
elasticache_major_engine_version     = "8"
elasticache_max_storage_gb           = 1
elasticache_max_ecpu_per_second      = 1000
elasticache_snapshot_retention_limit = 7

# Elastic Container Registry (ECR) Repositories
ecr_repository_names = [
  "backend",
  "frontend",
  "ai",
  "kitchen",
  "cashier",
  "admin-dashboard",
  "branch-manager",
  "waiter",
  "worker"
]

# ALB Ingress Access (Public Internet)
alb_ingress_cidr_blocks = [
  "0.0.0.0/0"
]

# GitHub Actions OIDC Provider (Already exists in AWS Account)
create_github_oidc_provider = false
