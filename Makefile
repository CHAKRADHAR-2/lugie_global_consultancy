.PHONY: dev up down db-migrate db-seed backend frontend lint test

# Start infrastructure only
up:
	docker compose up -d postgres redis minio minio-init

# Stop everything
down:
	docker compose down

# Run database migrations
db-migrate:
	cd backend && alembic upgrade head

# Seed sample data (development only)
db-seed:
	cd backend && python -m scripts.seed_data

# Start backend dev server
backend:
	cd backend && uvicorn app.main:app --reload --port 8000

# Start frontend dev server
frontend:
	cd frontend && pnpm dev

# Run all linters
lint:
	cd backend && ruff check . && ruff format --check .
	cd frontend && pnpm lint

# Run all tests
test:
	cd backend && pytest --cov=app tests/ -v
	cd frontend && pnpm test

# Full dev setup
dev: up db-migrate
	@echo "Infrastructure ready. Run 'make backend' and 'make frontend' in separate terminals."
