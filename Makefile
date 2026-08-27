NODE22_BIN := /opt/homebrew/opt/node@22/bin
ifneq ($(wildcard $(NODE22_BIN)/node),)
export PATH := $(NODE22_BIN):$(PATH)
endif

.PHONY: dev test lint typecheck build

dev:
	npm run dev

test:
	npm test

lint:
	npm run lint

typecheck:
	npm run typecheck

build:
	npm run build
