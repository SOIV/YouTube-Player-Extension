// YouTube Player Enhancer - Floating Player Module (Debug Version)

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
    
    this.intersectionObserver = null;
    this.mutationObserver = null;
    
    this.lastKnownPlayerState = {
      isMiniPlayer: false,
      isPIP: false
    };
    
    // 디버깅 플래그
    this.DEBUG = true;
  }

  log(...args) {
    if (this.DEBUG) {
      console.log('[FloatingPlayer]', ...args);
    }
  }

  isEnabled() {
    return this.settings.getSetting('popupPlayer');
  }

  init() {
    if (!this.isEnabled()) {
      this.log('Floating player disabled');
      return;
    }

    this.log('Initializing floating player');
    this.setupFloatingPlayer();
  }

  setupFloatingPlayer() {
    this.eventManager.addEventListener(document, 'yt-navigate-finish', () => {
      setTimeout(() => {
        if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
          this.log('Page navigation detected, applying settings');
          this.applyFloatingPlayerSettings();
        } else {
          // watch나 live가 아닌 페이지로 이동 시 플로팅 플레이어 비활성화
          this.log('Navigated away from watch/live page, deactivating floating player');
          if (document.body.classList.contains('efyt-floating-player')) {
            this.deactivateFloatingPlayer();
            this.cleanupObservers();
          }
        }
      }, 1000);
    });

    if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
      setTimeout(() => {
        this.log('Initial setup on watch page');
        this.applyFloatingPlayerSettings();
      }, 2000);
    }
  }

  applyFloatingPlayerSettings() {
    try {
      if (this.settings.getSetting('popupPlayer')) {
        this.log('Setting up floating player features');
        this.setupFloatingPlayerFeatures();
      } else {
        this.log('Cleaning up floating player');
        this.cleanup();
      }
    } catch (error) {
      console.error('[FloatingPlayer] Error applying settings:', error);
    }
  }

  setupFloatingPlayerFeatures() {
    if (!this.settings.getSetting('popupPlayer')) return;

    if (this.isCurrentlyInShorts()) {
      this.log('Shorts detected, skipping setup');
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
      '854x480',
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
      this.log('Shorts detected, skipping observer setup');
      return;
    }

    const playerContainer = document.querySelector('#player-container');
    if (!playerContainer) {
      this.log('Player container not found');
      return;
    }

    this.log('Setting up IntersectionObserver');
    
    // 기존 observer 정리
    this.cleanupObservers();
    
    this.currentPlayerContainer = playerContainer;

    // IntersectionObserver 설정
    this.intersectionObserver = new IntersectionObserver((entries) => {
      if (this.isCurrentlyInShorts()) {
        return;
      }

      const entry = entries[0];
      const video = this.domCache.get('video');
      const player = this.domCache.get('player');

      if (!video || !player) {
        this.log('Video or player not found in observer');
        return;
      }

      // YouTube 네이티브 miniplayer나 PIP 상태 체크
      const isMiniPlayer = player.classList.contains('ytp-player-minimized');
      const isPIP = document.pictureInPictureElement !== null;

      this.log('Observer triggered:', {
        intersectionRatio: entry.intersectionRatio,
        scrollY: window.scrollY,
        isMiniPlayer,
        isPIP,
        isFloatingActive: document.body.classList.contains('efyt-floating-player')
      });

      // 네이티브 miniplayer나 PIP 모드일 때는 우리 floating player 비활성화
      if (isMiniPlayer || isPIP) {
        this.log('Native miniplayer or PIP active, deactivating floating');
        if (document.body.classList.contains('efyt-floating-player')) {
          this.deactivateFloatingPlayer();
        }
        return;
      }

      const isWatchOrLive = window.location.pathname.includes('/watch') || window.location.pathname.includes('/live');
      const scrollY = window.scrollY;
      const playerHeight = playerContainer.offsetHeight;

      if ((entry.intersectionRatio === 0 && !document.body.classList.contains('efyt-floating-player') && scrollY > 0) ||
          (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.12)) {

        if (scrollY > playerHeight - 100 && isWatchOrLive && !player.classList.contains('ended-mode')) {
          this.log('Activating floating player');
          this.activateFloatingPlayer();
        }
      } else if (entry.intersectionRatio !== 0.5) {
        this.log('Deactivating floating player (scrolled back)');
        this.deactivateFloatingPlayer();
      }
    }, { threshold: [0, 0.2, 0.5] });

    this.intersectionObserver.observe(playerContainer);
    this.log('IntersectionObserver setup complete');

    // MutationObserver 추가: 플레이어 클래스 변화 감지
    const player = this.domCache.get('player');
    if (player) {
      this.log('Setting up MutationObserver for player state');
      
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isMiniPlayer = player.classList.contains('ytp-player-minimized');
            const isPIP = document.pictureInPictureElement !== null;

            // 상태 변화 감지
            if (this.lastKnownPlayerState.isMiniPlayer !== isMiniPlayer ||
                this.lastKnownPlayerState.isPIP !== isPIP) {
              
              this.log('Player state changed:', {
                wasMiniPlayer: this.lastKnownPlayerState.isMiniPlayer,
                isMiniPlayer,
                wasPIP: this.lastKnownPlayerState.isPIP,
                isPIP
              });
              
              // miniplayer나 PIP에서 일반 모드로 돌아온 경우
              if ((this.lastKnownPlayerState.isMiniPlayer && !isMiniPlayer) ||
                  (this.lastKnownPlayerState.isPIP && !isPIP)) {
                
                this.log('Returned from miniplayer/PIP, reinitializing...');
                
                // floating player 비활성화
                this.deactivateFloatingPlayer();
                
                // Observer 완전 재설정
                setTimeout(() => {
                  // player를 다시 가져와서 최신 상태 확인
                  const currentPlayer = this.domCache.get('player');
                  const currentIsMiniPlayer = currentPlayer ? currentPlayer.classList.contains('ytp-player-minimized') : false;
                  const currentIsPIP = document.pictureInPictureElement !== null;
                  
                  this.log('Checking state for reinit:', {
                    isShorts: this.isCurrentlyInShorts(),
                    isMiniPlayer: currentIsMiniPlayer,
                    isPIP: currentIsPIP
                  });
                  
                  if (!this.isCurrentlyInShorts() && 
                      !currentIsMiniPlayer &&
                      !currentIsPIP) {
                    this.log('Reinitializing observer after miniplayer exit');
                    this.setupFloatingPlayerObserver();
                  } else {
                    this.log('Skipping reinit - conditions not met');
                  }
                }, 300);
              }
              
              // miniplayer나 PIP 활성화된 경우
              if ((!this.lastKnownPlayerState.isMiniPlayer && isMiniPlayer) ||
                  (!this.lastKnownPlayerState.isPIP && isPIP)) {
                this.log('Entering miniplayer/PIP mode');
                this.deactivateFloatingPlayer();
              }

              this.lastKnownPlayerState.isMiniPlayer = isMiniPlayer;
              this.lastKnownPlayerState.isPIP = isPIP;
            }
          }
        });
      });

      this.mutationObserver.observe(player, { 
        attributes: true,
        attributeFilter: ['class']
      });
      
      this.log('MutationObserver setup complete');
    }

    // PIP 이벤트 리스너 추가
    const pipEnterHandler = () => {
      this.log('PIP entered via event');
      this.deactivateFloatingPlayer();
    };
    
    const pipLeaveHandler = () => {
      this.log('PIP left via event');
      setTimeout(() => {
        if (!this.isCurrentlyInShorts()) {
          this.log('Checking state after PIP exit...');
        }
      }, 100);
    };
    
    document.addEventListener('enterpictureinpicture', pipEnterHandler);
    document.addEventListener('leavepictureinpicture', pipLeaveHandler);
    
    // cleanup을 위해 참조 저장
    this.pipEnterHandler = pipEnterHandler;
    this.pipLeaveHandler = pipLeaveHandler;
  }

  // 플로팅 플레이어 활성화
  activateFloatingPlayer() {
    this.log('Activating floating player...');
    const video = this.domCache.get('video');
    
    if (video) {
      video.removeEventListener('timeupdate', this.boundProgressHandler);
      video.addEventListener('timeupdate', this.boundProgressHandler);
      this.updateFloatingPlayerProgress();
    }
    
    this.detachMoviePlayer();
    document.body.classList.add('efyt-floating-player');
    this.updateVideoAspectRatio();
    window.dispatchEvent(new Event('resize'));
    
    this.log('Floating player activated');
  }

  // 플로팅 플레이어 비활성화
  deactivateFloatingPlayer() {
    this.log('Deactivating floating player...');
    const video = this.domCache.get('video');
    
    if (video) {
      video.removeEventListener('timeupdate', this.boundProgressHandler);
    }
    
    this.reattachMoviePlayer();
    document.body.classList.remove('efyt-floating-player');
    document.body.classList.remove('efyt-floating-player-vertical');
    window.dispatchEvent(new Event('resize'));
    
    this.log('Floating player deactivated');
  }

  // Observer들만 정리
  cleanupObservers() {
    this.log('Cleaning up observers');
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
      this.log('IntersectionObserver disconnected');
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
      this.log('MutationObserver disconnected');
    }

    // 기존 방식도 유지 (하위 호환성)
    if (this.currentPlayerContainer && this.currentPlayerContainer.efytObserver) {
      this.currentPlayerContainer.efytObserver.disconnect();
      delete this.currentPlayerContainer.efytObserver;
    }
  }

  isCurrentlyInShorts() {
    // URL이 /watch 또는 /live면 무조건 shorts가 아님
    if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
      return false;
    }

    // URL 체크
    if (window.location.pathname.includes('/shorts')) {
      return true;
    }

    // DOM 요소로 쇼츠 감지
    if (document.querySelector('ytd-shorts') ||
        document.querySelector('[is-shorts]') ||
        document.querySelector('#shorts-player') ||
        document.querySelector('ytd-reel-video-renderer')) {
      return true;
    }

    // body 클래스로 쇼츠 감지
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

    if (existingStyle && this.lastSize === currentSize && this.lastPosition === currentPosition) {
      return;
    }

    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'efyt-floating-player-styles';
    style.textContent = `
      body.efyt-floating-player #player-container,
      body.efyt-floating-player #player-container.ytd-watch-flexy {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
        min-height: 0 !important;
        height: 0 !important;
      }

      body.efyt-floating-player #below,
      body.efyt-floating-player #secondary {
        margin-top: 24px !important;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) {
        width: 426px !important;
        height: 240px !important;
        position: fixed !important;
        z-index: 2147483647 !important;
        pointer-events: auto !important;
        top: 24px !important;
        right: 24px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
      }

      body.efyt-floating-player.efyt-floating-player-256x144 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-256x144 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 256px !important;
        height: 144px !important;
      }

      body.efyt-floating-player.efyt-floating-player-320x180 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-320x180 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 320px !important;
        height: 180px !important;
      }

      body.efyt-floating-player.efyt-floating-player-400x225 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-400x225 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 400px !important;
        height: 225px !important;
      }

      body.efyt-floating-player.efyt-floating-player-426x240 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-426x240 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 426px !important;
        height: 240px !important;
      }

      body.efyt-floating-player.efyt-floating-player-480x270 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-480x270 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 480px !important;
        height: 270px !important;
      }

      body.efyt-floating-player.efyt-floating-player-560x315 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-560x315 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 560px !important;
        height: 315px !important;
      }

      body.efyt-floating-player.efyt-floating-player-640x360 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-640x360 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 640px !important;
        height: 360px !important;
      }

      body.efyt-floating-player.efyt-floating-player-720x405 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-720x405 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 720px !important;
        height: 405px !important;
      }

      body.efyt-floating-player.efyt-floating-player-854x480 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-854x480 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 854px !important;
        height: 480px !important;
      }

      body.efyt-floating-player.efyt-floating-player-960x540 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-960x540 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        width: 960px !important;
        height: 540px !important;
      }

      body.efyt-floating-player.efyt-floating-player-top-left #movie_player:not(.ytp-fullscreen) {
        top: 24px !important;
        left: 24px !important;
        right: auto !important;
        bottom: auto !important;
      }

      body.efyt-floating-player.efyt-floating-player-top-center #movie_player:not(.ytp-fullscreen) {
        top: 24px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        right: auto !important;
        bottom: auto !important;
      }

      body.efyt-floating-player.efyt-floating-player-top-right #movie_player:not(.ytp-fullscreen) {
        top: 24px !important;
        right: 24px !important;
        left: auto !important;
        bottom: auto !important;
      }

      body.efyt-floating-player.efyt-floating-player-bottom-left #movie_player:not(.ytp-fullscreen) {
        bottom: 24px !important;
        left: 24px !important;
        top: auto !important;
        right: auto !important;
      }

      body.efyt-floating-player.efyt-floating-player-bottom-center #movie_player:not(.ytp-fullscreen) {
        bottom: 24px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        top: auto !important;
        right: auto !important;
      }

      body.efyt-floating-player.efyt-floating-player-bottom-right #movie_player:not(.ytp-fullscreen) {
        bottom: 24px !important;
        right: 24px !important;
        top: auto !important;
        left: auto !important;
      }

      body.efyt-floating-player #efyt-progress {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        z-index: 100;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen):hover #efyt-progress {
        opacity: 1;
      }

      body.efyt-floating-player #efyt-progress::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 0;
        height: 0;
      }

      body.efyt-floating-player #efyt-progress::-moz-range-thumb {
        width: 0;
        height: 0;
        border: none;
        background: transparent;
      }

      body.efyt-floating-player #efyt-progress::-webkit-slider-runnable-track {
        height: 4px;
        background: linear-gradient(to right, #f00 var(--progress, 0%), rgba(255, 255, 255, 0.3) var(--progress, 0%));
      }

      body.efyt-floating-player #efyt-progress::-moz-range-track {
        height: 4px;
        background: linear-gradient(to right, #f00 var(--progress, 0%), rgba(255, 255, 255, 0.3) var(--progress, 0%));
      }

      body.efyt-floating-player.efyt-floating-player-256x144 #movie_player:not(.ytp-fullscreen) {
        --efyt-floating-player-ui-scale: 0.6;
        --efyt-floating-player-time-scale: 0.5;
      }

      body.efyt-floating-player.efyt-floating-player-320x180 #movie_player:not(.ytp-fullscreen) {
        --efyt-floating-player-ui-scale: 0.65;
        --efyt-floating-player-time-scale: 0.55;
      }

      body.efyt-floating-player.efyt-floating-player-400x225 #movie_player:not(.ytp-fullscreen) {
        --efyt-floating-player-ui-scale: 0.75;
        --efyt-floating-player-time-scale: 0.65;
      }

      body.efyt-floating-player.efyt-floating-player-426x240 #movie_player:not(.ytp-fullscreen) {
        --efyt-floating-player-ui-scale: 0.8;
        --efyt-floating-player-time-scale: 0.7;
      }

      body.efyt-floating-player.efyt-floating-player-480x270 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-560x315 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-640x360 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-720x405 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-854x480 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player.efyt-floating-player-960x540 #movie_player:not(.ytp-fullscreen) {
        --efyt-floating-player-ui-scale: 1;
        --efyt-floating-player-time-scale: 1;
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-left-controls,
      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-right-controls,
      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-chrome-top .ytp-button,
      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-chrome-top .ytp-title,
      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-chrome-top .ytp-title-channel {
        zoom: var(--efyt-floating-player-ui-scale);
      }

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-time-display {
        zoom: var(--efyt-floating-player-time-scale);
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

      body.efyt-floating-player #movie_player:not(.ytp-fullscreen) .ytp-overlay-inline-container {
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

      body.efyt-floating-player-vertical.efyt-floating-player-854x480 #movie_player:not(.ytp-fullscreen),
      body.efyt-floating-player-vertical.efyt-floating-player-854x480 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 854px !important;
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
      this.log('Settings changed:', changedSettings);
      setTimeout(() => {
        this.applyFloatingPlayerSettings();
      }, 500);
    }
  }

  cleanup() {
    this.log('Cleanup called');
    
    const style = document.getElementById('efyt-floating-player-styles');
    if (style) {
      style.remove();
    }

    this.cleanupObservers();
    this.currentPlayerContainer = null;

    document.body.classList.remove('efyt-floating-player');
    document.body.classList.remove('efyt-floating-player-vertical');
    const positionClasses = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    positionClasses.forEach(pos => {
      document.body.classList.remove(`efyt-floating-player-${pos}`);
    });
    const sizeClasses = ['256x144', '320x180', '400x225', '426x240', '480x270', '560x315', '640x360', '720x405', '854x480', '960x540'];
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

    // PIP 이벤트 리스너 정리
    if (this.pipEnterHandler) {
      document.removeEventListener('enterpictureinpicture', this.pipEnterHandler);
    }
    if (this.pipLeaveHandler) {
      document.removeEventListener('leavepictureinpicture', this.pipLeaveHandler);
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
      this.log('Player detached from original parent');
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
      this.log('Player reattached to original parent');
    }

    this.isPlayerDetached = false;
    this.originalPlayerParent = null;
    this.originalPlayerNextSibling = null;
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.FloatingPlayerController = FloatingPlayerController;