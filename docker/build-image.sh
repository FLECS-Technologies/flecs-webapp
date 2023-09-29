#!/bin/bash

arch_to_platform() {
  case ${1} in
    amd64)
      echo linux/amd64
      ;;
    armhf)
      echo linux/arm/v7
      ;;
    arm64)
      echo linux/arm64
      ;;
    *)
      exit 1
  esac
}

DOCKER_TAG=${1}
ARCH=${2}
PLATFORM=$(arch_to_platform ${ARCH})

echo "Building tag ${DOCKER_TAG} for arch ${ARCH} (${PLATFORM})"

docker login -u ${REGISTRY_USER} -p ${REGISTRY_AUTH} cr.flecs.tech
docker buildx build \
  --push \
  --platform ${PLATFORM} \
  --tag cr.flecs.tech/webapp:${DOCKER_TAG}-${ARCH} \
  --file docker/Dockerfile \
  .
