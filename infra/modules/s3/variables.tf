variable "bucket_name" {
  description = "Globally unique name for the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)"
  type        = string
}

variable "force_destroy" {
  description = "A boolean that indicates all objects should be deleted from the bucket so that the bucket can be destroyed without error"
  type        = bool
  default     = false
}

variable "versioning_status" {
  description = "Versioning status of the bucket (Enabled, Suspended, Disabled)"
  type        = string
  default     = "Enabled"
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {}
}

variable "enable_cors" {
  description = "Whether to configure CORS on the bucket for direct browser uploads"
  type        = bool
  default     = true
}

variable "cors_allowed_headers" {
  description = "Allowed headers for S3 CORS"
  type        = list(string)
  default     = ["*"]
}

variable "cors_allowed_methods" {
  description = "Allowed HTTP methods for S3 CORS"
  type        = list(string)
  default     = ["GET", "PUT", "POST", "DELETE", "HEAD"]
}

variable "cors_allowed_origins" {
  description = "Allowed origins for S3 CORS"
  type        = list(string)
  default     = ["*"]
}

