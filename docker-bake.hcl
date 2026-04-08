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
    VERSION != "" ? "cr.flecs.tech/flecs/webapp:${VERSION}${VERSION_SPECIAL}" : "",
    "cr.flecs.tech/flecs/webapp:${NAMED_TAG}",
  ])
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
}
