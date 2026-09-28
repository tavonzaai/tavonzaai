# AWS Provider Configuration
variable "aws_region" {
  description = "AWS region for provisioning resources"
  type        = string
}

variable "aws_profile" {
  description = "AWS CLI profile name (optional)"
  type        = string
}

# Project & Environment Identification
variable "project_name" {
  description = "Unique project identifier"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for the custom VPC"
  type        = string
  default     = "10.1.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB & NAT Gateways)"
  type        = list(string)
  default     = ["10.1.1.0/24", "10.1.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for private app subnets (EC2 Instances)"
  type        = list(string)
  default     = ["10.1.10.0/24", "10.1.11.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDR blocks for isolated private database subnets (RDS & ElastiCache)"
  type        = list(string)
  default     = ["10.1.20.0/24", "10.1.21.0/24"]
}

variable "enable_nat_gateway" {
  description = "Whether to deploy NAT Gateway(s) for private app outbound internet access"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Set to true to share a single NAT Gateway across all AZs (cost-effective for dev)"
  type        = bool
  default     = true
}

# Domain and DNS Configuration
variable "domain_name" {
  description = "Primary hosted zone domain name (e.g. example.com or tavonzaai.co.uk)"
  type        = string
}

variable "api_subdomain" {
  description = "Subdomain prefix for backend API"
  type        = string
}

variable "admin_subdomain" {
  description = "Subdomain prefix for React Admin dashboard"
  type        = string
}

variable "enable_https" {
  description = "Whether to enable HTTPS with ACM certificate validation. Set to false if domain is not yet purchased or pointed to Route 53."
  type        = bool
  default     = false
}

# Custom DNS Records
variable "extra_txt_records" {
  description = "Additional TXT records (e.g. DKIM, DMARC, verification)"
  type = map(object({
    name    = string
    records = list(string)
    ttl     = number
  }))
}

variable "extra_cname_records" {
  description = "Additional CNAME records (e.g. DKIM, verification)"
  type = map(object({
    name   = string
    record = string
    ttl    = number
  }))
}


# AWS SES (Simple Email Service) Configuration
variable "enable_ses" {
  description = "Whether to configure AWS Simple Email Service (SES)"
  type        = bool
  default     = true
}

variable "ses_enable_mail_from" {
  description = "Whether to configure custom MAIL FROM domain in SES"
  type        = bool
  default     = true
}

variable "ses_mail_from_subdomain" {
  description = "Subdomain prefix for custom MAIL FROM domain in SES"
  type        = string
  default     = "mail"
}

variable "ses_enable_dmarc" {
  description = "Whether to configure DMARC TXT record for SES domain"
  type        = bool
  default     = true
}

variable "ses_dmarc_policy" {
  description = "DMARC policy record value"
  type        = string
  default     = "v=DMARC1; p=none; sp=none; aspf=r; adkim=r;"
}

variable "ses_create_smtp_user" {
  description = "Whether to create an IAM user with credentials for sending email via SES SMTP"
  type        = bool
  default     = true
}

variable "ses_verified_email_identities" {
  description = "List of individual email addresses to verify in SES for testing in sandbox mode without domain ownership"
  type        = list(string)
  default     = []
}

# Application Ports & Health Checks
variable "backend_port" {
  description = "Port the backend Docker container listens on"
  type        = number
}

variable "nextjs_port" {
  description = "Port the Next.js Docker container listens on"
  type        = number
}

variable "admin_port" {
  description = "Port the React Admin Docker container listens on"
  type        = number
}

variable "backend_health_check_path" {
  description = "Health check HTTP endpoint for backend service"
  type        = string
}

variable "nextjs_health_check_path" {
  description = "Health check HTTP endpoint for Next.js service"
  type        = string
}

variable "admin_health_check_path" {
  description = "Health check HTTP endpoint for Admin dashboard service"
  type        = string
}

# EC2 Compute Configuration (Legacy / Optional)
variable "backend_instance_type" {
  description = "EC2 instance type for Backend host"
  type        = string
  default     = "t3.small"
}

variable "frontend_instance_type" {
  description = "EC2 instance type for Frontend host"
  type        = string
  default     = "t3.small"
}

variable "backend_ami_id" {
  description = "Custom AMI ID for Backend EC2 (leave empty to use Debian 13)"
  type        = string
  default     = ""
}

variable "frontend_ami_id" {
  description = "Custom AMI ID for Frontend EC2 (leave empty to use Debian 13)"
  type        = string
  default     = ""
}

variable "ssh_key_name" {
  description = "Optional EC2 SSH Key Pair name (SSM Session Manager is the primary access method)"
  type        = string
  default     = ""
}

variable "backend_root_volume_size" {
  description = "Backend EC2 root EBS volume size in GB"
  type        = number
  default     = 20
}

variable "frontend_root_volume_size" {
  description = "Frontend EC2 root EBS volume size in GB"
  type        = number
  default     = 20
}

# ==============================================================================
# Amazon ECS Container Configuration
# ==============================================================================
variable "ecs_use_fargate_spot" {
  description = "Whether to use Fargate Spot for cost optimization (70% savings, recommended for dev)"
  type        = bool
  default     = true
}

variable "ecs_enable_container_insights" {
  description = "Whether to enable CloudWatch Container Insights on ECS cluster"
  type        = bool
  default     = false
}

variable "ecs_log_retention_days" {
  description = "Log retention period in days for ECS service CloudWatch log groups"
  type        = number
  default     = 7
}

variable "backend_container_image" {
  description = "Container image for Backend API (defaults to ECR repository latest image)"
  type        = string
  default     = ""
}

variable "frontend_container_image" {
  description = "Container image for Frontend Next.js app (defaults to ECR repository latest image)"
  type        = string
  default     = ""
}

variable "admin_container_image" {
  description = "Container image for React Admin app (defaults to ECR repository latest image)"
  type        = string
  default     = ""
}

variable "backend_task_cpu" {
  description = "CPU units for Backend task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "backend_task_memory" {
  description = "Memory for Backend task in MB (512 = 0.5 GB)"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Desired number of running Backend task containers"
  type        = number
  default     = 1
}

variable "frontend_task_cpu" {
  description = "CPU units for Frontend task"
  type        = number
  default     = 256
}

variable "frontend_task_memory" {
  description = "Memory for Frontend task in MB"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of running Frontend task containers"
  type        = number
  default     = 1
}

variable "admin_task_cpu" {
  description = "CPU units for Admin dashboard task"
  type        = number
  default     = 256
}

variable "admin_task_memory" {
  description = "Memory for Admin dashboard task in MB"
  type        = number
  default     = 512
}

variable "admin_desired_count" {
  description = "Desired number of running Admin dashboard task containers"
  type        = number
  default     = 1
}

# S3 Storage Configuration
variable "s3_bucket_name" {
  description = "Globally unique name for the private application S3 bucket"
  type        = string
}

# Secrets Manager Configuration
variable "secret_name" {
  description = "Custom secret name for Secrets Manager (optional; generated if blank)"
  type        = string
}

# RDS PostgreSQL Configuration
variable "rds_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
}

variable "rds_instance_class" {
  description = "RDS DB instance class"
  type        = string
}

variable "rds_allocated_storage" {
  description = "Allocated storage for RDS instance in GB"
  type        = number
}

variable "rds_storage_type" {
  description = "Storage type for RDS instance (e.g. gp3, gp2)"
  type        = string
}

variable "rds_db_name" {
  description = "Initial database name"
  type        = string
}

variable "rds_db_username" {
  description = "Database master username"
  type        = string
}

variable "rds_db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "rds_publicly_accessible" {
  description = "Whether the DB instance is publicly accessible (must be false for private databases)"
  type        = bool
}

variable "rds_skip_final_snapshot" {
  description = "Skip final snapshot when deleting RDS instance"
  type        = bool
}

variable "rds_deletion_protection" {
  description = "Enable deletion protection on RDS instance"
  type        = bool
}

variable "rds_backup_retention_period" {
  description = "Backup retention period in days (0 to disable for dev)"
  type        = number
}

variable "rds_auto_minor_version_upgrade" {
  description = "Automatically apply minor engine upgrades"
  type        = bool
}

variable "rds_apply_immediately" {
  description = "Apply database modifications immediately"
  type        = bool
}

variable "rds_storage_encrypted" {
  description = "Specifies whether DB storage is encrypted"
  type        = bool
}

variable "rds_multi_az" {
  description = "Enable multi-AZ deployment for RDS"
  type        = bool
}

# ElastiCache Redis / Valkey Configuration
variable "elasticache_cache_name" {
  description = "Name for the ElastiCache Serverless cache"
  type        = string
}

variable "elasticache_engine" {
  description = "Cache engine (valkey or redis)"
  type        = string
}

variable "elasticache_major_engine_version" {
  description = "Major engine version"
  type        = string
}

variable "elasticache_max_storage_gb" {
  description = "Maximum storage limit in GB (cost guardrail)"
  type        = number
}

variable "elasticache_max_ecpu_per_second" {
  description = "Maximum ECPUs per second limit (cost guardrail)"
  type        = number
}

variable "elasticache_snapshot_retention_limit" {
  description = "Number of days to retain snapshots. 0 = disabled (good for dev)"
  type        = number
}

# ==============================================================================
# Elastic Container Registry (ECR) Configuration
# ==============================================================================
variable "ecr_repository_names" {
  description = "List of microservices/applications to create dedicated ECR repositories for"
  type        = list(string)
  default     = ["backend", "frontend", "admin-dashboard"]
}

variable "ecr_image_tag_mutability" {
  description = "Tag mutability for ECR repositories (MUTABLE or IMMUTABLE)"
  type        = string
  default     = "MUTABLE"
}

variable "ecr_scan_on_push" {
  description = "Enable vulnerability scanning on push to ECR"
  type        = bool
  default     = true
}

variable "ecr_force_delete" {
  description = "Allow forced deletion of ECR repositories containing images upon terraform destroy"
  type        = bool
  default     = true
}

variable "ecr_untagged_image_expiry_days" {
  description = "Number of days after which untagged ECR images expire"
  type        = number
  default     = 14
}

variable "ecr_max_tagged_image_count" {
  description = "Maximum tagged images to retain per repository"
  type        = number
  default     = 30
}

# ==============================================================================
# GitHub Actions CI/CD & IAM Configuration
# ==============================================================================
variable "enable_github_actions_ecr_role" {
  description = "Whether to create IAM role for GitHub Actions CI/CD to push Docker images"
  type        = bool
  default     = true
}

variable "github_repository" {
  description = "GitHub repository in org/repo format (e.g. tavonzaai/tavonzaaiapp) allowed to push to ECR"
  type        = string
  default     = ""
}

variable "github_branches" {
  description = "GitHub branches allowed to push to ECR (e.g. ['main', 'dev'] or ['*'])"
  type        = list(string)
  default     = ["main", "dev"]
}

variable "create_github_oidc_provider" {
  description = "Whether to create the GitHub OIDC provider in the AWS account (set false if already exists)"
  type        = bool
  default     = true
}

# ==============================================================================
# Ingress IP Whitelist Configuration
# ==============================================================================
variable "alb_ingress_cidr_blocks" {
  description = "Allowed CIDR blocks for ALB HTTP/HTTPS ingress"
  type        = list(string)
}

