variable "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
}

variable "domain_name" {
  description = "Base domain name (e.g. example.com)"
  type        = string
}

variable "customer_subdomain" {
  description = "Subdomain prefix for Customer frontend (e.g. prod). If empty, manages root and www."
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

variable "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  type        = string
}

variable "alb_zone_id" {
  description = "Route 53 Hosted Zone ID of the Application Load Balancer"
  type        = string
}

# Additional Custom DNS Records (DKIM, DMARC, Domain Verification)
variable "extra_txt_records" {
  description = "Additional TXT records (e.g. DKIM, DMARC, verification)"
  type = map(object({
    name    = string
    records = list(string)
    ttl     = number
  }))
  default = {}
}

variable "extra_cname_records" {
  description = "Additional CNAME records (e.g. DKIM, verification)"
  type = map(object({
    name   = string
    record = string
    ttl    = number
  }))
  default = {}
}



