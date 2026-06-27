# Production Dockerfile for NestJS + Next.js monorepo.
# Nest serves the API under /api and renders Next.js for all other routes.

FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS builder
ENV CI=true
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts \
  && pnpm rebuild esbuild sharp msgpackr-extract unrs-resolver
COPY . .
RUN mkdir -p apps/web/public
RUN pnpm --filter backend build
RUN pnpm --filter web build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts \
  && pnpm store prune

COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist apps/backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/web/.next apps/web/.next
COPY --from=builder --chown=nestjs:nodejs /app/apps/web/public apps/web/public
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json apps/backend/package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/web/package.json apps/web/package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/kysely.config.ts apps/backend/kysely.config.ts

USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); const port = process.env.PORT || 3000; const req = http.get('http://localhost:' + port + '/api/health', {timeout: 2000}, (res) => {process.exit(res.statusCode === 200 ? 0 : 1)}); req.on('error', () => process.exit(1)); req.on('timeout', () => {req.destroy(); process.exit(1)});"

CMD ["sh", "-c", "apps/backend/node_modules/.bin/kysely migrate latest --cwd apps/backend && exec node apps/backend/dist/src/main.js"]
