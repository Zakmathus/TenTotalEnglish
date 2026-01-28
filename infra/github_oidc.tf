# -------- GitHub OIDC Provider --------
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1"
  ]
}

# 🔧 CAMBIA ESTO:
# "OWNER/REPO" -> ejemplo: "christiansantos/TenTotalEnglish"
locals {
  github_repo = "Zakmathus/TenTotalEnglish"
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Solo permite desde tu repo y branch main
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${local.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "tentotalenglish-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

# -------- Permissions (ECR + ECS + S3 + CloudFront) --------
data "aws_iam_policy_document" "github_actions_permissions" {
  # ECR push/pull
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer"
    ]
    resources = ["*"]
  }

  # ECS deploy (update service + register task def)
  statement {
    actions = [
      "ecs:DescribeServices",
      "ecs:UpdateService",
      "ecs:DescribeTaskDefinition",
      "ecs:RegisterTaskDefinition",
      "ecs:ListTaskDefinitions",
      "ecs:TagResource"
    ]
    resources = ["*"]
  }

  # PassRole para que ECS use el execution role que ya creamos
  statement {
    actions = ["iam:PassRole"]
    resources = [aws_iam_role.ecs_task_execution.arn]
  }

  # S3 upload (frontend)
  statement {
    actions = [
      "s3:ListBucket"
    ]
    resources = [aws_s3_bucket.frontend.arn]
  }

  statement {
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObject"
    ]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
  }

  # CloudFront invalidation
  statement {
    actions = [
      "cloudfront:CreateInvalidation"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "github_actions_inline" {
  name   = "tentotalenglish-github-actions-policy"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions_permissions.json
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}
