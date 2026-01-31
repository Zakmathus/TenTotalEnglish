# ---------- Secrets para la API (JWT + ConnectionString) ----------
resource "random_password" "jwt_key" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "api" {
  name = "tentotalenglish/prod/api"
}

resource "aws_secretsmanager_secret_version" "api" {
  secret_id = aws_secretsmanager_secret.api.id
  secret_string = jsonencode({
    ConnectionStrings__Postgres = "Host=${aws_db_instance.this.address};Port=5432;Database=${aws_db_instance.this.db_name};Username=${aws_db_instance.this.username};Password=${random_password.db.result}"
    Jwt__Issuer                 = "tentotalenglish"
    Jwt__Audience               = "tentotalenglish-admin"
    Jwt__Key                    = random_password.jwt_key.result
  })
}

# ---------- Logs ----------
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/tentotalenglish-api"
  retention_in_days = 14
}

# ---------- IAM Role (ECS Task Execution) ----------
data "aws_iam_policy_document" "ecs_task_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "tentotalenglish-ecs-task-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_exec_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Permitir leer secretos (DB + API)
data "aws_iam_policy_document" "secrets_read" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue",
      "kms:Decrypt"
    ]
    resources = [
      aws_secretsmanager_secret.db.arn,
      aws_secretsmanager_secret.api.arn
    ]
  }
}

resource "aws_iam_role_policy" "ecs_task_secrets_read" {
  name   = "tentotalenglish-ecs-secrets-read"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.secrets_read.json
}

# ---------- ALB SG ----------
resource "aws_security_group" "alb" {
  name        = "tentotalenglish-alb-sg"
  description = "ALB public SG"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "tentotalenglish-alb-sg" }
}

# ---------- ALB ----------
resource "aws_lb" "api" {
  name               = "tentotalenglish-api-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = { Name = "tentotalenglish-api-alb" }
}

resource "aws_lb_target_group" "api" {
  name        = "tentotalenglish-api-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.this.id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 15
    timeout             = 5
    matcher             = "200-399"
  }

  tags = { Name = "tentotalenglish-api-tg" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.api.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = "arn:aws:acm:us-west-2:585008064636:certificate/18999342-1cf4-46d8-a4f8-25c7832b5309"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}


# ---------- ECS ----------
resource "aws_ecs_cluster" "this" {
  name = "tentotalenglish-prod"
}

# Repo URL desde ECR creado en Paso 6
resource "aws_ecs_task_definition" "api" {
  family                   = "tentotalenglish-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${aws_ecr_repository.api.repository_url}:prod"
      essential = true
      portMappings = [
        { containerPort = 8080, hostPort = 8080, protocol = "tcp" }
      ],
      environment = [
        { name = "ASPNETCORE_ENVIRONMENT", value = "Production" }
      ],
      secrets = [
        { name = "ConnectionStrings__Postgres", valueFrom = "${aws_secretsmanager_secret.api.arn}:ConnectionStrings__Postgres::" },
        { name = "Jwt__Issuer", valueFrom = "${aws_secretsmanager_secret.api.arn}:Jwt__Issuer::" },
        { name = "Jwt__Audience", valueFrom = "${aws_secretsmanager_secret.api.arn}:Jwt__Audience::" },
        { name = "Jwt__Key", valueFrom = "${aws_secretsmanager_secret.api.arn}:Jwt__Key::" }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name,
          awslogs-region        = "us-west-2",
          awslogs-stream-prefix = "api"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "tentotalenglish-api"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.http]
}

output "api_alb_dns" {
  value = aws_lb.api.dns_name
}
