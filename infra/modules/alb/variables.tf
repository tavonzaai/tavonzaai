variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the ALB and Target Groups are created"
  type        = string
}

variable "subnet_ids" {
  description = "List of public subnet IDs for the internet-facing ALB (minimum 2 in distinct AZs)"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of Security Group IDs to attach to the ALB"
  type        = list(string)
}

variable "enable_https" {
  description = "Whether to configure HTTPS listener with ACM certificate. If false, HTTP port 80 routes traffic directly."
  type        = bool
  default     = true
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS listener (required if enable_https is true)"
  type        = string
  default     = null
}

variable "domain_name" {
  description = "Base domain name (e.g. example.com)"
  type        = string
}

variable "customer_subdomain" {
  description = "Subdomain prefix for Customer frontend (e.g. prod). If empty, ALB listens on root domain and www."
  type        = string
  default     = ""
}

variable "api_subdomain" {
  description = "Subdomain prefix for API (e.g. api)"
  type        = string
  default     = "api"
}

variable "ai_subdomain" {
  description = "Subdomain prefix for AI service (e.g. ai)"
  type        = string
  default     = "ai"
}

variable "kitchen_subdomain" {
  description = "Subdomain prefix for Kitchen frontend (e.g. kitchen)"
  type        = string
  default     = "kitchen"
}

variable "cashier_subdomain" {
  description = "Subdomain prefix for Cashier frontend (e.g. cashier)"
  type        = string
  default     = "cashier"
}

variable "admin_subdomain" {
  description = "Subdomain prefix for Admin (e.g. admin)"
  type        = string
  default     = "admin"
}

variable "target_type" {
  description = "Target type for ALB target groups (ip for ECS Fargate, instance for EC2)"
  type        = string
  default     = "ip"
}

variable "backend_instance_id" {
  description = "EC2 Instance ID for Backend API (required only if target_type is instance)"
  type        = string
  default     = null
}

variable "frontend_instance_id" {
  description = "EC2 Instance ID for Frontend (required only if target_type is instance)"
  type        = string
  default     = null
}

variable "ai_instance_id" {
  description = "EC2 Instance ID for AI service (defaults to backend_instance_id if null)"
  type        = string
  default     = null
}

variable "kitchen_instance_id" {
  description = "EC2 Instance ID for Kitchen frontend (defaults to frontend_instance_id if null)"
  type        = string
  default     = null
}

variable "cashier_instance_id" {
  description = "EC2 Instance ID for Cashier frontend (defaults to frontend_instance_id if null)"
  type        = string
  default     = null
}

variable "backend_port" {
  description = "Port the backend application listens on"
  type        = number
  default     = 5000
}

variable "nextjs_port" {
  description = "Port the Next.js customer application listens on"
  type        = number
  default     = 3000
}

variable "ai_port" {
  description = "Port the AI FastAPI application listens on"
  type        = number
  default     = 8000
}

variable "kitchen_port" {
  description = "Port the Kitchen application listens on"
  type        = number
  default     = 3105
}

variable "cashier_port" {
  description = "Port the Cashier application listens on"
  type        = number
  default     = 3104
}

variable "admin_port" {
  description = "Port the React Admin application listens on"
  type        = number
  default     = 3043
}

variable "backend_health_check_path" {
  description = "Health check path for backend service"
  type        = string
  default     = "/health"
}

variable "nextjs_health_check_path" {
  description = "Health check path for Next.js customer service"
  type        = string
  default     = "/"
}

variable "ai_health_check_path" {
  description = "Health check path for AI service"
  type        = string
  default     = "/health"
}

variable "kitchen_health_check_path" {
  description = "Health check path for Kitchen frontend"
  type        = string
  default     = "/"
}

variable "cashier_health_check_path" {
  description = "Health check path for Cashier frontend"
  type        = string
  default     = "/"
}

variable "admin_health_check_path" {
  description = "Health check path for Admin service"
  type        = string
  default     = "/"
}

variable "enable_deletion_protection" {
  description = "If true, deletion of the load balancer will be disabled via the AWS API"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}
