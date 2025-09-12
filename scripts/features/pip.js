// YouTube Player Enhancer - PIP & Mini Player Module

class PIPController {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;
  }

  // PIP 기능이 필요한지 확인
  isEnabled() {
    return this.settings.isPIPEnabled() || this.settings.isMiniPlayerEnabled();
  }

  // PIP 초기화
  init() {
    if (!this.isEnabled()) {
      console.log('PIP features disabled, skipping setup');
      return;
    }

    console.log('PIP controller initialized');
    this.setupPIP();
  }

  setupPIP() {
    // YouTube 페이지 변경 감지
    this.eventManager.addEventListener(document, 'yt-navigate-finish', () => {
      setTimeout(() => {
        if (window.location.pathname.includes('/watch')) {
          this.applyPIPSettings();
        }
      }, 1000);
    });

    // 초기 적용
    if (window.location.pathname.includes('/watch')) {
      setTimeout(() => {
        this.applyPIPSettings();
      }, 2000);
    }
  }

  applyPIPSettings() {
    try {
      if (this.settings.getSetting('enablePIP')) {
        this.addPIPButton();
        this.setupPIPCommands();
      }

      if (this.settings.getSetting('popupPlayer')) {
        this.setupMiniPlayerFeatures();
      }
    } catch (error) {
      console.error('Failed to apply PIP settings:', error);
    }
  }

  addPIPButton() {
    if (!this.settings.getSetting('enablePIP')) return;

    try {
      const controlsRight = document.querySelector('.ytp-right-controls');
      if (!controlsRight) return;

      // 기존 PIP 버튼 제거
      const existingButton = document.querySelector('.ytp-efyt-pip-button');
      if (existingButton) existingButton.remove();

      const pipButton = document.createElement('button');
      pipButton.className = 'ytp-efyt-pip-button ytp-button';
      pipButton.title = 'Picture in Picture';
      // 다른 버튼들과 같은 크기로 자동 조정
      pipButton.style.width = '';
      pipButton.style.height = '';
      pipButton.style.display = 'inline-flex';
      pipButton.style.alignItems = 'center';
      pipButton.style.justifyContent = 'center';
      pipButton.style.verticalAlign = 'top';
      pipButton.innerHTML = `
        <svg height="66%" version="1.1" viewBox="0 0 24 24" width="66%" style="pointer-events: none;">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM19 8h-6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z" fill="white"/>
        </svg>
      `;

      pipButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePIP();
      });

      // 설정 버튼 바로 뒤에 추가
      const settingsButton = controlsRight.querySelector('.ytp-settings-button');
      if (settingsButton && settingsButton.nextSibling) {
        controlsRight.insertBefore(pipButton, settingsButton.nextSibling);
      } else if (settingsButton) {
        controlsRight.appendChild(pipButton);
      } else {
        // 풀스크린 버튼 앞에 추가
        const fullscreenButton = controlsRight.querySelector('.ytp-fullscreen-button');
        if (fullscreenButton) {
          controlsRight.insertBefore(pipButton, fullscreenButton);
        } else {
          controlsRight.appendChild(pipButton);
        }
      }

      console.log('PIP button added');
    } catch (error) {
      console.error('Failed to add PIP button:', error);
    }
  }

  async togglePIP() {
    try {
      const video = this.domCache.get('video');
      if (!video) return;

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        console.log('Exited PIP mode');
      } else {
        await video.requestPictureInPicture();
        console.log('Entered PIP mode');
      }
    } catch (error) {
      console.error('PIP toggle failed:', error);
    }
  }

  setupPIPCommands() {
    // PIP 상태 변경 감지
    this.eventManager.addEventListener(document, 'enterpictureinpicture', () => {
      this.updatePIPButtonState();
    });
    
    this.eventManager.addEventListener(document, 'leavepictureinpicture', () => {
      this.updatePIPButtonState();
    });
  }

  updatePIPButtonState() {
    const pipButton = document.querySelector('.ytp-efyt-pip-button');
    if (!pipButton) return;

    if (document.pictureInPictureElement) {
      pipButton.classList.add('active');
      pipButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
      pipButton.title = 'Exit Picture in Picture';
    } else {
      pipButton.classList.remove('active');
      pipButton.style.backgroundColor = '';
      pipButton.title = 'Picture in Picture';
    }
  }

  setupMiniPlayerFeatures() {
    if (!this.settings.getSetting('popupPlayer')) return;
    
    // 미니플레이어 CSS 및 기본 설정 적용
    this.addMiniPlayerCSS();
    
    // 미니플레이어 스크롤 감지 설정
    setTimeout(() => {
      this.setupMiniPlayerObserver();
      // 미니플레이어 클래스 추가
      document.body.classList.add(`efyt-mini-player-${this.settings.getSetting('miniPlayerSize')}`, `efyt-mini-player-${this.settings.getSetting('miniPlayerPosition')}`);
    }, 1000);
  }

  // 미니플레이어 스크롤 감지 (원본 로직 기반)
  setupMiniPlayerObserver() {
    const playerContainer = document.querySelector('#player-container');
    if (!playerContainer) return;

    if (playerContainer.efytObserver) return; // 이미 설정된 경우

    playerContainer.efytObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const video = this.domCache.get('video');
      const player = this.domCache.get('player');
      
      if (!video || !player) return;

      const isWatch = window.location.pathname.includes('/watch');
      const scrollY = window.scrollY;
      const playerHeight = playerContainer.offsetHeight;

      // 미니플레이어 활성화 조건 (원본 로직)
      if ((entry.intersectionRatio === 0 && !document.body.classList.contains('efyt-mini-player') && scrollY > 0) ||
          (entry.intersectionRatio > 0 && entry.intersectionRatio < 0.12)) {
        
        if (scrollY > playerHeight - 100 && isWatch && !player.classList.contains('ended-mode')) {
          // 미니플레이어 활성화
          if (video) {
            video.addEventListener('timeupdate', this.updateMiniPlayerProgress.bind(this));
            this.updateMiniPlayerProgress();
          }
          document.body.classList.add('efyt-mini-player');
          window.dispatchEvent(new Event('resize'));
        }
      } else if (entry.intersectionRatio !== 0) {
        // 미니플레이어 비활성화
        if (video) {
          video.removeEventListener('timeupdate', this.updateMiniPlayerProgress.bind(this));
        }
        document.body.classList.remove('efyt-mini-player');
        window.dispatchEvent(new Event('resize'));
      }
    }, { threshold: 0.12 });

    playerContainer.efytObserver.observe(playerContainer);
  }

  // 미니플레이어 진행률 업데이트
  updateMiniPlayerProgress() {
    const video = this.domCache.get('video');
    const progressBar = document.querySelector('#efyt-progress');
    
    if (video && progressBar) {
      if (video.duration > 0) {
        progressBar.value = video.currentTime / video.duration;
      }
    }
  }

  // 미니플레이어 CSS 추가 (원본 스타일)
  addMiniPlayerCSS() {
    if (document.getElementById('efyt-mini-player-styles')) return;

    const style = document.createElement('style');
    style.id = 'efyt-mini-player-styles';
    
    // 동적 CSS 생성 - 모든 미니플레이어 크기 옵션 지원
    const sizeMap = {
      '256x144': ['256', '144'],
      '320x180': ['320', '180'], 
      '400x225': ['400', '225'],
      '426x240': ['426', '240'],
      '480x270': ['480', '270'],
      '560x315': ['560', '315'],
      '640x360': ['640', '360']
    };
    const sizes = sizeMap[this.settings.getSetting('miniPlayerSize')] || sizeMap['480x270']; // 기본값
    const aspectRatio = 16/9; // 기본 비율
    
    style.textContent = `
      :root {
        --efyt-mini-player-aspect-ratio: ${aspectRatio};
        --efyt-mini-player-height: ${sizes[1] || '180'}px;
        --efyt-mini-player-width: ${sizes[0] || '320'}px;
        --efyt-mini-player-center-left: calc(100vw / 2 - ${(sizes[0] || 320)/2}px);
      }

      body.efyt-mini-player .ytp-contextmenu {
        z-index: 2147483647 !important;
      }

      body:not(.efyt-mini-player) efyt-progress-tooltip {
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

      body.efyt-mini-player #movie_player:not(.unstarted-mode) #efyt-progress {
        display: block;
      }

      body.efyt-mini-player #movie_player.ytp-autohide #efyt-progress {
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

      body.efyt-mini-player-top-right efyt-hide-mini-player,
      body.efyt-mini-player-bottom-right efyt-hide-mini-player {
        float: right;
        margin-right: 5px;
      }

      body.efyt-mini-player efyt-hide-mini-player {
        display: block;
      }

      body.efyt-mini-player ytd-player #movie_player:not(.ytp-fullscreen) {
        background: #000 !important;
        position: fixed !important;
        z-index: 2198 !important;
      }

      body.efyt-mini-player.efyt-mini-player-top-left #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player.efyt-mini-player-bottom-left #movie_player:not(.ytp-fullscreen) {
        left: 15px !important;
        right: auto !important;
      }

      body.efyt-mini-player.efyt-mini-player-top-center #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player.efyt-mini-player-bottom-center #movie_player:not(.ytp-fullscreen) {
        left: var(--efyt-mini-player-center-left) !important;
      }

      body.efyt-mini-player.efyt-mini-player-top-right #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player.efyt-mini-player-bottom-right #movie_player:not(.ytp-fullscreen) {
        left: auto !important;
        right: 15px !important;
      }

      body.efyt-mini-player.efyt-mini-player-top-left #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player.efyt-mini-player-top-center #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player.efyt-mini-player-top-right #movie_player:not(.ytp-fullscreen) {
        top: 15px !important;
      }

      body.efyt-mini-player.efyt-mini-player-bottom-left #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player.efyt-mini-player-bottom-center #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player.efyt-mini-player-bottom-right #movie_player:not(.ytp-fullscreen) {
        bottom: 15px !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: auto !important;
        width: var(--efyt-mini-player-width) !important;
        aspect-ratio: var(--efyt-mini-player-aspect-ratio) !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        margin-left: 0 !important;
        left: 0 !important;
        top: 0 !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-chrome-bottom {
        width: calc(100% - 24px) !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) {
        border-radius: 8px !important;
      }
    `;
    
    document.head.appendChild(style);

    // 미니플레이어 UI 요소 추가
    this.addMiniPlayerElements();
  }

  // 미니플레이어 UI 요소들 추가
  addMiniPlayerElements() {
    // 진행률 바 추가
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

      // 진행률 바 클릭 이벤트
      progressBar.addEventListener('input', (e) => {
        const video = this.domCache.get('video');
        if (video && video.duration > 0) {
          video.currentTime = e.target.value * video.duration;
        }
      });
    }
  }

  // 설정 변경 시 호출
  onSettingsChanged(changedSettings) {
    const pipSettings = ['enablePIP', 'popupPlayer', 'miniPlayerSize', 'miniPlayerPosition'];
    const hasPIPChanges = changedSettings.some(key => pipSettings.includes(key));
    
    if (hasPIPChanges) {
      console.log('PIP settings changed, applying updates');
      setTimeout(() => {
        this.applyPIPSettings();
      }, 500);
    }
  }

  // 정리
  cleanup() {
    // 미니플레이어 스타일 제거
    const style = document.getElementById('efyt-mini-player-styles');
    if (style) {
      style.remove();
    }

    // observer 정리
    const playerContainer = document.querySelector('#player-container');
    if (playerContainer && playerContainer.efytObserver) {
      playerContainer.efytObserver.disconnect();
      delete playerContainer.efytObserver;
    }

    // PIP 버튼 제거
    const pipButton = document.querySelector('.ytp-efyt-pip-button');
    if (pipButton) pipButton.remove();

    // 미니플레이어 클래스 제거
    document.body.classList.remove('efyt-mini-player');
    const positionClasses = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    positionClasses.forEach(pos => {
      document.body.classList.remove(`efyt-mini-player-${pos}`);
    });

    console.log('PIP controller cleanup completed');
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.PIPController = PIPController;