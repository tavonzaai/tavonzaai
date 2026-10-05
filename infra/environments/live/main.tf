# Local Variables and Cloud-Init User Data Scripts
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  secret_name = var.secret_name != "" ? var.secret_name : "/${var.environment}/${var.project_name}/backend"

  # User data script for Ubuntu 24.04 LTS (SSM Agent is pre-installed)
  ec2_bootstrap_user_data = <<-EOF
    #!/bin/bash
    set -x
    exec > /var/log/user-data.log 2>&1

    # Force apt IPv4 in IPv4 VPC
    echo 'Acquire::ForceIPv4 "true";' > /etc/apt/apt.conf.d/99force-ipv4

    # Update system packages and install Docker
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg docker.io docker-compose-v2
    snap install aws-cli --classic || true

    # Enable and start Docker service
    systemctl enable docker
    systemctl start docker

    # Ensure docker group access for ubuntu and ssm-user
    groupadd -f docker
    usermod -aG docker ubuntu 2>/dev/null || true
    usermod -aG docker ssm-user 2>/dev/null || true

    # Ensure Amazon SSM Agent service is enabled and started
    systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service 2>/dev/null || systemctl enable amazon-ssm-agent || true
    systemctl restart snap.amazon-ssm-agent.amazon-ssm-agent.service 2>/dev/null || systemctl restart amazon-ssm-agent || true
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
  ai_port                 = var.ai_port
  kitchen_port            = var.kitchen_port
  cashier_port            = var.cashier_port
  admin_port              = var.admin_port
  manager_port            = var.manager_port
  postgres_port           = 5432
  redis_port              = 6379
  alb_ingress_cidr_blocks = var.alb_ingress_cidr_blocks
  allow_public_rds        = var.rds_publicly_accessible
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

  bucket_name         = var.s3_bucket_name
  environment         = var.environment
  project_name        = var.project_name
  block_public_access = false
  allow_public_read   = true
}

# 5. AWS Secrets Manager Module
module "secrets_manager" {
  source = "../../modules/secrets-manager"

  secret_name = local.secret_name
  description = "Application secrets for ${local.name_prefix}"
  initial_secret_keys = {
    DATABASE_URL          = "postgresql://${var.rds_db_username}:${var.rds_db_password}@${module.rds_postgres.database_endpoint}/${var.rds_db_name}?schema=public&sslmode=require"
    DATABASE_PASSWORD     = var.rds_db_password
    JWT_SECRET            = ""
    JWT_REFRESH_SECRET    = ""
    REDIS_URL             = "rediss://${module.elasticache.valkey_endpoint}:${module.elasticache.valkey_port}"
    THIRD_PARTY_API_KEYS  = ""
    SMTP_HOST             = var.enable_ses && length(module.ses) > 0 ? module.ses[0].ses_smtp_host : "email-smtp.${var.aws_region}.amazonaws.com"
    SMTP_PORT             = "587"
    SMTP_USER             = var.enable_ses && length(module.ses) > 0 && var.ses_create_smtp_user ? module.ses[0].ses_smtp_username : ""
    SMTP_PASS             = var.enable_ses && length(module.ses) > 0 && var.ses_create_smtp_user ? module.ses[0].ses_smtp_password_v4 : ""
    SMTP_FROM             = "noreply@${var.domain_name}"
    SMTP_SECURE           = "false"
    MAIL_FROM_ADDRESS     = "noreply@${var.domain_name}"
    SES_CONFIGURATION_SET = var.enable_ses && length(module.ses) > 0 ? module.ses[0].configuration_set_name : ""
    AWS_ACCESS_KEY_ID     = var.enable_ses && length(module.ses) > 0 && var.ses_create_smtp_user ? module.ses[0].ses_smtp_username : ""
    AWS_SECRET_ACCESS_KEY = var.enable_ses && length(module.ses) > 0 && var.ses_create_smtp_user ? module.ses[0].ses_smtp_raw_secret_key : ""
    S3_ACCESS_KEY_ID      = module.s3.s3_access_key_id
    S3_SECRET_ACCESS_KEY  = module.s3.s3_secret_access_key
    COMPANY_NAME          = "tavonzaai"
    S3_BUCKET_NAME        = var.s3_bucket_name
    AWS_S3_BUCKET         = var.s3_bucket_name
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
  enable_ses_access              = true # ECS/EC2 role needs SES SendEmail permission for SDK-based dispatch
  ses_domain_identity_arn        = var.enable_ses && length(module.ses) > 0 ? module.ses[0].domain_identity_arn : ""
  enable_github_actions_role     = var.enable_github_actions_ecr_role
  github_repository              = var.github_repository
  github_branches                = var.github_branches
  create_github_oidc_provider    = var.create_github_oidc_provider
}

# 7. RDS PostgreSQL Database Module
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

# 8. ElastiCache Redis / Valkey Module
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

# 9. Backend EC2 Instance Module (Deployed into Private App Subnet)
module "backend_ec2" {
  source = "../../modules/ec2"

  instance_name        = "${local.name_prefix}-backend"
  ami_id               = var.backend_ami_id
  instance_type        = var.backend_instance_type
  subnet_id            = module.vpc.private_app_subnet_ids[0]
  security_group_ids   = [module.security_groups.backend_security_group_id]
  iam_instance_profile = module.iam.backend_instance_profile_name
  key_name             = var.ssh_key_name
  root_volume_size     = var.backend_root_volume_size
  user_data            = local.ec2_bootstrap_user_data
}

# 10. Frontend EC2 Instance Module (Hosts Next.js & React Admin in Private App Subnet)
module "frontend_ec2" {
  source = "../../modules/ec2"

  instance_name        = "${local.name_prefix}-frontend"
  ami_id               = var.frontend_ami_id
  instance_type        = var.frontend_instance_type
  subnet_id            = module.vpc.private_app_subnet_ids[0]
  security_group_ids   = [module.security_groups.frontend_security_group_id]
  iam_instance_profile = module.iam.frontend_instance_profile_name
  key_name             = var.ssh_key_name
  root_volume_size     = var.frontend_root_volume_size
  user_data            = local.ec2_bootstrap_user_data
}

# 11. ACM Certificate Module (DNS Validated)
module "acm" {
  count  = var.enable_https ? 1 : 0
  source = "../../modules/acm"

  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  route53_zone_id           = data.aws_route53_zone.primary.zone_id
}

# 12. Application Load Balancer Module (Deployed into Public Subnets)
module "alb" {
  source = "../../modules/alb"

  project_name         = var.project_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.public_subnet_ids
  security_group_ids   = [module.security_groups.alb_security_group_id]
  enable_https         = var.enable_https
  certificate_arn      = var.enable_https && length(module.acm) > 0 ? module.acm[0].certificate_arn : null
  domain_name          = var.domain_name
  customer_subdomain   = var.customer_subdomain
  api_subdomain        = var.api_subdomain
  ai_subdomain         = var.ai_subdomain
  kitchen_subdomain    = var.kitchen_subdomain
  cashier_subdomain    = var.cashier_subdomain
  admin_subdomain      = var.admin_subdomain
  manager_subdomain    = var.manager_subdomain
  target_type          = "instance"
  backend_instance_id  = module.backend_ec2.instance_id
  frontend_instance_id = module.frontend_ec2.instance_id

  backend_port                     = var.backend_port
  nextjs_port                      = var.nextjs_port
  ai_port                          = var.ai_port
  kitchen_port                     = var.kitchen_port
  cashier_port                     = var.cashier_port
  admin_port                       = var.admin_port
  manager_port                     = var.manager_port
  backend_health_check_path        = var.backend_health_check_path
  nextjs_health_check_path         = var.nextjs_health_check_path
  ai_health_check_path             = var.ai_health_check_path
  kitchen_health_check_path        = var.kitchen_health_check_path
  cashier_health_check_path        = var.cashier_health_check_path
  admin_health_check_path          = var.admin_health_check_path
  manager_health_check_path        = var.manager_health_check_path
  health_check_interval            = var.health_check_interval
  health_check_timeout             = var.health_check_timeout
  health_check_healthy_threshold   = var.health_check_healthy_threshold
  health_check_unhealthy_threshold = var.health_check_unhealthy_threshold
}

# 13. Route 53 DNS Alias Records Module
module "route53" {
  source = "../../modules/route53"

  route53_zone_id     = data.aws_route53_zone.primary.zone_id
  domain_name         = var.domain_name
  customer_subdomain  = var.customer_subdomain
  api_subdomain       = var.api_subdomain
  ai_subdomain        = var.ai_subdomain
  kitchen_subdomain   = var.kitchen_subdomain
  cashier_subdomain   = var.cashier_subdomain
  admin_subdomain     = var.admin_subdomain
  manager_subdomain   = var.manager_subdomain
  alb_dns_name        = module.alb.alb_dns_name
  alb_zone_id         = module.alb.alb_zone_id
  extra_txt_records   = var.extra_txt_records
  extra_cname_records = var.extra_cname_records
}

# 14. AWS Simple Email Service (SES) Module
module "ses" {
  count  = var.enable_ses ? 1 : 0
  source = "../../modules/ses"

  domain_name               = var.domain_name
  route53_zone_id           = data.aws_route53_zone.primary.zone_id
  enable_mail_from          = var.ses_enable_mail_from
  mail_from_subdomain       = var.ses_mail_from_subdomain
  enable_dmarc              = var.ses_enable_dmarc
  dmarc_policy              = var.ses_dmarc_policy
  create_smtp_user          = var.ses_create_smtp_user
  verified_email_identities = var.ses_verified_email_identities
  project_name              = var.project_name
  environment               = var.environment
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
