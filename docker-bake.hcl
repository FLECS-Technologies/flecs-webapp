variable "REGISTRY" {
  default = "flecspublic.azurecr.io"
}

variable "VERSION" {
  default = ""
}

# Appended to VERSION in the versioned tag (e.g. "-dev" or "")
variable "VERSION_SPECIAL" {
  default = ""
}

# Named tag applied alongside the versioned one (e.g. "develop", "latest")
variable "NAMED_TAG" {
  default = "develop"
}

group "default" {
  targets = ["webapp"]
}

target "webapp" {
  context    = "."
  dockerfile = "docker/Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  tags = compact([
    VERSION != "" ? "${REGISTRY}/webapp:${VERSION}${VERSION_SPECIAL}" : "",
    "${REGISTRY}/webapp:${NAMED_TAG}",
  ])
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
}
