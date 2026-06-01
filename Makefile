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

special_%:
	@./special/$*.sh

.PHONY: docker
docker:
	docker buildx bake -f docker-bake.hcl $(ARGS)
