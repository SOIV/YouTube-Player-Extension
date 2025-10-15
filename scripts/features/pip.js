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
      return;
    }

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

      // 소형 플레이어 버튼 추가 (YouTube 우클릭 메뉴의 소형 플레이어 기능)
      if (this.settings.getSetting('enableSmallPlayerButton')) {
        this.addSmallPlayerButton();
      }
      
    } catch (error) {
    }
  }

  addPIPButton() {
    if (!this.settings.getSetting('enablePIP')) return;

    try {
      // YouTube 기본 PIP 버튼 찾기 및 하이재킹
      const nativePIPButton = document.querySelector('.ytp-pip-button');

      if (nativePIPButton) {
        // 기본 PIP 버튼을 보이게 만들기
        nativePIPButton.style.display = '';
        nativePIPButton.style.visibility = 'visible';
        nativePIPButton.style.opacity = '1';

        // 버튼을 올바른 컨테이너로 이동
        const controlsRightContainer = document.querySelector('.ytp-right-controls-right');
        const fullscreenButton = controlsRightContainer?.querySelector('.ytp-fullscreen-button');

        if (controlsRightContainer && fullscreenButton && nativePIPButton.parentElement !== controlsRightContainer) {
          // 전체화면 버튼 앞으로 이동
          controlsRightContainer.insertBefore(nativePIPButton, fullscreenButton);
        }

        // SVG 요소만 찾아서 path 내용만 교체 (툴팁 시스템 보존)
        const existingSvg = nativePIPButton.querySelector('svg');
        if (existingSvg) {
          // 기존 SVG의 viewBox와 transform 적용
          existingSvg.setAttribute('viewBox', '0 0 36 36');

          // 기존 SVG의 path만 교체
          const existingPath = existingSvg.querySelector('path');
          if (existingPath) {
            // g 태그로 감싸서 transform 적용
            const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            gElement.setAttribute('transform', 'translate(-5, -5)');

            const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            newPath.setAttribute('d', 'M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z');
            newPath.setAttribute('fill', 'white');

            gElement.appendChild(newPath);
            existingSvg.innerHTML = '';
            existingSvg.appendChild(gElement);
          }
        } else {
          // SVG가 없으면 전체 교체 (폴백)
          nativePIPButton.innerHTML = `
            <svg viewBox="0 0 36 36">
              <g transform="translate(-5, -5)">
                <path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z" fill="white"/>
              </g>
            </svg>
          `;
        }

        // 기존 클릭 이벤트에 우리 기능 추가 (기존 이벤트 중단)
        nativePIPButton.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.togglePIP();
        }, true); // capture phase에서 먼저 실행

        return;
      }

      // 기본 PIP 버튼이 없으면 커스텀 버튼 생성 (폴백)

      // ytp-right-controls-right 안에 버튼을 넣어야 함
      const controlsRightContainer = document.querySelector('.ytp-right-controls-right');
      if (!controlsRightContainer) return;

      // 기존 커스텀 PIP 버튼 제거
      const existingButton = document.querySelector('.ytp-efyt-pip-button');
      if (existingButton) existingButton.remove();

      const pipButton = document.createElement('button');
      pipButton.className = 'ytp-efyt-pip-button ytp-button';
      pipButton.title = '';
      pipButton.setAttribute('data-priority', '11');
      pipButton.setAttribute('data-title-no-tooltip', 'PIP 모드');
      pipButton.setAttribute('aria-label', 'PIP 모드');
      pipButton.setAttribute('data-tooltip-title', 'PIP 모드');
      pipButton.setAttribute('data-tooltip-target-id', 'ytp-pip-button');

      pipButton.innerHTML = `
        <svg viewBox="0 0 36 36">
          <g transform="translate(-5, -5)">
            <path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z" fill="white"/>
          </g>
        </svg>
      `;

      pipButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePIP();
      });

      // 전체화면 버튼 바로 앞에 추가
      const fullscreenButton = controlsRightContainer.querySelector('.ytp-fullscreen-button');
      if (fullscreenButton) {
        controlsRightContainer.insertBefore(pipButton, fullscreenButton);
      } else {
        controlsRightContainer.appendChild(pipButton);
      }

      // this.registerTooltipForButton(pipButton);

    } catch (error) {
    }
  }

  async togglePIP() {
    try {
      const video = this.domCache.get('video');
      if (!video) return;

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
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
      pipButton.setAttribute('data-title-no-tooltip', 'PIP 모드 종료');
      pipButton.setAttribute('data-tooltip-title', 'PIP 모드 종료');
    } else {
      pipButton.classList.remove('active');
      pipButton.style.backgroundColor = '';
      pipButton.setAttribute('data-title-no-tooltip', 'PIP 모드');
      pipButton.setAttribute('data-tooltip-title', 'PIP 모드');
    }
  }

  addSmallPlayerButton() {
    if (!this.settings.getSetting('enableSmallPlayerButton')) return;

    try {
      // ytp-right-controls-right 안에 버튼을 넣어야 함
      const controlsRightContainer = document.querySelector('.ytp-right-controls-right');
      if (!controlsRightContainer) return;

      // 기존 소형 플레이어 버튼 제거
      const existingButton = document.querySelector('.ytp-efyt-small-player-button');
      if (existingButton) existingButton.remove();

      const smallPlayerButton = document.createElement('button');
      smallPlayerButton.className = 'ytp-efyt-small-player-button ytp-button';
      smallPlayerButton.title = '';
      smallPlayerButton.setAttribute('data-priority', '11');
      smallPlayerButton.setAttribute('data-title-no-tooltip', '소형 플레이어');
      smallPlayerButton.setAttribute('aria-label', '소형 플레이어');
      smallPlayerButton.setAttribute('data-tooltip-title', '소형 플레이어');
      smallPlayerButton.setAttribute('data-tooltip-target-id', 'ytp-small-player-button');

      smallPlayerButton.innerHTML = `
        <svg viewBox="0 0 36 36">
          <g transform="translate(-5, -5)">
            <path d="M27 9H9c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V11c0-1.1-.9-2-2-2zm0 16H9V11h18v14zM24 14h-6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V15c0-.55-.45-1-1-1z" fill="white"/>
          </g>
        </svg>
      `;

      smallPlayerButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerSmallPlayerFromMenu();
      });

      // 전체화면 버튼 바로 앞에 추가
      const fullscreenButton = controlsRightContainer.querySelector('.ytp-fullscreen-button');
      if (fullscreenButton) {
        controlsRightContainer.insertBefore(smallPlayerButton, fullscreenButton);
      } else {
        controlsRightContainer.appendChild(smallPlayerButton);
      }

      // this.registerTooltipForButton(smallPlayerButton);

    } catch (error) {
    }
  }

  triggerSmallPlayerFromMenu() {
    try {
      // 1. 우클릭 컨텍스트 메뉴 시뮬레이션
      const video = document.querySelector('video');
      if (!video) {
        return;
      }

      // 2. 우클릭 이벤트 발생
      video.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      }));

      // 3. 메뉴가 나타날 때까지 잠시 기다린 후 소형 플레이어 항목 클릭
      setTimeout(() => {
        this.clickSmallPlayerMenuItem();
      }, 150);

    } catch (error) {
    }
  }

  clickSmallPlayerMenuItem() {
    try {
      // 컨텍스트 메뉴에서 소형 플레이어 관련 항목 찾기
      const contextMenu = document.querySelector('.ytp-contextmenu');
      if (!contextMenu) {
        return;
      }

      // ytp-menuitem 클래스를 가진 항목들 중에서 소형 플레이어 관련 항목 찾기
      const menuItems = contextMenu.querySelectorAll('.ytp-menuitem');
      let smallPlayerItem = null;

      for (const item of menuItems) {
        const text = item.textContent.trim();
        const ariaLabel = item.getAttribute('aria-label') || '';
        
        // 소형 플레이어 관련 텍스트를 찾기 (한국어, 영어 지원)
        if (text.includes('소형') || 
            text.includes('미니') ||
            text.includes('mini') || 
            text.includes('small') ||
            text.includes('picture') ||
            ariaLabel.includes('소형') ||
            ariaLabel.includes('mini') ||
            ariaLabel.includes('small')) {
          smallPlayerItem = item;
          break;
        }
      }

      if (smallPlayerItem) {
        smallPlayerItem.click();
        
        // 메뉴 숨기기
        setTimeout(() => {
          document.body.click();
        }, 50);
        
      } else {
        // 메뉴 숨기기
        document.body.click();
      }

    } catch (error) {
      // 오류 발생 시 메뉴 숨기기
      document.body.click();
    }
  }

  registerTooltipForButton(button) {
    try {
      
      // 1. YouTube의 전역 툴팁 시스템 찾기
      const player = document.querySelector('#movie_player');
      if (!player) {
        return;
      }

      // 2. YouTube 내부 API 접근 시도
      if (player.addTooltip && typeof player.addTooltip === 'function') {
        player.addTooltip(button);
        return;
      }

      // 3. YouTube 내부 툴팁 초기화 시스템 호출 시도
      if (window.yt && window.yt.www && window.yt.www.watch) {
        const watchPage = window.yt.www.watch;
        if (watchPage.initializeTooltips && typeof watchPage.initializeTooltips === 'function') {
          watchPage.initializeTooltips(button);
          return;
        }
      }

      // 4. YouTube 플레이어 내부 시스템에 버튼 등록 시도
      if (player._tooltipManager || player.tooltipManager) {
        const tooltipManager = player._tooltipManager || player.tooltipManager;
        if (tooltipManager.addButton && typeof tooltipManager.addButton === 'function') {
          tooltipManager.addButton(button);
          return;
        }
      }

      // 5. YouTube의 기존 이벤트 리스너를 우리 버튼에 복사 시도
      const referenceButton = document.querySelector('.ytp-settings-button');
      if (!referenceButton) {
      } else {
        
        // getEventListeners는 개발자 도구에서만 사용 가능
        if (typeof getEventListeners === 'function') {
          const listeners = getEventListeners(referenceButton);
          
          if (listeners.mouseover && listeners.mouseover.length > 0) {
            const originalListener = listeners.mouseover[0].listener;
            button.addEventListener('mouseover', originalListener);
            button.addEventListener('focus', originalListener);
            
            if (listeners.mouseout && listeners.mouseout.length > 0) {
              const hideListener = listeners.mouseout[0].listener;
              button.addEventListener('mouseout', hideListener);
              button.addEventListener('blur', hideListener);
              button.addEventListener('mouseleave', hideListener);
            }
            
            return;
          } else {
          }
        } else {
        }
      }

      // 6. 마지막 수단: 간단한 툴팁 시스템 직접 구현
      const tooltipText = button.getAttribute('data-tooltip-title') || button.getAttribute('data-title-no-tooltip');
      
      if (tooltipText) {
        const showTooltip = () => {
          // 기존 툴팁 제거
          const existingTooltip = document.querySelector('.ytp-tooltip');
          if (existingTooltip && existingTooltip.textContent !== tooltipText) {
            existingTooltip.remove();
          }
          
          // 새 툴팁 생성
          const tooltip = document.createElement('div');
          tooltip.className = 'ytp-tooltip';
          tooltip.textContent = tooltipText;
          
          const rect = button.getBoundingClientRect();
          tooltip.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width/2}px;
            top: ${rect.top - 40}px;
            transform: translateX(-50%);
            background: rgba(28, 28, 28, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-family: Roboto, Arial, sans-serif;
            white-space: nowrap;
            pointer-events: none;
            z-index: 2147483647;
            opacity: 1;
            visibility: visible;
          `;
          
          document.body.appendChild(tooltip);
        };
        
        const hideTooltip = () => {
          const tooltip = document.querySelector('.ytp-tooltip');
          if (tooltip && tooltip.textContent === tooltipText) {
            tooltip.remove();
          }
        };
        
        button.addEventListener('mouseover', showTooltip);
        button.addEventListener('focus', showTooltip);
        button.addEventListener('mouseout', hideTooltip);
        button.addEventListener('blur', hideTooltip);
        button.addEventListener('mouseleave', hideTooltip);
        
      } else {
      }

    } catch (error) {
    }
  }

  setupMiniPlayerFeatures() {
    if (!this.settings.getSetting('popupPlayer')) return;

    // 쇼츠에서는 미니플레이어 기능 완전 차단
    if (this.isCurrentlyInShorts()) {
      return;
    }

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
    // 쇼츠에서는 미니플레이어 Observer 설정 차단
    if (this.isCurrentlyInShorts()) {
      return;
    }

    const playerContainer = document.querySelector('#player-container');
    if (!playerContainer) return;

    if (playerContainer.efytObserver) return; // 이미 설정된 경우

    playerContainer.efytObserver = new IntersectionObserver((entries) => {
      // 쇼츠에서는 미니플레이어 동작 차단
      if (this.isCurrentlyInShorts()) {
        return;
      }

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

          // 세로 영상 감지 및 클래스 추가
          this.updateVideoAspectRatio();

          window.dispatchEvent(new Event('resize'));
        }
      } else if (entry.intersectionRatio !== 0) {
        // 미니플레이어 비활성화
        if (video) {
          video.removeEventListener('timeupdate', this.updateMiniPlayerProgress.bind(this));
        }
        document.body.classList.remove('efyt-mini-player');
        document.body.classList.remove('efyt-mini-player-vertical');
        window.dispatchEvent(new Event('resize'));
      }
    }, { threshold: 0.12 });

    playerContainer.efytObserver.observe(playerContainer);
  }

  // 쇼츠 감지 로직 강화
  isCurrentlyInShorts() {
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

  // 영상 비율 감지 및 업데이트
  updateVideoAspectRatio() {
    // 쇼츠에서는 화면 비율 조정 완전 차단
    if (this.isCurrentlyInShorts()) {
      // 쇼츠에서 기존 설정 제거
      document.body.classList.remove('efyt-mini-player-vertical');
      document.documentElement.style.removeProperty('--efyt-mini-player-aspect-ratio');
      return;
    }

    const video = this.domCache.get('video');
    if (!video) return;

    // 비디오가 로드되지 않은 경우 잠시 후 다시 시도
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setTimeout(() => this.updateVideoAspectRatio(), 500);
      return;
    }

    const aspectRatio = video.videoWidth / video.videoHeight;
    const isVertical = aspectRatio < 1; // 세로 영상 (높이가 너비보다 큰 경우)

    if (isVertical) {
      document.body.classList.add('efyt-mini-player-vertical');
      // CSS 변수 업데이트
      document.documentElement.style.setProperty('--efyt-mini-player-aspect-ratio', aspectRatio);
    } else {
      document.body.classList.remove('efyt-mini-player-vertical');
      // 기본 16:9 비율로 복원
      document.documentElement.style.setProperty('--efyt-mini-player-aspect-ratio', 16/9);
    }
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

      /* 미니플레이어에서 특정 UI 요소들 숨기기 */
      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-autoplay-icon {
        display: none !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-settings-button {
        display: none !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-right-controls > *:not(.ytp-subtitles-button) {
        display: none !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-cards-teaser,
      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-ce-element,
      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-cards-button {
        display: none !important;
      }

      body.efyt-mini-player #movie_player:not(.ytp-fullscreen) .ytp-watermark {
        display: none !important;
      }

      /* 세로 영상(9:16) 지원 스타일 */
      body.efyt-mini-player-vertical #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: auto !important;
        width: auto !important;
        aspect-ratio: var(--efyt-mini-player-aspect-ratio) !important;
      }

      /* 세로 영상용 크기 조정 */
      body.efyt-mini-player-vertical.efyt-mini-player-256x144 #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical.efyt-mini-player-256x144 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 256px !important;
        width: auto !important;
      }

      body.efyt-mini-player-vertical.efyt-mini-player-320x180 #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical.efyt-mini-player-320x180 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 320px !important;
        width: auto !important;
      }

      body.efyt-mini-player-vertical.efyt-mini-player-400x225 #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical.efyt-mini-player-400x225 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 400px !important;
        width: auto !important;
      }

      body.efyt-mini-player-vertical.efyt-mini-player-426x240 #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical.efyt-mini-player-426x240 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 426px !important;
        width: auto !important;
      }

      body.efyt-mini-player-vertical.efyt-mini-player-480x270 #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical.efyt-mini-player-480x270 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 480px !important;
        width: auto !important;
      }

      body.efyt-mini-player-vertical.efyt-mini-player-560x315 #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical.efyt-mini-player-560x315 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 560px !important;
        width: auto !important;
      }

      body.efyt-mini-player-vertical.efyt-mini-player-640x360 #movie_player:not(.ytp-fullscreen),
      body.efyt-mini-player-vertical.efyt-mini-player-640x360 #movie_player:not(.ytp-fullscreen) video.html5-main-video {
        height: 640px !important;
        width: auto !important;
      }

      /* 세로 영상에서 컨트롤 바 너비 조정 */
      body.efyt-mini-player-vertical #movie_player:not(.ytp-fullscreen) .ytp-chrome-bottom {
        width: calc(100% - 24px) !important;
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
    const pipSettings = ['enablePIP', 'popupPlayer', 'miniPlayerSize', 'miniPlayerPosition', 'enableSmallPlayerButton'];
    const hasPIPChanges = changedSettings.some(key => pipSettings.includes(key));
    
    if (hasPIPChanges) {
      
      // PIP 버튼 설정이 변경된 경우 즉시 처리
      if (changedSettings.includes('enablePIP')) {
        const existingPIPButton = document.querySelector('.ytp-efyt-pip-button');
        if (existingPIPButton) {
          existingPIPButton.remove();
        }
        
        if (this.settings.getSetting('enablePIP')) {
          setTimeout(() => {
            this.addPIPButton();
            this.setupPIPCommands();
          }, 100);
        }
      }
      
      // 소형 플레이어 버튼 설정이 변경된 경우 즉시 처리
      if (changedSettings.includes('enableSmallPlayerButton')) {
        const existingButton = document.querySelector('.ytp-efyt-small-player-button');
        if (existingButton) {
          existingButton.remove();
        }
        
        if (this.settings.getSetting('enableSmallPlayerButton')) {
          setTimeout(() => {
            this.addSmallPlayerButton();
          }, 100);
        }
      }
      
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

    // 소형 플레이어 버튼 제거
    const smallPlayerButton = document.querySelector('.ytp-efyt-small-player-button');
    if (smallPlayerButton) smallPlayerButton.remove();

    // 미니플레이어 클래스 제거
    document.body.classList.remove('efyt-mini-player');
    document.body.classList.remove('efyt-mini-player-vertical');
    const positionClasses = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    positionClasses.forEach(pos => {
      document.body.classList.remove(`efyt-mini-player-${pos}`);
    });

  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.PIPController = PIPController;