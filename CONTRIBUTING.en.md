# Contributing to Anime Samani

[Français](CONTRIBUTING.md)

Keep the authors’ credits and the MPL-2.0 license. The logos are in
`assets/branding/`.

## Report a problem

Include the Samani and Windows versions, reproduction steps and exact error code.
State whether the page works in your normal browser. For Discord, include the
status shown in settings; never share a token or password. See [SUPPORT.md](SUPPORT.md).

## Development

Use Node.js 24 and `npm ci`. `npm test` checks navigation, preferences, translations
and the RPC protocol. `npm run test:electron` exercises real Electron windows with
local website and background fixtures. A graphical desktop is required; on Linux,
use an X server. On Windows, `npm run build:win:installer` verifies all three
package formats.

The website lives in an isolated `WebContentsView`. The local shell receives a
limited validated IPC API; do not expose it to remote pages. Background files
must pass through the native picker and controlled local media protocol.

Add strings to **both** `desktop/i18n/fr.json` and `en.json`, and document features
in French and English. Preserve contrast and reduced-motion support. Add focused
regression tests for behavioral changes; text-only edits do not need new tests.

Send pull requests to `main` with visible behavior and verification details.
Never commit `node_modules`, `dist` or personal profiles.

## Releases

Update both package versions, the changelog and bilingual release notes. The
Windows workflow tests and builds executables, then publishes a new version from
`main` as a preview with matching source, credits and SHA-256 checksums. Existing
release versions are not overwritten. GitHub’s automatic token is sufficient.

Check the real website, several external players and a real Discord session
before removing the Preview flag.
