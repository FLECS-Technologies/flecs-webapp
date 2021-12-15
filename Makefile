ifndef NDEBUG
DOCKER_TAG=develop
else
DOCKER_TAG=latest
endif

.PHONY: docker
docker:
	docker build -f docker/Dockerfile -t marketplace.flecs.tech:5001/flecs/webapp:$(DOCKER_TAG) .

.PHONY: deb-pkg
deb-pkg:
	dpkg-deb --root-owner-group -Z gzip --build debian flecs-webapp.deb
