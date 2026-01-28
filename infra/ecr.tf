resource "aws_ecr_repository" "api" {
  name                 = "tentotalenglish-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = { Name = "tentotalenglish-api" }
}

output "ecr_api_repo_url" {
  value = aws_ecr_repository.api.repository_url
}
