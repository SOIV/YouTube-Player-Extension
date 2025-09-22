// YouTube Player Extension - Modular Main Entry Point

class YouTubePlayerEnhancer {
  constructor() {
    this.isInitialized = false;
    this.modules = {};
    
    // 핵심 매니저들
    this.settingsManager = null;
    this.domCache = null;
    this.eventManager = null;
    
    // 기능 모듈들
    this.audioEnhancer = null;
    this.pipController = null;
    
    this.mainLoopInterval = null;
    
    this.init();
  }

  async init() {
    try {
      
      // 1. 핵심 매니저 초기화
      await this.initCoreManagers();
      
      // 2. 설정 로드
      await this.loadSettings();
      
      // 3. 메시지 리스너 설정
      this.setupMessageListener();
      
      // 4. 기능 모듈들 초기화 (설정에 따라 선택적)
      await this.initFeatureModules();
      
      // 5. 메인 루프 시작 (최소한의 체크만)
      this.startMainLoop();
      
      this.isInitialized = true;
      
    } catch (error) {
    }
  }

  async initCoreManagers() {
    // DOM 캐시 매니저
    this.domCache = new window.YouTubeEnhancer.DOMCache();
    
    // 이벤트 매니저
    this.eventManager = new window.YouTubeEnhancer.EventManager();
    
    // 설정 매니저
    this.settingsManager = new window.YouTubeEnhancer.SettingsManager();
    
  }

  async loadSettings() {
    await this.settingsManager.loadSettings();
  }

  setupMessageListener() {
    // 백그라운드 스크립트에서 오는 설정 변경 메시지 처리
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'settingsChanged') {
        
        // 변경된 설정을 현재 설정에 반영
        Object.keys(message.changes).forEach(key => {
          const change = message.changes[key];
          if (change.newValue !== undefined) {
            this.settingsManager.settings[key] = change.newValue;
          }
        });
        
        // 각 모듈에 설정 변경 알림
        this.notifyModulesOfSettingsChange(Object.keys(message.changes));
        
        sendResponse({ success: true });
      }
      return true; // 비동기 응답을 위해
    });
  }

  async initFeatureModules() {
    
    // 오디오 향상 모듈
    if (this.settingsManager.isAudioEnabled()) {
      this.audioEnhancer = new window.YouTubeEnhancer.AudioEnhancer(
        this.settingsManager, 
        this.domCache, 
        this.eventManager
      );
      await this.audioEnhancer.init();
    }
    
    
    // PIP 및 미니플레이어 모듈
    if (this.settingsManager.isPIPEnabled() || this.settingsManager.isMiniPlayerEnabled()) {
      this.pipController = new window.YouTubeEnhancer.PIPController(
        this.settingsManager, 
        this.domCache, 
        this.eventManager
      );
      this.pipController.init();
    }
    
  }

  notifyModulesOfSettingsChange(changedKeys) {
    // 각 모듈에 설정 변경 알림
    if (this.audioEnhancer) {
      this.audioEnhancer.onSettingsChanged(changedKeys);
    }
    
    
    if (this.pipController) {
      this.pipController.onSettingsChanged(changedKeys);
    }
  }

  startMainLoop() {
    // 매우 간단한 메인 루프 - 오직 오디오 컨텍스트 건강성만 체크
    this.mainLoopInterval = this.eventManager.addInterval(() => {
      if (window.location.pathname.includes('/watch')) {
        this.runPeriodicChecks();
      }
    }, 30000); // 30초마다
    
  }

  runPeriodicChecks() {
    // 오직 오디오 컨텍스트 건강성만 체크
    if (this.audioEnhancer && this.settingsManager.isAudioEnabled()) {
      this.checkAudioContextHealth();
    }
  }

  checkAudioContextHealth() {
    try {
      if (!this.audioEnhancer.audioContext || this.audioEnhancer.audioContext.state === 'closed') {
        if (this.settingsManager.isAudioEnabled()) {
          this.audioEnhancer.init();
        }
      }
    } catch (error) {
    }
  }

  // 정리
  cleanup() {
    
    // 메인 루프 정리
    if (this.mainLoopInterval) {
      this.eventManager.removeInterval(this.mainLoopInterval);
    }
    
    // 각 모듈 정리
    if (this.audioEnhancer) {
      this.audioEnhancer.cleanup();
    }
    
    
    if (this.pipController) {
      this.pipController.cleanup();
    }
    
    // 이벤트 매니저 정리
    if (this.eventManager) {
      this.eventManager.cleanup();
    }
    
    // DOM 캐시 정리
    if (this.domCache) {
      this.domCache.clear();
    }
    
  }
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.youTubeEnhancer = new YouTubePlayerEnhancer();
  });
} else {
  window.youTubeEnhancer = new YouTubePlayerEnhancer();
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
  if (window.youTubeEnhancer) {
    window.youTubeEnhancer.cleanup();
  }
});