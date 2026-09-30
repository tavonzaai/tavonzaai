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

# 2. AI Target Group
resource "aws_lb_target_group" "ai" {
  name        = "${var.project_name}-${var.environment}-ai-tg"
  port        = var.ai_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = var.target_type

  health_check {
    enabled             = true
    interval            = 30
    path                = var.ai_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ai-tg"
  })
}

resource "aws_lb_target_group_attachment" "ai" {
  count            = var.target_type == "instance" && (var.ai_instance_id != null || var.backend_instance_id != null) ? 1 : 0
  target_group_arn = aws_lb_target_group.ai.arn
  target_id        = coalesce(var.ai_instance_id, var.backend_instance_id)
  port             = var.ai_port
}

# 3. Next.js Customer Frontend Target Group
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

# 4. Kitchen Frontend Target Group
resource "aws_lb_target_group" "kitchen" {
  name        = "${var.project_name}-${var.environment}-kit-tg"
  port        = var.kitchen_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = var.target_type

  health_check {
    enabled             = true
    interval            = 30
    path                = var.kitchen_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-kit-tg"
  })
}

resource "aws_lb_target_group_attachment" "kitchen" {
  count            = var.target_type == "instance" && (var.kitchen_instance_id != null || var.frontend_instance_id != null) ? 1 : 0
  target_group_arn = aws_lb_target_group.kitchen.arn
  target_id        = coalesce(var.kitchen_instance_id, var.frontend_instance_id)
  port             = var.kitchen_port
}

# 5. Cashier Frontend Target Group
resource "aws_lb_target_group" "cashier" {
  name        = "${var.project_name}-${var.environment}-cash-tg"
  port        = var.cashier_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = var.target_type

  health_check {
    enabled             = true
    interval            = 30
    path                = var.cashier_health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-cash-tg"
  })
}

resource "aws_lb_target_group_attachment" "cashier" {
  count            = var.target_type == "instance" && (var.cashier_instance_id != null || var.frontend_instance_id != null) ? 1 : 0
  target_group_arn = aws_lb_target_group.cashier.arn
  target_id        = coalesce(var.cashier_instance_id, var.frontend_instance_id)
  port             = var.cashier_port
}

# 6. React Admin Dashboard Target Group
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

# Rule 2: AI Subdomain -> AI Target Group (ai.example.com)
resource "aws_lb_listener_rule" "ai" {
  listener_arn = local.active_listener_arn
  priority     = 15

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ai.arn
  }

  condition {
    host_header {
      values = ["${var.ai_subdomain}.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Rule 3: Kitchen Subdomain -> Kitchen Target Group (kitchen.example.com)
resource "aws_lb_listener_rule" "kitchen" {
  listener_arn = local.active_listener_arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.kitchen.arn
  }

  condition {
    host_header {
      values = ["${var.kitchen_subdomain}.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Rule 4: Cashier Subdomain -> Cashier Target Group (cashier.example.com)
resource "aws_lb_listener_rule" "cashier" {
  listener_arn = local.active_listener_arn
  priority     = 25

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cashier.arn
  }

  condition {
    host_header {
      values = ["${var.cashier_subdomain}.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Rule 5: Admin Subdomain -> React Admin Target Group (admin.example.com)
resource "aws_lb_listener_rule" "admin" {
  count        = var.admin_subdomain != "" ? 1 : 0
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

# Rule 6: Customer Root Domain -> Next.js Target Group (example.com, www.example.com)
resource "aws_lb_listener_rule" "customer" {
  listener_arn = local.active_listener_arn
  priority     = 40

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

# --- Optional Path-Based Fallbacks for Direct ALB Access (when enable_https is false) ---

resource "aws_lb_listener_rule" "api_path" {
  count        = var.enable_https ? 0 : 1
  listener_arn = local.active_listener_arn
  priority     = 50

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

resource "aws_lb_listener_rule" "ai_path" {
  count        = var.enable_https ? 0 : 1
  listener_arn = local.active_listener_arn
  priority     = 55

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ai.arn
  }

  condition {
    path_pattern {
      values = ["/ai", "/ai/*"]
    }
  }

  tags = var.tags
}

resource "aws_lb_listener_rule" "kitchen_path" {
  count        = var.enable_https ? 0 : 1
  listener_arn = local.active_listener_arn
  priority     = 60

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.kitchen.arn
  }

  condition {
    path_pattern {
      values = ["/kitchen", "/kitchen/*"]
    }
  }

  tags = var.tags
}

resource "aws_lb_listener_rule" "cashier_path" {
  count        = var.enable_https ? 0 : 1
  listener_arn = local.active_listener_arn
  priority     = 65

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cashier.arn
  }

  condition {
    path_pattern {
      values = ["/cashier", "/cashier/*"]
    }
  }

  tags = var.tags
}

resource "aws_lb_listener_rule" "admin_path" {
  count        = var.enable_https ? 0 : (var.admin_subdomain != "" ? 1 : 0)
  listener_arn = local.active_listener_arn
  priority     = 70

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
