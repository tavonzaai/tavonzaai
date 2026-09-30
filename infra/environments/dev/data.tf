# Route 53 Public Hosted Zone for the base domain (delegated on Squarespace)
data "aws_route53_zone" "primary" {
  name         = var.domain_name
  private_zone = false
}

