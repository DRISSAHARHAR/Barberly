# Barberly Platform

Barberly est un monorepo qui contient les applications API, mobile et les packages partagés.

## Structure
- `apps/api`: API Node.js + Express + Prisma + Redis.
- `apps/mobile`: application React Native (Expo).
- `apps/web`: scaffold web (Next.js à implémenter).
- `packages/shared-types`: types partagés.
- `infrastructure/`: IaC et déploiement.
- `docs/`: documentation projet.

## Démarrage rapide
1. Copier les variables d'environnement (`.env.example` et `apps/api/.env.example`).
2. Installer les dépendances: `make install`
3. Lancer l'infrastructure: `docker compose up -d`
4. Lancer les apps: `npm run dev`

## Commandes utiles
- `npm run dev:api` : démarre uniquement l'API.
- `npm run dev:mobile` : démarre uniquement l'app mobile.
- `npm run build` : build de tous les workspaces.
- `npm run typecheck` : vérification TypeScript via Turbo.
