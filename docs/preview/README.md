# Aperçu de V1 / V1 preview

[Guide](guide.png) · [Bibliothèque / Library](library.png) · [Setup](setup-sidebar.png)

Captures sur une page de test locale. La couverture est chargée depuis le dépôt d’images utilisé par Anime Sama ; les vidéos restent fournies par les lecteurs du site.
Screenshots use a local test page. The cover comes from Anime Sama’s image repository; video playback still comes from the website’s players.

Le logo de la barre latérale est conservé. Le nouveau PNG est dans `assets/branding/app-mark.png`. Les bitmaps de Setup et les icônes Windows sont générés avec `python scripts/installer-art.py` (Pillow requis pour régénérer ces fichiers, pas pour lancer ou construire l’app).
The sidebar logo is preserved. The new PNG is in `assets/branding/app-mark.png`. Run `python scripts/installer-art.py` with Pillow to regenerate the Setup bitmaps and Windows icons; Pillow is not needed to run or build the app.
