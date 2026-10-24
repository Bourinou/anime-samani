<div align="center">
  <img src="icon.png" alt="Anime Sama icon" width="104" />
  <h1>Anime Sama.to Desktop</h1>
  <p>An updated desktop home for <a href="https://anime-sama.to/">Anime Sama.to</a>.</p>
  <p>Maintained by <a href="https://github.com/JustAJad"><strong>Just A Jad</strong></a> · Forked from <a href="https://github.com/AlexAnimateMp4/anime-sama-fr-desktop"><strong>AlexAnimateMp4’s original app</strong></a></p>
  <p><a href="https://github.com/JustAJad/anime-sama-to-desktop/releases">Windows downloads</a> · <a href="#whats-changed">What’s changed</a> · <a href="https://github.com/JustAJad/anime-sama-to-desktop/issues/new/choose">Report a problem</a></p>
</div>

## About this fork

**Anime Sama.to Desktop** continues the original **Anime Sama.fr Desktop** app by
**AlexAnimateMp4**. This fork updates it for the current `.to` website, fixes desktop
loading and settings issues, and adds small improvements for everyday use.

The original application is the foundation of this project. **Just A Jad maintains
this updated fork**; AlexAnimateMp4 retains credit for the original work. The
original Git history, MPL-2.0 license and attribution are preserved.

## Download and run

**Windows 10/11 · 64-bit**

Open [Releases](https://github.com/JustAJad/anime-sama-to-desktop/releases) and expand
**Assets** on the newest release:

| File | How to use it |
| --- | --- |
| `…Setup-x64.exe` | Install the app with Start menu and desktop shortcuts. |
| `…Portable-x64.exe` | Open the app directly, without installing it. |
| `…Windows-x64.zip` | Extract everything to a folder, then run `ANIME_SAMA_JUST_A_JAD.exe`. |
| `…Source.zip` | Application source for rebuilding or modifying the fork. |

Preview releases are marked **Pre-release** while real-world testing is in progress.
The builds are currently **unsigned**, so Windows may display a publisher warning.

If the first release is still building, its progress appears in
[Actions → Windows build](https://github.com/JustAJad/anime-sama-to-desktop/actions).
A successful build also has a downloadable artifact named **Anime-Sama-to-Windows**.

## What’s changed

| Area | Improvements in this fork |
| --- | --- |
| Current website | Opens `https://anime-sama.to/`; old `.fr` links keep their page path when migrated. |
| Loading errors | Shows the actual network error or HTTP response, with **Retry**, **Home** and **Open in browser**. |
| Reliability | Handles startup failures and later navigation errors; cancelled loads and failed video frames don’t replace the whole app. |
| Navigation | Visible menus, keyboard shortcuts, zoom, fullscreen and links to this fork’s downloads and issue tracker. |
| Settings | Fixes change listeners so settings such as **Always on top** apply immediately; disabling saved window size clears the correct values. |
| Runtime and builds | Updates Electron from 23 to 45, locks dependencies, and provides automated Windows builds. |
| Attribution | Identifies Just A Jad as fork maintainer and AlexAnimateMp4 as original author in the app and source. |

### Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Home | `Alt` + `Home` |
| Previous / next page | `Alt` + `Left` / `Right` |
| Reload, or retry after a failure | `Ctrl` + `R` |
| Open the current page in your browser | `Ctrl` + `Shift` + `B` |
| Fullscreen | `F11` |
| Zoom | `Ctrl` + `+` / `-`; reset with `Ctrl` + `0` |

The original tray settings, profile import/export and optional Discord Rich Presence
are retained. Their website integrations depend on Anime Sama’s HTML and may need
further updates as the website changes.

## Moving from the original app

The fork uses its own application identity and data folder, so it can coexist with
the original app. It does **not** automatically copy the original app’s local
history, favorites or settings. Keep your original installation and any exported
backups until you have checked the fork on your machine.

## About the “500” fix

The old app used `500` as a fallback when it could not load a page. That made a
connection failure look like a server error. This fork keeps **network failures**
and **actual HTTP errors** distinct and gives you a way to retry.

A real **HTTP 500** still means the website returned a server error. The desktop
app cannot repair the website’s server. Live website playback is not covered by
the local fixture tests; please report reproducible problems with the app version
and the exact error shown.

## Build from source

Install [Node.js 24 LTS](https://nodejs.org/), then run:

```sh
git clone https://github.com/JustAJad/anime-sama-to-desktop.git
cd anime-sama-to-desktop
npm ci
npm test
npm start
```

To create Windows packages:

```sh
npm run build:win             # Portable EXE + ZIP
npm run build:win:installer   # On Windows: Setup + Portable + ZIP
```

Outputs are written to `dist/`. `npm run test:electron` exercises the actual app
against local fixtures and needs a graphical desktop. Packaging supports Windows
x64; macOS and Linux installers are not provided.

Maintainers can use the [Windows workflow](.github/workflows/windows.yml) for native
Windows tests and packaging. A new version on `main` publishes a preview release
after the build passes. Release source, checksums, attribution and license files
are included beside the executables. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits and license

- **Original application:** [AlexAnimateMp4 / Alex Animate Mp4](https://github.com/AlexAnimateMp4/anime-sama-fr-desktop), release **0.1.1**.
- **Fork maintenance and updates:** [Just A Jad](https://github.com/JustAJad).
- **License:** [Mozilla Public License 2.0](LICENSE). See [NOTICE.md](NOTICE.md) for source and attribution details.
- **Historical documentation:** [Original README](UPSTREAM-README.md) and [upstream releases](https://github.com/AlexAnimateMp4/anime-sama-fr-desktop/releases).

This is an unofficial desktop wrapper. The Anime Sama website and its content are
provided by their respective operators. This project does not operate the website.
