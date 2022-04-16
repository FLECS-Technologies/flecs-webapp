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

VERSION=${1}
DOCKER_TAG=${2}
ARCH=${3}
PLATFORM=$(arch_to_platform ${ARCH})

echo "Building tag ${DOCKER_TAG} for arch ${ARCH} (${PLATFORM})"

#	@docker login -u $${REGISTRY_USER} -p $${REGISTRY_AUTH}
docker buildx build \
  --load \
  --platform ${PLATFORM} \
  --tag flecs/webapp:${DOCKER_TAG} \
  --file docker/Dockerfile \
  . && \
docker save flecs/webapp:${DOCKER_TAG} --output flecs-webapp_${VERSION}_${ARCH}.tar.gz
