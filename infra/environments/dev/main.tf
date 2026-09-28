# Local Variables and Cloud-Init User Data Scripts
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  secret_name = var.secret_name != "" ? var.secret_name : "/${var.environment}/${var.project_name}/backend"

  # User data script to install AWS SSM Agent, Docker, and Docker Compose Plugin on Debian 13
  ec2_bootstrap_user_data = <<-EOF
    #!/bin/bash
    set -euo pipefail

    # Update system packages
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg wget python3 awscli

    # 1. Install AWS Systems Manager (SSM) Agent
    mkdir -p /tmp/ssm
    wget -q https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/debian_amd64/amazon-ssm-agent.deb -O /tmp/ssm/amazon-ssm-agent.deb
    sudo dpkg -i /tmp/ssm/amazon-ssm-agent.deb
    sudo systemctl enable amazon-ssm-agent
    sudo systemctl start amazon-ssm-agent
    rm -rf /tmp/ssm

    # 2. Install Docker & Docker Compose Plugin
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo groupadd -f docker
    sudo usermod -aG docker admin 2>/dev/null || true
    sudo usermod -aG docker debian 2>/dev/null || true
    sudo usermod -aG docker ubuntu 2>/dev/null || true
    sudo usermod -aG docker ssm-user 2>/dev/null || true
    EOF
}

# 1. Custom 3-Tier Multi-AZ VPC Module
module "vpc" {
  source = "../../modules/vpc"

  project_name             = var.project_name
  environment              = var.environment
  vpc_cidr                 = var.vpc_cidr
  public_subnet_cidrs      = var.public_subnet_cidrs
  private_app_subnet_cidrs = var.private_app_subnet_cidrs
  private_db_subnet_cidrs  = var.private_db_subnet_cidrs
  enable_nat_gateway       = var.enable_nat_gateway
  single_nat_gateway       = var.single_nat_gateway
}

# 2. Security Groups Module
module "security_groups" {
  source = "../../modules/security-groups"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  backend_port            = var.backend_port
  nextjs_port             = var.nextjs_port
  admin_port              = var.admin_port
  postgres_port           = 5432
  redis_port              = 6379
  alb_ingress_cidr_blocks = var.alb_ingress_cidr_blocks
}

# 3. AWS Elastic Container Registry (ECR) Repositories Module
module "ecr" {
  source = "../../modules/ecr"

  project_name               = var.project_name
  environment                = var.environment
  repository_names           = var.ecr_repository_names
  image_tag_mutability       = var.ecr_image_tag_mutability
  scan_on_push               = var.ecr_scan_on_push
  force_delete               = var.ecr_force_delete
  untagged_image_expiry_days = var.ecr_untagged_image_expiry_days
  max_tagged_image_count     = var.ecr_max_tagged_image_count
}

# 4. Private S3 Bucket Module
module "s3" {
  source = "../../modules/s3"

  bucket_name = var.s3_bucket_name
  environment = var.environment
}

# 5. AWS Secrets Manager Module
module "secrets_manager" {
  source = "../../modules/secrets-manager"

  secret_name = local.secret_name
  description = "Application secrets for ${local.name_prefix}"
  initial_secret_keys = {
    DATABASE_URL         = "postgresql://${var.rds_db_username}:${var.rds_db_password}@${module.rds_postgres.database_endpoint}/${var.rds_db_name}?schema=public"
    DATABASE_PASSWORD    = var.rds_db_password
    JWT_SECRET           = ""
    REDIS_URL            = "redis://${module.elasticache.valkey_endpoint}:${module.elasticache.valkey_port}"
    THIRD_PARTY_API_KEYS = ""
    SMTP_HOST            = var.enable_ses && length(module.ses) > 0 ? module.ses[0].ses_smtp_host : "email-smtp.eu-west-2.amazonaws.com"
    SMTP_PORT            = "587"
    SMTP_USER            = var.enable_ses && length(module.ses) > 0 && var.ses_create_smtp_user ? module.ses[0].ses_smtp_username : ""
    SMTP_PASS            = var.enable_ses && length(module.ses) > 0 && var.ses_create_smtp_user ? module.ses[0].ses_smtp_password_v4 : ""
    SMTP_FROM            = "noreply@${var.domain_name}"
    SMTP_SECURE          = "false"
    COMPANY_NAME         = "tavonzaai"
  }
}

# Dedicated EC2 Admin Password Secret (Isolated from backend application secrets)
module "ec2_admin_secret" {
  source = "../../modules/secrets-manager"

  secret_name = "/${var.environment}/${var.project_name}/ec2-admin-password"
  description = "Dedicated administrative access password for ${local.name_prefix}"
  initial_secret_keys = {
    EC2_ADMIN_PASSWORD = ""
  }
}

# 6. IAM Roles, Instance Profiles, and CI/CD OIDC Module
module "iam" {
  source = "../../modules/iam"

  project_name                   = var.project_name
  environment                    = var.environment
  s3_bucket_arn                  = module.s3.bucket_arn
  secrets_manager_arn            = module.secrets_manager.secret_arn
  enable_ec2_admin_secret_access = true
  ec2_admin_secret_arn           = module.ec2_admin_secret.secret_arn
  ecr_repository_arns            = module.ecr.repository_arns_list
  enable_ses_access              = false # Backend uses SMTP credentials managed in Secrets Manager, redundant IAM policy disabled
  ses_domain_identity_arn        = var.enable_ses && length(module.ses) > 0 ? module.ses[0].domain_identity_arn : ""
  enable_github_actions_role     = var.enable_github_actions_ecr_role
  github_repository              = var.github_repository
  github_branches                = var.github_branches
  create_github_oidc_provider    = var.create_github_oidc_provider
}


# 6. RDS PostgreSQL Database Module
module "rds_postgres" {
  source = "../../modules/rds-postgres"

  identifier                 = "${local.name_prefix}-db"
  engine_version             = var.rds_engine_version
  db_instance_class          = var.rds_instance_class
  db_allocated_storage       = var.rds_allocated_storage
  storage_type               = var.rds_storage_type
  db_name                    = var.rds_db_name
  db_username                = var.rds_db_username
  db_password                = var.rds_db_password
  subnet_ids                 = module.vpc.private_db_subnet_ids
  security_group_ids         = [module.security_groups.rds_security_group_id]
  publicly_accessible        = var.rds_publicly_accessible
  skip_final_snapshot        = var.rds_skip_final_snapshot
  deletion_protection        = var.rds_deletion_protection
  backup_retention_period    = var.rds_backup_retention_period
  auto_minor_version_upgrade = var.rds_auto_minor_version_upgrade
  apply_immediately          = var.rds_apply_immediately
  storage_encrypted          = var.rds_storage_encrypted
  multi_az                   = var.rds_multi_az
}

# 7. ElastiCache Redis / Valkey Module
module "elasticache" {
  source = "../../modules/elasticache"

  cache_name               = var.elasticache_cache_name
  engine                   = var.elasticache_engine
  major_engine_version     = var.elasticache_major_engine_version
  subnet_ids               = module.vpc.private_db_subnet_ids
  security_group_ids       = [module.security_groups.redis_security_group_id]
  max_storage_gb           = var.elasticache_max_storage_gb
  max_ecpu_per_second      = var.elasticache_max_ecpu_per_second
  snapshot_retention_limit = var.elasticache_snapshot_retention_limit
  environment              = var.environment
}

# 8. ACM Certificate Module (DNS Validated)
module "acm" {
  source = "../../modules/acm"

  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  route53_zone_id           = aws_route53_zone.primary.zone_id
}

# 9. Application Load Balancer Module (Deployed into Public Subnets)
module "alb" {
  source = "../../modules/alb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnet_ids
  security_group_ids = [module.security_groups.alb_security_group_id]
  certificate_arn    = module.acm.certificate_arn
  domain_name        = var.domain_name
  api_subdomain      = var.api_subdomain
  admin_subdomain    = var.admin_subdomain
  target_type        = "ip"

  backend_port              = var.backend_port
  nextjs_port               = var.nextjs_port
  admin_port                = var.admin_port
  backend_health_check_path = var.backend_health_check_path
  nextjs_health_check_path  = var.nextjs_health_check_path
  admin_health_check_path   = var.admin_health_check_path
}

# 10. Amazon Elastic Container Service (ECS) Fargate Cluster & Microservices
module "ecs" {
  source = "../../modules/ecs"

  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.vpc.vpc_id
  subnet_ids                = module.vpc.private_app_subnet_ids
  security_group_ids        = [module.security_groups.ecs_security_group_id]
  aws_region                = var.aws_region
  use_fargate_spot          = var.ecs_use_fargate_spot
  enable_container_insights = var.ecs_enable_container_insights
  log_retention_days        = var.ecs_log_retention_days
  secrets_manager_arn       = module.secrets_manager.secret_arn
  s3_bucket_arn             = module.s3.bucket_arn

  services = {
    backend = {
      name             = "backend"
      container_image  = var.backend_container_image != "" ? var.backend_container_image : "${module.ecr.repository_urls["backend"]}:latest"
      container_port   = var.backend_port
      cpu              = var.backend_task_cpu
      memory           = var.backend_task_memory
      desired_count    = var.backend_desired_count
      target_group_arn = module.alb.backend_target_group_arn
      environment = [
        { name = "NODE_ENV", value = "development" },
        { name = "PORT", value = tostring(var.backend_port) }
      ]
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${module.secrets_manager.secret_arn}:DATABASE_URL::" },
        { name = "REDIS_URL", valueFrom = "${module.secrets_manager.secret_arn}:REDIS_URL::" },
        { name = "JWT_SECRET", valueFrom = "${module.secrets_manager.secret_arn}:JWT_SECRET::" }
      ]
    }
    frontend = {
      name             = "frontend"
      container_image  = var.frontend_container_image != "" ? var.frontend_container_image : "${module.ecr.repository_urls["frontend"]}:latest"
      container_port   = var.nextjs_port
      cpu              = var.frontend_task_cpu
      memory           = var.frontend_task_memory
      desired_count    = var.frontend_desired_count
      target_group_arn = module.alb.nextjs_target_group_arn
      environment = [
        { name = "NODE_ENV", value = "development" },
        { name = "PORT", value = tostring(var.nextjs_port) },
        { name = "NEXT_PUBLIC_API_URL", value = "https://${var.api_subdomain}.${var.domain_name}" }
      ]
      secrets = []
    }
    admin = {
      name             = "admin"
      container_image  = var.admin_container_image != "" ? var.admin_container_image : "${module.ecr.repository_urls["admin-dashboard"]}:latest"
      container_port   = var.admin_port
      cpu              = var.admin_task_cpu
      memory           = var.admin_task_memory
      desired_count    = var.admin_desired_count
      target_group_arn = module.alb.admin_target_group_arn
      environment = [
        { name = "NODE_ENV", value = "development" },
        { name = "PORT", value = tostring(var.admin_port) },
        { name = "NEXT_PUBLIC_API_URL", value = "https://${var.api_subdomain}.${var.domain_name}" }
      ]
      secrets = []
    }
  }
}

# 12. Route 53 DNS Alias Records Module
module "route53" {
  source = "../../modules/route53"

  route53_zone_id     = aws_route53_zone.primary.zone_id
  domain_name         = var.domain_name
  api_subdomain       = var.api_subdomain
  admin_subdomain     = var.admin_subdomain
  alb_dns_name        = module.alb.alb_dns_name
  alb_zone_id         = module.alb.alb_zone_id
  enable_zoho_mail    = var.enable_zoho_mail
  zoho_mx_records     = var.zoho_mx_records
  zoho_spf_record     = var.zoho_spf_record
  extra_txt_records   = var.extra_txt_records
  extra_cname_records = var.extra_cname_records
}

# 13. AWS Simple Email Service (SES) Module
module "ses" {
  count  = var.enable_ses ? 1 : 0
  source = "../../modules/ses"

  domain_name         = var.domain_name
  route53_zone_id     = aws_route53_zone.primary.zone_id
  enable_mail_from    = var.ses_enable_mail_from
  mail_from_subdomain = var.ses_mail_from_subdomain
  enable_dmarc        = var.ses_enable_dmarc
  dmarc_policy        = var.ses_dmarc_policy
  create_smtp_user    = var.ses_create_smtp_user
  project_name        = var.project_name
  environment         = var.environment
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

