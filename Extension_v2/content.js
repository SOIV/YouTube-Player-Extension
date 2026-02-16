// YouTube Player Extension - Modular Main Entry Point

class YouTubePlayerEnhancer {
  constructor() {
    this.isInitialized = false;
    this.modules = {};
    
    this.settingsManager = null;
    this.domCache = null;
    this.eventManager = null;
    
    this.audioCompressorController = null;
    this.stereoPanningController = null;
    this.pipButtonController = null;
    this.smallPlayerButtonController = null;
    this.floatingPlayerController = null;
    this.customThemeStyleId = 'ytpe-custom-theme';
    
    this.mainLoopInterval = null;
    
    this.init();
  }

  async init() {
    try {
      
      await this.initCoreManagers();
      
      await this.loadSettings();
      
      this.setupMessageListener();
      
      await this.initFeatureModules();

      this.applyCustomSettings(['customTheme', 'customScripts']);
      
      this.startMainLoop();
      
      this.isInitialized = true;
      
    } catch (error) {
    }
  }

  async initCoreManagers() {
    this.domCache = new window.YouTubeEnhancer.DOMCache();
    
    this.eventManager = new window.YouTubeEnhancer.EventManager();
    
    this.settingsManager = new window.YouTubeEnhancer.SettingsManager();
    
  }

  async loadSettings() {
    await this.settingsManager.loadSettings();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'settingChanged' && message.key !== undefined) {
        this.settingsManager.settings[message.key] = message.value;
        this.notifyModulesOfSettingsChange([message.key]);
        sendResponse({ success: true });
      }

      if (message.action === 'settingsChanged') {
        
        Object.keys(message.changes).forEach(key => {
          const change = message.changes[key];
          if (change.newValue !== undefined) {
            this.settingsManager.settings[key] = change.newValue;
          }
        });
        
        this.notifyModulesOfSettingsChange(Object.keys(message.changes));
        
        sendResponse({ success: true });
      }
      return true;
    });
  }

  async initFeatureModules() {
    
    this.audioCompressorController = new window.YouTubeEnhancer.AudioCompressorController(
      this.settingsManager,
      this.domCache,
      this.eventManager
    );
    await this.audioCompressorController.init();
    
    if (this.settingsManager.getSetting('enableStereoPan')) {
      this.stereoPanningController = new window.YouTubeEnhancer.StereoPanningController(
        this.settingsManager, 
        this.domCache, 
        this.eventManager
      );
      await this.stereoPanningController.init();
    }
    
    if (this.settingsManager.getSetting('enablePIP')) {
      this.pipButtonController = new window.YouTubeEnhancer.PIPButtonController(
        this.settingsManager, 
        this.domCache, 
        this.eventManager
      );
      this.pipButtonController.init();
    }
    
    if (this.settingsManager.getSetting('enableSmallPlayerButton')) {
      this.smallPlayerButtonController = new window.YouTubeEnhancer.SmallPlayerButtonController(
        this.settingsManager, 
        this.domCache, 
        this.eventManager
      );
      this.smallPlayerButtonController.init();
    }

    this.floatingPlayerController = new window.YouTubeEnhancer.FloatingPlayerController(
      this.settingsManager,
      this.domCache,
      this.eventManager
    );
    this.floatingPlayerController.init();
    
  }

  notifyModulesOfSettingsChange(changedKeys) {
    if (this.audioCompressorController) {
      this.audioCompressorController.onSettingsChanged(changedKeys);
    }
    
    if (this.stereoPanningController) {
      this.stereoPanningController.onSettingsChanged(changedKeys);
    }
    
    if (this.pipButtonController) {
      this.pipButtonController.onSettingsChanged(changedKeys);
    }
    
    if (this.smallPlayerButtonController) {
      this.smallPlayerButtonController.onSettingsChanged(changedKeys);
    }
    
    if (this.floatingPlayerController) {
      this.floatingPlayerController.onSettingsChanged(changedKeys);
    }

    this.applyCustomSettings(changedKeys);
  }

  applyCustomSettings(changedKeys) {
    if (changedKeys.includes('customTheme')) {
      this.applyCustomTheme();
    }

    if (changedKeys.includes('customScripts')) {
      this.executeCustomScript();
    }
  }

  applyCustomTheme() {
    const existing = document.getElementById(this.customThemeStyleId);
    if (existing) {
      existing.remove();
    }

    const customTheme = this.settingsManager.getSetting('customTheme', '');
    if (!customTheme || !customTheme.trim()) {
      return;
    }

    const style = document.createElement('style');
    style.id = this.customThemeStyleId;
    style.textContent = customTheme;
    (document.head || document.documentElement).appendChild(style);
  }

  executeCustomScript() {
    const customScripts = this.settingsManager.getSetting('customScripts', '');
    if (!customScripts || !customScripts.trim()) {
      return;
    }

    try {
      const runCustomScript = new Function('player', 'settings', customScripts);
      runCustomScript(
        this.domCache.get('player'),
        this.settingsManager.settings
      );
    } catch (error) {
      if (this.settingsManager.getSetting('debugMode')) {
        console.error('Custom script execution failed:', error);
      }
    }
  }

  startMainLoop() {
    this.mainLoopInterval = this.eventManager.addInterval(() => {
      if (window.location.pathname.includes('/watch')) {
        this.runPeriodicChecks();
      }
    }, 30000);
    
  }

  runPeriodicChecks() {
    if (this.audioCompressorController && this.settingsManager.getSetting('enableCompressor')) {
      this.checkAudioContextHealth(this.audioCompressorController);
    }
    if (this.stereoPanningController && this.settingsManager.getSetting('enableStereoPan')) {
      this.checkAudioContextHealth(this.stereoPanningController);
    }
  }

  checkAudioContextHealth(controller) {
    try {
      if (!controller.audioContext || controller.audioContext.state === 'closed') {
        if (controller.isEnabled()) {
          controller.init();
        }
      }
    } catch (error) {
    }
  }

  cleanup() {
    
    if (this.mainLoopInterval) {
      this.eventManager.removeInterval(this.mainLoopInterval);
    }
    
    if (this.audioCompressorController) {
      this.audioCompressorController.cleanup();
    }
    
    if (this.stereoPanningController) {
      this.stereoPanningController.cleanup();
    }
    
    if (this.pipButtonController) {
      this.pipButtonController.cleanup();
    }
    
    if (this.smallPlayerButtonController) {
      this.smallPlayerButtonController.cleanup();
    }
    
    if (this.floatingPlayerController) {
      this.floatingPlayerController.cleanup();
    }
    
    if (this.eventManager) {
      this.eventManager.cleanup();
    }
    
    if (this.domCache) {
      this.domCache.clear();
    }
    
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.youTubeEnhancer = new YouTubePlayerEnhancer();
  });
} else {
  window.youTubeEnhancer = new YouTubePlayerEnhancer();
}

window.addEventListener('beforeunload', () => {
  if (window.youTubeEnhancer) {
    window.youTubeEnhancer.cleanup();
  }
});
