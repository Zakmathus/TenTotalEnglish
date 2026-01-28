# Password random (no lo escribes tú)
resource "random_password" "db" {
  length  = 24
  special = false
}

# Subnet group: RDS debe vivir en subnets privadas
resource "aws_db_subnet_group" "this" {
  name       = "tentotalenglish-db-subnets"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = { Name = "tentotalenglish-db-subnets" }
}

# Secret en Secrets Manager (guardamos credenciales + endpoint)
resource "aws_secretsmanager_secret" "db" {
  name = "tentotalenglish/prod/db"
}

# RDS PostgreSQL (privado)
resource "aws_db_instance" "this" {
  identifier        = "tentotalenglish-prod-db"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = "tentotalenglish"
  username = "appuser"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db.id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = 7
  skip_final_snapshot     = true

  tags = { Name = "tentotalenglish-prod-db" }
}

# Guardamos el secreto completo incluyendo endpoint del RDS
resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = aws_db_instance.this.username
    password = random_password.db.result
    dbname   = aws_db_instance.this.db_name
    host     = aws_db_instance.this.address
    port     = 5432
  })
}

output "db_endpoint" {
  value = aws_db_instance.this.address
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db.arn
}
