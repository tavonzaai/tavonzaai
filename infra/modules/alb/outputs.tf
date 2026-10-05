output "alb_id" {
  description = "The ID of the Load Balancer"
  value       = aws_lb.this.id
}

output "alb_arn" {
  description = "The ARN of the Load Balancer"
  value       = aws_lb.this.arn
}

output "alb_dns_name" {
  description = "The DNS name of the Load Balancer"
  value       = aws_lb.this.dns_name
}

output "alb_zone_id" {
  description = "The canonical hosted zone ID of the Load Balancer"
  value       = aws_lb.this.zone_id
}

output "http_listener_arn" {
  description = "The ARN of the HTTP listener"
  value       = aws_lb_listener.http.arn
}

output "https_listener_arn" {
  description = "The ARN of the HTTPS listener (null if enable_https is false)"
  value       = var.enable_https && length(aws_lb_listener.https) > 0 ? aws_lb_listener.https[0].arn : null
}

output "backend_target_group_arn" {
  description = "ARN of the Backend API target group"
  value       = aws_lb_target_group.backend.arn
}

output "ai_target_group_arn" {
  description = "ARN of the AI FastAPI service target group"
  value       = aws_lb_target_group.ai.arn
}

output "customer_target_group_arn" {
  description = "ARN of the Customer frontend target group"
  value       = aws_lb_target_group.nextjs.arn
}

output "nextjs_target_group_arn" {
  description = "ARN of the Next.js target group (alias for customer)"
  value       = aws_lb_target_group.nextjs.arn
}

output "kitchen_target_group_arn" {
  description = "ARN of the Kitchen frontend target group"
  value       = aws_lb_target_group.kitchen.arn
}

output "cashier_target_group_arn" {
  description = "ARN of the Cashier frontend target group"
  value       = aws_lb_target_group.cashier.arn
}

output "admin_target_group_arn" {
  description = "ARN of the Admin dashboard target group"
  value       = aws_lb_target_group.admin.arn
}

output "manager_target_group_arn" {
  description = "ARN of the Manager frontend target group"
  value       = aws_lb_target_group.manager.arn
}

output "waiter_target_group_arn" {
  description = "ARN of the Waiter frontend target group"
  value       = aws_lb_target_group.waiter.arn
}

