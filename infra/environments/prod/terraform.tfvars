# AWS Provider & Project Settings
aws_region   = "eu-west-2"
aws_profile  = "" # Leave empty when using temporary STS session credentials
project_name = "tavonzaai"
environment  = "prod"

# Custom 3-Tier VPC Settings
vpc_cidr                 = "10.0.0.0/16"
public_subnet_cidrs      = ["10.0.1.0/24", "10.0.2.0/24"]
private_app_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]
private_db_subnet_cidrs  = ["10.0.20.0/24", "10.0.21.0/24"]
enable_nat_gateway       = true
single_nat_gateway       = true # Set to false for Multi-AZ NAT Gateway high-availability

# Domain & DNS
domain_name     = "tavonzaai.co.uk"
api_subdomain   = "api"
admin_subdomain = "admin"

# Zoho Mail & DNS Configuration
enable_zoho_mail = true
zoho_mx_records = [
  "10 mx.zoho.com",
  "20 mx2.zoho.com",
  "50 mx3.zoho.com"
]
zoho_spf_record     = "v=spf1 include:dc-8e814c8572._spfm.tavonzaai.co.uk ~all"
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
rds_backup_retention_period    = 7
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

# Testing Stage - Restrict ALB Access to Whitelisted Client & Developer IPs
alb_ingress_cidr_blocks = [
  "83.110.227.12/32", # Client IP 1
  "94.201.232.22/32", # Client IP 2
  "10.10.24.74/32",   # Developer IP 1
  "10.10.24.20/32",   # Developer IP 2
  "10.10.24.18/32"    # Developer IP 3
]
