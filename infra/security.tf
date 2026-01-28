# SG del backend (ECS): SOLO recibe 8080 desde el ALB
resource "aws_security_group" "api" {
  name        = "tentotalenglish-api-sg"
  description = "Security group for API (ECS tasks)"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "tentotalenglish-api-sg" }
}

# SG de la DB (RDS): SOLO recibe 5432 desde el API
resource "aws_security_group" "db" {
  name        = "tentotalenglish-db-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "tentotalenglish-db-sg" }
}
