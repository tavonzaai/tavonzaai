# AWS Provider & Project Settings
aws_region   = "eu-west-2"
aws_profile  = "milkey-dev"
project_name = "tavonzaai"
environment  = "prod"

# Custom 3-Tier VPC Settings
vpc_cidr                 = "10.0.0.0/16"
public_subnet_cidrs      = ["10.0.1.0/24", "10.0.2.0/24"]
private_app_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]
private_db_subnet_cidrs  = ["10.0.20.0/24", "10.0.21.0/24"]
enable_nat_gateway       = true
single_nat_gateway       = true # Set to false for Multi-AZ NAT Gateway high-availability

# Domain & DNS Configuration (Testable Version: prod- prefix)
domain_name        = "tavonza.com"
customer_subdomain = "prod"
api_subdomain      = "prod-api"
ai_subdomain       = "prod-ai"
kitchen_subdomain  = "prod-kitchen"
cashier_subdomain  = "prod-cashier"
admin_subdomain    = "prod-admin"
enable_https       = true

# Custom DNS Records
extra_txt_records   = {}
extra_cname_records = {}


# AWS Simple Email Service (SES) Configuration
enable_ses              = true
ses_enable_mail_from    = true
ses_mail_from_subdomain = "prod-mail"
ses_enable_dmarc        = true
ses_dmarc_policy        = "v=DMARC1; p=none; sp=none; aspf=r; adkim=r;"
ses_create_smtp_user    = true

# Application Ports & Health Checks
# 1. Customer Frontend -> tavonza.com (Next.js)
nextjs_port              = 3000
nextjs_health_check_path = "/"

# 2. Backend API -> api.tavonza.com (NestJS)
backend_port              = 5000
backend_health_check_path = "/health"

# 3. AI Service -> ai.tavonza.com (FastAPI)
ai_port              = 8000
ai_health_check_path = "/health"

# 4. Kitchen Frontend -> kitchen.tavonza.com (Next.js)
kitchen_port              = 3105
kitchen_health_check_path = "/"

# 5. Cashier Frontend -> cashier.tavonza.com (Next.js)
cashier_port              = 3104
cashier_health_check_path = "/"

# Admin Dashboard -> admin.tavonza.com
admin_port              = 3043
admin_health_check_path = "/"

# Health Check Timings (AWS ALB enforces maximum interval of 300 seconds / 5 minutes)
health_check_interval                 = 300
health_check_timeout                  = 5
health_check_healthy_threshold        = 2
health_check_unhealthy_threshold      = 3
ecs_health_check_grace_period_seconds = 600

# EC2 Compute Settings (Rightsized for Cost Optimization)
backend_instance_type     = "t3.small"
frontend_instance_type    = "t3.small"
backend_ami_id            = ""
frontend_ami_id           = ""
ssh_key_name              = ""
backend_root_volume_size  = 10
frontend_root_volume_size = 10

# S3 Storage Settings
s3_bucket_name = "tavonzaai-prod-storage-bucket"

# Secrets Manager Settings
secret_name = ""

# RDS PostgreSQL Database Settings (Production Best Practices)
rds_engine_version             = "17"
rds_instance_class             = "db.t3.micro"
rds_allocated_storage          = 20
rds_storage_type               = "gp3"
rds_db_name                    = "tavonzaai_db"
rds_db_username                = "tavonzaai_user"
rds_db_password                = "tavonzaaiPass2026Prod" # To be set/rotated in Secrets Manager
rds_publicly_accessible        = false
rds_skip_final_snapshot        = false
rds_deletion_protection        = true
rds_backup_retention_period    = 1
rds_auto_minor_version_upgrade = true
rds_apply_immediately          = false
rds_storage_encrypted          = true
rds_multi_az                   = false

# ElastiCache Redis / Valkey Settings (Serverless Capped at 1GB RAM)
elasticache_cache_name               = "tavonzaai-prod-cache"
elasticache_engine                   = "valkey"
elasticache_major_engine_version     = "8"
elasticache_max_storage_gb           = 1
elasticache_max_ecpu_per_second      = 1000
elasticache_snapshot_retention_limit = 1

# Elastic Container Registry (ECR) Repositories
ecr_repository_names = [
  "backend",         # NestJS API (api.tavonza.com)
  "frontend",        # Customer Next.js Frontend (tavonza.com)
  "ai",              # Python FastAPI AI service (ai.tavonza.com)
  "kitchen",         # Kitchen Next.js Frontend (kitchen.tavonza.com)
  "cashier",         # Cashier Next.js Frontend (cashier.tavonza.com)
  "admin-dashboard", # Admin React Dashboard (admin.tavonza.com)
  "branch-manager",  # Branch Manager Frontend (branch-manager.tavonza.com)
  "waiter",          # Waiter Next.js Frontend (waiter.tavonza.com)
  "worker"           # Background FIFO Queue Worker
]

# ALB Ingress Access (Default: Open to public Internet for tavonza.com)
alb_ingress_cidr_blocks = [
  "0.0.0.0/0"
]

# GitHub Actions OIDC Provider (Already exists in AWS Account)
create_github_oidc_provider = false

