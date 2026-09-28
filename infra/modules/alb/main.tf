resource "aws_lb" "this" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = var.security_group_ids
  subnets            = var.subnet_ids

  enable_deletion_protection = var.enable_deletion_protection

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alb"
  })
}

# Target Groups

# 1. Backend API Target Group
resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-be-tg"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = var.target_type

  health_check {
    enabled             = true
    interval            = 30
    path                = var.backend_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-be-tg"
  })
}

resource "aws_lb_target_group_attachment" "backend" {
  count            = var.target_type == "instance" && var.backend_instance_id != null ? 1 : 0
  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = var.backend_instance_id
  port             = var.backend_port
}

# 2. Next.js Frontend Target Group
resource "aws_lb_target_group" "nextjs" {
  name        = "${var.project_name}-${var.environment}-next-tg"
  port        = var.nextjs_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = var.target_type

  health_check {
    enabled             = true
    interval            = 30
    path                = var.nextjs_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-next-tg"
  })
}

resource "aws_lb_target_group_attachment" "nextjs" {
  count            = var.target_type == "instance" && var.frontend_instance_id != null ? 1 : 0
  target_group_arn = aws_lb_target_group.nextjs.arn
  target_id        = var.frontend_instance_id
  port             = var.nextjs_port
}

# 3. React Admin Dashboard Target Group
resource "aws_lb_target_group" "admin" {
  name        = "${var.project_name}-${var.environment}-admin-tg"
  port        = var.admin_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = var.target_type

  health_check {
    enabled             = true
    interval            = 30
    path                = var.admin_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-admin-tg"
  })
}

resource "aws_lb_target_group_attachment" "admin" {
  count            = var.target_type == "instance" && var.frontend_instance_id != null ? 1 : 0
  target_group_arn = aws_lb_target_group.admin.arn
  target_id        = var.frontend_instance_id
  port             = var.admin_port
}

locals {
  active_listener_arn = var.enable_https ? aws_lb_listener.https[0].arn : aws_lb_listener.http.arn
}

# Listeners

# HTTP Port 80 Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = var.enable_https ? [1] : []
    content {
      type = "redirect"

      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }

  dynamic "default_action" {
    for_each = var.enable_https ? [] : [1]
    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.nextjs.arn
    }
  }

  tags = var.tags
}

# HTTPS Port 443 Listener
resource "aws_lb_listener" "https" {
  count             = var.enable_https ? 1 : 0
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "404 Not Found"
      status_code  = "404"
    }
  }

  tags = var.tags
}

# Routing Rules

# Rule 1: API Subdomain -> Backend Target Group (api.example.com)
resource "aws_lb_listener_rule" "api" {
  listener_arn = local.active_listener_arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    host_header {
      values = ["${var.api_subdomain}.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Rule 1b: API Path-Based Routing (for direct ALB access when no custom domain)
resource "aws_lb_listener_rule" "api_path" {
  count        = var.enable_https ? 0 : 1
  listener_arn = local.active_listener_arn
  priority     = 15

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api", "/api/*", "/health"]
    }
  }

  tags = var.tags
}

# Rule 2: Root Domain -> Next.js Target Group (example.com, www.example.com)
resource "aws_lb_listener_rule" "nextjs" {
  listener_arn = local.active_listener_arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nextjs.arn
  }

  condition {
    host_header {
      values = [
        var.domain_name,
        "www.${var.domain_name}"
      ]
    }
  }

  tags = var.tags
}

# Rule 3: Admin Subdomain -> React Admin Target Group (admin.example.com)
resource "aws_lb_listener_rule" "admin" {
  listener_arn = local.active_listener_arn
  priority     = 30

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }

  condition {
    host_header {
      values = ["${var.admin_subdomain}.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Rule 3b: Admin Path-Based Routing (for direct ALB access when no custom domain)
resource "aws_lb_listener_rule" "admin_path" {
  count        = var.enable_https ? 0 : 1
  listener_arn = local.active_listener_arn
  priority     = 35

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }

  condition {
    path_pattern {
      values = ["/admin", "/admin/*"]
    }
  }

  tags = var.tags
}
