output "root_fqdn" {
  description = "FQDN of the root domain record"
  value       = aws_route53_record.root.fqdn
}

output "api_fqdn" {
  description = "FQDN of the API subdomain record"
  value       = aws_route53_record.api.fqdn
}

output "admin_fqdn" {
  description = "FQDN of the Admin subdomain record"
  value       = aws_route53_record.admin.fqdn
}

output "www_fqdn" {
  description = "FQDN of the WWW subdomain record"
  value       = aws_route53_record.www.fqdn
}

