output "root_fqdn" {
  description = "FQDN of the root domain record (Customer frontend)"
  value       = length(aws_route53_record.root) > 0 ? aws_route53_record.root[0].fqdn : null
}

output "api_fqdn" {
  description = "FQDN of the API subdomain record"
  value       = aws_route53_record.api.fqdn
}

output "ai_fqdn" {
  description = "FQDN of the AI subdomain record"
  value       = aws_route53_record.ai.fqdn
}

output "kitchen_fqdn" {
  description = "FQDN of the Kitchen subdomain record"
  value       = aws_route53_record.kitchen.fqdn
}

output "cashier_fqdn" {
  description = "FQDN of the Cashier subdomain record"
  value       = aws_route53_record.cashier.fqdn
}

output "admin_fqdn" {
  description = "FQDN of the Admin subdomain record"
  value       = length(aws_route53_record.admin) > 0 ? aws_route53_record.admin[0].fqdn : null
}

output "manager_fqdn" {
  description = "FQDN of the Manager subdomain record"
  value       = length(aws_route53_record.manager) > 0 ? aws_route53_record.manager[0].fqdn : null
}

output "waiter_fqdn" {
  description = "FQDN of the Waiter subdomain record"
  value       = length(aws_route53_record.waiter) > 0 ? aws_route53_record.waiter[0].fqdn : null
}

output "www_fqdn" {
  description = "FQDN of the WWW subdomain record"
  value       = length(aws_route53_record.www) > 0 ? aws_route53_record.www[0].fqdn : null
}

output "customer_fqdn" {
  description = "FQDN of the Customer frontend record (subdomain or root)"
  value       = length(aws_route53_record.customer) > 0 ? aws_route53_record.customer[0].fqdn : (length(aws_route53_record.root) > 0 ? aws_route53_record.root[0].fqdn : null)
}


