terraform {
  backend "s3" {
    bucket  = "tentotalenglish-tfstate-585008064636-prod"
    key     = "prod/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true

    # Nuevo locking nativo en S3 (recomendado)
    use_lockfile = true

    # IMPORTANTE: el backend S3 sí necesita saber el profile
    profile = "tentotalenglish"
  }
}
