# Barberly_2 (Web Auth améliorée)

Version simple mais plus proche d'une app Barberly:
- Inscription (Client / Barbier)
- Vérification OTP (démo locale)
- Connexion + "se souvenir de moi"
- Dashboard protégé avec profil et état du compte
- Déconnexion

## Démarrer

```bash
cd Barberly_2
npm install
npm run dev
```

Application: http://localhost:4100

## Flux rapide
1. Créer un compte via `/register`.
2. Copier le code OTP affiché (flash de démo) puis valider sur `/verify-otp`.
3. Se connecter via `/login`.
4. Consulter `/dashboard`.

## Notes
- Stockage en mémoire (démo), non persistant.
- Pour la prod: base de données + vrai OTP (SMS/email) + cookies secure HTTPS.
