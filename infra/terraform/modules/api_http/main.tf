resource "aws_apigatewayv2_api" "this" {
  name          = var.api_name
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["content-type", "authorization"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins = ["*"]
    max_age       = 300
  }

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "students_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.students_lambda_invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "groups_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.groups_lambda_invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "enrollments_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.enrollments_lambda_invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "payments" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.payments_lambda_invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "post_payments" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /payments"
  target    = "integrations/${aws_apigatewayv2_integration.payments.id}"
}

resource "aws_apigatewayv2_route" "get_student_payments" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /students/{id}/payments"
  target    = "integrations/${aws_apigatewayv2_integration.payments.id}"
}

resource "aws_apigatewayv2_route" "get_pending_payments" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /payments/pending"
  target    = "integrations/${aws_apigatewayv2_integration.payments.id}"
}

resource "aws_apigatewayv2_route" "get_student" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /students/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.students_lambda.id}"
}

resource "aws_apigatewayv2_route" "get_students" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /students"
  target    = "integrations/${aws_apigatewayv2_integration.students_lambda.id}"
}

resource "aws_apigatewayv2_route" "create_student" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /students"
  target    = "integrations/${aws_apigatewayv2_integration.students_lambda.id}"
}

resource "aws_apigatewayv2_route" "get_group" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /groups/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.groups_lambda.id}"
}

resource "aws_apigatewayv2_route" "create_group" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /groups"
  target    = "integrations/${aws_apigatewayv2_integration.groups_lambda.id}"
}

resource "aws_apigatewayv2_route" "get_groups" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /groups"
  target    = "integrations/${aws_apigatewayv2_integration.groups_lambda.id}"
}

resource "aws_apigatewayv2_route" "create_enrollment" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /enrollments"
  target    = "integrations/${aws_apigatewayv2_integration.enrollments_lambda.id}"
}

resource "aws_apigatewayv2_route" "get_active_enrollment" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /students/{id}/active-enrollment"
  target    = "integrations/${aws_apigatewayv2_integration.enrollments_lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_apigw_students" {
  statement_id  = "AllowExecutionFromApiGatewayStudents"
  action        = "lambda:InvokeFunction"
  function_name = var.students_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_apigw_groups" {
  statement_id  = "AllowExecutionFromApiGatewayGroups"
  action        = "lambda:InvokeFunction"
  function_name = var.groups_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_apigw_enrollments" {
  statement_id  = "AllowExecutionFromApiGatewayEnrollments"
  action        = "lambda:InvokeFunction"
  function_name = var.enrollments_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_payments" {
  statement_id  = "AllowExecutionFromApiGatewayPayments"
  action        = "lambda:InvokeFunction"
  function_name = var.payments_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}