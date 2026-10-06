# Security Group: Application Load Balancer (ALB)
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for public-facing Application Load Balancer"
  vpc_id      = var.vpc_id

  # ---------------------------------------------------------------------------
  # TODO: Testing Stage - Currently restricting access to whitelisted IPs.
  # Once testing is complete (in 7-10 days), we set
  # `alb_ingress_cidr_blocks = ["0.0.0.0/0"]` in our terraform.tfvars,
  # or uncomment the original public ingress block below.
  # ---------------------------------------------------------------------------
  # # [ORIGINAL PUBLIC INGRESS CONFIGURATION]
  # ingress {
  #   description      = "Allow HTTP inbound from anywhere"
  #   from_port        = 80
  #   to_port          = 80
  #   protocol         = "tcp"
  #   cidr_blocks      = ["0.0.0.0/0"]
  #   ipv6_cidr_blocks = ["::/0"]
  # }
  #
  # ingress {
  #   description      = "Allow HTTPS inbound from anywhere"
  #   from_port        = 443
  #   to_port          = 443
  #   protocol         = "tcp"
  #   cidr_blocks      = ["0.0.0.0/0"]
  #   ipv6_cidr_blocks = ["::/0"]
  # }

  # [ACTIVE WHITELIST INGRESS CONFIGURATION]
  ingress {
    description = "Allow HTTP inbound from whitelisted CIDRs"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.alb_ingress_cidr_blocks
  }

  ingress {
    description = "Allow HTTPS inbound from whitelisted CIDRs"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.alb_ingress_cidr_blocks
  }

  egress {
    description = "Allow all outbound traffic from ALB to targets"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  })
}

# Security Group: Backend EC2 Instance
resource "aws_security_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend-sg"
  description = "Security group for Backend EC2 instance running API docker container"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-backend-sg"
  })
}

# Allow traffic to Backend app only from the ALB security group
resource "aws_security_group_rule" "backend_ingress_from_alb" {
  type                     = "ingress"
  description              = "Allow Backend API traffic from ALB SG only"
  from_port                = var.backend_port
  to_port                  = var.backend_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.backend.id
}

# Allow AI service traffic from ALB SG to Backend host
resource "aws_security_group_rule" "backend_ingress_ai_from_alb" {
  type                     = "ingress"
  description              = "Allow AI service traffic from ALB SG to Backend host"
  from_port                = var.ai_port
  to_port                  = var.ai_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.backend.id
}

# Allow outbound traffic for package manager, docker registries, SSM, S3, Secrets Manager
resource "aws_security_group_rule" "backend_egress_all" {
  type              = "egress"
  description       = "Allow outbound traffic for OS updates, Docker, SSM, and AWS APIs"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.backend.id
}

# Security Group: Frontend EC2 Instance
resource "aws_security_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-frontend-sg"
  description = "Security group for Frontend EC2 instance running Next.js, Kitchen, Cashier, and Admin containers"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-frontend-sg"
  })
}

# Allow Next.js Customer traffic from ALB security group only
resource "aws_security_group_rule" "frontend_ingress_nextjs_from_alb" {
  type                     = "ingress"
  description              = "Allow Next.js Customer traffic from ALB SG only"
  from_port                = var.nextjs_port
  to_port                  = var.nextjs_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.frontend.id
}

# Allow Kitchen frontend traffic from ALB security group only
resource "aws_security_group_rule" "frontend_ingress_kitchen_from_alb" {
  type                     = "ingress"
  description              = "Allow Kitchen frontend traffic from ALB SG only"
  from_port                = var.kitchen_port
  to_port                  = var.kitchen_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.frontend.id
}

# Allow Cashier frontend traffic from ALB security group only
resource "aws_security_group_rule" "frontend_ingress_cashier_from_alb" {
  type                     = "ingress"
  description              = "Allow Cashier frontend traffic from ALB SG only"
  from_port                = var.cashier_port
  to_port                  = var.cashier_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.frontend.id
}

# Allow React Admin traffic from ALB security group only
resource "aws_security_group_rule" "frontend_ingress_admin_from_alb" {
  type                     = "ingress"
  description              = "Allow React Admin traffic from ALB SG only"
  from_port                = var.admin_port
  to_port                  = var.admin_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.frontend.id
}

# Allow Manager frontend traffic from ALB security group only
resource "aws_security_group_rule" "frontend_ingress_manager_from_alb" {
  type                     = "ingress"
  description              = "Allow Manager frontend traffic from ALB SG only"
  from_port                = var.manager_port
  to_port                  = var.manager_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.frontend.id
}

# Allow Waiter frontend traffic from ALB security group only
resource "aws_security_group_rule" "frontend_ingress_waiter_from_alb" {
  type                     = "ingress"
  description              = "Allow Waiter frontend traffic from ALB SG only"
  from_port                = var.waiter_port
  to_port                  = var.waiter_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.frontend.id
}

# Allow outbound traffic for package manager, docker registries, SSM, and AWS APIs
resource "aws_security_group_rule" "frontend_egress_all" {
  type              = "egress"
  description       = "Allow outbound traffic for OS updates, Docker, SSM, and AWS APIs"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.frontend.id
}

# Security Group: RDS PostgreSQL Database
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for RDS PostgreSQL database"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  })
}

# Allow PostgreSQL traffic only from Backend EC2 security group
resource "aws_security_group_rule" "rds_ingress_from_backend" {
  type                     = "ingress"
  description              = "Allow PostgreSQL access strictly from Backend EC2 SG"
  from_port                = var.postgres_port
  to_port                  = var.postgres_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.backend.id
  security_group_id        = aws_security_group.rds.id
}

# Allow PostgreSQL traffic from public Internet when allow_public_rds is true
resource "aws_security_group_rule" "rds_ingress_public" {
  count             = var.allow_public_rds ? 1 : 0
  type              = "ingress"
  description       = "Allow PostgreSQL access from the public Internet"
  from_port         = var.postgres_port
  to_port           = var.postgres_port
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.rds.id
}

# Security Group: ElastiCache Redis / Valkey
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-${var.environment}-redis-sg"
  description = "Security group for ElastiCache Redis / Valkey cache"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-redis-sg"
  })
}

# Allow Redis traffic only from Backend EC2 security group
resource "aws_security_group_rule" "redis_ingress_from_backend" {
  type                     = "ingress"
  description              = "Allow Redis / Valkey access strictly from Backend EC2 SG"
  from_port                = var.redis_port
  to_port                  = var.redis_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.backend.id
  security_group_id        = aws_security_group.redis.id
}

# ==============================================================================
# Security Group: Amazon ECS Tasks
# ==============================================================================
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-${var.environment}-ecs-sg"
  description = "Security group for ECS tasks running in private application subnets"
  vpc_id      = var.vpc_id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ecs-sg"
  })
}

# Allow Backend API traffic from ALB SG to ECS tasks
resource "aws_security_group_rule" "ecs_ingress_backend_from_alb" {
  type                     = "ingress"
  description              = "Allow Backend API traffic from ALB SG to ECS tasks"
  from_port                = var.backend_port
  to_port                  = var.backend_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

# Allow Next.js traffic from ALB SG to ECS tasks
resource "aws_security_group_rule" "ecs_ingress_nextjs_from_alb" {
  type                     = "ingress"
  description              = "Allow Next.js traffic from ALB SG to ECS tasks"
  from_port                = var.nextjs_port
  to_port                  = var.nextjs_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

# Allow React Admin traffic from ALB SG to ECS tasks
resource "aws_security_group_rule" "ecs_ingress_admin_from_alb" {
  type                     = "ingress"
  description              = "Allow React Admin traffic from ALB SG to ECS tasks"
  from_port                = var.admin_port
  to_port                  = var.admin_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

# Allow AI service traffic from ALB SG to ECS tasks
resource "aws_security_group_rule" "ecs_ingress_ai_from_alb" {
  type                     = "ingress"
  description              = "Allow AI service traffic from ALB SG to ECS tasks"
  from_port                = var.ai_port
  to_port                  = var.ai_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

# Allow Kitchen frontend traffic from ALB SG to ECS tasks
resource "aws_security_group_rule" "ecs_ingress_kitchen_from_alb" {
  type                     = "ingress"
  description              = "Allow Kitchen frontend traffic from ALB SG to ECS tasks"
  from_port                = var.kitchen_port
  to_port                  = var.kitchen_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

# Allow Cashier frontend traffic from ALB SG to ECS tasks
resource "aws_security_group_rule" "ecs_ingress_cashier_from_alb" {
  type                     = "ingress"
  description              = "Allow Cashier frontend traffic from ALB SG to ECS tasks"
  from_port                = var.cashier_port
  to_port                  = var.cashier_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

# Allow Manager frontend traffic from ALB SG to ECS tasks
resource "aws_security_group_rule" "ecs_ingress_manager_from_alb" {
  type                     = "ingress"
  description              = "Allow Manager frontend traffic from ALB SG to ECS tasks"
  from_port                = var.manager_port
  to_port                  = var.manager_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
}

# Allow inter-service communication within the ECS cluster
resource "aws_security_group_rule" "ecs_ingress_self" {
  type              = "ingress"
  description       = "Allow internal traffic between containers in the ECS cluster"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  self              = true
  security_group_id = aws_security_group.ecs.id
}

# Allow outbound traffic for ECS tasks (pulling images, AWS APIs, NAT Gateway)
resource "aws_security_group_rule" "ecs_egress_all" {
  type              = "egress"
  description       = "Allow all outbound traffic from ECS tasks"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.ecs.id
}

# Allow PostgreSQL traffic from ECS SG to RDS
resource "aws_security_group_rule" "rds_ingress_from_ecs" {
  type                     = "ingress"
  description              = "Allow PostgreSQL access from ECS SG"
  from_port                = var.postgres_port
  to_port                  = var.postgres_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
  security_group_id        = aws_security_group.rds.id
}

# Allow Redis / Valkey traffic from ECS SG to ElastiCache
resource "aws_security_group_rule" "redis_ingress_from_ecs" {
  type                     = "ingress"
  description              = "Allow Redis / Valkey access from ECS SG"
  from_port                = var.redis_port
  to_port                  = var.redis_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
  security_group_id        = aws_security_group.redis.id
}

