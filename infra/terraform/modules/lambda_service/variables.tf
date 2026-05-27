variable "function_name" {
  type = string
}

variable "role_arn" {
  type = string
}

variable "handler" {
  type = string
}

variable "package_file" {
  type = string
}

variable "table_name" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {}
}
