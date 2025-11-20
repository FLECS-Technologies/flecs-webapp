VERSION=$(shell cat package.json | jq -r '.version')$(VERSION_SPECIAL)
DOCKER_TAG=$(VERSION)

.PHONY: version
version:
	@echo $(VERSION)

.PHONY: ci
ci:
	@npm ci

.PHONY: dev-build
dev-build: ci
	@npm run build:test --if-present

.PHONY: build
build: ci
	@npm run build:production --if-present

docker_%:
	./docker/build-image.sh $(DOCKER_TAG) $* $(ARGS)

.PHONY: deb-pkg_%
deb-pkg_%:
	@rm -rf out/$*/pkg/debian
	@mkdir -p out/$*/pkg/debian
	@cp -prT pkg/fs out/$*/pkg/debian
	@cp -prT pkg/debian out/$*/pkg/debian
	@sed -i 's/DOCKER_TAG=.*/DOCKER_TAG=$(DOCKER_TAG)/g' out/$*/pkg/debian/opt/flecs-webapp/bin/flecs-webapp.sh
	@sed -i 's/Version:.*/Version: $(VERSION)/g' out/$*/pkg/debian/DEBIAN/control
	@sed -i 's/Architecture:.*/Architecture: $*/g' out/$*/pkg/debian/DEBIAN/control
	@dpkg-deb --root-owner-group -Z gzip --build out/$*/pkg/debian out/$*/pkg/flecs-webapp_$(VERSION)_$*.deb
	@echo $(VERSION) >out/$*/pkg/latest_flecs-webapp_$*

.PHONY: tgz-pkg_%
tgz-pkg_%:
	@rm -rf out/$*/pkg/tar
	@mkdir -p out/$*/pkg/tar
	@cp -prT pkg/fs out/$*/pkg/tar
	@cp -prT pkg/tar out/$*/pkg/tar
	@sed -i 's/DOCKER_TAG=.*/DOCKER_TAG=$(DOCKER_TAG)/g' out/$*/pkg/tar/opt/flecs-webapp/bin/flecs-webapp.sh
	@tar -C out/$*/pkg/tar -czf out/$*/pkg/flecs-webapp_$(VERSION)_$*.tgz . --group=root:0 --owner=root:0

package_%: deb-pkg_% tgz-pkg_%
	@echo "Building package_$*"
