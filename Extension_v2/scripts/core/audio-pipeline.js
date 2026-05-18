// YouTube Player Enhancer - Shared Audio Pipeline

class AudioPipeline {
  constructor(settingsManager, domCache) {
    this.settings = settingsManager;
    this.domCache = domCache;

    this.audioContext = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.compressorNode = null;
    this.stereoPannerNode = null;
    this.connectedVideoElement = null;

    this.videoPlayHandler = null;
    this.documentClickHandler = null;
    this.visibilityChangeHandler = null;
    this.navigationHandler = null;
    this.reconnectTimer = null;

    this.setupNavigationListener();
  }

  static getInstance(settingsManager, domCache) {
    if (!window.YouTubeEnhancer.audioPipeline) {
      window.YouTubeEnhancer.audioPipeline = new AudioPipeline(settingsManager, domCache);
    }
    return window.YouTubeEnhancer.audioPipeline;
  }

  isDebugEnabled() {
    return !!this.settings.getSetting('debugMode');
  }

  isAnyEffectEnabled() {
    return !!(
      this.settings.getSetting('enableCompressor') ||
      this.settings.getSetting('enableStereoPan')
    );
  }

  async ensureReady() {
    if (!this.isAnyEffectEnabled()) {
      this.applySettings();
      return;
    }

    try {
      this.ensureAudioContext();
      this.ensureAudioNodes();
      await this.connectToVideo();
      this.setupUserActivationListeners();
      this.routeAudioGraph();
      this.applySettings();
    } catch (error) {
      this.logError('Failed to initialize audio pipeline:', error);
    }
  }

  ensureAudioContext() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      return;
    }

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.setupAudioContextLifecycle();
  }

  ensureAudioNodes() {
    if (!this.audioContext) return;

    if (!this.gainNode) {
      this.gainNode = this.audioContext.createGain();
    }

    if (!this.compressorNode) {
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.compressorNode.threshold.value = -24;
      this.compressorNode.knee.value = 30;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;
    }

    if (!this.stereoPannerNode) {
      this.stereoPannerNode = this.audioContext.createStereoPanner();
    }
  }

  setupAudioContextLifecycle() {
    if (this.visibilityChangeHandler) return;

    this.visibilityChangeHandler = () => {
      if (!this.audioContext || this.audioContext.state !== 'suspended') {
        return;
      }

      if (!document.hidden && this.isAnyEffectEnabled()) {
        this.resumeContext();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  async connectToVideo() {
    const videoElement = this.getCurrentVideo();
    if (!videoElement || !this.audioContext) {
      return false;
    }

    if (this.connectedVideoElement === videoElement && this.sourceNode) {
      return true;
    }

    this.disconnectSource();

    try {
      this.sourceNode = this.audioContext.createMediaElementSource(videoElement);
      this.connectedVideoElement = videoElement;
      return true;
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        this.logError('Video already has a MediaElementSource. Audio effects are skipped for this page instance.');
      } else {
        this.logError('Failed to connect video:', error);
      }
      this.sourceNode = null;
      this.connectedVideoElement = null;
      return false;
    }
  }

  disconnectSource() {
    if (!this.sourceNode) return;

    try {
      this.sourceNode.disconnect();
    } catch (error) {
    }

    this.sourceNode = null;
    this.connectedVideoElement = null;
  }

  getCurrentVideo() {
    const currentVideo = document.querySelector('#movie_player video') ||
                         document.querySelector('.html5-video-player video') ||
                         document.querySelector('video');
    const cachedVideo = this.domCache ? this.domCache.get('video') : null;

    if (currentVideo && cachedVideo && currentVideo !== cachedVideo && this.domCache) {
      this.domCache.delete('video');
    }

    if (currentVideo) {
      return currentVideo;
    }

    return cachedVideo && document.contains(cachedVideo) ? cachedVideo : null;
  }

  setupNavigationListener() {
    if (this.navigationHandler) return;

    this.navigationHandler = () => {
      if (this.domCache) {
        this.domCache.delete('video');
        this.domCache.delete('player');
      }

      if (this.isAnyEffectEnabled()) {
        this.scheduleReconnect();
      }
    };

    document.addEventListener('yt-navigate-finish', this.navigationHandler);
  }

  routeAudioGraph() {
    if (!this.audioContext || !this.sourceNode || !this.gainNode) {
      return;
    }

    this.disconnectGraphNodes();

    try {
      this.sourceNode.connect(this.gainNode);

      let currentNode = this.gainNode;

      if (this.settings.getSetting('enableCompressor') && this.compressorNode) {
        currentNode.connect(this.compressorNode);
        currentNode = this.compressorNode;
      }

      if (this.settings.getSetting('enableStereoPan') && this.stereoPannerNode) {
        currentNode.connect(this.stereoPannerNode);
        currentNode = this.stereoPannerNode;
      }

      currentNode.connect(this.audioContext.destination);
    } catch (error) {
      this.logError('Failed to route audio graph:', error);
    }
  }

  disconnectGraphNodes() {
    [this.gainNode, this.compressorNode, this.stereoPannerNode].forEach((node) => {
      if (!node) return;
      try {
        node.disconnect();
      } catch (error) {
      }
    });
  }

  applySettings() {
    if (!this.audioContext || !this.gainNode) {
      return;
    }

    const currentTime = this.audioContext.currentTime;

    try {
      const volumePercent = this.settings.getSetting('volumeBoost', 100);
      const gainValue = this.settings.getSetting('enableCompressor') ? volumePercent / 100 : 1;
      this.gainNode.gain.setValueAtTime(gainValue, currentTime);

      if (this.compressorNode) {
        const ratio = this.settings.getSetting('compressorRatio', 12);
        this.compressorNode.ratio.setValueAtTime(ratio, currentTime);
      }

      if (this.stereoPannerNode) {
        const panValue = this.settings.getSetting('enableStereoPan')
          ? this.settings.getSetting('stereoPan', 0) / 100
          : 0;
        const clampedPan = Math.max(-1, Math.min(1, panValue));
        this.stereoPannerNode.pan.setValueAtTime(clampedPan, currentTime);
      }
    } catch (error) {
      this.logError('Failed to apply audio settings:', error);
    }
  }

  async onSettingsChanged(changedSettings) {
    const audioSettings = [
      'enableCompressor',
      'volumeBoost',
      'compressorRatio',
      'enableStereoPan',
      'stereoPan'
    ];

    if (!changedSettings.some(key => audioSettings.includes(key))) {
      return;
    }

    if (this.isAnyEffectEnabled()) {
      await this.ensureReady();
      return;
    }

    this.routeAudioGraph();
    this.applySettings();
  }

  checkHealth() {
    if (!this.isAnyEffectEnabled()) {
      return;
    }

    const currentVideo = this.getCurrentVideo();
    if (!this.audioContext || this.audioContext.state === 'closed' ||
        !this.sourceNode || this.connectedVideoElement !== currentVideo) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.domCache) {
        this.domCache.delete('video');
        this.domCache.delete('player');
      }
      await this.ensureReady();
    }, 250);
  }

  setupUserActivationListeners() {
    const videoElement = this.getCurrentVideo();

    if (videoElement && this.videoPlayHandler) {
      videoElement.removeEventListener('play', this.videoPlayHandler);
    }

    this.videoPlayHandler = () => {
      this.resumeContext();
    };

    if (videoElement) {
      videoElement.addEventListener('play', this.videoPlayHandler);
    }

    if (!this.documentClickHandler) {
      this.documentClickHandler = () => {
        this.resumeContext();
      };
      document.addEventListener('click', this.documentClickHandler);
    }
  }

  async resumeContext() {
    if (!this.audioContext || this.audioContext.state !== 'suspended') {
      return;
    }

    try {
      await this.audioContext.resume();
    } catch (error) {
    }
  }

  cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.videoPlayHandler) {
      const videoElement = this.connectedVideoElement || document.querySelector('video');
      if (videoElement) {
        videoElement.removeEventListener('play', this.videoPlayHandler);
      }
      this.videoPlayHandler = null;
    }

    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }

    if (this.navigationHandler) {
      document.removeEventListener('yt-navigate-finish', this.navigationHandler);
      this.navigationHandler = null;
    }

    this.disconnectGraphNodes();
    this.disconnectSource();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.audioContext = null;
    this.gainNode = null;
    this.compressorNode = null;
    this.stereoPannerNode = null;
  }

  logError(...args) {
    if (this.isDebugEnabled()) {
      console.error('[AudioPipeline]', ...args);
    }
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.AudioPipeline = AudioPipeline;
