// YouTube Player Enhancer - Audio Compressor Module

class AudioCompressorController {
  constructor(settingsManager, domCache) {
    this.settings = settingsManager;
    this.pipeline = window.YouTubeEnhancer.AudioPipeline.getInstance(settingsManager, domCache);
  }

  isEnabled() {
    return !!this.settings.getSetting('enableCompressor');
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
    this.pipeline.cleanup();
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.AudioCompressorController = AudioCompressorController;
