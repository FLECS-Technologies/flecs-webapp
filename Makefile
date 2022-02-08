ifndef NDEBUG
DOCKER_TAG=develop
else
DOCKER_TAG=latest
endif

.PHONY: docker
docker:
	@docker login -u $${REGISTRY_USER} -p $${REGISTRY_AUTH}
	docker buildx build \
	--push \
	--platform linux/amd64,linux/arm/v7,linux/arm64 \
	--tag flecs/webapp:$(DOCKER_TAG) \
	--file docker/Dockerfile \
	.

.PHONY: deb-pkg
deb-pkg: VERSION=$$(cat debian/DEBIAN/control | grep -oE "[0-9]\.[0-9]\.[0-9]-.+")
deb-pkg:
	@dpkg-deb --root-owner-group -Z gzip --build debian flecs-webapp_${VERSION}_all.deb
