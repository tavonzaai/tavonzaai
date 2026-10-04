output "bucket_id" {
  description = "Name (ID) of the S3 bucket"
  value       = aws_s3_bucket.this.id
}

output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.this.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.this.arn
}

output "bucket_domain_name" {
  description = "Bucket domain name"
  value       = aws_s3_bucket.this.bucket_domain_name
}

output "s3_user_name" {
  description = "Name of the dedicated S3 IAM user"
  value       = var.create_s3_user ? aws_iam_user.s3_user[0].name : null
}

output "s3_user_arn" {
  description = "ARN of the dedicated S3 IAM user"
  value       = var.create_s3_user ? aws_iam_user.s3_user[0].arn : null
}

output "s3_access_key_id" {
  description = "Access Key ID for dedicated S3 IAM user"
  value       = var.create_s3_user ? aws_iam_access_key.s3_user[0].id : null
}

output "s3_secret_access_key" {
  description = "Secret Access Key for dedicated S3 IAM user"
  value       = var.create_s3_user ? aws_iam_access_key.s3_user[0].secret : null
  sensitive   = true
}
