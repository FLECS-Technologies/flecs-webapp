VERSION=$(shell cat package.json | jq -r '.version')$(VERSION_SPECIAL)
DOCKER_TAG=$(VERSION)
BRAND ?= example-brand
WHITELABEL_DIR ?= ../flecs-whitelabel
TAG ?= 5.3.0-local-dev
WEBAPP_TAG ?= $(TAG)
LOCAL_PLATFORM ?= linux/arm64
WHITE_LABEL_TAG ?= $(WEBAPP_TAG)
WHITE_LABEL_PLATFORM ?= $(LOCAL_PLATFORM)
ORB_MACHINE ?= flecsiscool
CORE_VERSION ?= develop-debug

ifeq ($(BRAND),example-brand)
BRAND_DIR ?= brands/example-brand
else
BRAND_DIR ?= $(WHITELABEL_DIR)/dist/$(BRAND)
endif

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

.PHONY: brand-packages
brand-packages:
	@$(MAKE) -C $(WHITELABEL_DIR) brand-build

.PHONY: build-brand
build-brand:
	@echo "Building webapp with brand package: $(BRAND_DIR)"
	@VITE_BRAND_DIR=$(BRAND_DIR) npm run build

.PHONY: build-local
build-local:
	@echo "Building webapp without a whitelabel package"
	@npm run build

.PHONY: docker-local
docker-local: build-local
	@docker buildx bake -f docker-bake.hcl \
		--set webapp.platform=$(LOCAL_PLATFORM) \
		--load \
		--var "NAMED_TAG=$(WEBAPP_TAG)"

.PHONY: orb-load-local
orb-load-local: docker-local
	@docker save cr.flecs.tech/flecs/webapp:$(WEBAPP_TAG) | \
		orb -m $(ORB_MACHINE) sudo docker load

.PHONY: orb-install-local
orb-install-local: orb-load-local
	@orb -m $(ORB_MACHINE) sudo bash -lc 'curl -fsSL install-staging.flecs.tech | bash -s -- --yes --dev --debug --core-version $(CORE_VERSION) --webapp-version $(WEBAPP_TAG)'

.PHONY: host-install-local
host-install-local: docker-local
	@curl -fsSL install-staging.flecs.tech | bash -s -- --yes --dev --debug --core-version $(CORE_VERSION) --webapp-version $(WEBAPP_TAG)

.PHONY: docker-brand
docker-brand: build-brand
	@docker buildx bake -f docker-bake.hcl \
		--set webapp.platform=$(WHITE_LABEL_PLATFORM) \
		--load \
		--var "NAMED_TAG=$(WHITE_LABEL_TAG)"

.PHONY: orb-load-brand
orb-load-brand: docker-brand
	@docker save cr.flecs.tech/flecs/webapp:$(WHITE_LABEL_TAG) | \
		orb -m $(ORB_MACHINE) sudo docker load

.PHONY: orb-install-brand
orb-install-brand: orb-load-brand
	@orb -m $(ORB_MACHINE) sudo bash -lc 'curl -fsSL install-staging.flecs.tech | bash -s -- --yes --dev --debug --core-version $(CORE_VERSION) --webapp-version $(WHITE_LABEL_TAG)'

.PHONY: host-install-brand
host-install-brand: docker-brand
	@curl -fsSL install-staging.flecs.tech | bash -s -- --yes --dev --debug --core-version $(CORE_VERSION) --webapp-version $(WHITE_LABEL_TAG)

special_%:
	@./special/$*.sh

.PHONY: docker
docker:
	docker buildx bake -f docker-bake.hcl $(ARGS)
