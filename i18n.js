// 다국어 지원 시스템
class I18n {
  constructor() {
    this.currentLanguage = 'ko';
    this.translations = {
      ko: {
        // Header
        appName: 'YouTube™ Player Extension',
        appDescription: '고급 플레이어 기능 및 버그 수정',
        
        // Section titles
        audioControl: '오디오 제어',
        playbackQuality: '재생 품질',
        pipMiniPlayer: 'Picture-in-Picture(PIP) & 미니플레이어',
        bugFixes: '버그 수정',
        advancedSettings: '고급 설정',
        about: 'About / 정보',
        
        // Audio controls
        audioCompressor: '오디오 컴프레서',
        audioCompressorDesc: '볼륨 증폭 및 다이나믹 레인지 압축 (50% ~ 200%)',
        stereoPanning: '스테레오 패닝 (L/R)',
        stereoPanningDesc: '좌우 음향 균형 조정',
        
        // Quality controls
        autoQuality: '자동 품질 선택',
        autoQualityDesc: '선호 화질로 자동 설정',
        videoCodec: '비디오 코덱',
        videoCodecDesc: '선호하는 비디오 코덱 선택',
        
        // PIP controls
        pipMode: 'Picture-in-Picture 모드',
        pipModeDesc: '비디오를 작은 창으로 띄워서 시청 (PIP 버튼 추가)',
        miniPlayer: '미니플레이어',
        miniPlayerDesc: '스크롤 시 작은 플레이어로 계속 시청',
        miniPlayerSize: '미니플레이어 크기',
        miniPlayerSizeDesc: '미니플레이어의 크기를 선택',
        miniPlayerPosition: '미니플레이어 위치',
        miniPlayerPositionDesc: '미니플레이어가 나타날 화면 위치',
        
        // Positions
        topLeft: '왼쪽 상단',
        topRight: '오른쪽 상단',
        bottomLeft: '왼쪽 하단',
        bottomRight: '오른쪽 하단',
        
        // Quality options
        auto: '자동',
        compatibility: '호환성',
        efficiency: '효율성',
        latest: '최신',
        
        // Bug fixes
        noBugFixes: '현재 추가된 버그 수정 기능이 없습니다.',
        youtubeWorking: 'YouTube에서 대부분의 기능들이 정상 작동하고 있습니다.',
        
        // Advanced settings
        customTheme: '커스텀 테마 (CSS)',
        customScripts: '커스텀 스크립트 (JavaScript)',
        exportSettings: '설정 내보내기',
        importSettings: '설정 가져오기',
        resetSettings: '초기화',
        
        // Footer
        footerText: 'YouTube™ Player Extension v1.0.0',
        
        // Messages
        enabledOn: '활성화됨',
        disabledOn: '비활성화됨',
        changed: '변경됨',
        adjusted: '조정됨',
        center: 'Center'
      },
      
      en: {
        // Header
        appName: 'YouTube™ Player Extension',
        appDescription: 'Advanced player features and bug fixes',
        
        // Section titles
        audioControl: 'Audio Control',
        playbackQuality: 'Playback Quality',
        pipMiniPlayer: 'Picture-in-Picture (PIP) & Mini Player',
        bugFixes: 'Bug Fixes',
        advancedSettings: 'Advanced Settings',
        about: 'About',
        
        // Audio controls
        audioCompressor: 'Audio Compressor',
        audioCompressorDesc: 'Volume boost and dynamic range compression (50% ~ 200%)',
        stereoPanning: 'Stereo Panning (L/R)',
        stereoPanningDesc: 'Adjust left/right audio balance',
        
        // Quality controls
        autoQuality: 'Auto Quality Selection',
        autoQualityDesc: 'Automatically set to preferred quality',
        videoCodec: 'Video Codec',
        videoCodecDesc: 'Select preferred video codec',
        
        // PIP controls
        pipMode: 'Picture-in-Picture Mode',
        pipModeDesc: 'Watch video in a small floating window (adds PIP button)',
        miniPlayer: 'Mini Player',
        miniPlayerDesc: 'Continue watching with small player while scrolling',
        miniPlayerSize: 'Mini Player Size',
        miniPlayerSizeDesc: 'Select the size of mini player',
        miniPlayerPosition: 'Mini Player Position',
        miniPlayerPositionDesc: 'Screen position where mini player appears',
        
        // Positions
        topLeft: 'Top Left',
        topRight: 'Top Right',
        bottomLeft: 'Bottom Left',
        bottomRight: 'Bottom Right',
        
        // Quality options
        auto: 'Auto',
        compatibility: 'Compatibility',
        efficiency: 'Efficiency',
        latest: 'Latest',
        
        // Bug fixes
        noBugFixes: 'No bug fix features are currently available.',
        youtubeWorking: 'Most features are working properly on YouTube.',
        
        // Advanced settings
        customTheme: 'Custom Theme (CSS)',
        customScripts: 'Custom Scripts (JavaScript)',
        exportSettings: 'Export Settings',
        importSettings: 'Import Settings',
        resetSettings: 'Reset',
        
        // Footer
        footerText: 'YouTube™ Player Extension v1.0.0',
        
        // Messages
        enabledOn: 'enabled',
        disabledOn: 'disabled',
        changed: 'changed',
        adjusted: 'adjusted',
        center: 'Center'
      }
    };
    
    this.detectLanguage();
  }
  
  detectLanguage() {
    // 브라우저 언어 감지
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('ko')) {
      this.currentLanguage = 'ko';
    } else {
      this.currentLanguage = 'en';
    }
    
    // 저장된 언어 설정 확인
    const savedLang = localStorage.getItem('ytpe-language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
  }
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('ytpe-language', lang);
      return true;
    }
    return false;
  }
  
  t(key) {
    return this.translations[this.currentLanguage][key] || key;
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// 전역 인스턴스
window.i18n = new I18n();