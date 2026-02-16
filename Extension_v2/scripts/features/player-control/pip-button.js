// YouTube Player Enhancer - PIP Button Module

class PIPButtonController {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;

    // 언어 감지 및 다국어 텍스트 초기화
    this.currentLang = this.detectYouTubeLanguage();
    this.translations = this.getTranslations();
  }

  // 유튜브 언어 감지
  detectYouTubeLanguage() {
    // 방법 1: HTML lang 속성
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      return htmlLang.split('-')[0]; // 'ko-KR' -> 'ko'
    }

    // 방법 2: YouTube 내부 설정
    if (window.yt && window.yt.config_ && window.yt.config_.HL) {
      return window.yt.config_.HL.split('-')[0];
    }

    // 방법 3: 쿠키에서 읽기
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'PREF') {
        const match = value.match(/hl=([^&]+)/);
        if (match) {
          return match[1].split('-')[0];
        }
      }
    }

    // 방법 4: 브라우저 언어
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.split('-')[0];
  }

  // 다국어 텍스트 정의
  getTranslations() {
    return {
      ko: {
        pipMode: 'PIP 모드'
      },
      en: {
        pipMode: 'Picture in Picture'
      },
      ja: {
        pipMode: 'ピクチャー イン ピクチャー'
      },
      zh: {
        pipMode: '画中画模式'
      }
    };
  }

  // 번역 텍스트 가져오기
  t(key) {
    const lang = this.currentLang;
    // 현재 언어에 해당하는 텍스트가 있으면 사용, 없으면 영어 사용
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    // 영어도 없으면 한국어 사용 (기본값)
    return this.translations.en[key] || this.translations.ko[key] || key;
  }

  // PIP 기능이 필요한지 확인
  isEnabled() {
    return this.settings.getSetting('enablePIP');
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
        if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
          this.applyPIPSettings();
        }
      }, 1000);
    });

    // 초기 적용
    if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
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
    } catch (error) {
    }
  }

  addPIPButton() {
    if (!this.settings.getSetting('enablePIP')) return;

    try {
      // YouTube 기본 PIP 버튼 찾기 및 하이재킹
      const nativePIPButton = document.querySelector('.ytp-pip-button');

      if (nativePIPButton) {
        nativePIPButton.style.display = '';
        nativePIPButton.style.visibility = 'visible';
        nativePIPButton.style.opacity = '1';

        // 툴팁 텍스트를 다국어로 설정
        nativePIPButton.setAttribute('data-title-no-tooltip', this.t('pipMode'));
        nativePIPButton.setAttribute('aria-label', this.t('pipMode'));
        nativePIPButton.setAttribute('data-tooltip-title', this.t('pipMode'));

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
            gElement.setAttribute('transform', 'translate(-5, -6)');

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
              <g transform="translate(-5, -6)">
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

      // 커스텀 버튼 생성 시에도 다국어 적용
      const pipButton = document.createElement('button');
      pipButton.className = 'ytp-efyt-pip-button ytp-button';
      pipButton.title = '';
      pipButton.setAttribute('data-priority', '11');
      pipButton.setAttribute('data-title-no-tooltip', this.t('pipMode'));
      pipButton.setAttribute('aria-label', this.t('pipMode'));
      pipButton.setAttribute('data-tooltip-title', this.t('pipMode'));
      pipButton.setAttribute('data-tooltip-target-id', 'ytp-pip-button');

      pipButton.innerHTML = `
        <svg viewBox="0 0 36 36">
          <g transform="translate(-5, -6)">
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

  // PIP 버튼 상태 업데이트
  updatePIPButtonState() {
    const pipButton = document.querySelector('.ytp-efyt-pip-button');
    if (!pipButton) return;

    if (document.pictureInPictureElement) {
      pipButton.classList.add('active');
      pipButton.setAttribute('data-title-no-tooltip', this.t('pipMode'));
      pipButton.setAttribute('data-tooltip-title', this.t('pipMode'));
    } else {
      pipButton.classList.remove('active');
      pipButton.setAttribute('data-title-no-tooltip', this.t('pipMode'));
      pipButton.setAttribute('data-tooltip-title', this.t('pipMode'));
    }
  }

  // 설정 변경 시 호출
  onSettingsChanged(changedSettings) {
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
  }

  // 정리
  cleanup() {
    // PIP 버튼 제거
    const pipButton = document.querySelector('.ytp-efyt-pip-button');
    if (pipButton) pipButton.remove();
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.PIPButtonController = PIPButtonController;
