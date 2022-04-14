ifndef NDEBUG
DOCKER_TAG=develop
REACT_APP_ENVIRONMENT=test
else
DOCKER_TAG=latest
REACT_APP_ENVIRONMENT=production
endif

.PHONY: docker
docker:
	@docker login -u $${REGISTRY_USER} -p $${REGISTRY_AUTH}
	docker buildx build \
	--push \
	--platform linux/amd64,linux/arm/v7,linux/arm64 \
	--build-arg REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT} \
	--tag flecs/webapp:$(DOCKER_TAG) \
	--file docker/Dockerfile \
	.

.PHONY: deb-pkg
deb-pkg: VERSION=1.0.0-beta.2
deb-pkg:
	@sed -i 's/Version:.*/Version: ${VERSION}/g' debian/DEBIAN/control
	@dpkg-deb --root-owner-group -Z gzip --build debian flecs-webapp_${VERSION}_all.deb
