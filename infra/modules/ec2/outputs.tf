output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.this.id
}

output "arn" {
  description = "The ARN of the EC2 instance"
  value       = aws_instance.this.arn
}

output "private_ip" {
  description = "The private IP address of the EC2 instance"
  value       = aws_instance.this.private_ip
}

output "public_ip" {
  description = "The public IP address of the EC2 instance (EIP if assigned, otherwise instance public IP)"
  value       = var.assign_eip && length(aws_eip.this) > 0 ? aws_eip.this[0].public_ip : aws_instance.this.public_ip
}

output "eip" {
  description = "The Elastic IP address associated with the EC2 instance (if enabled)"
  value       = var.assign_eip && length(aws_eip.this) > 0 ? aws_eip.this[0].public_ip : null
}

output "eip_allocation_id" {
  description = "The Allocation ID of the Elastic IP (if enabled)"
  value       = var.assign_eip && length(aws_eip.this) > 0 ? aws_eip.this[0].id : null
}

output "instance_name" {
  description = "The name of the EC2 instance"
  value       = var.instance_name
}

