// YouTube Player Enhancer - Audio Features Module

class AudioEnhancer {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;
    
    this.audioContext = null;
    this.audioNodes = {};
    this.sourceNode = null;
    this.connectedVideoElement = null;
    
    // 디바운스 타이머
    this.settingsDebounceTimer = null;
    this.reconnectDebounceTimer = null;
    
    // 쓰로틀 제어
    this.isApplyingSettings = false;
    this.lastApplyTime = 0;
    
    // 이벤트 리스너 참조 저장
    this.visibilityChangeHandler = null;
    this.videoPlayHandler = null;
    this.documentClickHandler = null;
    
    // 재시도 카운터
    this.retryCount = 0;
  }

  // 오디오 기능이 필요한지 확인
  isEnabled() {
    return this.settings.isAudioEnabled();
  }

  // 오디오 시스템 완전 활성화 여부 확인
  isFullyEnabled() {
    return this.settings.getSetting('enableCompressor') || 
           this.settings.getSetting('enableStereoPan');
  }

  // 오디오 향상 기능 초기화
  async init() {
    // 최소한 하나의 오디오 기능이라도 켜져 있어야 초기화
    if (!this.isFullyEnabled()) {
      console.log('No audio features enabled, skipping initialization');
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.setupAudioContextLifecycle();
      await this.setupAudioNodes();
      await this.connectToVideo();
      this.setupVideoPlayListener();
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.error('Audio init error:', error);
    }
  }

  // 오디오 컨텍스트 생명주기 관리
  setupAudioContextLifecycle() {
    // 이벤트 핸들러 생성 및 저장
    this.visibilityChangeHandler = () => {
      // audioContext가 null이면 아무 작업도 하지 않음
      if (!this.audioContext) return;
      
      if (document.hidden && this.audioContext.state === 'running') {
        // 페이지가 숨겨져도 오디오 컨텍스트 유지 (음악 재생 중단 방지)
      }
    };
    
    // 페이지 숨김/표시 감지
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  // 비디오 요소에 연결
  async connectToVideo() {
    const videoElement = document.querySelector('video');
    
    if (!videoElement) {
      console.warn('Video element not found');
      return;
    }

    // 이미 연결된 비디오면 스킵
    if (this.connectedVideoElement === videoElement) {
      console.log('Already connected to this video element');
      return;
    }

    // audioContext가 없으면 종료
    if (!this.audioContext) {
      console.error('AudioContext not initialized');
      return;
    }

    try {
      console.log('AudioContext state before:', this.audioContext.state);
      
      // AudioContext resume (autoplay 정책 대응)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('AudioContext resumed');
      }

      // 이전 연결 정리
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        console.log('Previous source disconnected');
      }

      // MediaElementSource 생성
      this.sourceNode = this.audioContext.createMediaElementSource(videoElement);
      this.connectedVideoElement = videoElement;

      // 오디오 체인에 연결
      this.sourceNode.connect(this.audioNodes.gainNode);
      
      console.log('Audio connected to video');
      console.log('AudioContext state after:', this.audioContext.state);
      console.log('Gain node value:', this.audioNodes.gainNode.gain.value);
    } catch (error) {
      console.error('Error connecting to video:', error);
      
      // 이미 다른 곳에서 연결된 경우 - 비디오 복제로 해결
      if (error.name === 'InvalidStateError') {
        console.warn('Video element already has a MediaElementSource');
        console.log('Attempting to recreate video element...');
        
        // 비디오 복제 후 재시도
        await this.recreateVideoElement();
        
        // 재귀 호출로 다시 시도 (1회만)
        if (!this.retryCount) {
          this.retryCount = 1;
          await this.connectToVideo();
          this.retryCount = 0;
        }
      }
    }
  }
  
  // 비디오 요소 재생성
  async recreateVideoElement() {
    try {
      const video = document.querySelector('video');
      if (!video) return;
      
      const currentTime = video.currentTime;
      const wasPaused = video.paused;
      const volume = video.volume;
      const muted = video.muted;
      
      // 비디오 복제
      const newVideo = video.cloneNode(true);
      newVideo.currentTime = currentTime;
      newVideo.volume = volume;
      newVideo.muted = muted;
      
      // 교체
      video.parentNode.replaceChild(newVideo, video);
      
      // DOM 캐시 갱신
      if (this.domCache) {
        this.domCache.delete('video');
        this.domCache.delete('player');
      }
      
      // connectedVideoElement 초기화
      this.connectedVideoElement = null;
      
      // 재생 상태 복원
      if (!wasPaused) {
        await newVideo.play().catch(() => {});
      }
      
      console.log('Video element recreated');
    } catch (error) {
      console.error('Failed to recreate video element:', error);
    }
  }

  // 비디오 재생 리스너 설정
  setupVideoPlayListener() {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    // 이벤트 핸들러 생성 및 저장
    this.videoPlayHandler = async () => {
      // audioContext가 없거나 이미 running 상태면 스킵
      if (!this.audioContext || this.audioContext.state !== 'suspended') {
        return;
      }
      
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed on video play');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    };

    this.documentClickHandler = async () => {
      // audioContext가 없거나 이미 running 상태면 스킵
      if (!this.audioContext || this.audioContext.state !== 'suspended') {
        return;
      }
      
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed on click');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    };

    videoElement.addEventListener('play', this.videoPlayHandler, { once: true });
    document.addEventListener('click', this.documentClickHandler, { once: true });
  }

  // 오디오 노드 설정
  async setupAudioNodes() {
    if (!this.audioContext) return;

    try {
      // 게인 노드 (항상 필요, 이미 있으면 재사용)
      if (!this.audioNodes.gainNode) {
        this.audioNodes.gainNode = this.audioContext.createGain();
        console.log('Gain node created');
      }
      
      // 컴프레서 노드
      if (this.settings.getSetting('enableCompressor')) {
        if (!this.audioNodes.compressor) {
          this.audioNodes.compressor = this.audioContext.createDynamicsCompressor();
          this.audioNodes.compressor.threshold.value = -24;
          this.audioNodes.compressor.knee.value = 30;
          this.audioNodes.compressor.ratio.value = this.settings.getSetting('compressorRatio', 12);
          this.audioNodes.compressor.attack.value = 0.003;
          this.audioNodes.compressor.release.value = 0.25;
          console.log('Compressor node created');
        }
      }
      
      // 스테레오 패닝 노드
      if (this.settings.getSetting('enableStereoPan')) {
        if (!this.audioNodes.stereoPanner) {
          this.audioNodes.stereoPanner = this.audioContext.createStereoPanner();
          const panValue = this.settings.getSetting('stereoPan', 0) / 100;
          this.audioNodes.stereoPanner.pan.value = Math.max(-1, Math.min(1, panValue));
          console.log('Stereo panner node created');
        }
      }

      // 오디오 연결 설정
      this.connectAudioNodes();
      
    } catch (error) {
      console.error('Error setting up audio nodes:', error);
    }
  }

  // 오디오 노드 연결
  connectAudioNodes() {
    if (!this.audioContext || !this.audioNodes.gainNode) return;
    
    if (!this.isFullyEnabled()) {
      console.log('No audio features enabled, skipping connection');
      return;
    }

    console.log('Connecting audio nodes...');

    // 먼저 gainNode 이후의 모든 연결 해제
    try {
      if (this.audioNodes.gainNode) {
        this.audioNodes.gainNode.disconnect();
      }
      if (this.audioNodes.compressor) {
        this.audioNodes.compressor.disconnect();
      }
      if (this.audioNodes.stereoPanner) {
        this.audioNodes.stereoPanner.disconnect();
      }
    } catch (error) {
      // disconnect 오류 무시
    }

    // sourceNode가 있으면 gainNode에 연결
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
        this.sourceNode.connect(this.audioNodes.gainNode);
        console.log('Source connected to gain node');
      } catch (error) {
        console.error('Error connecting source:', error);
      }
    }

    let currentNode = this.audioNodes.gainNode;
    
    // 컴프레서 처리
    if (this.settings.getSetting('enableCompressor') && this.audioNodes.compressor) {
      currentNode.connect(this.audioNodes.compressor);
      currentNode = this.audioNodes.compressor;
      console.log('Compressor connected');
    }
    
    // 스테레오 패닝 처리
    if (this.settings.getSetting('enableStereoPan') && this.audioNodes.stereoPanner) {
      currentNode.connect(this.audioNodes.stereoPanner);
      currentNode = this.audioNodes.stereoPanner;
      console.log('Stereo panner connected');
    }
    
    // 최종 출력에 연결
    currentNode.connect(this.audioContext.destination);
    console.log('Connected to destination');

    // 설정 적용
    this.applyAudioSettings();
  }

  // 오디오 노드 연결 해제
  disconnectAudioNodes() {
    try {
      if (this.audioNodes.gainNode) this.audioNodes.gainNode.disconnect();
      if (this.audioNodes.compressor) this.audioNodes.compressor.disconnect();
      if (this.audioNodes.stereoPanner) this.audioNodes.stereoPanner.disconnect();
    } catch (error) {
      // disconnect 오류 무시
    }
  }

  // 오디오 노드 재연결
  async reconnectAudioNodes() {
    try {
      console.log('Reconnecting audio nodes...');
      
      // 기존 연결 해제
      this.disconnectAudioNodes();
      
      // 기존 노드 삭제 (gainNode는 유지)
      if (this.audioNodes.compressor) {
        this.audioNodes.compressor = null;
      }
      if (this.audioNodes.stereoPanner) {
        this.audioNodes.stereoPanner = null;
      }
      
      // 노드 재생성
      await this.setupAudioNodes();
      
      console.log('Audio nodes reconnected successfully');
    } catch (error) {
      console.error('Error reconnecting audio nodes:', error);
    }
  }

  // 오디오 설정 적용
  applyAudioSettings() {
    if (!this.audioContext || !this.audioNodes.gainNode) {
      console.warn('Cannot apply audio settings: context or gain node missing');
      return;
    }

    console.log('Applying audio settings...');
    
    try {
      const currentTime = this.audioContext.currentTime;

      // 게인 노드 볼륨 설정
      if (this.settings.getSetting('enableCompressor')) {
        const volumeMultiplier = this.settings.getSetting('volumeBoost', 100) / 100;
        this.audioNodes.gainNode.gain.setValueAtTime(volumeMultiplier, currentTime);
        console.log('Volume boost applied:', volumeMultiplier);
      } else {
        this.audioNodes.gainNode.gain.setValueAtTime(1.0, currentTime);
        console.log('Default volume applied: 1.0');
      }

      // 컴프레서 비율 조정
      if (this.settings.getSetting('enableCompressor') && this.audioNodes.compressor) {
        const ratio = this.settings.getSetting('compressorRatio', 12);
        this.audioNodes.compressor.ratio.setValueAtTime(ratio, currentTime);
        console.log('Compressor ratio applied:', ratio);
      }

      // 스테레오 패닝 조정
      if (this.settings.getSetting('enableStereoPan') && this.audioNodes.stereoPanner) {
        const panValue = this.settings.getSetting('stereoPan', 0) / 100;
        const clampedPan = Math.max(-1, Math.min(1, panValue));
        this.audioNodes.stereoPanner.pan.setValueAtTime(clampedPan, currentTime);
        console.log('Stereo pan applied:', clampedPan);
      }
      
      console.log('Audio settings applied successfully');
    } catch (error) {
      console.error('Error applying audio settings:', error);
    }
  }

  // 설정 변경 시 호출 (디바운스 + 쓰로틀 적용)
  async onSettingsChanged(changedSettings) {
    const audioSettings = ['volumeBoost', 'compressorRatio', 'stereoPan'];
    const hasAudioChanges = changedSettings.some(key => audioSettings.includes(key));
    
    if (!hasAudioChanges) return;

    // ON/OFF 토글은 무시 (페이지 새로고침 필요)
    // enableCompressor, enableStereoPan 변경은 처리하지 않음

    // 오디오 시스템이 없으면 종료
    if (!this.audioContext) {
      return;
    }

    // 파라미터 변경만 처리 (쓰로틀 + 디바운스 적용)
    const now = Date.now();
    const timeSinceLastApply = now - this.lastApplyTime;
    
    // 이미 설정 적용 중이거나, 마지막 적용 후 100ms 이내면 대기
    if (this.isApplyingSettings || timeSinceLastApply < 100) {
      // 디바운스 타이머만 갱신
      if (this.settingsDebounceTimer) {
        clearTimeout(this.settingsDebounceTimer);
      }
      
      this.settingsDebounceTimer = setTimeout(() => {
        this.applyAudioSettingsThrottled();
      }, 150);
      return;
    }
    
    // 즉시 적용 + 디바운스 설정
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
    }
    
    this.settingsDebounceTimer = setTimeout(() => {
      this.applyAudioSettingsThrottled();
    }, 150);
  }

  // 쓰로틀링이 적용된 설정 적용 메서드
  applyAudioSettingsThrottled() {
    if (this.isApplyingSettings) return;
    
    this.isApplyingSettings = true;
    this.lastApplyTime = Date.now();
    
    try {
      console.log('Parameter changes only, applying settings...');
      this.applyAudioSettings();
    } finally {
      this.isApplyingSettings = false;
      this.settingsDebounceTimer = null;
    }
  }

  // 정리
  cleanup() {
    console.log('Cleaning up audio system...');
    
    // 디바운스 타이머 정리
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
      this.settingsDebounceTimer = null;
    }
    if (this.reconnectDebounceTimer) {
      clearTimeout(this.reconnectDebounceTimer);
      this.reconnectDebounceTimer = null;
    }
    
    this.cleanupAudioContext();
    
    // 비디오 오디오 복구 - 오디오 시스템이 완전히 꺼질 때만
    if (!this.isFullyEnabled()) {
      console.log('Restoring video audio to default...');
      this.restoreVideoAudio();
    }
  }
  
  // 비디오 오디오 복구
  restoreVideoAudio() {
    try {
      const video = document.querySelector('video');
      if (!video) return;
      
      // 현재 재생 시간과 상태 저장
      const currentTime = video.currentTime;
      const wasPaused = video.paused;
      
      // 비디오 요소를 복제해서 교체 (오디오 라우팅 초기화)
      const newVideo = video.cloneNode(true);
      newVideo.currentTime = currentTime;
      
      video.parentNode.replaceChild(newVideo, video);
      
      // DOM 캐시 갱신 (중요!)
      if (this.domCache) {
        this.domCache.delete('video');
        this.domCache.delete('player');
      }
      
      // 재생 상태 복원
      if (!wasPaused) {
        newVideo.play().catch(() => {});
      }
      
      console.log('Video audio restored');
    } catch (error) {
      console.error('Failed to restore video audio:', error);
    }
  }

  cleanupAudioContext() {
    try {
      // 이벤트 리스너 제거
      if (this.visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
        this.visibilityChangeHandler = null;
      }
      
      if (this.videoPlayHandler) {
        const videoElement = document.querySelector('video');
        if (videoElement) {
          videoElement.removeEventListener('play', this.videoPlayHandler);
        }
        this.videoPlayHandler = null;
      }
      
      if (this.documentClickHandler) {
        document.removeEventListener('click', this.documentClickHandler);
        this.documentClickHandler = null;
      }
      
      // 오디오 노드 연결 해제
      this.disconnectAudioNodes();
      
      // sourceNode 정리
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      
      // AudioContext 닫기
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      
      this.audioContext = null;
      this.audioNodes = {};
      this.connectedVideoElement = null;
      
      console.log('Audio context cleaned up');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.AudioEnhancer = AudioEnhancer;