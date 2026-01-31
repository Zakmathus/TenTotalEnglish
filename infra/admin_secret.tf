resource "aws_secretsmanager_secret" "admin" {
  name = "tentotalenglish/prod/admin"
}

output "admin_secret_arn" {
  value = aws_secretsmanager_secret.admin.arn
}
