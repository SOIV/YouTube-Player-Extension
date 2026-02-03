// YouTube Player Enhancer - Floating Player Module

class FloatingPlayerController {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;
    this.boundProgressHandler = this.updateFloatingPlayerProgress.bind(this);
    this.currentPlayerContainer = null;
    this.lastSize = null;
    this.lastPosition = null;
    this.originalPlayerParent = null;
    this.originalPlayerNextSibling = null;
    this.isPlayerDetached = false;
  }

  isEnabled() {
    return this.settings.getSetting('popupPlayer');
  }

  init() {
    if (!this.isEnabled()) {
      return;
    }

    this.setupFloatingPlayer();
  }

  setupFloatingPlayer() {
    this.eventManager.addEventListener(document, 'yt-navigate-finish', () => {
      setTimeout(() => {
        if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
          this.applyFloatingPlayerSettings();
        }
      }, 1000);
    });

    if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
      setTimeout(() => {
        this.applyFloatingPlayerSettings();
      }, 2000);
    }
  }

  applyFloatingPlayerSettings() {
    try {
      if (this.settings.getSetting('popupPlayer')) {
        this.setupFloatingPlayerFeatures();
      } else {
        this.cleanup();
      }
    } catch (error) {
    }
  }

  setupFloatingPlayerFeatures() {
    if (!this.settings.getSetting('popupPlayer')) return;

    if (this.isCurrentlyInShorts()) {
      return;
    }

    this.addFloatingPlayerCSS();
    this.updateFloatingPlayerClasses();

    setTimeout(() => {
      this.setupFloatingPlayerObserver();
    }, 1000);
  }

  updateFloatingPlayerClasses() {
    const sizeClasses = [
      '256x144',
      '320x180',
      '400x225',
      '426x240',
      '480x270',
      '560x315',
      '640x360',
      '720x405',
      '960x540'
    ];
    const positionClasses = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right'
    ];

    sizeClasses.forEach(size => {
      document.body.classList.remove(`efyt-floating-player-${size}`);
    });
    positionClasses.forEach(pos => {
      document.body.classList.remove(`efyt-floating-player-${pos}`);
    });

    document.body.classList.add(
      `efyt-floating-player-${this.settings.getSetting('miniPlayerSize')}`,
      `efyt-floating-player-${this.settings.getSetting('miniPlayerPosition')}`
    );
  }

  setupFloatingPlayerObserver() {
    if (this.isCurrentlyInShorts()) {
      return;
    }

    const playerContainer = document.querySelector('#player-container');
    if (!playerContainer) return;

    if (this.currentPlayerContainer && this.currentPlayerContainer !== playerContainer) {
      if (this.currentPlayerContainer.efytObserver) {
        this.currentPlayerContainer.efytObserver.disconnect();
        delete this.currentPlayerContainer.efytObserver;
      }
    }
    this.currentPlayerContainer = playerContainer;

    if (playerContainer.efytObserver) return;

    playerContainer.efytObserver = new IntersectionObserver((entries) => {
      if (this.isCurrentlyInShorts()) {
        return;
      }

      const entry = entries[0];
      const video = this.domCache.get('video');
      const player = this.domCache.get('player');

      if (!video || !player) return;

      const isWatchOrLive = window.location.pathname.includes('/watch') || window.location.pathname.includes('/live');
      const scrollY = window.scrollY;
      const playerHeight = playerContainer.offsetHeight;

      if ((entry.intersectionRatio === 0 && !document.body.classList.contains('efyt-floating-player') && scrollY > 0) ||
          (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.12)) {

        if (scrollY > playerHeight - 100 && isWatchOrLive && !player.classList.contains('ended-mode')) {
          if (video) {
            video.removeEventListener('timeupdate', this.boundProgressHandler);
            video.addEventListener('timeupdate', this.boundProgressHandler);
            this.updateFloatingPlayerProgress();
          }
          this.detachMoviePlayer();
          document.body.classList.add('efyt-floating-player');

          this.updateVideoAspectRatio();

          window.dispatchEvent(new Event('resize'));
        }
      } else if (entry.intersectionRatio !== 0) {
        if (video) {
          video.removeEventListener('timeupdate', this.boundProgressHandler);
        }
        this.reattachMoviePlayer();
        document.body.classList.remove('efyt-floating-player');
        document.body.classList.remove('efyt-floating-player-vertical');
        window.dispatchEvent(new Event('resize'));
      }
    }, { threshold: [0, 0.2] });

    playerContainer.efytObserver.observe(playerContainer);
  }

  isCurrentlyInShorts() {
    if (window.location.pathname.includes('/shorts')) {
      return true;
    }

    if (document.querySelector('ytd-shorts') ||
        document.querySelector('[is-shorts]') ||
        document.querySelector('#shorts-player') ||
        document.querySelector('ytd-reel-video-renderer')) {
      return true;
    }

    if (document.body.classList.contains('shorts') ||
        document.documentElement.getAttribute('data-current-page-type') === 'shorts') {
      return true;
    }

    return false;
  }

  updateVideoAspectRatio() {
    if (this.isCurrentlyInShorts()) {
      document.body.classList.remove('efyt-floating-player-vertical');
      document.documentElement.style.removeProperty('--efyt-floating-player-aspect-ratio');
      return;
    }

    const video = this.domCache.get('video');
    if (!video) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setTimeout(() => this.updateVideoAspectRatio(), 500);
      return;
    }

    const aspectRatio = video.videoWidth / video.videoHeight;
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) {
      return;
    }

    const isVertical = aspectRatio < 1;

    if (isVertical) {
      document.body.classList.add('efyt-floating-player-vertical');
    } else {
      document.body.classList.remove('efyt-floating-player-vertical');
    }

    document.documentElement.style.setProperty('--efyt-floating-player-aspect-ratio', aspectRatio);
  }

  updateFloatingPlayerProgress() {
    const video = this.domCache.get('video');
    const progressBar = document.querySelector('#efyt-progress');

    if (video && progressBar) {
      if (video.duration > 0) {
        progressBar.value = video.currentTime / video.duration;
      }
    }
  }

  addFloatingPlayerCSS() {
    const currentSize = this.settings.getSetting('miniPlayerSize');
    const currentPosition = this.settings.getSetting('miniPlayerPosition');
    const existingStyle = document.getElementById('efyt-floating-player-styles');
    if (existingStyle && this.lastSize === currentSize && this.lastPosition === currentPosition) return;
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'efyt-floating-player-styles';
    
    const sizeMap = {
      '256x144': ['256', '144'],
      '320x180': ['320', '180'], 
      '400x225': ['400', '225'],
      '426x240': ['426', '240'],
      '480x270': ['480', '270'],
      '560x315': ['560', '315'],
      '640x360': ['640', '360'],
      '720x405': ['720', '405'],
      '960x540': ['960', '540']
    };
    const sizes = sizeMap[currentSize] || sizeMap['480x270'];
    const aspectRatio = 16/9;
    
    style.textContent = `
      :root {
        --efyt-floating-player-aspect-ratio: ${aspectRatio};
        --efyt-floating-player-height: ${sizes[1] || '180'}px;
        --efyt-floating-player-width: ${sizes[0] || '320'}px;
        --efyt-floating-player-center-left: calc(100vw / 2 - ${(sizes[0] || 320)/2}px);
      }

      body.efyt-floating-player .ytp-contextmenu {
        z-index: 2147483647 !important;
      }

      body:not(.efyt-floating-player) efyt-progress-tooltip {
        display: none;
      }

      #efyt-progress {
        appearance: none;
        background: #333;
        border: none;
        color: #f03;
        cursor: pointer;
        display: none;
        height: 3px;
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0;
      }

      body.efyt-floating-player #movie_player:not(.unstarted-mode) #efyt-progress {
        display: block;
      }

      body.efyt-floating-player #movie_player.ytp-autohide #efyt-progress {
        display: none;
      }

      efyt-hide-mini-player {
        cursor: pointer;
        display: none;
        height: 25px;
        position: relative;
        top: 5px;
        left: 5px;
        width: 25px;
        z-index: 2198;
      }

      efyt-hide-mini-player svg {
        fill: #eee !important;
      }

      efyt-hide-mini-player:hover svg {
        fill: #fff !important;
      }

      body.efyt-floating-player-top-right efyt-hide-mini-player,
      body.efyt-floating-player-bottom-right efyt-hide-mini-player {
        float: right;
        margin-right: 5px;
      }

      body.efyt-floating-player efyt-hide-mini-player {
        display: block;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) {
        background: #000 !important;
        position: fixed !important;
        z-index: 2147483640 !important;
      }

      body.efyt-floating-player.efyt-floating-player-top-left #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-bottom-left #movie_player:not(.ytp-fullscreen) {
        left: 15px !important;
        right: auto !important;
      }

      body.efyt-floating-player.efyt-floating-player-top-center #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-bottom-center #movie_player:not(.ytp-fullscreen) {
        left: var(--efyt-floating-player-center-left) !important;
      }

      body.efyt-floating-player.efyt-floating-player-top-right #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-bottom-right #movie_player:not(.ytp-fullscreen) {
        left: auto !important;
        right: 15px !important;
      }

      body.efyt-floating-player.efyt-floating-player-top-left #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-top-center #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-top-right #movie_player:not(.ytp-fullscreen) {
        top: 60px !important;
      }

      body.efyt-floating-player.efyt-floating-player-bottom-left #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-bottom-center #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-bottom-right #movie_player:not(.ytp-fullscreen) {
        bottom: 15px !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: auto !important;
        width: var(--efyt-floating-player-width) !important;
        aspect-ratio: var(--efyt-floating-player-aspect-ratio) !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        margin-left: 0 !important;
        left: 0 !important;
        top: 0 !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-chrome-bottom {
        width: calc(100% - 24px) !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) {
        border-radius: 8px !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-autoplay-icon {
        display: none !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-settings-button {
        display: none !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-right-controls > *:not(.ytp-subtitles-button) {
        display: none !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-cards-teaser,
      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-ce-element,
      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-cards-button {
        display: none !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-watermark {
        display: none !important;
      }


      body.efyt-floating-player-vertical #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: auto !important;
        width: auto !important;
        aspect-ratio: var(--efyt-floating-player-aspect-ratio) !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-256x144 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-256x144 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 256px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-320x180 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-320x180 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 320px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-400x225 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-400x225 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 400px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-426x240 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-426x240 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 426px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-480x270 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-480x270 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 480px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-560x315 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-560x315 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 560px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-640x360 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-640x360 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 640px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-720x405 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-720x405 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 720px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical.efyt-floating-player-960x540 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-960x540 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 960px !important;
        width: auto !important;
      }

      body.efyt-floating-player-vertical #movie_player:not(.ytp-fullscreen) .ytp-chrome-bottom {
        width: calc(100% - 24px) !important;
      }
    `;

    document.head.appendChild(style);
    this.lastSize = currentSize;
    this.lastPosition = currentPosition;

    this.addFloatingPlayerElements();
  }

  addFloatingPlayerElements() {
    const player = this.domCache.get('player');
    if (player && !document.querySelector('#efyt-progress')) {
      const progressBar = document.createElement('input');
      progressBar.type = 'range';
      progressBar.id = 'efyt-progress';
      progressBar.min = '0';
      progressBar.max = '1';
      progressBar.step = '0.01';
      progressBar.value = '0';
      player.appendChild(progressBar);

      progressBar.addEventListener('input', (e) => {
        const video = this.domCache.get('video');
        if (video && video.duration > 0) {
          video.currentTime = e.target.value * video.duration;
        }
      });
    }
  }

  onSettingsChanged(changedSettings) {
    const floatingPlayerSettings = ['popupPlayer', 'miniPlayerSize', 'miniPlayerPosition'];
    const hasFloatingPlayerChanges = changedSettings.some(key => floatingPlayerSettings.includes(key));
    
    if (hasFloatingPlayerChanges) {
      setTimeout(() => {
        this.applyFloatingPlayerSettings();
      }, 500);
    }
  }

  cleanup() {
    const style = document.getElementById('efyt-floating-player-styles');
    if (style) {
      style.remove();
    }

    if (this.currentPlayerContainer && this.currentPlayerContainer.efytObserver) {
      this.currentPlayerContainer.efytObserver.disconnect();
      delete this.currentPlayerContainer.efytObserver;
    }
    this.currentPlayerContainer = null;

    document.body.classList.remove('efyt-floating-player');
    document.body.classList.remove('efyt-floating-player-vertical');
    const positionClasses = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    positionClasses.forEach(pos => {
      document.body.classList.remove(`efyt-floating-player-${pos}`);
    });
    const sizeClasses = ['256x144', '320x180', '400x225', '426x240', '480x270', '560x315', '640x360', '720x405', '960x540'];
    sizeClasses.forEach(size => {
      document.body.classList.remove(`efyt-floating-player-${size}`);
    });

    const video = this.domCache.get('video');
    if (video) {
      video.removeEventListener('timeupdate', this.boundProgressHandler);
    }

    this.reattachMoviePlayer();

    const progressBar = document.querySelector('#efyt-progress');
    if (progressBar) {
      progressBar.remove();
    }
  }

  detachMoviePlayer() {
    const moviePlayer = document.querySelector('#movie_player');
    if (!moviePlayer) return;
    if (this.isPlayerDetached && moviePlayer.parentElement === document.body) return;

    this.originalPlayerParent = moviePlayer.parentElement;
    this.originalPlayerNextSibling = moviePlayer.nextSibling;

    if (this.originalPlayerParent) {
      document.body.appendChild(moviePlayer);
      this.isPlayerDetached = true;
    }
  }

  reattachMoviePlayer() {
    if (!this.isPlayerDetached) return;

    const moviePlayer = document.querySelector('#movie_player');
    if (!moviePlayer) {
      this.isPlayerDetached = false;
      this.originalPlayerParent = null;
      this.originalPlayerNextSibling = null;
      return;
    }

    let parent = this.originalPlayerParent;
    if (!parent || !document.contains(parent)) {
      parent = document.querySelector('ytd-player') || document.querySelector('#player-container');
    }

    if (parent) {
      if (this.originalPlayerNextSibling && parent.contains(this.originalPlayerNextSibling)) {
        parent.insertBefore(moviePlayer, this.originalPlayerNextSibling);
      } else {
        parent.appendChild(moviePlayer);
      }
    }

    this.isPlayerDetached = false;
    this.originalPlayerParent = null;
    this.originalPlayerNextSibling = null;
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.FloatingPlayerController = FloatingPlayerController;
