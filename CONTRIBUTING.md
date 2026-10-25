# Pour Contribuer à Anime Samani

[English](CONTRIBUTING.en.md) · [日本語](CONTRIBUTING.ja.md)

Gardez les crédits des auteurs et la licence MPL-2.0. Les logos sont dans
`assets/branding/`.

## Signaler un problème

Indiquez la version de Samani, la version de Windows, les étapes et le code exact
s’il y en a un. Précisez si la même page fonctionne dans votre navigateur. Pour
Discord, indiquez l’état affiché dans les réglages, sans partager de jeton ni de
mot de passe. Voir [SUPPORT.md](SUPPORT.md).

## Développer

Utilisez Node.js 24 et `npm ci`. `npm test` vérifie la navigation, les thèmes,
les traductions et le protocole RPC. `npm run test:electron` utilise les vraies
fenêtres Electron avec des pages locales et des fonds de test. Il faut un bureau
graphique ; sous Linux, un serveur X est nécessaire. Sur Windows,
`npm run build:win:installer` vérifie les trois formats de distribution.

Le site réside dans une `WebContentsView` isolée. L’interface locale reçoit une
API IPC limitée et validée ; ne donnez pas cette API aux pages distantes. Les
fichiers de fond passent par le sélecteur natif et un protocole local contrôlé.

Ajoutez les nouvelles chaînes dans **les trois fichiers** `desktop/i18n/fr.json`,
`en.json` et `ja.json`. Documentez les fonctions en français, en anglais et en japonais. Gardez les
contrastes et l’option de réduction des animations. Ajoutez des tests ciblés
pour les changements de comportement ; les seules retouches de texte n’exigent
pas de nouveau test.

Ouvrez une proposition vers `main` en décrivant le comportement et les contrôles
effectués. Ne commitez ni `node_modules`, ni `dist`, ni profils personnels.

## Publier

Mettez à jour le changelog et les notes de version dans les trois langues.
Le workflow Windows teste et construit l’app à chaque push sur `main`, puis
publie les nouveaux numéros de version avec le code source, les crédits et les sommes SHA-256.
Les versions de `package.json` et `package-lock.json` sont explicites : un
rebuild de V1 reste en 1.0.0. Une publication portant un numéro déjà utilisé
ne remplace pas les fichiers existants. Préparez un build de test avant toute
modification d’une version publiée.
Le jeton automatique de GitHub suffit.

Pour les changements de documentation uniquement, ajoutez `[skip ci]` au message
du commit pour éviter de publier une nouvelle version de l’app.

Les mises à jour intégrées concernent Setup. Vérifiez aussi le site réel, les
lecteurs, Discord et la mise à jour depuis une installation précédente quand
vous modifiez ces fonctions.
