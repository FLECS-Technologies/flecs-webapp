variable "VERSION" {
  default = ""
}

# Appended to VERSION in the versioned tag (e.g. "-dev" or "")
variable "VERSION_SPECIAL" {
  default = ""
}

# Named tag applied alongside the versioned one (e.g. "dev", "latest")
variable "NAMED_TAG" {
  default = "dev"
}

# The version in its other "v" form: strip the leading "v" if present,
# otherwise add it. Used to emit both "v${VERSION}" and "${VERSION}" tags.
function "toggle_v" {
  params = [version]
  result = substr(version, 0, 1) == "v" ? substr(version, 1, -1) : "v${version}"
}

group "default" {
  targets = ["webapp"]
}

target "webapp" {
  context    = "."
  dockerfile = "docker/Dockerfile"
  platforms  = ["linux/amd64", "linux/arm64"]
  tags = compact(concat(
    VERSION != "" ? [
      "cr.flecs.tech/flecs/webapp:${VERSION}${VERSION_SPECIAL}",
      "cr.flecs.tech/flecs/webapp:${toggle_v(VERSION)}${VERSION_SPECIAL}",
    ] : [],
    ["cr.flecs.tech/flecs/webapp:${NAMED_TAG}"],
  ))
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
}
