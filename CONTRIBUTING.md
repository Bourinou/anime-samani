# Pour Contribuer à Anime Samani

[English](CONTRIBUTING.en.md)

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

Ajoutez les nouvelles chaînes dans **les deux fichiers** `desktop/i18n/fr.json`
et `en.json`. Documentez les fonctions en français et en anglais. Gardez les
contrastes et l’option de réduction des animations. Ajoutez des tests ciblés
pour les changements de comportement ; les seules retouches de texte n’exigent
pas de nouveau test.

Ouvrez une proposition vers `main` en décrivant le comportement et les contrôles
effectués. Ne commitez ni `node_modules`, ni `dist`, ni profils personnels.

## Publier

Mettez à jour la version de `package.json` et `package-lock.json`, le changelog et
les notes de version bilingues. Le workflow Windows teste et construit les
exécutables ; une nouvelle version sur `main` crée ensuite un aperçu avec le
code source correspondant, les crédits et les sommes SHA-256. Les versions
existantes ne sont pas remplacées. Le jeton automatique de GitHub suffit.

Validez le site réel, plusieurs lecteurs vidéo et une vraie session Discord
avant de retirer la mention Aperçu.
