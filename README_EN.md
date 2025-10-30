# YouTube Player Extension

[![한국어](https://img.shields.io/badge/README-한국어-red)](README.md)
[![Latest Release](https://img.shields.io/github/v/release/SOIV/YouTube-Player-Extension)](https://github.com/SOIV/YouTube-Player-Extension/releases)
[![Total Downloads](https://img.shields.io/github/downloads/SOIV/YouTube-Player-Extension/total)](https://github.com/SOIV/YouTube-Player-Extension/releases)
[![Latest Version Downloads](https://img.shields.io/github/downloads/SOIV/YouTube-Player-Extension/latest/total)](https://github.com/SOIV/YouTube-Player-Extension/releases)

A browser extension that enhances various features of the YouTube player.

## Key Features

### 🎵 Audio Enhancement
- **Volume Boost (Audio Compressor)**: Play at volumes higher than default (50% ~ 200%)
- **Stereo Panning**: Adjust left-right audio balance (-100% ~ +100%)

### 📱 Player Features
- **Picture-in-Picture (PIP) Button**: Added a button to launch the PIP.
- **Mini Player Button**: Added a button to go to YouTube's mini player.
- **Floating Player**: Continue watching with small player while scrolling (customizable size and position)

### 🛠️ Advanced Settings
- **Custom Scripts**: Execute JavaScript code for additional functionality
- **Custom Themes**: CSS style customization
- **Multi-language Support**: Korean, English

## Installation

> ※ This extension does not support automatic updates.

### 🏪 Chrome Web Store (Coming Soon)

> 📅 **Chrome Web Store Upload Planned**: We're preparing to register on the Chrome Web Store for easier installation and updates. It will be supported and registered in V2.

### 📦 Download from Releases (Recommended)

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

![Screenshot 1](docs/screenshot/en/스크린샷%202025-09-15%20232038.png)
![Screenshot 2](docs/screenshot/en/스크린샷%202025-09-15%20232105.png)
![Screenshot 3](docs/screenshot/en/스크린샷%202025-09-15%20232132.png)
![Screenshot 4](docs/screenshot/en/스크린샷%202025-09-15%20232144.png)

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
├── manifest.json          # Extension manifest
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── content.js             # Main content script
├── background.js          # Background service worker
├── about.html             # About page
├── i18n.js               # Internationalization system
├── styles.css            # Stylesheet
├── scripts/
│   ├── core/
│   │   ├── base.js       # Basic utilities
│   │   └── settings.js   # Settings manager
│   └── features/
│       ├── audio.js      # Audio enhancement module
│       └── pip.js        # PiP and mini player module
├── locales/              # Language files
│   ├── ko.json          # Korean
│   ├── en.json          # English
│   └── example.json     # Translation template
├── icons/               # Extension icons
└── docs/                # Documentation
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

### ❓ Some features don't work in Firefox
- Firefox has **limited support** and some features may not work properly
- We recommend using **Chromium-based browsers** (Chrome, Edge, Whale, etc.) for the best experience

### ❓ I'm experiencing errors or bugs with the mini player
- **Scrolling before YouTube site fully loads** may cause mini player related errors or bugs
- **Solution**: Wait for the YouTube page to fully load before scrolling or using extension features
- Refresh the page and wait a moment before using to avoid the issue
- This issue may be fixed in a **future update**

### ❓ Does the extension auto-update?
- Currently **does not support automatic updates**
- Download new versions from [Releases page](https://github.com/SOIV/YouTube-Player-Extension/releases)
- Auto-update will be supported after Chrome Web Store registration

## Contributing

1. Fork this repository
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Bug Reports

Please report bugs or feature requests at [Issues](https://github.com/SOIV/YouTube-Player-Extension/issues).

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) file for details.

---

**Notice**: This extension is not an official YouTube product. YouTube is a trademark of Google Inc.