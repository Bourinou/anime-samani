<div align="center">
  <img src="assets/branding/wordmark.png" alt="Anime Samani" width="760" />
  <h1>Anime Samani</h1>
  <p><strong>Anime Sama, a little more you.</strong></p>
  <p>An independent desktop app imagined and maintained by <a href="https://github.com/JustAJad">Just A Jad</a>.</p>
  <p><a href="README.md">Français</a> · <a href="https://github.com/JustAJad/anime-sarani-desktop/releases">Windows downloads</a> · <a href="CREDITS.md">Credits</a> · <a href="https://github.com/JustAJad/anime-sarani-desktop/issues/new/choose">Report an issue</a></p>
</div>

## Anime Sama, with your touch

**Anime Samani** keeps the real [Anime Sama website](https://anime-sama.to/) at the
center and adds a personal desktop space: a local library, themes, animated
backgrounds and redesigned Discord presence. Its name plays on “sarani,” the idea
of **a little more**.

Samani continues **AlexAnimateMp4’s original app**. **[raphael-as’s community
maintenance](https://github.com/raphael-as/anime-sama-fr-desktop)** — including
domain, Discord and credit updates — also provided inspiration. **Just A Jad**
created Samani’s logos, identity and desktop changes. [Detailed credits](CREDITS.md).

## Download

**Windows 10/11 · 64-bit** — visit [Releases](https://github.com/JustAJad/anime-sarani-desktop/releases) and expand **Assets**:

| File | How to use it |
| --- | --- |
| `Anime-Samani-…-Setup-x64.exe` | Install Samani and its shortcuts. |
| `Anime-Samani-…-Portable-x64.exe` | Open Samani without installing it. |
| `Anime-Samani-…-Windows-x64.zip` | Extract everything and run `ANIME_SAMANI.exe`. |
| `Anime-Samani-…-Source.zip` | Read or rebuild the matching source. |

**Aperçu / Preview** releases await real-world website validation. Builds are
unsigned, so Windows may display a publisher warning. SHA-256 checksums, source
and license files accompany each release. Follow builds in [Actions](https://github.com/JustAJad/anime-sarani-desktop/actions).

## Make it yours

| Feature | What you can do |
| --- | --- |
| **Samani identity** | See Just A Jad’s original logos and an optional animated startup introduction. |
| **Your palette** | Use the logos’ peach–pink gradient, try Sakura, Ocean or Midnight, and adjust both colors and the gradient angle. |
| **Image or video backgrounds** | Import local PNG/JPEG/WebP images or MP4/WebM videos, with blur and brightness controls. Videos are always muted. |
| **Translucent surfaces** | Adjust surface opacity while preserving the website’s components and layout. |
| **A calmer desktop** | Pause background videos during playback, reduce motion, or enter cinema mode. |
| **Local library** | Bookmark the current page and revisit the latest 40 catalogue pages. No Samani account or server receives the library. |
| **Quick access** | Open shortcuts, favorites and recent pages with `Ctrl + K`. |
| **Discord presence** | Share title, season, episode and playback state; customize text or hide details. |
| **French and English** | Start in French and switch all desktop controls to English immediately in settings. |

![Anime Samani personalization](assets/img/readme/samani-personalization-en.png)

*Samani’s interface with local test data. The actual website uses a separate native
web view without access to desktop functions.*

### Custom backgrounds

In **Personalization → Appearance**, choose an image or video smaller than **250 MB**.
Samani keeps a local copy in its data folder so moving the original file will not
break the background. Files remain on your computer. Playback depends on the
file’s codec; WebM is a good lightweight option.

Backgrounds and transparency affect the desktop and compatible website surfaces.
Website cards, artwork and players keep their own rendering for readability.
The catalogue is not replaced with a local imitation.

### Discord presence

This release uses the Discord application supplied by Just A Jad:
`1563568424691437578`. Open **desktop Discord**, then Samani. Check the connection
status in **Personalization → Discord presence**.

- Show or hide the title and episode. Hiding the title also hides the specific page from the public button.
- Customize text with `{title}`, `{episode}`, `{season}` and `{language}`.
- Enable or remove the website and Samani buttons.
- Disable presence to clear Samani’s activity.
- The preview works while Discord is closed and does not prove a live connection.

Samani handles reconnection, fragmented packets and throttled updates. Episode
metadata depends on the page’s available elements. A real Discord session and
external players still need validation on your machine. No Discord token,
password or Samani account is required.

## Shortcuts

| Action | Shortcut |
| --- | --- |
| Quick access | `Ctrl + K` |
| Home / back / forward | `Alt + Home` / `Alt + ←` / `Alt + →` |
| Reload or retry | `Ctrl + R` |
| Personalization | `Ctrl + ,` |
| Cinema mode | `Ctrl + Shift + F`; `Esc` to return |
| Fullscreen | `F11` |

## Data and compatibility

The 0.2 profile directory is retained to preserve website cookies and storage
through the rebrand. Samani’s local library is separate from website favorites.
Profiles from AlexAnimateMp4’s or raphael-as’s apps are not imported automatically;
keep their backups.

The language setting translates **Samani’s desktop and settings**. Anime Sama’s
titles, videos and text keep the languages offered by the website.

A real **HTTP 500** comes from the website server. Samani distinguishes that from
connection failures and offers retry actions; it cannot repair the website or an
unavailable external player. See [SUPPORT.md](SUPPORT.md).

## Build and contribute

With [Node.js 24 LTS](https://nodejs.org/):

```sh
git clone https://github.com/JustAJad/anime-sarani-desktop.git
cd anime-sarani-desktop
npm ci
npm test
npm start
```

`npm run test:electron` exercises the actual window against local fixtures and needs
a graphical desktop. `npm run build:win` creates Portable and ZIP packages; on
Windows, `npm run build:win:installer` adds Setup. Outputs go to `dist/`.
GitHub Actions builds Windows packages and publishes preview versions.

[Contribution guide](CONTRIBUTING.en.md) · [Changelog](CHANGELOG.md) · [Archived original documentation](UPSTREAM-README.md)

## Credits and license

- **AlexAnimateMp4** — original Anime Sama.fr Desktop 0.1.1 application.
- **raphael-as** — community maintenance and inspiration for domain, Discord and credits.
- **Just A Jad** — Anime Samani, original logos, visual identity and desktop development.

The original history and **[MPL-2.0 license](LICENSE)** are preserved. See
[NOTICE.md](NOTICE.md) for source and artwork attribution. Samani is independent
of Anime Sama and Discord; their services and content remain the responsibility
of their respective operators.
