# Adventurers' Log

Old School RuneScape activity tracker and companion app for web and iOS.

## Prerequisites

- Node `v24.17.0` via nvm
- pnpm `11.8.0` via Corepack
- Docker Desktop

## Install

```bash
nvm use
corepack enable
pnpm install
```

## Environment

```bash
cp .env.example .env
```

Required backend variables:

- `NODE_ENV=development`
- `PORT=3000`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/app`
- `LOG_LEVEL=debug`
- `REDIS_URL=redis://localhost:6379`

## Local services

```bash
docker compose up -d
# If local ports are already in use:
# POSTGRES_PORT=15432 REDIS_PORT=16379 docker compose up -d
```

## Database

```bash
pnpm db:migrate
pnpm db:types
```

Migrations should run as an explicit release/deploy step before starting the backend in production.

## Development

```bash
pnpm dev       # Nest backend
pnpm dev:web   # Next.js frontend
pnpm docs:dev  # VitePress docs
```

Backend health: <http://localhost:3000/api/health>

Dev-only Swagger docs: <http://localhost:3000/docs>

## Checks and tests

```bash
pnpm check
pnpm build
pnpm test
pnpm test:e2e
```

`pnpm test:e2e` starts the backend and frontend, then verifies the Next.js app renders and can query `GET /api/health`.

## Production Docker image

The root `Dockerfile` builds the Nest backend and Next.js frontend into one image. Nest serves API routes under `/api` and renders Next.js for all other routes.

```bash
docker build -t adventurers-log .
```

For local production testing, start Postgres/Valkey first and expose the app port:

```bash
docker compose up -d

docker run --rm \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5432/app \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  -e LOG_LEVEL=debug \
  adventurers-log
```

Web app: <http://localhost:3000>

Backend health: <http://localhost:3000/api/health>

## iOS

The iOS app lives under `apps/ios/AdventurersLog`.

```bash
open apps/ios/AdventurersLog/AdventurersLog.xcodeproj
```

CI uses a self-hosted macOS runner and builds the `AdventurersLog` scheme.
