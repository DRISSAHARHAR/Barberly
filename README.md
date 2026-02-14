# Barberly Platform

Barberly est une plateforme BeautyTech marocaine de réservation de coiffure/barbier.
Le produit cible deux modes de service :
- **À domicile** (HOME)
- **En salon** (SALON)

## Vision produit
Digitaliser la réservation coiffure au Maroc avec une expérience simple pour les clients et des revenus plus stables pour les coiffeurs.

## Applications
- `apps/api`: API Node.js + Express + Prisma + Redis.
- `apps/mobile`: application React Native (Expo) pour clients et barbiers.
- `apps/web`: scaffold web (marketing + admin à implémenter).
- `packages/shared-types`: types partagés.

## Fonctionnalités métier déjà modélisées
- Authentification OTP + sessions JWT
- Rôles utilisateurs (CLIENT / BARBER / ADMIN)
- Profils clients et barbiers
- Services barber, disponibilité, portfolio
- Réservations avec statut, mode de service (domicile/salon) et mode de paiement (cash/en ligne)

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

## Dépannage Expo (SDK)
Si Expo Go affiche une erreur d'incompatibilité SDK, assurez-vous que l'app mobile utilise la même version majeure qu'Expo Go.
Ce projet est aligné sur Expo SDK 54.

Commandes utiles (dans `apps/mobile`):
- `npx expo-doctor`
- `npx expo start --tunnel -c`

### Cas fréquent: "les fichiers à supprimer n'existent pas"
Ce comportement est normal si l'installation n'a pas encore été faite (ou a échoué avant la création de `node_modules` / `package-lock.json`).

Dans ce cas:
1. **Ne supprimez rien** si les fichiers n'existent pas.
2. Lancez directement l'installation.

#### Windows (CMD)
Depuis la racine du projet:

```bat
cd C:\chemin\vers\Barberly
npm install --legacy-peer-deps
cd apps\mobile
npm install --legacy-peer-deps
npx expo-doctor
npx expo start --tunnel -c
```

#### Windows (PowerShell)
Depuis la racine du projet:

```powershell
Set-Location C:\chemin\vers\Barberly
npm install --legacy-peer-deps
Set-Location apps/mobile
npm install --legacy-peer-deps
npx expo-doctor
npx expo start --tunnel -c
```

Si `expo-doctor` signale encore des versions incorrectes, exécutez ensuite:

```bash
npx expo install --check
```
