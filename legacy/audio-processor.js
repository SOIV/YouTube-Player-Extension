// YouTube Player Enhancer - Advanced Audio Processor
class AdvancedAudioProcessor {
  constructor() {
    this.audioContext = null;
    this.nodes = {};
    this.analyser = null;
    this.visualizer = null;
    this.isConnected = false;
    this.settings = {};
  }

  async initialize(settings = {}) {
    this.settings = settings;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.setupAudioNodes();
      console.log('Advanced Audio Processor initialized');
    } catch (error) {
      console.error('Failed to initialize audio processor:', error);
    }
  }

  async setupAudioNodes() {
    // 기본 노드들
    this.nodes.input = null; // 비디오 소스
    this.nodes.preGain = this.audioContext.createGain();
    this.nodes.stereoPanner = this.audioContext.createStereoPanner();
    this.nodes.compressor = this.audioContext.createDynamicsCompressor();
    
    // EQ 노드들 (다중 밴드)
    this.nodes.eq = {
      lowPass: this.audioContext.createBiquadFilter(),
      lowShelf: this.audioContext.createBiquadFilter(),
      lowMid: this.audioContext.createBiquadFilter(),
      mid: this.audioContext.createBiquadFilter(),
      highMid: this.audioContext.createBiquadFilter(),
      highShelf: this.audioContext.createBiquadFilter(),
      highPass: this.audioContext.createBiquadFilter()
    };

    // 이펙트 노드들
    this.nodes.reverb = this.audioContext.createConvolver();
    this.nodes.delay = this.audioContext.createDelay(1.0);
    this.nodes.delayFeedback = this.audioContext.createGain();
    this.nodes.delayMix = this.audioContext.createGain();
    
    // 최종 출력
    this.nodes.outputGain = this.audioContext.createGain();
    
    // 분석기 (비주얼라이저용)
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.setupEqualizer();
    this.setupCompressor();
    this.setupDelay();
    this.connectNodes();
  }

  setupEqualizer() {
    const eq = this.nodes.eq;
    
    // Low Pass Filter (20kHz)
    eq.lowPass.type = 'lowpass';
    eq.lowPass.frequency.setValueAtTime(20000, this.audioContext.currentTime);
    eq.lowPass.Q.setValueAtTime(0.7, this.audioContext.currentTime);

    // Low Shelf (100Hz) - 베이스
    eq.lowShelf.type = 'lowshelf';
    eq.lowShelf.frequency.setValueAtTime(100, this.audioContext.currentTime);
    eq.lowShelf.gain.setValueAtTime(0, this.audioContext.currentTime);

    // Low Mid (200Hz)
    eq.lowMid.type = 'peaking';
    eq.lowMid.frequency.setValueAtTime(200, this.audioContext.currentTime);
    eq.lowMid.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    eq.lowMid.gain.setValueAtTime(0, this.audioContext.currentTime);

    // Mid (1kHz)
    eq.mid.type = 'peaking';
    eq.mid.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    eq.mid.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    eq.mid.gain.setValueAtTime(0, this.audioContext.currentTime);

    // High Mid (3kHz)
    eq.highMid.type = 'peaking';
    eq.highMid.frequency.setValueAtTime(3000, this.audioContext.currentTime);
    eq.highMid.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    eq.highMid.gain.setValueAtTime(0, this.audioContext.currentTime);

    // High Shelf (8kHz) - 트레블
    eq.highShelf.type = 'highshelf';
    eq.highShelf.frequency.setValueAtTime(8000, this.audioContext.currentTime);
    eq.highShelf.gain.setValueAtTime(0, this.audioContext.currentTime);

    // High Pass Filter (20Hz)
    eq.highPass.type = 'highpass';
    eq.highPass.frequency.setValueAtTime(20, this.audioContext.currentTime);
    eq.highPass.Q.setValueAtTime(0.7, this.audioContext.currentTime);
  }

  setupCompressor() {
    const comp = this.nodes.compressor;
    
    // 다이나믹 레인지 압축기 설정
    comp.threshold.setValueAtTime(-24, this.audioContext.currentTime);
    comp.knee.setValueAtTime(30, this.audioContext.currentTime);
    comp.ratio.setValueAtTime(3, this.audioContext.currentTime);
    comp.attack.setValueAtTime(0.003, this.audioContext.currentTime);
    comp.release.setValueAtTime(0.25, this.audioContext.currentTime);
  }

  setupDelay() {
    // 딜레이 이펙트 설정
    this.nodes.delay.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
    this.nodes.delayFeedback.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    this.nodes.delayMix.gain.setValueAtTime(0, this.audioContext.currentTime); // 기본적으로 비활성화
  }

  connectNodes() {
    // 오디오 체인 연결
    // Input -> PreGain -> Compressor -> EQ Chain -> Effects -> Output
    
    // EQ 체인 연결
    const eq = this.nodes.eq;
    this.nodes.preGain.connect(this.nodes.compressor);
    this.nodes.compressor.connect(eq.highPass);
    eq.highPass.connect(eq.lowShelf);
    eq.lowShelf.connect(eq.lowMid);
    eq.lowMid.connect(eq.mid);
    eq.mid.connect(eq.highMid);
    eq.highMid.connect(eq.highShelf);
    eq.highShelf.connect(eq.lowPass);
    
    // EQ 출력을 스테레오 패너로
    eq.lowPass.connect(this.nodes.stereoPanner);
    
    // 딜레이 체인 설정
    this.nodes.stereoPanner.connect(this.nodes.delay);
    this.nodes.delay.connect(this.nodes.delayFeedback);
    this.nodes.delayFeedback.connect(this.nodes.delay); // 피드백
    this.nodes.delay.connect(this.nodes.delayMix);
    
    // 드라이/웻 믹스
    this.nodes.stereoPanner.connect(this.nodes.outputGain); // 드라이 신호
    this.nodes.delayMix.connect(this.nodes.outputGain); // 웻 신호
    
    // 분석기 연결
    this.nodes.outputGain.connect(this.analyser);
    
    // 최종 출력
    this.nodes.outputGain.connect(this.audioContext.destination);
  }

  connectToVideoElement(videoElement) {
    if (this.isConnected) {
      this.disconnect();
    }

    try {
      this.nodes.input = this.audioContext.createMediaElementSource(videoElement);
      this.nodes.input.connect(this.nodes.preGain);
      this.isConnected = true;
      console.log('Audio processor connected to video element');
    } catch (error) {
      console.error('Failed to connect to video element:', error);
    }
  }

  disconnect() {
    if (this.nodes.input) {
      this.nodes.input.disconnect();
      this.nodes.input = null;
      this.isConnected = false;
    }
  }

  // 설정 적용 메서드들
  setVolumeBoost(value) {
    const gain = Math.max(0.1, Math.min(3.0, value / 100));
    this.nodes.preGain.gain.setValueAtTime(gain, this.audioContext.currentTime);
  }

  setStereoPan(value) {
    const panValue = Math.max(-1, Math.min(1, value / 100));
    this.nodes.stereoPanner.pan.setValueAtTime(panValue, this.audioContext.currentTime);
  }

  setBassBoost(value) {
    const gain = Math.max(-20, Math.min(20, value));
    this.nodes.eq.lowShelf.gain.setValueAtTime(gain, this.audioContext.currentTime);
  }

  setTrebleBoost(value) {
    const gain = Math.max(-20, Math.min(20, value));
    this.nodes.eq.highShelf.gain.setValueAtTime(gain, this.audioContext.currentTime);
  }

  setMidBoost(value) {
    const gain = Math.max(-20, Math.min(20, value));
    this.nodes.eq.mid.gain.setValueAtTime(gain, this.audioContext.currentTime);
  }

  setCompression(enabled, threshold = -24, ratio = 3) {
    if (enabled) {
      this.nodes.compressor.threshold.setValueAtTime(threshold, this.audioContext.currentTime);
      this.nodes.compressor.ratio.setValueAtTime(ratio, this.audioContext.currentTime);
    } else {
      // 컴프레션 비활성화 (높은 threshold로 설정)
      this.nodes.compressor.threshold.setValueAtTime(0, this.audioContext.currentTime);
      this.nodes.compressor.ratio.setValueAtTime(1, this.audioContext.currentTime);
    }
  }

  setDelay(enabled, time = 0.3, feedback = 0.3, mix = 0.2) {
    if (enabled) {
      this.nodes.delay.delayTime.setValueAtTime(time, this.audioContext.currentTime);
      this.nodes.delayFeedback.gain.setValueAtTime(feedback, this.audioContext.currentTime);
      this.nodes.delayMix.gain.setValueAtTime(mix, this.audioContext.currentTime);
    } else {
      this.nodes.delayMix.gain.setValueAtTime(0, this.audioContext.currentTime);
    }
  }

  // 고급 EQ 설정
  setEQBand(band, frequency, gain, q = 0.7) {
    if (this.nodes.eq[band]) {
      const filter = this.nodes.eq[band];
      filter.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      filter.gain.setValueAtTime(gain, this.audioContext.currentTime);
      filter.Q.setValueAtTime(q, this.audioContext.currentTime);
    }
  }

  // 프리셋 적용
  applyPreset(presetName) {
    const presets = {
      'flat': {
        bass: 0, mid: 0, treble: 0,
        compression: false, delay: false
      },
      'bass-boost': {
        bass: 6, mid: 0, treble: -2,
        compression: true, delay: false
      },
      'vocal-enhance': {
        bass: -3, mid: 4, treble: 2,
        compression: true, delay: false
      },
      'rock': {
        bass: 4, mid: -2, treble: 4,
        compression: true, delay: false
      },
      'classical': {
        bass: 0, mid: 0, treble: 2,
        compression: false, delay: true
      },
      'electronic': {
        bass: 6, mid: -2, treble: 4,
        compression: true, delay: true
      }
    };

    const preset = presets[presetName];
    if (preset) {
      this.setBassBoost(preset.bass);
      this.setMidBoost(preset.mid);
      this.setTrebleBoost(preset.treble);
      this.setCompression(preset.compression);
      this.setDelay(preset.delay);
    }
  }

  // 비주얼라이저 데이터 획득
  getFrequencyData() {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }

  getTimeDomainData() {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    
    return dataArray;
  }

  // 비주얼라이저 생성
  createVisualizer(canvasElement) {
    if (!canvasElement) return;

    this.visualizer = {
      canvas: canvasElement,
      ctx: canvasElement.getContext('2d'),
      animationId: null
    };

    this.startVisualization();
  }

  startVisualization() {
    if (!this.visualizer || !this.analyser) return;

    const { canvas, ctx } = this.visualizer;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.visualizer.animationId = requestAnimationFrame(draw);

      this.analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }

  stopVisualization() {
    if (this.visualizer && this.visualizer.animationId) {
      cancelAnimationFrame(this.visualizer.animationId);
      this.visualizer.animationId = null;
    }
  }

  // 오디오 분석 정보
  getAudioInfo() {
    if (!this.analyser) return null;

    const frequencyData = this.getFrequencyData();
    if (!frequencyData) return null;

    // RMS (Root Mean Square) 계산
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i] * frequencyData[i];
    }
    const rms = Math.sqrt(sum / frequencyData.length);

    // 피크 레벨 계산
    const peak = Math.max(...frequencyData);

    // 주파수 밴드별 에너지 계산
    const bandSize = Math.floor(frequencyData.length / 3);
    const bass = frequencyData.slice(0, bandSize).reduce((a, b) => a + b, 0) / bandSize;
    const mid = frequencyData.slice(bandSize, bandSize * 2).reduce((a, b) => a + b, 0) / bandSize;
    const treble = frequencyData.slice(bandSize * 2).reduce((a, b) => a + b, 0) / bandSize;

    return {
      rms: (rms / 255) * 100,
      peak: (peak / 255) * 100,
      bass: (bass / 255) * 100,
      mid: (mid / 255) * 100,
      treble: (treble / 255) * 100
    };
  }

  // 리소스 정리
  destroy() {
    this.stopVisualization();
    this.disconnect();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}

// 전역 인스턴스
if (!window.youtubeAudioProcessor) {
  window.youtubeAudioProcessor = new AdvancedAudioProcessor();
}