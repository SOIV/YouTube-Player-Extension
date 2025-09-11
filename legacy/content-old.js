// YouTube Player Enhancer - Content Script

// DOM 캐싱 시스템
class DOMCache {
  constructor() {
    this.cache = new Map();
    this.selectors = {
      player: '#movie_player',
      video: 'video',
      controls: '.ytp-chrome-controls',
      rightControls: '.ytp-right-controls',
      leftControls: '.ytp-left-controls'
    };
  }
  
  get(selectorKey) {
    const selector = this.selectors[selectorKey] || selectorKey;
    if (!this.cache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        this.cache.set(selector, element);
      }
    }
    return this.cache.get(selector);
  }
  
  invalidate(selectorKey) {
    const selector = this.selectors[selectorKey] || selectorKey;
    this.cache.delete(selector);
  }
  
  clear() {
    this.cache.clear();
  }
}

// 이벤트 및 인터벌 관리 시스템
class EventManager {
  constructor() {
    this.intervals = new Set();
    this.listeners = new Map();
    this.abortController = new AbortController();
  }
  
  addInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.intervals.add(intervalId);
    return intervalId;
  }
  
  addEventListener(target, event, callback, options = {}) {
    const finalOptions = { ...options, signal: this.abortController.signal };
    target.addEventListener(event, callback, finalOptions);
    
    const key = `${target.constructor.name}-${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push({ target, event, callback, options });
  }
  
  cleanup() {
    // 모든 인터벌 정리
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
    
    // 모든 이벤트 리스너 정리
    this.abortController.abort();
    this.abortController = new AbortController();
    this.listeners.clear();
  }
}

class YouTubePlayerEnhancer {
  constructor() {
    this.settings = {};
    this.audioContext = null;
    this.audioNodes = {};
    this.player = null;
    this.videoElement = null;
    this.isInitialized = false;
    this.observer = null;
    this.customScripts = [];
    this.domCache = new DOMCache();
    this.eventManager = new EventManager();
    this.mainLoopInterval = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    // MutationObserver 비활성화 - 성능 간섭 방지
    // this.setupObserver();
    this.setupMessageListener(); // 설정 변경 메시지 리스너 추가
    this.applyEnhancements();
    this.setupEventListeners();
    this.setupPlayerBugFixes();
    this.startMainLoop();
    this.isInitialized = true;
    console.log('YouTube Player Enhancer initialized - Performance optimized');
  }

  setupMessageListener() {
    // 백그라운드 스크립트에서 오는 설정 변경 메시지 처리
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'settingsChanged') {
        console.log('Settings changed:', message.changes);
        
        // 변경된 설정을 현재 설정에 반영
        Object.keys(message.changes).forEach(key => {
          const change = message.changes[key];
          if (change.newValue !== undefined) {
            this.settings[key] = change.newValue;
          }
        });
        
        // 오디오 관련 설정이 변경된 경우 즉시 적용
        const audioSettings = ['enableCompressor', 'enableStereoPan', 'volumeBoost', 'compressorRatio', 'stereoPan'];
        const changedAudioSettings = Object.keys(message.changes).filter(key => 
          audioSettings.includes(key)
        );
        
        if (changedAudioSettings.length > 0) {
          console.log('Audio settings changed:', changedAudioSettings);
          this.checkAudioContextHealth();
          if (this.audioContext && this.audioNodes.gainNode) {
            this.applyAudioSettings();
          }
        }
        
        sendResponse({ success: true });
      }
      return true; // 비동기 응답을 위해
    });
  }

  // 메인 루프 - 모든 정기 체크를 통합 (성능 최적화: 1초 -> 10초)
  startMainLoop() {
    this.mainLoopInterval = this.eventManager.addInterval(() => {
      if (window.location.pathname.includes('/watch')) {
        this.runPeriodicChecks();
      }
    }, 30000); // 30초로 대폭 늘려서 성능 부담 완전 최소화
  }

  runPeriodicChecks() {
    // 모든 플레이어 간섭 제거 - 오직 오디오 컨텍스트만 체크
    // const player = this.domCache.get('player');
    // if (player) {
      // PIP 관련 체크 제거 - 성능 간섭 방지
      // this.checkPIPUpdates();
      
      // 오디오 컨텍스트 상태만 체크 (사용자가 오디오 기능을 켰을 때만)
      this.checkAudioContextHealth();
    // }
  }

  checkAudioContextHealth() {
    // 오디오 기능이 실제로 활성화되어 있는지 확인 (토글 기준)
    const needsAudio = this.settings.enableCompressor || this.settings.enableStereoPan;
    console.log(`Audio context health check: needsAudio=${needsAudio}, enableCompressor=${this.settings.enableCompressor}, enableStereoPan=${this.settings.enableStereoPan}`);
    
    if (needsAudio && (!this.audioContext || this.audioContext.state === 'closed')) {
      // 오디오 기능이 켜져 있고 컨텍스트가 없으면 생성
      console.log('Creating audio context...');
      this.setupAudioEnhancements();
    } else if (!needsAudio && this.audioContext && this.audioContext.state !== 'closed') {
      // 오디오 기능이 모두 꺼져 있으면 컨텍스트 완전 종료
      console.log('Cleaning up audio context...');
      this.cleanupAudioContext();
    } else if (needsAudio && this.audioContext) {
      console.log(`Audio context exists: state=${this.audioContext.state}`);
    }
  }

  cleanupAudioContext() {
    try {
      // 오디오 노드 연결 해제
      this.disconnectAudioNodes();
      
      // 오디오 컨텍스트 완전 종료
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
        console.log('Audio context completely closed - no audio interference');
      }
      
      this.audioContext = null;
      this.audioNodes = {};
    } catch (error) {
      console.error('Failed to cleanup audio context:', error);
    }
  }

  // 정리 메서드 추가
  destroy() {
    this.eventManager.cleanup();
    this.domCache.clear();
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  // Player API 호출을 안전하게 처리하는 helper 함수
  safePlayerCall(player, methodName, ...args) {
    if (player && typeof player[methodName] === 'function') {
      try {
        const result = player[methodName](...args);
        return result !== undefined ? result : true; // 성공시 true 반환
      } catch (error) {
        console.warn(`Player API call failed: ${methodName}`, error);
        return false;
      }
    }
    console.warn(`Player method not available: ${methodName}`);
    return false;
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
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
        customTheme: ''
      });
      this.settings = result;
    } catch (error) {
      console.error('Settings load failed:', error);
    }
  }

  setupObserver() {
    // MutationObserver 완전 비활성화 - 성능 간섭 방지 및 렉 제거
    console.log('⚠️ MutationObserver disabled to prevent performance interference');
    return;
    
    // 기존 MutationObserver 코드 비활성화
    // this.observer = new MutationObserver(...);
    // this.observer.observe(...);
  }

  handleDOMChanges() {
    console.log('🔄 Important DOM change detected, updating...');
    
    // DOM 변경 시 캐시 무효화 (선택적)
    this.domCache.delete('player'); // 전체 clear 대신 플레이어만
    this.domCache.delete('video');
    
    if (window.location.pathname.includes('/watch')) {
      // 지연 시간 늘림 (100ms -> 500ms)
      setTimeout(() => {
        this.setupPlayer();
        // applyVideoPageEnhancements 제거 - 중복 실행 방지
      }, 500);
    }
  }

  applyEnhancements() {
    this.applyBugFixes();
    // 오디오 기능이 켜져있을 때만 오디오 컨텍스트 생성
    if (this.settings.enableCompressor || this.settings.enableStereoPan) {
      this.setupAudioEnhancements();
    }
    this.setupQualityControl();
    this.applyCustomTheme();
    this.executeCustomScripts();
    
    if (window.location.pathname.includes('/watch')) {
      this.applyVideoPageEnhancements();
    }
  }

  // ==================== 버그 수정 ====================
  applyBugFixes() {
    this.fixCommonBugs();
    this.setupPlayerBugFixes();
  }

  fixCommonBugs() {
    // 기존 버그 수정들 - 모두 제거됨 (YouTube에서 정상 작동)
    // if (this.settings.fixPlaybackSpeed) this.fixPlaybackSpeedBug();
    // if (this.settings.fixEndScreen) this.fixEndScreenBug();
  }

  setupPlayerBugFixes() {
    // 키보드 단축키 설정 제거 - 사용자 입력과 충돌 방지
    // this.setupKeyboardShortcuts();
    
    // 모든 버그 수정 기능 제거 - YouTube에서 정상 작동
    // if (this.settings.fixPlayerState) this.fixPlayerStateBugs();
  }

  fixPlayerStateBugs() {
    // 플레이어 상태 관련 버그 수정
    this.eventManager.addEventListener(document, 'yt-navigate-finish', () => {
      // 지연 없이 즉시 실행하고, 기존 설정 정리 후 새로 설정
      this.initializePlayerFixes();
    });
    
    // 페이지 로드 완료 시에도 초기화 (보험용)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.initializePlayerFixes(), 500);
      });
    } else {
      setTimeout(() => this.initializePlayerFixes(), 100);
    }
  }

  initializePlayerFixes() {
    const player = this.domCache.get('player');
    if (!player) return;

    // 중복 방지: 이미 초기화된 플레이어는 건너뛰기
    if (player._efytInitialized) return;
    player._efytInitialized = true;

    console.log('🎯 Initializing player fixes for:', player);

    // 모든 플레이어 간섭 제거 - YouTube 기본 기능 사용
    // this.fixUnresponsivePlayer(player);
    // this.fixFullscreenBugs(player);
    // this.setupVideoClickHandler(player);
  }

  // setupVideoClickHandler 완전 제거 - YouTube 기본 클릭 기능 사용
  // 확장 프로그램이 YouTube 클릭 이벤트에 간섭하지 않음

  // fixUnresponsivePlayer 제거 - 불필요한 간섭

  // checkPlayerResponsiveness, fixFullscreenBugs 제거 - YouTube 기본 기능이 정상 작동

  setupKeyboardShortcuts() {
    // 키보드 단축키 완전 제거 - 사용자 클릭/키보드 입력과 충돌 방지
    console.log('⚠️ Keyboard shortcuts disabled to prevent player interference');
    return;
  }

  // 버퍼링 관련 함수들 완전 제거 - YouTube 기본 버퍼링이 충분히 우수함

  // fixSeekbarBugs와 enhanceSeekbar 완전 제거 - YouTube 재생바는 현재 정상 작동

  // ==================== 오디오 향상 ====================
  async setupAudioEnhancements() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 오디오 컨텍스트 생명주기 관리
        this.setupAudioContextLifecycle();
        
        await this.setupAudioNodes();
      } catch (error) {
        console.error('Failed to setup audio context:', error);
      }
    }
  }

  // 로딩 인디케이터 완전 제거 - 유튜브 기본 로딩에 전혀 간섭하지 않음
  showLoadingIndicator(show) {
    // 모든 로딩 관련 간섭 제거
    return;
  }

  setupAudioContextLifecycle() {
    // 페이지 가시성 변화 감지 - 비디오 재생에 영향을 주지 않도록 수정
    this.eventManager.addEventListener(document, 'visibilitychange', () => {
      // 다른 창으로 이동해도 오디오 컨텍스트를 유지하여 재생이 계속되도록 함
      // AudioContext suspend/resume이 비디오 재생을 중지시키는 문제 해결
      if (document.hidden) {
        // suspend 대신 볼륨만 낮춤 (옵션)
        // this.suspendAudioContext();
      } else {
        // this.resumeAudioContext();
      }
    });

    // 비디오 재생/일시정지 감지
    this.eventManager.addEventListener(document, 'play', (e) => {
      if (e.target.tagName === 'VIDEO') {
        this.resumeAudioContext();
      }
    }, true);

    this.eventManager.addEventListener(document, 'pause', (e) => {
      if (e.target.tagName === 'VIDEO') {
        setTimeout(() => this.suspendAudioContext(), 1000); // 1초 후 suspend
      }
    }, true);
  }

  // 이거 왜 다른 창으로 넘어가면 재생이 중지됨?
  async suspendAudioContext() {
    if (this.audioContext && this.audioContext.state === 'running') {
      try {
        await this.audioContext.suspend();
        console.log('Audio context suspended');
      } catch (error) {
        console.log('Failed to suspend audio context:', error);
      }
    }
  }

  // 이거랑 같이 동작하던디
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed');
      } catch (error) {
        console.log('Failed to resume audio context:', error);
      }
    }
  }

  async setupAudioNodes() {
    // 오디오 노드 체인 구성
    this.audioNodes = {
      source: null,
      gainNode: this.audioContext.createGain(),
      compressor: this.audioContext.createDynamicsCompressor(),
      stereoPanner: this.audioContext.createStereoPanner(),
      destination: this.audioContext.destination
    };
    
    // 컴프레서 기본 설정
    this.audioNodes.compressor.threshold.setValueAtTime(-50, this.audioContext.currentTime);
    this.audioNodes.compressor.knee.setValueAtTime(40, this.audioContext.currentTime);
    this.audioNodes.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
    this.audioNodes.compressor.attack.setValueAtTime(0, this.audioContext.currentTime);
    this.audioNodes.compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
    
    // 노드 연결
    this.connectAudioNodes();
    this.applyAudioSettings();
  }

  connectAudioNodes() {
    // 기존 연결 해제
    this.disconnectAudioNodes();
    
    const { gainNode, compressor, stereoPanner, destination } = this.audioNodes;
    
    // 오디오 체인 구성 (컴프레서와 스테레오 패너 ON/OFF에 따라)
    let currentNode = gainNode;
    
    // 컴프레서 처리
    if (this.settings.enableCompressor) {
      currentNode.connect(compressor);
      currentNode = compressor;
    }
    
    // 스테레오 패너 처리
    if (this.settings.enableStereoPan) {
      currentNode.connect(stereoPanner);
      currentNode = stereoPanner;
    }
    
    // 최종 출력에 연결
    currentNode.connect(destination);
    
    console.log(`Audio chain: gainNode -> ${this.settings.enableCompressor ? 'compressor -> ' : ''}${this.settings.enableStereoPan ? 'stereoPanner -> ' : ''}destination`);
  }

  disconnectAudioNodes() {
    // 모든 노드 연결 해제
    if (this.audioNodes.gainNode) {
      this.audioNodes.gainNode.disconnect();
    }
    if (this.audioNodes.compressor) {
      this.audioNodes.compressor.disconnect();
    }
    if (this.audioNodes.stereoPanner) {
      this.audioNodes.stereoPanner.disconnect();
    }
  }

  setupPlayer() {
    const videoElement = this.domCache.get('video');
    if (videoElement && videoElement !== this.videoElement) {
      this.videoElement = videoElement;
      this.connectVideoToAudioNodes(videoElement);
    }
  }

  connectVideoToAudioNodes(videoElement) {
    // 오디오 기능이 모두 꺼져있으면 오디오 노드 연결 안함 (영상 로딩 방해 방지)
    if (!this.settings.enableCompressor && !this.settings.enableStereoPan) {
      console.log('Audio features disabled, skipping audio node connection');
      return;
    }
    
    // 영상이 로딩되고 재생 준비가 될 때까지 대기하여 로딩 방해 방지
    if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
      videoElement.addEventListener('loadeddata', () => {
        this.performAudioConnection(videoElement);
      }, { once: true });
    } else {
      this.performAudioConnection(videoElement);
    }
  }

  performAudioConnection(videoElement) {
    try {
      // 다시 한번 체크 - 오디오 기능이 꺼져있으면 연결 안함
      if (!this.settings.enableCompressor && !this.settings.enableStereoPan) {
        return;
      }
      
      if (this.audioNodes.source) {
        this.audioNodes.source.disconnect();
      }
      
      this.audioNodes.source = this.audioContext.createMediaElementSource(videoElement);
      this.audioNodes.source.connect(this.audioNodes.gainNode);
      
      console.log('Audio nodes connected to video element');
    } catch (error) {
      console.error('Failed to connect audio nodes:', error);
    }
  }

  applyAudioSettings() {
    console.log('=== applyAudioSettings called ===');
    console.log('Current settings:', {
      enableCompressor: this.settings.enableCompressor,
      enableStereoPan: this.settings.enableStereoPan,
      volumeBoost: this.settings.volumeBoost,
      stereoPan: this.settings.stereoPan,
      compressorRatio: this.settings.compressorRatio
    });
    
    if (!this.audioNodes.gainNode) {
      console.log('No gainNode available, skipping audio settings');
      return;
    }

    console.log('Audio nodes available:', {
      gainNode: !!this.audioNodes.gainNode,
      compressor: !!this.audioNodes.compressor,
      stereoPanner: !!this.audioNodes.stereoPanner
    });

    // 오디오 노드 체인 재연결 (컴프레서/스테레오 패너 ON/OFF에 따라)
    this.connectAudioNodes();

    // 게인 노드 볼륨 설정
    if (this.settings.enableCompressor) {
      // 컴프레서 활성화 시 볼륨 부스트 적용 (50% ~ 200%)
      const volumeMultiplier = this.settings.volumeBoost / 100;
      this.audioNodes.gainNode.gain.setValueAtTime(volumeMultiplier, this.audioContext.currentTime);
      
      // 컴프레서 설정
      if (this.audioNodes.compressor) {
        const ratio = this.settings.compressorRatio || 12;
        this.audioNodes.compressor.ratio.setValueAtTime(ratio, this.audioContext.currentTime);
      }
    } else {
      // 컴프레서 비활성화 시 원본 볼륨 (100%)
      this.audioNodes.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
    }

    // 스테레오 패닝 설정 적용
    if (this.settings.enableStereoPan && this.audioNodes.stereoPanner) {
      // 스테레오 패닝 활성화 시 설정값 적용 (-1 = 왼쪽, 0 = 중앙, 1 = 오른쪽)
      const panValue = this.settings.stereoPan / 100;
      this.audioNodes.stereoPanner.pan.setValueAtTime(panValue, this.audioContext.currentTime);
      console.log(`Stereo panning applied: ${panValue} (${this.settings.stereoPan}%)`);
    }
    // 스테레오 패너가 비활성화된 경우에는 노드 체인에서 제외되므로 별도 설정 불필요
  }


  // ==================== 품질 제어 ====================
  setupQualityControl() {
    if (!this.settings.autoQuality) return;

    document.addEventListener('yt-navigate-finish', () => {
      setTimeout(() => {
        this.applyQualitySettings();
      }, 3000); // 3초로 증가하여 플레이어 완전 로드 대기
    });

    // 플레이어 상태 변경시에도 품질 적용 시도
    document.addEventListener('yt-player-updated', () => {
      setTimeout(() => {
        this.applyQualitySettings();
      }, 1000);
    });
  }

  applyQualitySettings() {
    const player = this.domCache.get('player');
    if (!player) {
      console.log('Player not found for quality settings');
      return;
    }

    // 플레이어가 완전히 준비될 때까지 대기
    if (!player.getVideoData || !player.getVideoData()) {
      setTimeout(() => this.applyQualitySettings(), 1000);
      return;
    }

    try {
      // 품질 설정 - 여러 방법 시도
      if (this.settings.preferredQuality !== 'auto') {
        const quality = this.settings.preferredQuality;
        
        // 방법 1: setPlaybackQuality
        if (this.safePlayerCall(player, 'setPlaybackQuality', quality)) {
          console.log(`Quality set to ${quality} using setPlaybackQuality`);
        }
        // 방법 2: setPlaybackQualityRange 
        else if (this.safePlayerCall(player, 'setPlaybackQualityRange', quality, quality)) {
          console.log(`Quality set to ${quality} using setPlaybackQualityRange`);
        }
        // 방법 3: 품질 메뉴를 통한 설정
        else {
          this.setQualityViaMenu(quality);
        }
      }

      // 코덱 설정 (가능한 경우)
      if (this.settings.autoCodec && this.settings.preferredCodec !== 'auto') {
        this.setPreferredCodec(this.settings.preferredCodec);
      }
    } catch (error) {
      console.error('Failed to apply quality settings:', error);
    }
  }

  // 품질 메뉴를 통한 설정 (대안 방법)
  setQualityViaMenu(quality) {
    try {
      // YouTube 품질 버튼 찾기 및 클릭
      const settingsButton = document.querySelector('.ytp-settings-button');
      if (settingsButton) {
        settingsButton.click();
        
        setTimeout(() => {
          const qualityButton = document.querySelector('.ytp-menuitem[role="menuitemradio"]');
          if (qualityButton) {
            console.log(`Attempting to set quality via menu: ${quality}`);
            // 메뉴를 닫기
            settingsButton.click();
          }
        }, 100);
      }
    } catch (error) {
      console.warn('Failed to set quality via menu:', error);
    }
  }

  setPreferredCodec(codec) {
    // 코덱 선택은 제한적이지만 시도해볼 수 있는 방법
    try {
      const player = this.domCache.get('player');
      const videoElement = this.domCache.get('video');
      
      if (videoElement && videoElement.canPlayType) {
        const codecMimeTypes = {
          'vp9': 'video/webm; codecs="vp9"',
          'h264': 'video/mp4; codecs="avc1.42E01E"',
          'av01': 'video/mp4; codecs="av01.0.08M.08"'
        };
        
        const mimeType = codecMimeTypes[codec];
        if (mimeType && videoElement.canPlayType(mimeType)) {
          console.log(`Preferred codec ${codec} is supported`);
          // 실제 코덱 강제는 YouTube의 내부 구현에 의존
        }
      }
    } catch (error) {
      console.error('Codec setting failed:', error);
    }
  }


  // ==================== 디버그/고급 기능 ====================
  applyCustomTheme() {
    if (!this.settings.customTheme) return;

    const style = document.createElement('style');
    style.id = 'ype-custom-theme';
    style.textContent = this.settings.customTheme;
    document.head.appendChild(style);
  }

  executeCustomScripts() {
    if (!this.settings.customScripts) return;

    try {
      // 안전한 스크립트 실행을 위한 샌드박스
      const script = new Function('player', 'settings', 'audioContext', this.settings.customScripts);
      script(this.domCache.get('player'), this.settings, this.audioContext);
    } catch (error) {
      console.error('Custom script execution failed:', error);
    }
  }

  // ==================== 기존 버그 수정 메서드들 ====================

  // fixTheaterModeBug 제거 - YouTube 영화관 모드는 현재 정상 작동

  fixVolumeMemoryBug() {
    document.addEventListener('yt-navigate-finish', () => {
      const savedVolume = localStorage.getItem('yt-player-volume');
      if (savedVolume) {
        setTimeout(() => {
          const player = this.domCache.get('player');
          if (player && player.setVolume) {
            player.setVolume(parseInt(savedVolume));
          }
        }, 500);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.ytp-volume-slider')) {
        setTimeout(() => {
          const player = this.domCache.get('player');
          if (player && player.getVolume) {
            localStorage.setItem('yt-player-volume', player.getVolume().toString());
          }
        }, 100);
      }
    });
  }

  // fixPlaybackSpeedBug와 fixEndScreenBug 완전 제거 - YouTube에서 현재 정상 작동

  applyVideoPageEnhancements() {
    setTimeout(() => {
      this.setupPlayer();
      this.applyAudioSettings();
      this.setupPIPFeatures();
      this.setupMiniPlayerFeatures();
    }, 500);
  }

  // ==================== Picture-in-Picture & 미니플레이어 (Enhancer for YouTube 원본 로직) ====================
  setupPIPFeatures() {
    if (!this.settings.enablePIP) return;
    
    // PIP 버튼 추가 및 이벤트 설정
    setTimeout(() => {
      this.addPIPButton();
      this.setupPIPCommands();
    }, 1000);
  }

  setupMiniPlayerFeatures() {
    if (!this.settings.popupPlayer) return;
    
    // 미니플레이어 CSS 및 기본 설정 적용
    this.addMiniPlayerCSS();
    
    // 미니플레이어 스크롤 감지 설정
    setTimeout(() => {
      this.setupMiniPlayerObserver();
      // 미니플레이어 클래스 추가
      document.body.classList.add(`efyt-mini-player-${this.settings.miniPlayerSize}`, `efyt-mini-player-${this.settings.miniPlayerPosition}`);
    }, 1000);
  }

  // PIP 버튼 추가 (간단하고 빠른 버전)
  addPIPButton() {
    // PIP 설정이 꺼져 있으면 버튼을 추가하지 않음
    if (!this.settings.enablePIP) return;
    
    // PIP 지원 여부 체크
    if (!this.isPIPSupported()) {
      console.warn('PIP not supported, button not added');
      return;
    }
    
    const controlsRight = document.querySelector('.ytp-right-controls');
    if (!controlsRight) return;

    // 기존 PIP 버튼 제거
    const existingButton = document.querySelector('.ytp-efyt-pip-button');
    if (existingButton) existingButton.remove();

    const pipButton = document.createElement('button');
    pipButton.className = 'ytp-efyt-pip-button ytp-button';
    pipButton.title = 'Picture in Picture';
    pipButton.style.width = '48px';
    pipButton.style.height = '48px';
    pipButton.style.display = 'inline-flex';
    pipButton.style.alignItems = 'center';
    pipButton.style.justifyContent = 'center';
    pipButton.style.verticalAlign = 'top';
    pipButton.innerHTML = `
      <svg height="24" version="1.1" viewBox="0 0 24 24" width="24" style="pointer-events: none;">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM19 8h-6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z" fill="white"/>
      </svg>
    `;

    // 단순한 클릭 이벤트
    pipButton.addEventListener('click', this.togglePIP.bind(this));

    // 설정 버튼 바로 뒤에 추가 (자막 → 설정 → PIP 순서)
    const settingsButton = controlsRight.querySelector('.ytp-settings-button');
    if (settingsButton && settingsButton.nextSibling) {
      controlsRight.insertBefore(pipButton, settingsButton.nextSibling);
    } else if (settingsButton) {
      controlsRight.appendChild(pipButton);
    } else {
      // 설정 버튼이 없으면 풀스크린 버튼 앞에 추가
      const fullscreenButton = controlsRight.querySelector('.ytp-fullscreen-button');
      if (fullscreenButton) {
        controlsRight.insertBefore(pipButton, fullscreenButton);
      } else {
        controlsRight.appendChild(pipButton);
      }
    }
  }

  // 크롬 네이티브 PIP API 사용
  async togglePIP(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // PIP 지원 여부 체크
    if (!this.isPIPSupported()) {
      console.warn('Picture-in-Picture is not supported');
      return;
    }
    
    const video = this.domCache.get('video');
    if (!video) {
      console.warn('Video element not found');
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        // PIP 종료
        await document.exitPictureInPicture();
        console.log('PIP disabled');
      } else {
        // PIP 시작 - 크롬 네이티브 API 직접 호출
        if (video.readyState >= 2) { // 비디오가 로드되었는지 확인
          await video.requestPictureInPicture();
          console.log('PIP enabled');
        } else {
          console.warn('Video not ready for PIP');
        }
      }
    } catch (error) {
      console.error('PIP toggle failed:', error);
      // 사용자에게 피드백 제공
      this.showPIPError(error);
    }
  }

  // PIP 지원 여부 체크
  isPIPSupported() {
    return (
      'pictureInPictureEnabled' in document &&
      document.pictureInPictureEnabled &&
      'requestPictureInPicture' in HTMLVideoElement.prototype
    );
  }

  // PIP 에러 피드백
  showPIPError(error) {
    const errorMessages = {
      'NotSupportedError': 'PIP가 지원되지 않습니다',
      'InvalidStateError': '비디오가 준비되지 않았습니다',
      'NotAllowedError': 'PIP 권한이 없습니다',
      'AbortError': 'PIP 요청이 취소되었습니다'
    };
    
    const message = errorMessages[error.name] || 'PIP 실행 중 오류가 발생했습니다';
    console.warn(`PIP Error: ${message}`);
  }

  // PIP 버튼 상태 업데이트
  updatePIPButtonState() {
    const pipButton = document.querySelector('.ytp-efyt-pip-button');
    if (pipButton) {
      if (document.pictureInPictureElement) {
        pipButton.classList.add('active');
        pipButton.style.backgroundColor = 'rgba(255,255,255,0.2)';
      } else {
        pipButton.classList.remove('active');
        pipButton.style.backgroundColor = '';
      }
    }
  }

  // PIP 관련 정기 체크 (메인 루프에서 호출)
  checkPIPUpdates() {
    // PIP 버튼 상태 체크
    this.updatePIPButtonState();
  }

  // PIP 명령 설정 (단순화)
  setupPIPCommands() {
    // PIP 상태 변경 감지
    document.addEventListener('enterpictureinpicture', () => {
      this.updatePIPButtonState();
    });
    
    document.addEventListener('leavepictureinpicture', () => {
      this.updatePIPButtonState();
    });
  }

  // 미니플레이어 스크롤 감지 (원본 로직 기반)
  setupMiniPlayerObserver() {
    const playerContainer = document.querySelector('#player-container');
    if (!playerContainer) return;

    if (playerContainer.efytObserver) return; // 이미 설정된 경우

    playerContainer.efytObserver = new IntersectionObserver((entries) => {
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
          window.dispatchEvent(new Event('resize'));
        }
      } else if (entry.intersectionRatio !== 0) {
        // 미니플레이어 비활성화
        if (video) {
          video.removeEventListener('timeupdate', this.updateMiniPlayerProgress.bind(this));
        }
        document.body.classList.remove('efyt-mini-player');
        window.dispatchEvent(new Event('resize'));
      }
    }, { threshold: 0.12 });

    playerContainer.efytObserver.observe(playerContainer);
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
    const sizes = sizeMap[this.settings.miniPlayerSize] || sizeMap['480x270']; // 기본값
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
    `;
    
    document.head.appendChild(style);

    // 미니플레이어 UI 요소 추가
    this.addMiniPlayerElements();
  }

  // 미니플레이어 UI 요소 추가
  addMiniPlayerElements() {
    if (document.querySelector('#efyt-progress')) return;

    // 진행률 바 추가
    const progressBar = document.createElement('progress');
    progressBar.id = 'efyt-progress';
    progressBar.max = 1;
    progressBar.value = 0;
    
    // 진행률 바 클릭 이벤트
    progressBar.addEventListener('click', (e) => {
      const video = this.domCache.get('video');
      if (video) {
        const clickPosition = e.offsetX / progressBar.clientWidth;
        video.currentTime = video.duration * clickPosition;
      }
    });

    // 닫기 버튼 추가
    const hideButton = document.createElement('efyt-hide-mini-player');
    hideButton.innerHTML = `
      <svg version="1.1" viewBox="0 0 24 24" height="100%" width="100%">
        <path d="M 12,2 C 6.47,2 2,6.47 2,12 2,17.53 6.47,22 12,22 17.53,22 22,17.53 22,12 22,6.47 17.53,2 12,2 Z M 17,15.59 15.59,17 12,13.41 8.41,17 7,15.59 10.59,12 7,8.41 8.41,7 12,10.59 15.59,7 17,8.41 13.41,12 Z"/>
      </svg>
    `;
    
    hideButton.addEventListener('click', () => {
      document.body.classList.remove('efyt-mini-player');
    });

    // 플레이어에 요소 추가
    setTimeout(() => {
      const player = this.domCache.get('player');
      if (player) {
        player.appendChild(progressBar);
        player.appendChild(hideButton);
      }
    }, 100);
  }



  setupEventListeners() {
    chrome.storage.onChanged.addListener((changes) => {
      for (let key in changes) {
        this.settings[key] = changes[key].newValue;
        
        // PIP 설정 변경 시 버튼 추가/제거
        if (key === 'enablePIP') {
          if (changes[key].newValue) {
            setTimeout(() => this.addPIPButton(), 100);
          } else {
            const existingButton = document.querySelector('.ytp-efyt-pip-button');
            if (existingButton) existingButton.remove();
          }
        }
      }
      this.applyEnhancements();
    });

    document.addEventListener('yt-navigate-finish', () => {
      setTimeout(() => {
        this.applyEnhancements();
      }, 100);
    });
  }
}

// 확장 프로그램 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new YouTubePlayerEnhancer();
  });
} else {
  new YouTubePlayerEnhancer();
}