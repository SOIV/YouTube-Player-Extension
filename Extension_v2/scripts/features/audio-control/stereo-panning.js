// YouTube Player Enhancer - Stereo Panning Module

class StereoPanningController {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;
    
    this.audioContext = null;
    this.gainNode = null;
    this.stereoPannerNode = null;
    this.sourceNode = null;
    this.connectedVideoElement = null;
    
    this.settingsDebounceTimer = null;
    this.isApplyingSettings = false;
    this.lastApplyTime = 0;
    
    this.visibilityChangeHandler = null;
    this.videoPlayHandler = null;
    this.documentClickHandler = null;
    
    this.retryCount = 0;
  }

  isEnabled() {
    return this.settings.getSetting('enableStereoPan');
  }

  async init() {
    if (!this.isEnabled()) {
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.setupAudioContextLifecycle();
      await this.setupAudioNodes();
      await this.connectToVideo();
      this.setupVideoPlayListener();
    } catch (error) {
      console.error('Stereo Panning init error:', error);
    }
  }

  setupAudioContextLifecycle() {
    this.visibilityChangeHandler = () => {
      if (!this.audioContext) return;
    };
    
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  async connectToVideo() {
    const videoElement = document.querySelector('video');
    
    if (!videoElement) {
      return;
    }

    if (this.connectedVideoElement === videoElement) {
      return;
    }

    if (!this.audioContext) {
      return;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.sourceNode) {
        this.sourceNode.disconnect();
      }

      this.sourceNode = this.audioContext.createMediaElementSource(videoElement);
      this.connectedVideoElement = videoElement;

      this.sourceNode.connect(this.gainNode);
      
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        await this.recreateVideoElement();
        
        if (!this.retryCount) {
          this.retryCount = 1;
          await this.connectToVideo();
          this.retryCount = 0;
        }
      }
    }
  }
  
  async recreateVideoElement() {
    try {
      const video = document.querySelector('video');
      if (!video) return;
      
      const currentTime = video.currentTime;
      const wasPaused = video.paused;
      const volume = video.volume;
      const muted = video.muted;
      
      const newVideo = video.cloneNode(true);
      newVideo.currentTime = currentTime;
      newVideo.volume = volume;
      newVideo.muted = muted;
      
      video.parentNode.replaceChild(newVideo, video);
      
      if (this.domCache) {
        this.domCache.delete('video');
        this.domCache.delete('player');
      }
      
      this.connectedVideoElement = null;
      
      if (!wasPaused) {
        await newVideo.play().catch(() => {});
      }
      
    } catch (error) {
    }
  }

  setupVideoPlayListener() {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    this.videoPlayHandler = async () => {
      if (!this.audioContext || this.audioContext.state !== 'suspended') {
        return;
      }
      
      try {
        await this.audioContext.resume();
      } catch (error) {
      }
    };

    this.documentClickHandler = async () => {
      if (!this.audioContext || this.audioContext.state !== 'suspended') {
        return;
      }
      
      try {
        await this.audioContext.resume();
      } catch (error) {
      }
    };

    videoElement.addEventListener('play', this.videoPlayHandler, { once: true });
    document.addEventListener('click', this.documentClickHandler, { once: true });
  }

  async setupAudioNodes() {
    if (!this.audioContext) return;

    try {
      if (!this.gainNode) {
        this.gainNode = this.audioContext.createGain();
      }
      
      if (this.isEnabled()) {
        if (!this.stereoPannerNode) {
          this.stereoPannerNode = this.audioContext.createStereoPanner();
          const panValue = this.settings.getSetting('stereoPan', 0) / 100;
          this.stereoPannerNode.pan.value = Math.max(-1, Math.min(1, panValue));
        }
      }

      this.connectAudioNodes();
      
    } catch (error) {
    }
  }

  connectAudioNodes() {
    if (!this.audioContext || !this.gainNode) return;
    
    if (!this.isEnabled()) {
      return;
    }

    try {
      if (this.gainNode) {
        this.gainNode.disconnect();
      }
      if (this.stereoPannerNode) {
        this.stereoPannerNode.disconnect();
      }
    } catch (error) {
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
        this.sourceNode.connect(this.gainNode);
      } catch (error) {
      }
    }

    let currentNode = this.gainNode;
    
    if (this.isEnabled() && this.stereoPannerNode) {
      currentNode.connect(this.stereoPannerNode);
      currentNode = this.stereoPannerNode;
    }
    
    currentNode.connect(this.audioContext.destination);

    this.applyAudioSettings();
  }

  disconnectAudioNodes() {
    try {
      if (this.gainNode) this.gainNode.disconnect();
      if (this.stereoPannerNode) this.stereoPannerNode.disconnect();
    } catch (error) {
    }
  }

  applyAudioSettings() {
    if (!this.audioContext || !this.gainNode) {
      return;
    }
    
    try {
      const currentTime = this.audioContext.currentTime;

      this.gainNode.gain.setValueAtTime(1.0, currentTime);

      if (this.isEnabled() && this.stereoPannerNode) {
        const panValue = this.settings.getSetting('stereoPan', 0) / 100;
        const clampedPan = Math.max(-1, Math.min(1, panValue));
        this.stereoPannerNode.pan.setValueAtTime(clampedPan, currentTime);
      }
      
    } catch (error) {
    }
  }

  async onSettingsChanged(changedSettings) {
    const audioSettings = ['stereoPan'];
    const hasAudioChanges = changedSettings.some(key => audioSettings.includes(key));
    
    if (!hasAudioChanges) return;

    if (!this.audioContext) {
      return;
    }

    const now = Date.now();
    const timeSinceLastApply = now - this.lastApplyTime;
    
    if (this.isApplyingSettings || timeSinceLastApply < 100) {
      if (this.settingsDebounceTimer) {
        clearTimeout(this.settingsDebounceTimer);
      }
      
      this.settingsDebounceTimer = setTimeout(() => {
        this.applyAudioSettingsThrottled();
      }, 150);
      return;
    }
    
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
    }
    
    this.settingsDebounceTimer = setTimeout(() => {
      this.applyAudioSettingsThrottled();
    }, 150);
  }

  applyAudioSettingsThrottled() {
    if (this.isApplyingSettings) return;
    
    this.isApplyingSettings = true;
    this.lastApplyTime = Date.now();
    
    try {
      this.applyAudioSettings();
    } finally {
      this.isApplyingSettings = false;
      this.settingsDebounceTimer = null;
    }
  }

  cleanup() {
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
      this.settingsDebounceTimer = null;
    }
    
    this.cleanupAudioContext();
    
    if (!this.isEnabled()) {
      this.restoreVideoAudio();
    }
  }
  
  restoreVideoAudio() {
    try {
      const video = document.querySelector('video');
      if (!video) return;
      
      const currentTime = video.currentTime;
      const wasPaused = video.paused;
      
      const newVideo = video.cloneNode(true);
      newVideo.currentTime = currentTime;
      
      video.parentNode.replaceChild(newVideo, video);
      
      if (this.domCache) {
        this.domCache.delete('video');
        this.domCache.delete('player');
      }
      
      if (!wasPaused) {
        newVideo.play().catch(() => {});
      }
      
    } catch (error) {
    }
  }

  cleanupAudioContext() {
    try {
      if (this.visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
        this.visibilityChangeHandler = null;
      }
      
      if (this.videoPlayHandler) {
        const videoElement = document.querySelector('video');
        if (videoElement) {
          videoElement.removeEventListener('play', this.videoPlayHandler);
        }
        this.videoPlayHandler = null;
      }
      
      if (this.documentClickHandler) {
        document.removeEventListener('click', this.documentClickHandler);
        this.documentClickHandler = null;
      }
      
      this.disconnectAudioNodes();
      
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      
      this.audioContext = null;
      this.gainNode = null;
      this.stereoPannerNode = null;
      this.connectedVideoElement = null;
      
    } catch (error) {
    }
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.StereoPanningController = StereoPanningController;
