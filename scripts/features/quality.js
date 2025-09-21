// YouTube Player Enhancer - Quality Control Module

class QualityController {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;
  }

  // 품질 제어 기능이 필요한지 확인
  isEnabled() {
    return this.settings.isQualityControlEnabled();
  }

  // 품질 제어 초기화
  init() {
    if (!this.isEnabled()) {
      return;
    }

    this.setupQualityControl();
  }

  setupQualityControl() {
    // YouTube 페이지 변경 감지
    this.eventManager.addEventListener(document, 'yt-navigate-finish', () => {
      setTimeout(() => {
        if (window.location.pathname.includes('/watch')) {
          this.applyQualitySettings();
        }
      }, 1000);
    });

    // 초기 적용
    if (window.location.pathname.includes('/watch')) {
      setTimeout(() => {
        this.applyQualitySettings();
      }, 2000);
    }
  }

  applyQualitySettings() {
    const player = this.domCache.get('player');
    if (!player) return;

    try {
      // 자동 품질 설정 적용
      if (this.settings.getSetting('autoQuality')) {
        this.setVideoQuality(player);
      }

    } catch (error) {
    }
  }

  setVideoQuality(player) {
    try {
      const preferredQuality = this.settings.getSetting('preferredQuality', 'auto');
      
      if (preferredQuality === 'auto') {
        // 자동 품질: 네트워크 상태에 따라 최적 품질 선택
        this.setAutoQuality(player);
      } else {
        // 수동 품질 설정
        if (typeof player.setPlaybackQuality === 'function') {
          player.setPlaybackQuality(preferredQuality);
        }
      }
    } catch (error) {
    }
  }

  setAutoQuality(player) {
    try {
      // 네트워크 상태 감지
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      let targetQuality = 'hd720'; // 기본값

      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;

        // 네트워크 상태에 따른 품질 선택
        if (effectiveType === 'slow-2g' || downlink < 1) {
          targetQuality = 'small'; // 240p
        } else if (effectiveType === '2g' || downlink < 2) {
          targetQuality = 'medium'; // 360p
        } else if (effectiveType === '3g' || downlink < 5) {
          targetQuality = 'large'; // 480p
        } else if (downlink >= 10) {
          targetQuality = 'hd1080'; // 1080p
        }
      }

      // 사용 가능한 품질 확인
      if (typeof player.getAvailableQualityLevels === 'function') {
        const availableQualities = player.getAvailableQualityLevels();
        if (availableQualities.includes(targetQuality)) {
          player.setPlaybackQuality(targetQuality);
        }
      }
    } catch (error) {
    }
  }


  // 설정 변경 시 호출
  onSettingsChanged(changedSettings) {
    const qualitySettings = ['autoQuality', 'preferredQuality'];
    const hasQualityChanges = changedSettings.some(key => qualitySettings.includes(key));
    
    if (hasQualityChanges) {
      setTimeout(() => {
        this.applyQualitySettings();
      }, 500);
    }
  }

  // 정리
  cleanup() {
    // 품질 제어는 특별한 정리가 필요하지 않음
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.QualityController = QualityController;