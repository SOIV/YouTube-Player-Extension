// YouTube Player Enhancer - Settings Manager

class SettingsManager {
  constructor() {
    this.settings = {};
    this.defaultSettings = {
      // 버그 수정 관련 (모두 제거됨)
      
      // 오디오 설정
      enableCompressor: false, // 오디오 컴프레서 ON/OFF
      volumeBoost: 100, // 100% = 기본값
      compressorRatio: 12, // 컴프레서 비율 (1:1 ~ 20:1)

      enableStereoPan: false, // 스테레오 패닝 ON/OFF
      stereoPan: 0, // -100 (왼쪽) ~ 100 (오른쪽)
      
      // 팝업/플로팅 재생기
      popupPlayer: false,
      miniPlayerSize: '480x270', // 256x144, 320x180, 400x225, 426x240, 480x270, 560x315, 640x360, 720x405, 960x540
      miniPlayerPosition: 'top-right', // top-left, top-right, bottom-left, bottom-right
      
      // Picture-in-Picture 설정
      enablePIP: true,
      
      // 소형 플레이어 버튼 설정
      enableSmallPlayerButton: true,
      
      // 고급 설정
      customScripts: '',
      customTheme: '',
      debugMode: false
    };
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(this.defaultSettings);
      this.settings = result;
      return this.settings;
    } catch (error) {
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
      return false;
    }
  }

  getSetting(key, defaultValue = null) {
    return this.settings[key] ?? defaultValue;
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.SettingsManager = SettingsManager;
