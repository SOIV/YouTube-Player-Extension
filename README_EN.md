# YouTube Player Extension

[![한국어](https://img.shields.io/badge/README-한국어-red)](README.md)
[![Latest Release](https://img.shields.io/github/v/release/SOIV/YouTube-Player-Extension)](https://github.com/SOIV/YouTube-Player-Extension/releases)
[![Total Downloads](https://img.shields.io/github/downloads/SOIV/YouTube-Player-Extension/total)](https://github.com/SOIV/YouTube-Player-Extension/releases)
[![Latest Version Downloads](https://img.shields.io/github/downloads/SOIV/YouTube-Player-Extension/latest/total)](https://github.com/SOIV/YouTube-Player-Extension/releases)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chromewebstore.google.com/detail/ndbapfoppojondcmkgdmgmkcanogjfof?utm_source=item-share-cb)

A browser extension that enhances various features of the YouTube player.

## Project Status

- `Extension_v2` (v2.x): **Active development and support target**
- `Extension` (v1.x): **Frozen, no further feature/support updates**
- New features and improvements are developed on `Extension_v2`.

## Key Features

### 🎵 Audio Features
- **Volume Boost (Audio Compressor)**: Play at volumes higher than default (50% ~ 200%)
- **Stereo Panning**: Adjust left-right audio balance (-100% ~ +100%)

### 📱 Player Features
- **Picture-in-Picture (PIP) Button**: Added a button to launch the PIP.
- **Mini Player Button**: Added a button to go to YouTube's mini player.
- **Floating Player**: Continue watching with small player while scrolling (customizable size and position)

### 🛠️ Advanced Settings
- **Custom Scripts**: Execute JavaScript code for additional functionality
- **Custom Themes**: CSS style customization
- **Debug Mode**: Control developer/troubleshooting log output
- **Multi-language Support**: Korean, English

## Installation

> ※ Chrome Web Store installs support automatic updates.
> Unpacked/manual installs require manual updates.

### 🏪 Chrome Web Store (Recommended)

You can install it directly from the Chrome Web Store.<br>
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chromewebstore.google.com/detail/ndbapfoppojondcmkgdmgmkcanogjfof?utm_source=item-share-cb)

### 📦 Download from Releases (Distribution discontinued after v2.0.0)

1. Download the latest version from [Releases page](https://github.com/SOIV/YouTube-Player-Extension/releases)
2. Extract the downloaded ZIP file to your desired folder
3. Open Chrome browser and go to `chrome://extensions/`
4. Enable "Developer mode" toggle in the top right
5. Click "Load unpacked"
6. Select the extracted folder
7. Extension is installed and ready to use on YouTube

## Usage

1. Navigate to YouTube
2. Click the extension icon to open settings panel
3. Enable/disable desired features
4. Settings are automatically saved

## Screenshots

![Screenshot 1](docs/screenshot/en/v2/스크린샷%202026-02-17%20004033.png)
![Screenshot 2](docs/screenshot/en/v2/스크린샷%202026-02-17%20004050.png)
![Screenshot 3](docs/screenshot/en/v2/스크린샷%202026-02-17%20004116.png)
![Screenshot 4](docs/screenshot/en/v2/스크린샷%202026-02-17%20004129.png)
![Screenshot 5](docs/screenshot/en/v2/스크린샷%202026-02-17%20004202.png)

## Browser Compatibility

> Supports all browsers that use the Chromium engine.

- ✅ **Chrome** (Recommended)
- ✅ **Microsoft Edge**
- ✅ **NAVER Whale**
- ✅ **Opera**
- ⚠️ **Firefox** (Limited support)

## File Structure

```
YouTube Player Extension/
├── Extension/                                # v1.x (frozen/preserved)
├── Extension_v2/                             # v2.x (active development)
│   ├── manifest.json                         # Extension manifest
│   ├── popup.html                            # Popup UI
│   ├── popup.js                              # Popup logic
│   ├── content.js                            # Main content script
│   ├── background.js                         # Background service worker
│   ├── _locales/
│   │   ├── ko/messages.json                  # Korean messages
│   │   └── en/messages.json                  # English messages
│   ├── styles/
│   │   ├── popup.css                         # Popup styles
│   │   └── content/
│   │       ├── enhancer.css                  # Content feature styles
│   │       └── bugfix.css                    # Content bugfix styles
│   ├── scripts/
│   │   ├── core/
│   │   │   ├── base.js                       # Base utilities
│   │   │   └── settings.js                   # Settings manager
│   │   └── features/
│   │       ├── audio-control/
│   │       │   ├── audio-compressor.js       # Audio compressor
│   │       │   └── stereo-panning.js         # Stereo panning
│   │       └── player-control/
│   │           ├── pip-button.js             # PIP button
│   │           ├── mini-player-button.js     # Mini player button
│   │           ├── floating-player.js        # Floating player
│   │           ├── Loop-button.js            # Loop button (planned)
│   │           └── Automatic-quality-selection.js # Auto quality (planned)
│   ├── icons/                                # Extension icons
│   └── LICENSE
├── legacy/                                   # legacy/backup files
├── docs/                                     # Documentation
└── Privacy-Policy.md                         # Privacy Policy
```

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Extension API**: Chrome Extension Manifest V3
- **Audio Processing**: Web Audio API
- **Video APIs**: Picture-in-Picture API
- **Storage**: Chrome Storage API
- **Internationalization**: JSON-based multi-language support

## Permissions & Hosts

### Extension Permissions
- `storage`: Store user settings
- `activeTab`: Access current tab
- `scripting`: Script injection
- `contextMenus`: Add context menus

### Host Permissions
- `*.youtube.com/*`: Access YouTube site
- `*.googlevideo.com/*`: Access video streams

## Frequently Asked Questions (FAQ)

### ❓ I installed the extension but it's not working on YouTube
- Go to `chrome://extensions/` in Chrome browser
- Check if YouTube Player Extension is **enabled**
- Refresh the page and try again
- Completely close and restart the browser

### ❓ I can't see the extension icon
- Click the **puzzle piece icon (Extensions)** on the right side of Chrome's address bar
- Click the **pin icon** next to YouTube Player Extension to pin it to the toolbar

### ❓ Settings don't apply after changing them
- **Refresh** the YouTube page
- If multiple YouTube tabs are open, refresh all tabs
- Clear browser cache and try again

### ❓ Volume Boost (Audio Compressor) is not working
- Check if the tab is not muted in the browser
- Check if system volume is at an appropriate level
- Check for potential conflicts when using with other audio enhancement features

### ❓ Installation/features do not work on Firefox
- Current distribution/support target is **Chromium-based browsers**
- Firefox is not officially supported

### ❓ I'm experiencing errors or bugs with the Floating Player
- **Scrolling before YouTube site fully loads** may cause Floating Player related errors or bugs
- **Solution**: Wait for the YouTube page to fully load before scrolling or using extension features
- Refresh the page and wait a moment before using to avoid the issue
- This issue may be fixed in a **future update**

### ❓ Does the extension auto-update?
- Chrome Web Store installs update automatically
- Unpacked/manual installs require manual updates
- If you use manual install, download latest build from [Releases page](https://github.com/SOIV/YouTube-Player-Extension/releases) and reload it

## Contributing

1. Fork this repository
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Bug Reports

Please report bugs or feature requests at [Issues](https://github.com/SOIV/YouTube-Player-Extension/issues).

## To-Do

You can check the status of all scheduled tasks or updates in [ToDo](TODO.md).<br>
Notices can be found at [Notice](Notice.md).

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) file for details.

---

**Notice**: This extension is not an official YouTube product. YouTube is a trademark of Google Inc.
