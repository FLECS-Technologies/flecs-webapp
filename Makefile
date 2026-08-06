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
	@npm run build:dev

.PHONY: build
build: ci
	@npm run build

.PHONY: release-build
release-build: ci
	@npm run build:release

special_%:
	@./special/$*.sh

.PHONY: docker
docker:
	docker buildx bake -f docker-bake.hcl $(ARGS)
