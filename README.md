# LUGIE Platform

> **Lugie Global Consultancy** – *Dream Beyond Borders*

Overseas Education Consultancy Management System.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 26 LTS + pnpm
- Python 3.12 + uv

### Development Setup

```bash
# 1. Clone and configure
cp .env.example .env

# 2. Start infrastructure services
docker compose up -d postgres redis minio

# 3. Backend
cd backend
uv sync
alembic upgrade head
python -m scripts.seed_data  # Optional: load sample data
uvicorn app.main:app --reload --port 8000

# 4. Frontend
cd frontend
pnpm install
pnpm dev
```

Open http://localhost:3000

### Docker Compose (Full Stack)

```bash
docker compose up --build
```

## Project Structure

```
LUGIE/
├── backend/          # Python FastAPI
├── frontend/         # Next.js 16
├── docker-compose.yml
├── .env.example
└── Makefile
```

## Environment

See `.env.example` for all required environment variables.

## License

Proprietary – Lugie Global Consultancy
