VERSION=1.5.0-porpoise
DOCKER_TAG=$(VERSION)

.PHONY: docker
docker: docker_amd64 docker_armhf docker_arm64
	@docker login -u $${REGISTRY_USER} -p $${REGISTRY_AUTH}
	@docker buildx build \
	--push \
	--platform linux/amd64,linux/arm/v7,linux/arm64 \
	--tag flecs/webapp:$(DOCKER_TAG) \
	--file docker/Dockerfile \
	.

docker_%:
	./docker/build-image.sh $(VERSION) $(DOCKER_TAG) $*

.PHONY: deb-pkg
deb-pkg: docker deb-pkg_amd64 deb-pkg_armhf deb-pkg_arm64

deb-pkg_%: docker_%
	@sed -i 's/VERSION=.*/VERSION=$(VERSION)/g' debian/opt/flecs-webapp/bin/flecs-webapp.sh
	@sed -i 's/Version:.*/Version: $(VERSION)/g' debian/DEBIAN/control
	@sed -i 's/Architecture:.*/Architecture: $*/g' debian/DEBIAN/control
	@rm -rf debian/opt/flecs-webapp/assets
	@mkdir -p debian/opt/flecs-webapp/assets
	@cp -f flecs-webapp_$(VERSION)_$*.tar.gz debian/opt/flecs-webapp/assets/
	@dpkg-deb --root-owner-group -Z gzip --build debian flecs-webapp_$(VERSION)_$*.deb
