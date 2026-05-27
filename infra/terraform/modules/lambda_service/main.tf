resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = var.role_arn
  runtime       = "dotnet8"
  handler       = var.handler
  filename      = var.package_file
  source_code_hash = filebase64sha256(var.package_file)

  memory_size = 512
  timeout     = 15

  environment {
    variables = {
      TABLE_NAME = var.table_name
    }
  }

  tags = var.tags
}