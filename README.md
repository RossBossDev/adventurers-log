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

Backend health: <http://localhost:3000/health>

Dev-only Swagger docs: <http://localhost:3000/docs>

## Checks and tests

```bash
pnpm check
pnpm build
pnpm test
pnpm test:e2e
```

`pnpm test:e2e` starts the backend and frontend, then verifies the Next.js app renders and can query `GET /health`.

## Docker build

```bash
docker build -f apps/backend/Dockerfile -t adventurers-log-backend .
```

## iOS

The iOS app lives under `apps/ios/AdventurersLog`.

```bash
open apps/ios/AdventurersLog/AdventurersLog.xcodeproj
```

CI uses a self-hosted macOS runner and builds the `AdventurersLog` scheme.
