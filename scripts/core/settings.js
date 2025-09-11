// YouTube Player Enhancer - Settings Manager

class SettingsManager {
  constructor() {
    this.settings = {};
    this.defaultSettings = {
      // 버그 수정 관련 (모두 제거됨)
      
      // 오디오 설정
      volumeBoost: 100, // 100% = 기본값
      enableCompressor: false, // 오디오 컴프레서 ON/OFF
      compressorRatio: 12, // 컴프레서 비율 (1:1 ~ 20:1)
      enableStereoPan: false, // 스테레오 패닝 ON/OFF
      stereoPan: 0, // -100 (왼쪽) ~ 100 (오른쪽)
      
      // 재생 품질
      autoQuality: true,
      preferredQuality: 'auto',
      autoCodec: true,
      preferredCodec: 'auto', // vp9, h264, av01
      
      // 팝업/미니 재생기
      popupPlayer: false,
      miniPlayerSize: '480x270', // 256x144, 320x180, 400x225, 426x240, 480x270, 560x315, 640x360
      miniPlayerPosition: 'bottom-right',
      
      // Picture-in-Picture 설정
      enablePIP: true,
      
      // 디버그/고급 모드
      enableDebugMode: false,
      customScripts: '',
      customTheme: '',
      
      // UI 상태 (접기/펼치기)
      collapsedSections: {
        bugFixes: false,     // 버그 수정은 기본적으로 펼쳐진 상태
        advanced: true       // 고급 설정은 기본적으로 접힌 상태
      }
    };
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(this.defaultSettings);
      this.settings = result;
      return this.settings;
    } catch (error) {
      console.error('Settings load failed:', error);
      this.settings = { ...this.defaultSettings };
      return this.settings;
    }
  }

  async saveSetting(key, value) {
    try {
      this.settings[key] = value;
      await chrome.storage.sync.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Failed to save setting:', error);
      return false;
    }
  }

  getSetting(key, defaultValue = null) {
    return this.settings[key] ?? defaultValue;
  }

  // 기능별 설정 체크 헬퍼 메서드들
  isAudioEnabled() {
    return this.settings.enableCompressor || this.settings.enableStereoPan;
  }

  isQualityControlEnabled() {
    return this.settings.autoQuality || this.settings.autoCodec;
  }

  isPIPEnabled() {
    return this.settings.enablePIP;
  }

  isMiniPlayerEnabled() {
    return this.settings.popupPlayer;
  }

  isAdvancedEnabled() {
    return this.settings.enableDebugMode || 
           this.settings.customScripts || 
           this.settings.customTheme;
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.SettingsManager = SettingsManager;