# ==============================================================================
# Amazon Elastic Container Service (ECS) Cluster & Capacity Providers
# ==============================================================================
resource "aws_ecs_cluster" "this" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-cluster"
  })
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name = aws_ecs_cluster.this.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = var.use_fargate_spot ? "FARGATE_SPOT" : "FARGATE"
    weight            = 1
    base              = 0
  }
}

# ==============================================================================
# IAM Roles: ECS Task Execution Role & Task Application Role
# ==============================================================================
data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Execution Role: Used by the ECS agent to pull images and push logs
resource "aws_iam_role" "execution" {
  name               = "${var.project_name}-${var.environment}-ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ecs-execution-role"
  })
}

resource "aws_iam_role_policy_attachment" "execution_standard" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "execution_secrets" {
  count = var.enable_secrets_manager_access ? 1 : 0

  statement {
    sid    = "SecretsManagerReadForEnvInjection"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = [var.secrets_manager_arn]
  }
}

resource "aws_iam_policy" "execution_secrets" {
  count       = var.enable_secrets_manager_access ? 1 : 0
  name        = "${var.project_name}-${var.environment}-ecs-execution-secrets"
  description = "Allows ECS agent to retrieve secrets from Secrets Manager for container environment injection"
  policy      = data.aws_iam_policy_document.execution_secrets[0].json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "execution_secrets" {
  count      = var.enable_secrets_manager_access ? 1 : 0
  role       = aws_iam_role.execution.name
  policy_arn = aws_iam_policy.execution_secrets[0].arn
}

# Task Role: Used by the containerized application itself at runtime
resource "aws_iam_role" "task" {
  name               = "${var.project_name}-${var.environment}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-ecs-task-role"
  })
}

data "aws_iam_policy_document" "task_s3" {
  count = var.enable_s3_access ? 1 : 0

  statement {
    sid    = "S3BucketAccess"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = [var.s3_bucket_arn]
  }

  statement {
    sid    = "S3ObjectAccess"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = ["${var.s3_bucket_arn}/*"]
  }
}

resource "aws_iam_policy" "task_s3" {
  count       = var.enable_s3_access ? 1 : 0
  name        = "${var.project_name}-${var.environment}-ecs-task-s3"
  description = "Allows ECS containers to access designated S3 storage bucket"
  policy      = data.aws_iam_policy_document.task_s3[0].json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "task_s3" {
  count      = var.enable_s3_access ? 1 : 0
  role       = aws_iam_role.task.name
  policy_arn = aws_iam_policy.task_s3[0].arn
}

data "aws_iam_policy_document" "task_secrets" {
  count = var.enable_secrets_manager_access ? 1 : 0

  statement {
    sid    = "SecretsManagerReadAtRuntime"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = [var.secrets_manager_arn]
  }
}

resource "aws_iam_policy" "task_secrets" {
  count       = var.enable_secrets_manager_access ? 1 : 0
  name        = "${var.project_name}-${var.environment}-ecs-task-secrets"
  description = "Allows ECS containers to read application secrets at runtime"
  policy      = data.aws_iam_policy_document.task_secrets[0].json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "task_secrets" {
  count      = var.enable_secrets_manager_access ? 1 : 0
  role       = aws_iam_role.task.name
  policy_arn = aws_iam_policy.task_secrets[0].arn
}

# ECS Exec: Enable SSM interactive container debugging
data "aws_iam_policy_document" "task_ssm" {
  statement {
    sid    = "ECSExecSessionManager"
    effect = "Allow"
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "task_ssm" {
  name        = "${var.project_name}-${var.environment}-ecs-task-ssm"
  description = "Enables AWS ECS Exec interactive debugging inside containers"
  policy      = data.aws_iam_policy_document.task_ssm.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "task_ssm" {
  role       = aws_iam_role.task.name
  policy_arn = aws_iam_policy.task_ssm.arn
}

# ==============================================================================
# CloudWatch Log Groups for each ECS Service
# ==============================================================================
resource "aws_cloudwatch_log_group" "services" {
  for_each          = var.services
  name              = "/ecs/${var.project_name}-${var.environment}/${each.key}"
  retention_in_days = var.log_retention_days

  tags = merge(var.tags, {
    Name    = "/ecs/${var.project_name}-${var.environment}/${each.key}"
    Service = each.key
  })
}

# ==============================================================================
# ECS Task Definitions
# ==============================================================================
resource "aws_ecs_task_definition" "services" {
  for_each                 = var.services
  family                   = "${var.project_name}-${var.environment}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(coalesce(each.value.cpu, 256))
  memory                   = tostring(coalesce(each.value.memory, 512))
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = each.value.name
      image     = each.value.container_image
      essential = true

      portMappings = each.value.container_port != null ? [
        {
          containerPort = each.value.container_port
          hostPort      = each.value.container_port
          protocol      = "tcp"
        }
      ] : []

      environment = coalesce(each.value.environment, [])
      secrets     = coalesce(each.value.secrets, [])
      command     = each.value.command

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.services[each.key].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = merge(var.tags, {
    Name    = "${var.project_name}-${var.environment}-${each.key}-task"
    Service = each.key
  })
}

# ==============================================================================
# ECS Services
# ==============================================================================
resource "aws_ecs_service" "services" {
  for_each        = var.services
  name            = "${var.project_name}-${var.environment}-${each.key}"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = coalesce(each.value.desired_count, 1)

  capacity_provider_strategy {
    capacity_provider = var.use_fargate_spot ? "FARGATE_SPOT" : "FARGATE"
    weight            = 1
    base              = 0
  }

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = var.assign_public_ip
  }

  dynamic "load_balancer" {
    for_each = each.value.target_group_arn != null && each.value.target_group_arn != "" ? [1] : []
    content {
      target_group_arn = each.value.target_group_arn
      container_name   = each.value.name
      container_port   = each.value.container_port
    }
  }

  enable_execute_command = true

  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = merge(var.tags, {
    Name    = "${var.project_name}-${var.environment}-${each.key}-service"
    Service = each.key
  })
}
