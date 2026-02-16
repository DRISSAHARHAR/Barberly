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
3. Lancer l'infrastructure: `docker compose up -d --build`
4. Lancer les apps: `npm run dev`

> Note: `npm run dev:api` lance automatiquement `prisma generate` avant le serveur.

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
- `npm run start:lan -- -c` (recommandé)
- `npm run start:tunnel -- -c` (si LAN impossible)

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
npm run start:lan -- -c
```

#### Windows (PowerShell)
Depuis la racine du projet:

```powershell
Set-Location C:\chemin\vers\Barberly
npm install --legacy-peer-deps
Set-Location apps/mobile
npm install --legacy-peer-deps
npx expo-doctor
npm run start:lan -- -c
```

Si `expo-doctor` signale encore des versions incorrectes, exécutez ensuite:

```bash
npx expo install --check
```

### Cas ciblé: `@types/react` encore en `18.x`
Si `expo-doctor` affiche uniquement:
- attendu: `~19.1.10`
- trouvé: `18.3.28`

alors vos dépendances locales n'ont pas encore pris la version du `package.json`.

Dans `apps/mobile`:

```bash
npm install -D @types/react@~19.1.10 --legacy-peer-deps
npx expo-doctor
```

### Si vous voyez encore les anciennes erreurs (`main` introuvable / TS5098)
Si votre terminal affiche encore:
- `ConfigError: Cannot resolve entry file`
- ou `TS5098` côté API

vous êtes probablement sur un cache local ou des dépendances non rafraîchies.

1. Vérifiez que vous êtes bien à jour (`git pull`).
2. Réinstallez proprement les dépendances.

#### Réinstallation propre (Windows CMD)
```bat
cd C:\chemin\vers\Barberly
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
if exist apps\mobile\node_modules rmdir /s /q apps\mobile\node_modules
if exist apps\mobile\package-lock.json del /f /q apps\mobile\package-lock.json
if exist apps\api\node_modules rmdir /s /q apps\api\node_modules
if exist apps\api\package-lock.json del /f /q apps\api\package-lock.json
npm install --legacy-peer-deps
npm install -w apps/mobile --legacy-peer-deps
npm install -w apps/api --legacy-peer-deps
```

Puis relancez:

```bat
cd apps\mobile
npm run start:lan -- -c
```

Dans un second terminal:

```bat
cd C:\chemin\vers\Barberly
npm run dev:api
```

Si l'écran mobile affiche seulement **"Something went wrong"**, appuyez sur **"View error log"** dans Expo Go et copiez l'erreur exacte.

### Dépannage Docker API / Prisma
Si vous voyez des erreurs Prisma dans Docker (`@prisma/client did not initialize yet`, OpenSSL, migration engine):

1. Rebuild complet:

```bat
docker compose down -v
docker compose up -d --build
```

2. Vérifier les logs API:

```bat
docker compose logs -f api
```

3. Entrer dans le conteneur API (commande fiable avec service name):

```bat
docker compose exec api sh
```

4. Vérifier Prisma dans le conteneur:

```sh
npx prisma generate
npx prisma migrate deploy
```

Pour un run local sans Docker (API), vous pouvez aussi forcer manuellement:

```bat
npm run prisma:generate -w apps/api
npm run dev:api
```

5. Si `postgres` sort immédiatement (container exited), faites un reset volume puis rebuild (cas fréquent après changement de version PostgreSQL):

```bat
docker compose down -v
docker compose up -d --build
```

Note: avec `docker compose`, les noms de conteneurs sont souvent `project-api-1`.
Utilisez donc de préférence `docker compose exec api ...` au lieu de `docker exec -it barber_api ...`.

### Erreur `ngrok tunnel took too long to connect`
Cette erreur vient du mode `--tunnel` (réseau lent, ngrok bloqué par firewall/ISP, proxy entreprise).

Essayez dans cet ordre (dans `apps/mobile`):

```bat
npx expo start --lan -c
```

Si `--lan` ne fonctionne pas, essayez:

```bat
npx expo start --localhost -c
```

Notes pratiques:
- **`--lan`**: PC et téléphone doivent être sur le même Wi-Fi.
- **`--localhost`**: utile surtout avec émulateur Android/iOS local.
- Désactivez VPN/proxy si possible.
- Autorisez Node.js / Expo CLI dans le firewall Windows.

### Si Expo Go affiche encore "Something went wrong"
1. Ouvrez **View error log** dans Expo Go.
2. Vérifiez l'URL API mobile. Dans `apps/mobile`, créez un fichier `.env` avec:

```env
EXPO_PUBLIC_API_URL=http://VOTRE_IP_LOCALE_PC:3000/api
```

Exemple: `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api`

3. Redémarrez Expo:

```bat
npm run start:lan -- -c
```

Si l'erreur persiste, copiez le texte exact du **View error log**.

Si vous voyez l'erreur `react-native-gesture-handler could not be found`, réinstallez les dépendances mobiles:

```bat
npm install -w apps/mobile --legacy-peer-deps
```

### Si `npm run dev:api` dit `DATABASE_URL not found`
Le serveur API charge automatiquement `.env` puis `.env.development` dans `apps/api`.

Assurez-vous d'avoir au moins:

```env
DATABASE_URL=postgresql://barber:barber_password@localhost:5432/barber_db
REDIS_URL=redis://localhost:6379
```

Si vous avez déjà cloné avant ces corrections, faites une remise à niveau locale:

```bat
git fetch
git pull
rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
rmdir /s /q apps\mobile\node_modules
rmdir /s /q apps\api\node_modules
npm install --legacy-peer-deps
npm install -w apps/mobile --legacy-peer-deps
npm install -w apps/api --legacy-peer-deps
```
