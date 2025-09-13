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

      // 자동 코덱 설정 적용
      if (this.settings.getSetting('autoCodec')) {
        this.setVideoCodec(player);
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

  setVideoCodec(player) {
    try {
      const preferredCodec = this.settings.getSetting('preferredCodec', 'auto');
      
      if (preferredCodec === 'auto') {
        // 자동 코덱: 브라우저와 성능에 따라 최적 코덱 선택
        this.setAutoCodec();
      } else {
        // 수동 코덱 설정
        this.forceCodec(preferredCodec);
      }
    } catch (error) {
    }
  }

  setAutoCodec() {
    try {
      // 브라우저 지원 여부 확인
      const video = document.createElement('video');
      const codecs = {
        av01: 'video/mp4; codecs="av01.0.08M.08"',
        vp9: 'video/webm; codecs="vp9"',
        h264: 'video/mp4; codecs="avc1.42E01E"'
      };

      let bestCodec = 'h264'; // 기본값

      // AV1 > VP9 > H.264 순서로 선호
      if (video.canPlayType(codecs.av01) === 'probably') {
        bestCodec = 'av01';
      } else if (video.canPlayType(codecs.vp9) === 'probably') {
        bestCodec = 'vp9';
      }

      this.forceCodec(bestCodec);
    } catch (error) {
    }
  }

  forceCodec(codecType) {
    try {
      // URL 파라미터로 코덱 강제 설정
      const url = new URL(window.location);
      
      switch (codecType) {
        case 'av01':
          url.searchParams.set('vq', 'av01');
          break;
        case 'vp9':
          url.searchParams.set('vq', 'vp9');
          break;
        case 'h264':
          url.searchParams.set('vq', 'h264');
          break;
        default:
          url.searchParams.delete('vq');
      }

      // URL이 변경된 경우에만 새로고침
      if (url.toString() !== window.location.toString()) {
        // 부드러운 코덱 변경을 위해 플레이어 API 사용
        this.requestCodecChange(codecType);
      }
    } catch (error) {
    }
  }

  requestCodecChange(codecType) {
    try {
      // YouTube 플레이어 API를 통한 코덱 변경 요청
      const player = this.domCache.get('player');
      if (player && typeof player.setPlaybackQuality === 'function') {
        // 현재 재생 시간 저장
        const currentTime = player.getCurrentTime();
        
        // 품질 변경으로 코덱 변경 유도
        const qualities = player.getAvailableQualityLevels();
        if (qualities.length > 0) {
          // 잠시 다른 품질로 변경 후 원래 품질로 복구
          const currentQuality = player.getPlaybackQuality();
          const tempQuality = qualities.find(q => q !== currentQuality) || qualities[0];
          
          player.setPlaybackQuality(tempQuality);
          setTimeout(() => {
            player.setPlaybackQuality(currentQuality);
            player.seekTo(currentTime);
          }, 100);
        }
      }
    } catch (error) {
    }
  }

  // 설정 변경 시 호출
  onSettingsChanged(changedSettings) {
    const qualitySettings = ['autoQuality', 'preferredQuality', 'autoCodec', 'preferredCodec'];
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