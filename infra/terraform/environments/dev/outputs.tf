output "api_endpoint" {
  value = module.main_api.api_endpoint
}

output "table_name" {
  value = module.dynamodb.table_name
}

output "students_lambda_name" {
  value = module.students_lambda.function_name
}

output "groups_lambda_name" {
  value = module.groups_lambda.function_name
}

output "enrollments_lambda_name" {
  value = module.enrollments_lambda.function_name
}

output "frontend_cdn_domain_name" {
  value = module.frontend_cdn.domain_name
}

output "frontend_cdn_distribution_id" {
  value = module.frontend_cdn.distribution_id
}

output "frontend_cdn_url" {
  value = module.frontend_cdn.url
}