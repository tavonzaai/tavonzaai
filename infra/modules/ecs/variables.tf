variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where ECS tasks are deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs for ECS tasks (awsvpc network mode)"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of Security Group IDs to associate with ECS tasks"
  type        = list(string)
}

variable "aws_region" {
  description = "AWS Region where resources and CloudWatch logs are deployed"
  type        = string
}

variable "use_fargate_spot" {
  description = "Whether to use Fargate Spot for cost optimization (recommended true for dev)"
  type        = bool
  default     = true
}

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights on the ECS cluster (disabled in dev to save cost)"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days for ECS container log streams"
  type        = number
  default     = 7
}

variable "assign_public_ip" {
  description = "Assign public IP to tasks (false when in private subnets with NAT gateway)"
  type        = bool
  default     = false
}

variable "secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret for secret injection"
  type        = string
  default     = null
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket for task IAM permissions"
  type        = string
  default     = null
}

variable "services" {
  description = "Map of ECS services configuration"
  type = map(object({
    name             = string
    container_image  = string
    container_port   = optional(number)
    cpu              = optional(number, 256)
    memory           = optional(number, 512)
    desired_count    = optional(number, 1)
    target_group_arn = optional(string, null)
    environment      = optional(list(object({ name = string, value = string })), [])
    secrets          = optional(list(object({ name = string, valueFrom = string })), [])
    command          = optional(list(string), null)
  }))
  default = {}
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
