# Binary output path
BIN_DIR := bin
SERVER_BIN := $(BIN_DIR)/server
DEV_HOST ?= 127.0.0.1

# Env files per environment
ENV_DEV   := .env.development
ENV_PROD  := .env.production
ENV_STAGE := .env.staging
MIGRATE_ENV ?= development

.PHONY: dev prod stage build build-prod install test test-coverage clean watch fmt lint help run sqlc sqlc-vet check kill-port

help:
	@echo "Available targets:"
	@echo "  dev              - Kill dev port (from .env.development) then start dev server"
	@echo "  prod             - Kill prod port (from .env.production) then start prod server"
	@echo "  stage            - Kill stage port (from .env.staging) then start staging server"
	@echo "  build            - Build application"
	@echo "  build-prod       - Build optimized production binary"
	@echo "  install          - Install dependencies"
	@echo "  test             - Run tests"
	@echo "  test-coverage    - Run tests with coverage"
	@echo "  clean            - Clean build artifacts"
	@echo "  watch            - Run with live reload (requires air)"
	@echo "  fmt              - Format code"
	@echo "  lint             - Lint code (requires golangci-lint)"
	@echo "  run              - Alias for dev"
	@echo "  sqlc             - Generate sqlc database code"
	@echo "  sqlc-vet         - Vet sqlc queries"
	@echo "  check            - Generate sqlc, format and test"
	@echo "  migrate-up       - Run migrations up (MIGRATE_ENV=development by default)"
	@echo "  migrate-down     - Rollback last migration"
	@echo "  migrate-create   - Create new migration file"
	@echo "  migrate-status   - Show migration status"

# Single cross-platform port killer (Go, works on Windows/Linux/Mac, cmd/PowerShell/Git Bash)
# Usage: make kill-port ENV_FILE=.env.development
kill-port:
	@go run scripts/killport.go $(ENV_FILE)

dev:
	@$(MAKE) kill-port ENV_FILE=$(ENV_DEV)
	@echo "Starting development server..."
	GO_ENV=development SERVER_HOST=$(DEV_HOST) go run cmd/server/main.go

prod:
	@$(MAKE) kill-port ENV_FILE=$(ENV_PROD)
	@echo "Starting production server..."
	GO_ENV=production SERVER_HOST=127.0.0.1 go run cmd/server/main.go

stage:
	@$(MAKE) kill-port ENV_FILE=$(ENV_STAGE)
	@echo "Starting staging server..."
	GO_ENV=staging SERVER_HOST=127.0.0.1 go run cmd/server/main.go

build:
	@echo "Building application..."
	@mkdir -p $(BIN_DIR) 2>/dev/null || true
	go build -o $(SERVER_BIN) cmd/server/main.go
	@echo "Binary created at: $(SERVER_BIN)"

build-prod:
	@echo "Building production binary..."
	@mkdir -p $(BIN_DIR) 2>/dev/null || true
	CGO_ENABLED=0 go build -a -ldflags="-w -s" -o $(SERVER_BIN) cmd/server/main.go
	@echo "Production binary created at: $(SERVER_BIN)"

install:
	@echo "Installing dependencies..."
	go mod download
	go mod tidy

test:
	@echo "Running tests..."
	go test -v ./...

test-coverage:
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

clean:
	@echo "Cleaning build artifacts..."
ifeq ($(OS),Windows_NT)
	@if exist $(BIN_DIR) rmdir /S /Q $(BIN_DIR) 2>nul || echo.
	@if exist coverage.out del /Q coverage.out 2>nul || echo.
	@if exist coverage.html del /Q coverage.html 2>nul || echo.
	@if exist tmp rmdir /S /Q tmp 2>nul || echo.
else
	@rm -rf $(BIN_DIR)
	@rm -f coverage.out coverage.html
	@rm -rf tmp
endif
	go clean
	@echo "Clean complete"

watch:
	@echo "Starting with live reload..."
	@echo "Make sure 'air' is installed: go install github.com/cosmtrek/air@latest"
	@GO_ENV=development SERVER_HOST=127.0.0.1 air

fmt:
	@echo "Formatting code..."
	go fmt ./...

lint:
	@echo "Linting code..."
	@echo "Make sure 'golangci-lint' is installed"
	golangci-lint run

run: dev

swagger:
	@echo "Generating Swagger documentation..."
	@echo "Make sure 'swag' is installed: go install github.com/swaggo/swag/cmd/swag@latest"
	swag init -g cmd/server/main.go --parseInternal

sqlc:
	@echo "Generating sqlc code..."
	sqlc generate

sqlc-vet:
	@echo "Checking sqlc queries..."
	sqlc vet

check: sqlc fmt test

migrate-up:
	@echo "Running migrations (env=$(MIGRATE_ENV))..."
	sql-migrate up -env="$(MIGRATE_ENV)"

migrate-down:
	@echo "Rolling back last migration (env=$(MIGRATE_ENV))..."
	sql-migrate down -env="$(MIGRATE_ENV)" -limit=1

migrate-create:
	@read -p "Enter migration name: " name; \
	timestamp=$$(date +%Y%m%d%H%M%S); \
	filename="./migrations/$${timestamp}_$${name}.sql"; \
	echo "-- +migrate Up" > $$filename; \
	echo "" >> $$filename; \
	echo "-- +migrate Down" >> $$filename; \
	echo "Created migration: $$filename"

migrate-status:
	@echo "Checking migration status (env=$(MIGRATE_ENV))..."
	sql-migrate status -env="$(MIGRATE_ENV)"