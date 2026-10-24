# Contributing

This fork maintains AlexAnimateMp4’s original desktop application for Anime Sama.to.
Keep original-author attribution and the MPL-2.0 license intact.

## Report a problem

Use the repository’s issue form. Include the app version, Windows version, what you
clicked, what you expected, and the exact error displayed. State whether the same
page works in your normal browser. Remove personal information from screenshots.

For a quality-of-life request, explain the task you want to make easier and how
the proposed change would help. Avoid requesting changes to the website itself:
this repository maintains the desktop wrapper.

## Work on the app

Use Node.js 24 and npm ci. Keep package-lock.json committed. Run npm test for syntax
and navigation checks, and npm run test:electron on a graphical desktop for the
real-window fixture checks. On Windows, run npm run build:win:installer to verify
packaging. Add focused regression coverage for changes to loading or native app
behavior. Documentation-only edits do not need new tests.

Send pull requests to main. Describe the visible behavior, the reason for the
change, and what you tested. Never commit node_modules, build outputs, credentials,
private profile data or personal browsing history.

## Release a version

1. Update package.json and package-lock.json together, and add release notes to CHANGELOG.md and RELEASE-NOTES.md.
2. Push the changes to main, or run Windows build manually with publish enabled.
3. The Windows job runs tests, creates Setup/Portable/ZIP files, and attaches the matching source and SHA-256 checksums.
4. After the build succeeds, the release job creates a pre-release tagged v<version>. Existing release tags are left intact.
5. Test the download on Windows, including website navigation and playback. Use GitHub’s release editor to remove the pre-release flag only after that validation.

The built-in GITHUB_TOKEN handles releases; a personal access token is not needed.
If GitHub disables workflows on a new fork, enable Actions once in the Actions tab.
