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
        this.setupMiniPlayerStyles();
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
      pipButton.style.width = '48px';
      pipButton.style.height = '48px';
      pipButton.style.display = 'inline-flex';
      pipButton.style.alignItems = 'center';
      pipButton.style.justifyContent = 'center';
      pipButton.style.verticalAlign = 'top';
      pipButton.innerHTML = `
        <svg height="24" version="1.1" viewBox="0 0 24 24" width="24" style="pointer-events: none;">
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

  setupMiniPlayerStyles() {
    if (!this.settings.getSetting('popupPlayer')) {
      this.removeMiniPlayerStyles();
      return;
    }

    try {
      this.addMiniPlayerStyles();
      console.log('Mini player styles setup completed');
    } catch (error) {
      console.error('Failed to setup mini player styles:', error);
    }
  }

  addMiniPlayerStyles() {
    // 기존 스타일 제거
    const existingStyle = document.getElementById('efyt-mini-player-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

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
        --efyt-mini-player-height: ${sizes[1] || '270'}px;
        --efyt-mini-player-width: ${sizes[0] || '480'}px;
        --efyt-mini-player-center-left: calc(100vw / 2 - ${(sizes[0] || 480)/2}px);
      }
      body.efyt-mini-player .ytp-contextmenu {
        z-index: 2147483647 !important;
      }
      body:not(.efyt-mini-player) efyt-progress-tooltip {
        display: none !important;
      }
      body.efyt-mini-player #movie_player {
        position: fixed !important;
        width: var(--efyt-mini-player-width) !important;
        height: var(--efyt-mini-player-height) !important;
        z-index: 2147483647 !important;
        background: #000 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
      }
      body.efyt-mini-player.efyt-mini-player-top-left #movie_player {
        top: 20px !important;
        left: 20px !important;
      }
      body.efyt-mini-player.efyt-mini-player-top-center #movie_player {
        top: 20px !important;
        left: var(--efyt-mini-player-center-left) !important;
      }
      body.efyt-mini-player.efyt-mini-player-top-right #movie_player {
        top: 20px !important;
        right: 20px !important;
      }
      body.efyt-mini-player.efyt-mini-player-bottom-left #movie_player {
        bottom: 20px !important;
        left: 20px !important;
      }
      body.efyt-mini-player.efyt-mini-player-bottom-center #movie_player {
        bottom: 20px !important;
        left: var(--efyt-mini-player-center-left) !important;
      }
      body.efyt-mini-player.efyt-mini-player-bottom-right #movie_player {
        bottom: 20px !important;
        right: 20px !important;
      }
    `;

    document.head.appendChild(style);
  }

  removeMiniPlayerStyles() {
    const style = document.getElementById('efyt-mini-player-styles');
    if (style) {
      style.remove();
    }
    
    // 미니플레이어 클래스 제거
    document.body.classList.remove('efyt-mini-player');
    const sizeClasses = ['256x144', '320x180', '400x225', '426x240', '480x270', '560x315', '640x360'];
    const positionClasses = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    
    sizeClasses.forEach(size => {
      document.body.classList.remove(`efyt-mini-player-${size}`);
    });
    positionClasses.forEach(pos => {
      document.body.classList.remove(`efyt-mini-player-${pos}`);
    });
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
    this.removeMiniPlayerStyles();
    
    const pipButton = document.querySelector('.ytp-efyt-pip-button');
    if (pipButton) pipButton.remove();
    
    console.log('PIP controller cleanup completed');
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.PIPController = PIPController;