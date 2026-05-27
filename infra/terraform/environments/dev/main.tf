locals {
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

module "dynamodb" {
  source     = "../../modules/dynamodb_table"
  table_name = "${var.project}-${var.environment}-main"
  tags       = local.common_tags
}

module "students_lambda_role" {
  source    = "../../modules/iam_lambda_role"
  role_name = "${var.project}-${var.environment}-students-role"
  table_arn = module.dynamodb.table_arn
  tags      = local.common_tags
}

module "students_lambda" {
  source        = "../../modules/lambda_service"
  function_name = "${var.project}-${var.environment}-students-service"
  role_arn      = module.students_lambda_role.role_arn
  handler       = "TenTotalEnglish.Students.Api::TenTotalEnglish.Students.Api.Handlers.Function::FunctionHandler"
  package_file  = "../../../../artifacts/tte-students-service.zip"
  table_name    = module.dynamodb.table_name
  tags          = local.common_tags
}

module "groups_lambda_role" {
  source    = "../../modules/iam_lambda_role"
  role_name = "${var.project}-${var.environment}-groups-role"
  table_arn = module.dynamodb.table_arn
  tags      = local.common_tags
}

module "groups_lambda" {
  source        = "../../modules/lambda_service"
  function_name = "${var.project}-${var.environment}-groups-service"
  role_arn      = module.groups_lambda_role.role_arn
  handler       = "TenTotalEnglish.Groups.Api::TenTotalEnglish.Groups.Api.Handlers.Function::FunctionHandler"
  package_file  = "../../../../artifacts/tte-groups-service.zip"
  table_name    = module.dynamodb.table_name
  tags          = local.common_tags
}

module "enrollments_lambda_role" {
  source    = "../../modules/iam_lambda_role"
  role_name = "${var.project}-${var.environment}-enrollments-role"
  table_arn = module.dynamodb.table_arn
  tags      = local.common_tags
}

module "payments_lambda_role" {
  source    = "../../modules/iam_lambda_role"
  role_name = "${var.project}-${var.environment}-payments-role"
  table_arn = module.dynamodb.table_arn
  tags      = local.common_tags
}

module "enrollments_lambda" {
  source        = "../../modules/lambda_service"
  function_name = "${var.project}-${var.environment}-enrollments-service"
  role_arn      = module.enrollments_lambda_role.role_arn
  handler       = "TenTotalEnglish.Enrollments.Api::TenTotalEnglish.Enrollments.Api.Handlers.Function::FunctionHandler"
  package_file  = "../../../../artifacts/tte-enrollments-service.zip"
  table_name    = module.dynamodb.table_name
  tags          = local.common_tags
}

module "payments_lambda" {
  source        = "../../modules/lambda_service"
  function_name = "${var.project}-${var.environment}-payments-service"
  role_arn      = module.payments_lambda_role.role_arn
  handler       = "TenTotalEnglish.Payments.Api::TenTotalEnglish.Payments.Api.Handlers.Function::FunctionHandler"
  package_file  = "../../../../artifacts/tte-payments-service.zip"
  table_name    = module.dynamodb.table_name
  tags          = local.common_tags
}

module "main_api" {
  source                           = "../../modules/api_http"
  api_name                         = "${var.project}-${var.environment}-main-api"
  students_lambda_invoke_arn       = module.students_lambda.invoke_arn
  students_lambda_function_name    = module.students_lambda.function_name
  groups_lambda_invoke_arn         = module.groups_lambda.invoke_arn
  groups_lambda_function_name      = module.groups_lambda.function_name
  enrollments_lambda_invoke_arn    = module.enrollments_lambda.invoke_arn
  enrollments_lambda_function_name = module.enrollments_lambda.function_name
  payments_lambda_invoke_arn       = module.payments_lambda.invoke_arn
  payments_lambda_function_name    = module.payments_lambda.function_name
  tags                             = local.common_tags
}

module "frontend_static_site" {
  source      = "../../modules/frontend_static_site"
  bucket_name = "${var.project}-${var.environment}-web-001"
  project     = var.project
  environment = var.environment
  tags        = local.common_tags
}

module "frontend_cdn" {
  source             = "../../modules/frontend_cdn"
  project            = var.project
  environment        = var.environment
  origin_domain_name = module.frontend_static_site.website_endpoint
  tags               = local.common_tags
}