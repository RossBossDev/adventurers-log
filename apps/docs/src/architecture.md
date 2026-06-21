# Architecture notes

Initial shape:

- NestJS backend in `apps/backend`
- Next.js frontend in `apps/web`
- iOS app in `apps/ios`
- VitePress docs in `apps/docs`
- Postgres for persistence
- Valkey/BullMQ for future async, cron, and long-running work
