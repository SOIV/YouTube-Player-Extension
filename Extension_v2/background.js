// YouTube Player Extension - Background Service Worker

class BackgroundManager {
  constructor() {
    this.defaultSettings = {
      enableCompressor: false,
      volumeBoost: 100,
      compressorRatio: 12,
      enableStereoPan: false,
      stereoPan: 0,
      popupPlayer: false,
      miniPlayerSize: '480x270',
      miniPlayerPosition: 'top-right',
      enablePIP: true,
      enableSmallPlayerButton: true,
      customScripts: '',
      customTheme: '',
      debugMode: false,
      extensionVersion: '2.0.1',
      installDate: null,
      lastUpdateCheck: null
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.handleFirstInstall();
      } else if (details.reason === 'update') {
        this.handleUpdate(details.previousVersion);
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true;
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });
  }

  async handleFirstInstall() {
    const now = new Date().toISOString();

    try {
      await chrome.storage.sync.set({
        ...this.defaultSettings,
        installDate: now,
        lastUpdateCheck: now
      });
    } catch (error) {
    }
  }

  async handleUpdate(previousVersion) {
    const now = new Date().toISOString();

    try {
      const existingSettings = await chrome.storage.sync.get();
      const migratedSettings = {
        ...this.defaultSettings,
        ...existingSettings,
        extensionVersion: '2.0.1',
        previousVersion,
        lastUpdateCheck: existingSettings.lastUpdateCheck || now,
        installDate: existingSettings.installDate || now
      };

      await chrome.storage.sync.set(migratedSettings);
    } catch (error) {
    }
  }

  async handleMessage(message, sendResponse) {
    try {
      switch (message.action) {
        case 'getSettings': {
          const settings = await chrome.storage.sync.get(this.defaultSettings);
          sendResponse({ success: true, settings });
          break;
        }

        case 'saveSettings':
          await chrome.storage.sync.set(message.settings || {});
          sendResponse({ success: true });
          break;

        case 'resetSettings':
          await chrome.storage.sync.clear();
          await this.handleFirstInstall();
          sendResponse({ success: true });
          break;

        case 'exportSettings': {
          const settings = await chrome.storage.sync.get(this.defaultSettings);
          sendResponse({
            success: true,
            settings,
            filename: `youtube-player-extension-settings-${new Date().toISOString().split('T')[0]}.json`
          });
          break;
        }

        case 'checkForUpdates': {
          const updateInfo = await this.checkForUpdates();
          sendResponse({ success: true, updateInfo });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  handleStorageChange(changes, namespace) {
    if (namespace !== 'sync') {
      return;
    }

    chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingsChanged',
          changes
        }).catch(() => {
        });
      });
    });
  }

  async checkForUpdates() {
    try {
      const { lastUpdateCheck } = await chrome.storage.sync.get('lastUpdateCheck');
      const now = new Date();
      const lastCheckDate = new Date(lastUpdateCheck || 0);

      if (now - lastCheckDate > 24 * 60 * 60 * 1000) {
        await chrome.storage.sync.set({
          lastUpdateCheck: now.toISOString()
        });

        return {
          hasUpdate: false,
          currentVersion: '2.0.1',
          latestVersion: '2.0.1',
          lastChecked: now.toISOString()
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}

new BackgroundManager();
