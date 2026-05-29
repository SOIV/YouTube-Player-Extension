// YouTube Player Enhancer - Loop Button Module

class LoopButtonController {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;

    this.currentLang = this.detectYouTubeLanguage();
    this.translations = this.getTranslations();
    this._loopObserver = null;
    this._animationTimer = null;
  }

  detectYouTubeLanguage() {
    const htmlLang = document.documentElement.lang;
    if (htmlLang) return htmlLang.split('-')[0];

    if (window.yt && window.yt.config_ && window.yt.config_.HL) {
      return window.yt.config_.HL.split('-')[0];
    }

    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'PREF') {
        const match = value.match(/hl=([^&]+)/);
        if (match) return match[1].split('-')[0];
      }
    }

    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.split('-')[0];
  }

  getTranslations() {
    return {
      ko: { loopButton: '반복 재생' },
      en: { loopButton: 'Loop' },
      ja: { loopButton: 'リピート再生' },
      zh: { loopButton: '循环播放' }
    };
  }

  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    return this.translations.en[key] || this.translations.ko[key] || key;
  }

  isEnabled() {
    return this.settings.getSetting('enableLoopButton');
  }

  init() {
    this.setupLoopButton();
  }

  setupLoopButton() {
    this.eventManager.addEventListener(document, 'yt-navigate-finish', () => {
      setTimeout(() => {
        if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
          this.applyLoopButtonSettings();
        }
      }, 1000);
    });

    if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
      setTimeout(() => {
        this.applyLoopButtonSettings();
      }, 2000);
    }
  }

  applyLoopButtonSettings() {
    try {
      if (this.isEnabled()) {
        this.addLoopButton();
      }
    } catch (error) {}
  }

  clearAnimationTimer() {
    if (this._animationTimer) {
      clearTimeout(this._animationTimer);
      this._animationTimer = null;
    }
  }

  addLoopButton() {
    try {
      const controlsRightContainer = document.querySelector('.ytp-right-controls-right');
      if (!controlsRightContainer) return;

      const existing = document.querySelector('.ytp-efyt-loop-button');
      if (existing) {
        this.clearAnimationTimer();
        existing.remove();
      }

      if (this._loopObserver) {
        this._loopObserver.disconnect();
        this._loopObserver = null;
      }

      const loopButton = document.createElement('button');
      loopButton.className = 'ytp-efyt-loop-button ytp-button';
      loopButton.setAttribute('data-priority', '12');
      loopButton.setAttribute('aria-label', this.t('loopButton'));
      loopButton.setAttribute('data-title-no-tooltip', this.t('loopButton'));
      loopButton.setAttribute('data-tooltip-title', this.t('loopButton'));
      loopButton.setAttribute('data-tooltip-target-id', 'ytp-loop-button');

      loopButton.innerHTML = `
        <svg viewBox="0 0 24 24" class="ype-loop-icon" aria-hidden="true" focusable="false">
          <path class="ype-loop-tail"
                d="M 17 6 L 20 6 L 20 18 L 4 18 L 4 6 L 17 6 L 20 6 L 20 18 L 4 18 L 4 6 L 17 6"
                pathLength="200"/>
          <path class="ype-loop-tail"
                d="M 7 18 L 4 18 L 4 6 L 20 6 L 20 18 L 7 18 L 4 18 L 4 6 L 20 6 L 20 18 L 7 18"
                pathLength="200"/>
          <polygon class="ype-loop-arrow-head ype-loop-top-arrow" points="-2,-4 2.5,0 -2,4"/>
          <polygon class="ype-loop-arrow-head ype-loop-bottom-arrow" points="-2,-4 2.5,0 -2,4"/>

          <path class="ype-loop-status-icon" d="M 11 10.5 L 12.5 9.5 L 12.5 14.5" />
          
        </svg>
      `;

      const video = document.querySelector('video');
      if (video && video.loop) {
        loopButton.classList.add('active');
      }

      loopButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleLoop(loopButton);
      });

      const fullscreenButton = controlsRightContainer.querySelector('.ytp-fullscreen-button');
      if (fullscreenButton) {
        controlsRightContainer.insertBefore(loopButton, fullscreenButton);
      } else {
        controlsRightContainer.appendChild(loopButton);
      }

      this.watchVideoLoopState(loopButton);

    } catch (error) {}
  }

  toggleLoop(button) {
    const video = document.querySelector('video');
    if (!video) return;

    const willBeActive = !video.loop;
    video.loop = willBeActive;

    if (willBeActive) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }

    this.clearAnimationTimer();

    button.classList.remove('animating');
    void button.querySelector('.ype-loop-icon')?.offsetWidth;
    button.classList.add('animating');

    this._animationTimer = setTimeout(() => {
      button.classList.remove('animating');
      this._animationTimer = null;
    }, 1150);
  }

  watchVideoLoopState(button) {
    const video = document.querySelector('video');
    if (!video) return;

    // YouTube 자체 컨텍스트 메뉴로 loop가 바뀔 때도 버튼 상태 동기화
    this._loopObserver = new MutationObserver(() => {
      if (video.loop) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    this._loopObserver.observe(video, { attributes: true, attributeFilter: ['loop'] });
  }

  onSettingsChanged(changedSettings) {
    if (changedSettings.includes('enableLoopButton')) {
      const existing = document.querySelector('.ytp-efyt-loop-button');
      if (existing) {
        this.clearAnimationTimer();
        existing.remove();
      }

      if (this._loopObserver) {
        this._loopObserver.disconnect();
        this._loopObserver = null;
      }

      if (this.isEnabled()) {
        setTimeout(() => this.addLoopButton(), 100);
      }
    }
  }

  cleanup() {
    if (this._loopObserver) {
      this._loopObserver.disconnect();
      this._loopObserver = null;
    }
    this.clearAnimationTimer();
    const button = document.querySelector('.ytp-efyt-loop-button');
    if (button) button.remove();
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.LoopButtonController = LoopButtonController;
