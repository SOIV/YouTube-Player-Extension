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
        audioControl: '🎵 오디오 제어',
        playbackQuality: '📺 재생 품질',
        pipMiniPlayer: '📱 Picture-in-Picture(PIP) & 미니플레이어',
        bugFixes: '🔧 버그 수정',
        advancedSettings: '🛠️ 고급 설정',
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
        center: 'Center',
        
        // Toast messages
        settingsLoadFailed: '설정을 불러오는데 실패했습니다.',
        extensionYouTubeOnly: '이 확장 프로그램은 YouTube에서만 작동합니다.',
        extensionActivated: 'YouTube에서 확장 프로그램이 활성화되었습니다.',
        settingSaveFailed: '설정 저장에 실패했습니다.',
        settingsExported: '설정이 내보내졌습니다.',
        settingsExportFailed: '설정 내보내기에 실패했습니다.',
        settingsImported: '설정이 가져와졌습니다.',
        settingsImportFailed: '설정 가져오기에 실패했습니다.',
        settingsResetFailed: '설정 초기화에 실패했습니다.',
        
        // Setting display names
        audioCompressorName: '오디오 컴프레서',
        stereoPanningName: '스테레오 패닝',
        autoQualityName: '자동 품질 선택',
        preferredQualityName: '선호 화질',
        autoCodecName: '자동 코덱 선택',
        preferredCodecName: '선호 코덱',
        miniPlayerName: '미니플레이어',
        miniPlayerSizeName: '미니플레이어 크기',
        miniPlayerPositionName: '미니플레이어 위치',
        pipModeName: 'Picture-in-Picture(PIP)',
        
        // About page
        backButton: '뒤로',
        aboutInfo: 'YouTube™ Player Extension 정보',
        version: '버전 1.0.0',
        appFeatures: '주요 기능',
        developmentBackground: '개발 배경',
        karaokeSuggestion: '노래방 기능이 필요하다면?',
        technicalInfo: '기술 정보',
        appDescriptionLong: 'YouTube의 플레이어 기능을 향상시키고\n실용적인 오디오 제어 기능을 제공하는 확장 프로그램',
        
        // Features
        audioCompressorFeature: '오디오 컴프레서 - 볼륨 증폭 및 다이나믹 레인지 압축 (50% ~ 200%)',
        stereoPanningFeature: '스테레오 패닝 - 좌우 음향 균형 조정 (L/R)',
        pipFeature: 'Picture-in-Picture - 작은 창으로 비디오 시청',
        miniPlayerFeature: '미니플레이어 - 스크롤 시 작은 플레이어로 계속 시청',
        autoQualityFeature: '자동 품질 선택 - 선호 화질로 자동 설정',
        codecSelectionFeature: '비디오 코덱 선택 - H.264, VP9, AV1 중 선택',
        
        // Development background
        developmentText: '기존의 복잡한 YouTube 확장 프로그램들과 달리, 정말 필요한 기능만 엄선하여 성능과 안정성에 중점을 둔 설계입니다.',
        
        // Karaoke
        transposeTitle: 'Transpose ▲▼ 추천',
        transposeDescription: '노래 키 조정, 템포 변경, 반복 구간 설정 등의 노래방 기능이 필요하시면',
        transposeLink: 'Transpose ▲▼',
        transposeRecommend: '확장 프로그램을 추천드립니다.',
        transposeNote: '각 확장 프로그램이 각자의 전문 분야에서 최고의 성능을 발휘할 수 있도록 역할을 분담했습니다.',
        
        // Technical info
        manifestV3: 'Manifest V3 - 최신 크롬 확장 프로그램 표준',
        modularDesign: '모듈화 설계 - 기능별 분리된 JavaScript 모듈',
        webAudioAPI: 'Web Audio API - 고품질 오디오 처리',
        memoryOptimized: '메모리 최적화 - 사용하지 않는 기능은 로드하지 않음',
        youtubeCompatibility: 'YouTube 호환성 - YouTube 업데이트에 대응하는 안정적인 구조',
        
        // Footer
        madeBy: 'Made by SOIV Studio',
        youtubeTrademark: 'YouTube는 Google LLC의 상표입니다',
        disclaimer: '이 확장 프로그램은 YouTube와 공식적인 관련이 없습니다',
        
        // Mini Player controls
        miniPlayerLabel: '미니플레이어',
        miniPlayerDescription: '스크롤 시 작은 플레이어로 계속 시청',
        miniPlayerSizeLabel: '미니플레이어 크기',
        miniPlayerSizeDescription: '미니플레이어의 크기를 선택',
        miniPlayerPositionLabel: '미니플레이어 위치',
        miniPlayerPositionDescription: '미니플레이어가 나타날 화면 위치',
        defaultSize: '기본값',
        
        // Quality controls
        autoOption: '자동',
        
        // Placeholder texts
        customThemePlaceholder: '/* 커스텀 CSS 코드를 입력하세요 */\n.ytp-chrome-bottom { \n  background: rgba(0,0,0,0.8) !important; \n}',
        customScriptsPlaceholder: '// 커스텀 JavaScript 코드를 입력하세요\nconsole.log("커스텀 스크립트 실행됨");'
      },
      
      en: {
        // Header
        appName: 'YouTube™ Player Extension',
        appDescription: 'Advanced player features and bug fixes',
        
        // Section titles
        audioControl: '🎵 Audio Control',
        playbackQuality: '📺 Playback Quality',
        pipMiniPlayer: '📱 Picture-in-Picture (PIP) & Mini Player',
        bugFixes: '🔧 Bug Fixes',
        advancedSettings: '🛠️ Advanced Settings',
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
        center: 'Center',
        
        // Toast messages
        settingsLoadFailed: 'Failed to load settings.',
        extensionYouTubeOnly: 'This extension only works on YouTube.',
        extensionActivated: 'Extension activated on YouTube.',
        settingSaveFailed: 'Failed to save setting.',
        settingsExported: 'Settings exported.',
        settingsExportFailed: 'Failed to export settings.',
        settingsImported: 'Settings imported.',
        settingsImportFailed: 'Failed to import settings.',
        settingsResetFailed: 'Failed to reset settings.',
        
        // Setting display names
        audioCompressorName: 'Audio Compressor',
        stereoPanningName: 'Stereo Panning',
        autoQualityName: 'Auto Quality Selection',
        preferredQualityName: 'Preferred Quality',
        autoCodecName: 'Auto Codec Selection',
        preferredCodecName: 'Preferred Codec',
        miniPlayerName: 'Mini Player',
        miniPlayerSizeName: 'Mini Player Size',
        miniPlayerPositionName: 'Mini Player Position',
        pipModeName: 'Picture-in-Picture (PIP)',
        
        // About page
        backButton: 'Back',
        aboutInfo: 'YouTube™ Player Extension Info',
        version: 'Version 1.0.0',
        appFeatures: 'Key Features',
        developmentBackground: 'Development Background',
        karaokeSuggestion: 'Need karaoke features?',
        technicalInfo: 'Technical Information',
        appDescriptionLong: 'An extension that enhances YouTube\'s player features\nand provides practical audio control functions',
        
        // Features
        audioCompressorFeature: 'Audio Compressor - Volume boost and dynamic range compression (50% ~ 200%)',
        stereoPanningFeature: 'Stereo Panning - Adjust left/right audio balance (L/R)',
        pipFeature: 'Picture-in-Picture - Watch video in a small floating window',
        miniPlayerFeature: 'Mini Player - Continue watching with small player while scrolling',
        autoQualityFeature: 'Auto Quality Selection - Automatically set to preferred quality',
        codecSelectionFeature: 'Video Codec Selection - Choose from H.264, VP9, AV1',
        
        // Development background
        developmentText: 'Unlike complex YouTube extensions, this design focuses on performance and stability by carefully selecting only essential features.',
        
        // Karaoke
        transposeTitle: 'Transpose ▲▼ Recommended',
        transposeDescription: 'If you need karaoke features such as key adjustment, tempo change, and repeat section settings, we recommend',
        transposeLink: 'Transpose ▲▼',
        transposeRecommend: 'extension.',
        transposeNote: 'Each extension is designed to perform best in their respective specialized areas by dividing roles.',
        
        // Technical info
        manifestV3: 'Manifest V3 - Latest Chrome extension standard',
        modularDesign: 'Modular Design - JavaScript modules separated by functionality',
        webAudioAPI: 'Web Audio API - High-quality audio processing',
        memoryOptimized: 'Memory Optimized - Unused features are not loaded',
        youtubeCompatibility: 'YouTube Compatibility - Stable structure that responds to YouTube updates',
        
        // Footer
        madeBy: 'Made by SOIV Studio',
        youtubeTrademark: 'YouTube is a trademark of Google LLC',
        disclaimer: 'This extension is not officially affiliated with YouTube',
        
        // Mini Player controls
        miniPlayerLabel: 'Mini Player',
        miniPlayerDescription: 'Continue watching with small player while scrolling',
        miniPlayerSizeLabel: 'Mini Player Size',
        miniPlayerSizeDescription: 'Select the size of mini player',
        miniPlayerPositionLabel: 'Mini Player Position',
        miniPlayerPositionDescription: 'Screen position where mini player appears',
        defaultSize: 'Default',
        
        // Quality controls
        autoOption: 'Auto',
        
        // Placeholder texts
        customThemePlaceholder: '/* Enter your custom CSS code here */\n.ytp-chrome-bottom { \n  background: rgba(0,0,0,0.8) !important; \n}',
        customScriptsPlaceholder: '// Enter your custom JavaScript code here\nconsole.log("Custom script executed");'
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