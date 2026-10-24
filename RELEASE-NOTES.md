## Anime Sama.to Desktop 0.2.0 — preview

An updated fork maintained by **Just A Jad**, based on **AlexAnimateMp4’s** original
Anime Sama.fr Desktop 0.1.1. Original credit, history and MPL-2.0 are preserved.

### Updated and fixed

- Use the current **https://anime-sama.to/** website and migrate old .fr links.
- Display actual network/HTTP errors instead of turning every load failure into 500.
- Recover from startup and later navigation failures with Retry, Home and browser actions.
- Keep cancelled loads and failed video subframes from replacing the whole app.
- Fix settings change listeners, saved-window-size cleanup, and resize tracking.
- Add visible navigation, zoom/fullscreen controls and keyboard shortcuts.
- Add links to this fork’s downloads, source and issue tracker.
- Update Electron to **45.0.0** and provide native Windows builds with source and checksums.

### Downloads

For **Windows 10/11, 64-bit**: choose Setup to install, Portable to run directly,
or extract the Windows ZIP and run ANIME_SAMA_JUST_A_JAD.exe. The source ZIP,
NOTICE.md, LICENSE and SHA256SUMS.txt are provided alongside the app.

### Preview status

This release is unsigned and remains a preview pending real-world Windows and
live website playback checks. Automated tests use local website fixtures. The
website’s 2023 profile and Discord integrations are retained but have not all been
revalidated against the current live site. A genuine HTTP 500 still depends on
the website operator resolving its server error.

Original app: https://github.com/AlexAnimateMp4/anime-sama-fr-desktop
Fork and issues: https://github.com/JustAJad/anime-sama-to-desktop
