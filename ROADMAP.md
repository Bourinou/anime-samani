# Pour la suite / Next up

Idées à reprendre lors de la prochaine session. Rien n’est encore promis ni implémenté ici.
Ideas for the next session. These are plans, not implemented features or delivery promises.

## Français

- [ ] **Japonais dans l’interface** : ajouter `desktop/i18n/ja.json`, le choix de langue et vérifier les traductions avec une personne japonophone. Cela concerne Samani, pas la traduction du catalogue ou des vidéos.
- [ ] **Favoris liés au site** : étudier comment les favoris d’Anime Sama sont stockés, puis relier ajout et suppression à la bibliothèque locale. Prévoir les doublons, les conflits et une sauvegarde avant toute migration. La synchronisation entre appareils demandera une étude séparée.
- [ ] **Reprendre un épisode** : commencer par retrouver la dernière page et proposer un bouton pour la rouvrir. Vérifier ce qui existe déjà dans les pages récentes.
- [ ] **Reprise au bon moment** : étudier ensuite les lecteurs actuellement disponibles et leurs API documentées ou messages `postMessage`. Si un lecteur le permet, enregistrer l’anime, l’épisode et le temps de lecture, puis restaurer la position. Tester chaque lecteur ; afficher clairement quand seule la page peut être reprise.

### Points à vérifier

Les pistes de la capture sont des idées à valider, pas une recette déjà vérifiée.
Les restrictions d’origine des iframes peuvent empêcher l’accès direct au lecteur.
Conserver `webSecurity`, l’isolation des contextes et le sandbox. Privilégier les
API prévues par les lecteurs, avec validation de l’origine et du format des messages.
La présence d’un lecteur dans une ancienne liste ne garantit pas qu’il soit encore disponible.

## English

- [ ] **Japanese UI**: add `desktop/i18n/ja.json`, a language option, and have the translation reviewed by a Japanese speaker. This translates Samani, not the website catalogue or videos.
- [ ] **Link website favorites**: investigate Anime Sama’s storage, then connect additions and removals to the local library. Handle duplicates and conflicts, and back up data before migration. Cross-device sync needs a separate design.
- [ ] **Resume an episode**: start with reopening the last episode page. Check what the recent-pages feature already provides.
- [ ] **Resume at the saved timestamp**: investigate currently available players and their documented APIs or `postMessage` interfaces. Where supported, save anime, episode and playback time, then restore the position. Test each player and clearly distinguish page-only resume from timestamp resume.

### Things to check

The screenshot contains suggestions to investigate, not verified implementation instructions.
Cross-origin iframe restrictions may prevent direct player access. Keep `webSecurity`,
context isolation and sandboxing enabled. Prefer supported player APIs and validate
message origins and payloads. Older player lists may include services that are no longer available.
