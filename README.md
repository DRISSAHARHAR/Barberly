# Barberly Platform

Monorepo structure:
- `apps/api`: Node.js/Express backend with Prisma.
- `apps/mobile`: React Native mobile app.
- `apps/web`: Next.js web app scaffold.
- `packages/*`: shared packages.
- `infrastructure/*`: infra as code and deploy scripts.
- `docs/*`: architecture and product documentation.

## Quick start
1. `make install`
2. `docker compose up -d`
3. `npm run dev`
