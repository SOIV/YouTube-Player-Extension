# AGENTS.md

This repository is a vanilla JavaScript Chrome extension (Manifest V3).
Follow existing patterns; avoid introducing new tooling unless asked.

## Project Snapshot
- Primary code lives under `Extension/`.
- Manifest: `Extension/manifest.json`.
- Content script entry: `Extension/content.js`.
- Background service worker: `Extension/background.js`.
- Popup UI logic: `Extension/popup.js` + `Extension/popup.html`.
- Shared core modules: `Extension/scripts/core/*.js`.
- Feature modules: `Extension/scripts/features/**`.
- Styles: `Extension/styles.css`.
- Locales: `Extension/locales/*.json`.
- Legacy code: `legacy/` (do not modify unless explicitly requested).

## Build / Lint / Test Commands
No build, lint, or test tooling is present in this snapshot.
There is no `package.json`, no CI workflows, and no test runner configs.

Use these manual flows instead:
- Load the unpacked extension in Chrome:
  1) `chrome://extensions/` -> enable Developer mode.
  2) Click "Load unpacked" and select the repo root or `Extension/` folder.
  3) Open YouTube and verify features.
- Background script debugging: use Chrome extension service worker devtools.
- Content script debugging: open YouTube -> DevTools -> Sources.

Release packaging guidance (docs only, not a build step):
- `docs/DEPLOY.md`:
  - `cd "../YouTube Player Extension - Release"`
  - `zip -r "youtube-extension-v1.0.0.zip" .`

Single-test execution: N/A (no test framework detected).

## Cursor / Copilot Rules
No Cursor rules found under `.cursor/rules/` or `.cursorrules`.
No Copilot instructions found under `.github/copilot-instructions.md`.

## Code Style Conventions (Observed)
Use existing style in the files below:
- `Extension/background.js`
- `Extension/content.js`
- `Extension/popup.js`
- `Extension/scripts/core/base.js`
- `Extension/scripts/core/settings.js`

### JavaScript Style
- ES6 classes are used for managers and controllers.
- Indentation: 2 spaces.
- Semicolons are used consistently.
- Strings use single quotes in JS; JSON uses double quotes.
- Naming:
  - Classes: PascalCase (`PopupManager`, `SettingsManager`).
  - Functions/variables: camelCase (`handleToggleClick`, `defaultSettings`).
  - Constants appear inline; no dedicated constants file.
- Methods are grouped by lifecycle: `init`, then feature handlers, then utilities.
- Use `async/await` for Chrome storage and messaging APIs.

### Error Handling
- Many `try/catch` blocks intentionally ignore failures (empty catch or no logging).
- Treat errors as non-fatal in UI flows; follow existing behavior unless asked to change.
- Prefer graceful no-op on missing elements or API failures.

### DOM / Event Patterns
- DOM lookups use `document.querySelector` / `getElementById`.
- UI elements identified via `data-setting` or `data-i18n` attributes.
- Event listeners are registered in a dedicated `setupEventListeners` method.
- Use debouncing for slider changes (`setTimeout`) and update UI in `input` events.

### Namespacing and Globals
- Core modules attach to `window.YouTubeEnhancer` namespace.
- Content script entry instantiates a top-level class and assigns to `window`.
- Avoid adding new globals; extend `window.YouTubeEnhancer` if needed.

### Localization
- Locale files are JSON under `Extension/locales/`.
- See `Extension/locales/README.md` for adding new languages.
- Use `window.i18n.t(key)` for UI strings.
- Update `supportedLanguages` in `Extension/i18n.js` when adding locales.

### CSS Style
- File: `Extension/styles.css`.
- Class names are kebab-case with prefixes like `ype-` and `ytbf-`.
- Heavy use of `!important` to override YouTube styles.
- Media queries at 768px and 480px for responsiveness.

## Architecture Notes
- Manifest V3: service worker background (`Extension/background.js`).
- Content scripts are injected via `manifest.json` in `content_scripts` list.
- The content script is modular: core managers + feature controllers.
- Settings persist in `chrome.storage.sync`.
- UI (popup) communicates to content scripts via `chrome.tabs.sendMessage`.

## File Layout Rules
- Production code lives only under `Extension/`.
- `docs/` contains guidance; do not rely on it for runtime behavior.
- `legacy/` is archival; avoid editing unless user asks.
- Release artifacts live under `Releases/` and should not be edited.

## When Making Changes
- Keep changes minimal and localized to the relevant module.
- Prefer adding new feature controllers under `Extension/scripts/features/`.
- Update `manifest.json` when adding new scripts or assets.
- If you add new settings, update:
  - `Extension/scripts/core/settings.js` defaults.
  - `Extension/popup.js` UI wiring.
  - Any relevant controllers.
- For new UI strings, update locale files under `Extension/locales/`.

## Manual Verification Checklist
- Load unpacked extension and refresh YouTube.
- Check popup UI toggles, sliders, and toast notifications.
- Verify content script changes on `/watch` pages.
- Confirm no console errors in background or content script.

## Documentation References
- `README.md` / `README_EN.md`: project overview and installation.
- `docs/DEPLOY.md`: release packaging.
- `Extension/locales/README.md`: localization process.
- `legacy/README.md`: legacy archive details.
