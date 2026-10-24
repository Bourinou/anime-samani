# Historique / Changelog

## 0.3.0 — Anime Samani

### Français

Identité et logos de Just A Jad, crédit à raphael-as pour la maintenance et
l’inspiration, interface française avec anglais complet, introduction animée,
thèmes et médias locaux, bibliothèque et accès rapide, mode cinéma et nouveau
module Discord RPC avec l’application de Just A Jad. Le profil du site de la
version 0.2 reste dans le même dossier. Tests ajoutés pour les thèmes, les langues,
les fichiers locaux, les trames RPC et la nouvelle interface native.

### English

Just A Jad’s new identity and logos; raphael-as maintenance/inspiration credit;
French-first bilingual shell; animated intro; themes and local media; library and
quick access; cinema mode; and a rebuilt Discord RPC module using Just A Jad’s
application. The 0.2 website profile directory is retained. Added tests cover
preferences, language parity, local media, RPC framing and the native shell.

## Archives / Archive

Les notes antérieures sont conservées ci-dessous dans leur langue d’origine.
Earlier notes are preserved below in their original language.

# Changelog

## 0.2.0 — Anime Sama.to Desktop fork

First maintained fork by **Just A Jad**, based on **AlexAnimateMp4’s 0.1.1**.

### Changed

- Current anime-sama.to address, fork metadata and links, while retaining the original credit and MPL-2.0 license.
- Electron 45 and locked dependencies replace the older Electron 23 runtime and recursive installation script.
- Native Windows build, installer, portable app, corresponding source and preview releases through GitHub Actions.

### Fixed

- Unknown loading failures are no longer mislabeled HTTP 500.
- Startup errors, later navigation failures and error-page recursion are handled consistently.
- Cancelled requests and failed video frames do not replace the main page.
- Settings listeners use the stored namespace; saved window dimensions clear correctly and resizing is tracked across platforms.

### Added

- Recovery actions, visible navigation and help menus, keyboard shortcuts, zoom and fullscreen controls.
- Regression and Electron window tests, issue reporting and contributor documentation.

## Original release history

The following notes are preserved from the original project.

<div id="changelog">
    <h1 id="changelog-title">0.1.1</h1>
    <h3 id="changelog-fixed">Fixed</h3>
    <div id="changelog-fixed-body">
        <ul>
            <h3><a href="./index.js">index.js</a></h3>
            <li>Fixed error <a href="https://source.chromium.org/chromium/chromium/src/+/main:net/base/net_error_list.h;l=35" target="_blank">-3</a>.</li>
            <li>Inversion of the value of the <code>DISCORD_RICH_PRESENCE</code> setting in the condition of the <code>close</code> event when this one is <strong>disabled</strong>.</li>
            <li>Added <strong>cross-software</strong> compatibility for <code>settings</code>.</li>
        </ul>
    </div>
    <h1 id="changelog-old">To view older changelogs, please refer to <a id="changelog-old-link" href="https://github.com/AlexAnimateMp4/anime-sama-fr-desktop/releases">Github releases</a>.</h1>
</div>
