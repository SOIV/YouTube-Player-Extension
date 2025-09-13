// YouTube Player Enhancer - Audio Features Module

class AudioEnhancer {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;
    
    this.audioContext = null;
    this.audioNodes = {};
  }

  // 오디오 기능이 필요한지 확인
  isEnabled() {
    return this.settings.isAudioEnabled();
  }

  // 오디오 향상 기능 초기화
  async init() {
    if (!this.isEnabled()) {
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.setupAudioContextLifecycle();
      await this.setupAudioNodes();
    } catch (error) {
    }
  }

  // 오디오 컨텍스트 생명주기 관리
  setupAudioContextLifecycle() {
    // 페이지 숨김/표시 감지
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.audioContext.state === 'running') {
        // 페이지가 숨겨져도 오디오 컨텍스트 유지 (음악 재생 중단 방지)
      }
    });
  }

  // 오디오 노드 설정
  async setupAudioNodes() {
    if (!this.audioContext) return;

    try {
      // 게인 노드 (볼륨 조절용)
      this.audioNodes.gainNode = this.audioContext.createGain();
      
      // 컴프레서 노드
      if (this.settings.getSetting('enableCompressor')) {
        this.audioNodes.compressor = this.audioContext.createDynamicsCompressor();
        this.audioNodes.compressor.threshold.value = -24;
        this.audioNodes.compressor.knee.value = 30;
        this.audioNodes.compressor.ratio.value = this.settings.getSetting('compressorRatio', 12);
        this.audioNodes.compressor.attack.value = 0.003;
        this.audioNodes.compressor.release.value = 0.25;
      }
      
      // 스테레오 패닝 노드
      if (this.settings.getSetting('enableStereoPan')) {
        this.audioNodes.stereoPanner = this.audioContext.createStereoPanner();
        const panValue = this.settings.getSetting('stereoPan', 0) / 100;
        this.audioNodes.stereoPanner.pan.value = Math.max(-1, Math.min(1, panValue));
      }

      // 오디오 연결 설정
      this.connectAudioNodes();
      
    } catch (error) {
    }
  }

  // 오디오 노드 연결
  connectAudioNodes() {
    if (!this.audioContext || !this.audioNodes.gainNode) return;
    
    // 오디오 기능이 모두 꺼져있으면 오디오 노드 연결 안함
    if (!this.isEnabled()) {
      return;
    }

    let currentNode = this.audioNodes.gainNode;
    
    // 컴프레서 처리
    if (this.settings.getSetting('enableCompressor') && this.audioNodes.compressor) {
      currentNode.connect(this.audioNodes.compressor);
      currentNode = this.audioNodes.compressor;
    }
    
    // 스테레오 패닝 처리
    if (this.settings.getSetting('enableStereoPan') && this.audioNodes.stereoPanner) {
      currentNode.connect(this.audioNodes.stereoPanner);
      currentNode = this.audioNodes.stereoPanner;
    }
    
    // 최종 출력에 연결
    currentNode.connect(this.audioContext.destination);
    
  }

  // 오디오 노드 연결 해제
  disconnectAudioNodes() {
    try {
      if (this.audioNodes.gainNode) this.audioNodes.gainNode.disconnect();
      if (this.audioNodes.compressor) this.audioNodes.compressor.disconnect();
      if (this.audioNodes.stereoPanner) this.audioNodes.stereoPanner.disconnect();
    } catch (error) {
    }
  }

  // 오디오 설정 적용
  applyAudioSettings() {
    if (!this.audioContext || !this.audioNodes.gainNode) return;


    // 게인 노드 볼륨 설정
    if (this.settings.getSetting('enableCompressor')) {
      // 컴프레서 활성화 시 볼륨 부스트 적용 (50% ~ 200%)
      const volumeMultiplier = this.settings.getSetting('volumeBoost', 100) / 100;
      this.audioNodes.gainNode.gain.setValueAtTime(volumeMultiplier, this.audioContext.currentTime);
    } else {
      // 컴프레서 비활성화 시 기본 볼륨
      this.audioNodes.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
    }

    // 컴프레서 비율 조정
    if (this.settings.getSetting('enableCompressor') && this.audioNodes.compressor) {
      const ratio = this.settings.getSetting('compressorRatio', 12);
      this.audioNodes.compressor.ratio.setValueAtTime(ratio, this.audioContext.currentTime);
    }

    // 스테레오 패닝 조정
    if (this.settings.getSetting('enableStereoPan') && this.audioNodes.stereoPanner) {
      const panValue = this.settings.getSetting('stereoPan', 0) / 100;
      const clampedPan = Math.max(-1, Math.min(1, panValue));
      this.audioNodes.stereoPanner.pan.setValueAtTime(clampedPan, this.audioContext.currentTime);
    }
  }

  // 설정 변경 시 호출
  onSettingsChanged(changedSettings) {
    const audioSettings = ['enableCompressor', 'enableStereoPan', 'volumeBoost', 'compressorRatio', 'stereoPan'];
    const hasAudioChanges = changedSettings.some(key => audioSettings.includes(key));
    
    if (hasAudioChanges) {
      if (this.audioContext && this.audioNodes.gainNode) {
        this.applyAudioSettings();
      }
    }
  }

  // 정리
  cleanup() {
    this.cleanupAudioContext();
  }

  cleanupAudioContext() {
    try {
      this.disconnectAudioNodes();
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      
      this.audioContext = null;
      this.audioNodes = {};
    } catch (error) {
    }
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.AudioEnhancer = AudioEnhancer;