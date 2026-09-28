# ==============================================================================
# Networking Outputs
# ==============================================================================
output "vpc_id" {
  description = "ID of the custom 3-tier VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the custom VPC"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs (ALB & NAT Gateways)"
  value       = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "List of private application subnet IDs (EC2 Instances)"
  value       = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  description = "List of isolated private database subnet IDs (RDS & ElastiCache)"
  value       = module.vpc.private_db_subnet_ids
}

output "nat_gateway_public_ips" {
  description = "Elastic IP addresses associated with the NAT Gateways"
  value       = module.vpc.nat_gateway_public_ips
}

# ==============================================================================
# Load Balancer & Routing Outputs
# ==============================================================================
output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.alb.alb_arn
}

output "acm_certificate_arn" {
  description = "ARN of the ACM SSL Certificate"
  value       = module.acm.certificate_arn
}

output "application_urls" {
  description = "Public HTTPS application endpoints configured in Route 53"
  value = {
    frontend_nextjs = "https://${module.route53.root_fqdn}"
    backend_api     = "https://${module.route53.api_fqdn}"
    admin_dashboard = "https://${module.route53.admin_fqdn}"
  }
}

output "route53_zone_id" {
  description = "Route 53 Public Hosted Zone ID"
  value       = aws_route53_zone.primary.zone_id
}

output "route53_name_servers" {
  description = "Route 53 Public Hosted Zone Name Servers (Configure these at your domain registrar)"
  value       = aws_route53_zone.primary.name_servers
}

# ==============================================================================
# Amazon ECS Container Outputs
# ==============================================================================
output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = module.ecs.cluster_id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

output "ecs_service_names" {
  description = "Map of ECS service names"
  value       = module.ecs.service_names
}

output "ecs_service_arns" {
  description = "Map of ECS service ARNs"
  value       = module.ecs.service_arns
}

output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS Task Execution IAM Role"
  value       = module.ecs.execution_role_arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS Task IAM Role"
  value       = module.ecs.task_role_arn
}

output "ecs_security_group_id" {
  description = "Security Group ID associated with the ECS tasks"
  value       = module.security_groups.ecs_security_group_id
}

# ==============================================================================
# Database & Cache Outputs
# ==============================================================================
output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint (hostname:port)"
  value       = module.rds_postgres.database_endpoint
}

output "rds_address" {
  description = "PostgreSQL RDS hostname"
  value       = module.rds_postgres.database_address
}

output "rds_port" {
  description = "PostgreSQL RDS port"
  value       = module.rds_postgres.database_port
}

output "rds_database_name" {
  description = "PostgreSQL Database name"
  value       = module.rds_postgres.database_name
}

output "elasticache_endpoint" {
  description = "ElastiCache Redis / Valkey endpoint address"
  value       = module.elasticache.valkey_endpoint
}

output "elasticache_port" {
  description = "ElastiCache Redis / Valkey port"
  value       = module.elasticache.valkey_port
}

# ==============================================================================
# Storage & Secrets Outputs
# ==============================================================================
output "s3_bucket_name" {
  description = "Name of the private S3 bucket"
  value       = module.s3.bucket_name
}

output "s3_bucket_arn" {
  description = "ARN of the private S3 bucket"
  value       = module.s3.bucket_arn
}

output "secrets_manager_secret_name" {
  description = "Name of the AWS Secrets Manager secret"
  value       = module.secrets_manager.secret_name
}

output "secrets_manager_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret"
  value       = module.secrets_manager.secret_arn
}

output "ec2_admin_secret_name" {
  description = "Name of the dedicated EC2 Admin Password Secrets Manager secret"
  value       = module.ec2_admin_secret.secret_name
}

output "ec2_admin_secret_arn" {
  description = "ARN of the dedicated EC2 Admin Password Secrets Manager secret"
  value       = module.ec2_admin_secret.secret_arn
}

# ==============================================================================
# ECR & CI/CD Outputs
# ==============================================================================
output "ecr_repository_urls" {
  description = "Map of microservice names to their ECR repository URLs"
  value       = module.ecr.repository_urls
}

output "ecr_repository_arns" {
  description = "Map of microservice names to their ECR repository ARNs"
  value       = module.ecr.repository_arns
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend Docker images"
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend Docker images"
  value       = module.ecr.frontend_repository_url
}

output "ecr_admin_repository_url" {
  description = "ECR repository URL for admin dashboard Docker images"
  value       = module.ecr.admin_repository_url
}

output "github_actions_ecr_role_arn" {
  description = "ARN of the IAM role for GitHub Actions CI/CD to authenticate and push to ECR"
  value       = module.iam.github_actions_ecr_role_arn
}

# ==============================================================================
# AWS SES (Simple Email Service) Outputs
# ==============================================================================
output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = var.enable_ses ? module.ses[0].domain_identity_arn : null
}

output "ses_dkim_tokens" {
  description = "Easy DKIM tokens for the verified domain"
  value       = var.enable_ses ? module.ses[0].dkim_tokens : null
}

output "ses_mail_from_domain" {
  description = "Custom MAIL FROM domain"
  value       = var.enable_ses ? module.ses[0].mail_from_domain : null
}

output "ses_smtp_host" {
  description = "AWS SES SMTP endpoint host"
  value       = var.enable_ses ? module.ses[0].ses_smtp_host : null
}

output "ses_smtp_port" {
  description = "AWS SES SMTP port"
  value       = var.enable_ses ? module.ses[0].ses_smtp_port : null
}

output "ses_smtp_username" {
  description = "AWS SES SMTP username (IAM Access Key ID)"
  value       = var.enable_ses ? module.ses[0].ses_smtp_username : null
}

output "ses_smtp_password_v4" {
  description = "AWS SES SMTP password (SigV4)"
  value       = var.enable_ses ? module.ses[0].ses_smtp_password_v4 : null
  sensitive   = true
}

