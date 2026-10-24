<div align="center">
  <img src="assets/branding/wordmark.png" alt="Anime Samani" width="760" />
  <h1>Anime Samani</h1>
  <p><strong>Anime Sama, un peu plus vous.</strong></p>
  <p>Une application de bureau indépendante imaginée et maintenue par <a href="https://github.com/JustAJad">Just A Jad</a>.</p>
  <p><a href="README.en.md">English</a> · <a href="https://github.com/JustAJad/anime-sarani-desktop/releases">Télécharger pour Windows</a> · <a href="CREDITS.md">Crédits</a> · <a href="https://github.com/JustAJad/anime-sarani-desktop/issues/new/choose">Signaler un problème</a></p>
</div>

## Anime Sama, avec votre touche

**Anime Samani** garde le véritable site [Anime Sama](https://anime-sama.to/) au
centre de l’application et lui ajoute un espace de bureau personnel : une
bibliothèque locale, des thèmes, des fonds animés et une présence Discord repensée.
Son nom est un clin d’œil à « sarani », l’idée d’**encore plus**.

Samani prolonge l’application originale d’**AlexAnimateMp4**. Le travail de
maintenance de **[raphael-as](https://github.com/raphael-as/anime-sama-fr-desktop)**,
notamment sur le domaine, Discord et les crédits, a également servi d’inspiration.
**Just A Jad** signe les logos, l’identité et les évolutions propres à Samani.
[Voir les crédits et les sources précises](CREDITS.md).

## Télécharger

**Windows 10/11 · 64 bits** — ouvrez les [versions publiées](https://github.com/JustAJad/anime-sarani-desktop/releases), puis la section **Assets** :

| Fichier | Utilisation |
| --- | --- |
| `Anime-Samani-…-Setup-x64.exe` | Installer Samani et ses raccourcis. |
| `Anime-Samani-…-Portable-x64.exe` | Ouvrir Samani sans installation. |
| `Anime-Samani-…-Windows-x64.zip` | Tout extraire, puis lancer `ANIME_SAMANI.exe`. |
| `Anime-Samani-…-Source.zip` | Consulter ou reconstruire la version correspondante. |

Les versions **Aperçu / Preview** sont encore en phase de validation sur le site
réel. Les exécutables ne sont pas signés ; Windows peut afficher un avertissement
de publication. Les sommes SHA-256, le code source et les licences accompagnent
chaque version. La construction est visible dans [Actions](https://github.com/JustAJad/anime-sarani-desktop/actions).

## Ce qui rend Samani différent

| Votre espace | Ce que vous pouvez faire |
| --- | --- |
| **Identité Samani** | Retrouver les logos originaux de Just A Jad et une introduction animée au démarrage, désactivable. |
| **Une palette à vous** | Partir du dégradé pêche–rose des logos, choisir Sakura, Océan ou Minuit, puis régler les deux couleurs et la direction. |
| **Image ou vidéo en fond** | Importer une image PNG/JPEG/WebP ou une vidéo MP4/WebM locale, régler son flou et sa luminosité. Les vidéos sont toujours muettes. |
| **Surfaces translucides** | Régler l’opacité des surfaces ; le site conserve ses propres composants et son organisation. |
| **Un bureau plus calme** | Mettre le fond vidéo en pause pendant la lecture, réduire les animations ou passer en mode cinéma. |
| **Bibliothèque locale** | Épingler la page courante et retrouver les 40 dernières pages du catalogue. Rien n’est envoyé à un compte Samani. |
| **Accès rapide** | Ouvrir les raccourcis, favoris et pages récentes avec `Ctrl + K`. |
| **Discord repensé** | Afficher le titre, la saison, l’épisode et l’état de lecture ; personnaliser le texte et masquer les détails au besoin. |
| **Français et anglais** | Utiliser le français par défaut ou passer à l’anglais immédiatement dans les réglages. |

![Personnalisation Anime Samani](assets/img/readme/samani-personalization.png)

*Capture de l’interface Samani avec les données d’un test local. Les pages du site
s’affichent dans une vue web native distincte, sans accès aux fonctions du bureau.*

### Fonds personnalisés

Dans **Personnalisation → Apparence**, choisissez une image ou une vidéo de moins
de **250 Mo**. Samani en conserve une copie dans son dossier de données afin que
le fond continue de fonctionner après le déplacement du fichier original.
Les fichiers restent sur votre ordinateur. La lecture dépend du codec de votre
fichier ; WebM est un bon choix pour un fond vidéo léger.

Le fond et la transparence s’appliquent autour du site et aux arrière-plans
compatibles. Les cartes, images et lecteurs du site conservent leur rendu et leur
lisibilité. Samani ne remplace pas le catalogue par une copie locale.

### Présence Discord

La version est configurée avec l’application Discord fournie par Just A Jad :
`1563568424691437578`. Ouvrez le **client Discord de bureau**, puis Samani. L’état de
connexion apparaît dans **Personnalisation → Présence Discord**.

- Choisissez d’afficher ou de masquer le titre et l’épisode ; masquer le titre masque aussi la page précise du bouton public.
- Personnalisez le texte avec `{title}`, `{episode}`, `{season}` et `{language}`.
- Activez ou retirez les boutons vers le site et Samani.
- Désactivez la présence pour effacer l’activité de Samani.
- L’aperçu reste disponible même si Discord est fermé ; il ne prouve pas que Discord est connecté.

Samani gère les reconnexions, les paquets fragmentés et limite les mises à jour.
Les métadonnées dépendent des éléments disponibles dans la page. La session
Discord réelle et les lecteurs externes restent à vérifier sur votre machine.
Aucun jeton Discord, mot de passe ou compte Samani n’est nécessaire.

## Raccourcis

| Action | Raccourci |
| --- | --- |
| Accès rapide | `Ctrl + K` |
| Accueil / précédent / suivant | `Alt + Home` / `Alt + ←` / `Alt + →` |
| Actualiser ou réessayer | `Ctrl + R` |
| Personnalisation | `Ctrl + ,` |
| Mode cinéma | `Ctrl + Maj + F` ; `Échap` pour revenir |
| Plein écran | `F11` |

## Données et compatibilité

Le dossier de profil de la version 0.2 est conservé pour maintenir les cookies et
le stockage du site pendant le changement de nom. La bibliothèque Samani est
indépendante des favoris du site. Samani n’importe pas automatiquement les profils
des applications d’AlexAnimateMp4 ou de raphael-as. Conservez leurs sauvegardes.

Le choix Français/English traduit **le bureau Samani et ses réglages**. Les titres,
vidéos et textes d’Anime Sama restent dans la langue proposée par le site.

Une vraie erreur **HTTP 500** provient du serveur du site. Samani distingue ces
erreurs des problèmes de connexion et propose de réessayer ; il ne peut pas
réparer le serveur ni un lecteur indisponible. Voir [SUPPORT.md](SUPPORT.md).

## Construire et contribuer

Avec [Node.js 24 LTS](https://nodejs.org/) :

```sh
git clone https://github.com/JustAJad/anime-sarani-desktop.git
cd anime-sarani-desktop
npm ci
npm test
npm start
```

`npm run test:electron` teste la vraie fenêtre avec des pages locales et nécessite
un bureau graphique. `npm run build:win` produit le portable et le ZIP ; sur
Windows, `npm run build:win:installer` ajoute l’installateur. Les sorties vont dans
`dist/`. Les versions sont construites et publiées en aperçu par GitHub Actions.

[Guide de contribution](CONTRIBUTING.md) · [Historique](CHANGELOG.md) · [Documentation originale archivée](UPSTREAM-README.md)

## Crédits et licence

- **AlexAnimateMp4** — application originale Anime Sama.fr Desktop 0.1.1.
- **raphael-as** — maintenance communautaire et inspiration pour le domaine, Discord et les crédits.
- **Just A Jad** — Anime Samani, logos, identité visuelle et évolutions du bureau.

L’historique original et la licence **[MPL-2.0](LICENSE)** sont conservés. Les logos
fournis par Just A Jad sont crédités dans [NOTICE.md](NOTICE.md). Anime Samani est
indépendant du site Anime Sama et de Discord ; leurs contenus et services restent
sous la responsabilité de leurs opérateurs respectifs.
