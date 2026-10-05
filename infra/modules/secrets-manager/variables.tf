variable "secret_name" {
  description = "Name/path of the Secrets Manager secret (e.g. /dev/tavonzaai/backend)"
  type        = string
}

variable "description" {
  description = "Description of the secret"
  type        = string
  default     = "Backend application secrets"
}

variable "recovery_window_in_days" {
  description = "Number of days AWS waits before deleting the secret (0 for force delete without recovery)"
  type        = number
  default     = 0
}

variable "initial_secret_keys" {
  description = "Map of initial placeholder keys to store in the secret without sensitive values"
  type        = map(string)
  default = {
    DATABASE_URL         = ""
    DATABASE_PASSWORD    = ""
    JWT_SECRET           = ""
    REDIS_URL            = ""
    THIRD_PARTY_API_KEYS = ""
    SMTP_HOST            = ""
    SMTP_PORT            = "587"
    SMTP_USER            = ""
    SMTP_PASS            = ""
    SMTP_FROM            = ""
    SMTP_SECURE          = "false"
    COMPANY_NAME         = "tavonzaai"
    EC2_ADMIN_PASSWORD   = ""
    S3_ACCESS_KEY_ID     = ""
    S3_SECRET_ACCESS_KEY = ""
  }
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}
