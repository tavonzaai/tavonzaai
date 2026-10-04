# S3 Bucket
resource "aws_s3_bucket" "this" {
  bucket        = var.bucket_name
  force_destroy = var.force_destroy

  tags = merge(var.tags, {
    Name        = var.bucket_name
    Environment = var.environment
  })
}

# Ownership controls: BucketOwnerEnforced disables ACLs and ensures bucket owner owns all objects
resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Block all public access completely
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable Versioning
resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = var.versioning_status
  }
}

# Server-side encryption using AES256
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CORS Configuration for direct web browser uploads & viewing
resource "aws_s3_bucket_cors_configuration" "this" {
  count  = var.enable_cors ? 1 : 0
  bucket = aws_s3_bucket.this.id

  cors_rule {
    allowed_headers = var.cors_allowed_headers
    allowed_methods = var.cors_allowed_methods
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag", "x-amz-server-side-encryption"]
    max_age_seconds = 3600
  }
}

# ------------------------------------------------------------------------------
# Dedicated S3 IAM User (Separated from SES SMTP User)
# ------------------------------------------------------------------------------
locals {
  s3_user_name = var.s3_user_name != "" ? var.s3_user_name : "${var.project_name}-${var.environment}-s3-user"
}

resource "aws_iam_user" "s3_user" {
  count = var.create_s3_user ? 1 : 0
  name  = local.s3_user_name

  tags = merge(var.tags, {
    Name        = local.s3_user_name
    Environment = var.environment
  })
}

resource "aws_iam_access_key" "s3_user" {
  count = var.create_s3_user ? 1 : 0
  user  = aws_iam_user.s3_user[0].name
}

data "aws_iam_policy_document" "s3_user_policy" {
  count = var.create_s3_user ? 1 : 0

  statement {
    sid    = "S3BucketAccess"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = [aws_s3_bucket.this.arn]
  }

  statement {
    sid    = "S3ObjectAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:AbortMultipartUpload",
      "s3:ListMultipartUploadParts"
    ]
    resources = ["${aws_s3_bucket.this.arn}/*"]
  }
}

resource "aws_iam_user_policy" "s3_user_policy" {
  count  = var.create_s3_user ? 1 : 0
  name   = "${local.s3_user_name}-policy"
  user   = aws_iam_user.s3_user[0].name
  policy = data.aws_iam_policy_document.s3_user_policy[0].json
}

