variable "api_name" {
  type = string
}

variable "students_lambda_invoke_arn" {
  type = string
}

variable "students_lambda_function_name" {
  type = string
}

variable "groups_lambda_invoke_arn" {
  type = string
}

variable "groups_lambda_function_name" {
  type = string
}

variable "enrollments_lambda_invoke_arn" {
  type = string
}

variable "enrollments_lambda_function_name" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {}
}

variable "payments_lambda_invoke_arn" {
  type = string
}

variable "payments_lambda_function_name" {
  type = string
}