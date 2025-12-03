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

special_%:
	@./special/$*.sh

docker_%:
	./docker/build-image.sh $(DOCKER_TAG) $* $(ARGS)
