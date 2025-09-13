# YouTube Player Extension

[![한국어](https://img.shields.io/badge/README-한국어-red)](README.md)

A browser extension that enhances various features of the YouTube player.

## Key Features

### 🎵 Audio Enhancement
- **Volume Boost**: Play at volumes higher than default (up to 500%)
- **Audio Compressor**: Dynamic range control for more consistent volume levels
- **Stereo Panning**: Adjust left-right audio balance (-100% ~ +100%)

### 📺 Quality Control
- **Auto Quality Selection**: Automatically set optimal quality based on network conditions
- **Preferred Quality Setting**: Auto-set preferred quality from 240p to 4K
- **Auto Codec Selection**: Automatically select optimal codec among VP9, H.264, AV1

### 🖼️ Picture-in-Picture (PiP)
- **Enhanced PiP Feature**: Improved native PiP button
- **Small Player**: Added YouTube's native small player button
- **Mini Player**: Customizable size and position (7 sizes, 4 positions)

### 🛠️ Advanced Settings
- **Custom Scripts**: Execute JavaScript code for additional functionality
- **Custom Themes**: CSS style customization
- **Multi-language Support**: Korean, English

## Installation

### 📦 Download from Releases (Recommended)

1. Download the latest version from [Releases page](https://github.com/SOIV/YouTube-Player-Extension/releases)
2. Extract the downloaded ZIP file to your desired folder
3. Open Chrome browser and go to `chrome://extensions/`
4. Enable "Developer mode" toggle in the top right
5. Click "Load unpacked"
6. Select the extracted folder
7. Extension is installed and ready to use on YouTube

### 🔧 Developer Installation (Direct Source Code)

```bash
# Clone repository
git clone https://github.com/SOIV/YouTube-Player-Extension.git
cd YouTube-Player-Extension
```

1. Open Chrome browser and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the cloned project folder

## Usage

1. Navigate to YouTube
2. Click the extension icon to open settings panel
3. Enable/disable desired features
4. Settings are automatically saved

> ※ This extension does not support automatic updates.

## Browser Compatibility

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
│       ├── quality.js    # Quality control module
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