ifndef NDEBUG
DOCKER_TAG=develop
else
DOCKER_TAG=latest
endif

.PHONY: docker
docker:
	docker buildx build \
	--push \
	--platform linux/amd64,linux/arm/v7,linux/arm64 \
	--tag marketplace.flecs.tech:5001/flecs/webapp:$(DOCKER_TAG) \
	--file docker/Dockerfile \
	.

.PHONY: deb-pkg
deb-pkg:
	dpkg-deb --root-owner-group -Z gzip --build debian flecs-webapp.deb
