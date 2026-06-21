FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
RUN pnpm install --frozen-lockfile --filter backend...

FROM deps AS build
COPY . .
RUN pnpm --filter backend build
RUN pnpm deploy --filter backend --prod /prod/backend

FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod/backend ./
CMD ["node", "dist/main.js"]
