VERSION=2.1.1-dormouse
DOCKER_TAG=$(VERSION)$(VERSION_SPECIAL)

.PHONY: version
version:
	@echo $(VERSION)$(VERSION_SPECIAL)

.PHONY: ci
ci:
	@npm ci

.PHONY: dev-build
dev-build: ci
	@npm run build:test --if-present

.PHONY: build
build: ci
	@npm run build:production --if-present

special_%:
	@./special/$*.sh

docker_%:
	./docker/build-image.sh $(DOCKER_TAG) $*

deb-pkg_%:
	@sed -i 's/DOCKER_TAG=.*/DOCKER_TAG=$(DOCKER_TAG)/g' debian/opt/flecs-webapp/bin/flecs-webapp.sh
	@sed -i 's/Version:.*/Version: $(VERSION)/g' debian/DEBIAN/control
	@sed -i 's/Architecture:.*/Architecture: $*/g' debian/DEBIAN/control
	@rm -rf debian/opt/flecs-webapp/assets
	@mkdir -p debian/opt/flecs-webapp/assets
	@docker pull --platform linux/$* flecs/webapp:$(DOCKER_TAG)-$*
	@docker tag flecs/webapp:$(DOCKER_TAG)-$* flecs/webapp:$(DOCKER_TAG)
	@docker save flecs/webapp:$(DOCKER_TAG) --output flecs-webapp_$(VERSION)_$*.tar.gz
	@cp -f flecs-webapp_$(VERSION)_$*.tar.gz debian/opt/flecs-webapp/assets/
	@dpkg-deb --root-owner-group -Z gzip --build debian flecs-webapp_$(VERSION)_$*.deb
	@echo $(VERSION) >latest_flecs-webapp_$*
