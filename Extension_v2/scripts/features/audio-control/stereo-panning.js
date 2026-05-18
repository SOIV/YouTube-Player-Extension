// YouTube Player Enhancer - Stereo Panning Module

class StereoPanningController {
  constructor(settingsManager, domCache) {
    this.settings = settingsManager;
    this.pipeline = window.YouTubeEnhancer.AudioPipeline.getInstance(settingsManager, domCache);
  }

  isEnabled() {
    return !!this.settings.getSetting('enableStereoPan');
  }

  async init() {
    await this.pipeline.ensureReady();
  }

  async onSettingsChanged(changedSettings) {
    await this.pipeline.onSettingsChanged(changedSettings);
  }

  checkHealth() {
    this.pipeline.checkHealth();
  }

  cleanup() {
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.StereoPanningController = StereoPanningController;
