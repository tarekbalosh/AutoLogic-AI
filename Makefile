.PHONY: dev build test lint format db-migrate db-generate db-seed docker-up docker-down

# Development
dev:
	npm run dev

build:
	npm run build

# Quality Control
lint:
	npm run lint

format:
	npm run format

# Database
db-migrate:
	npm run db:push

db-generate:
	npm run db:generate

# Infrastructure
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

# Setup
setup:
	npm install
	cp .env.example .env
	$(MAKE) docker-up
	$(MAKE) db-generate
