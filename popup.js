// YouTube Player Enhancer - Popup Script
class PopupManager {
  constructor() {
    this.settings = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.initI18n();
    this.setupUI();
    this.setupEventListeners();
    this.updateSliderDisplays();
  }

  initI18n() {
    // 언어 선택기 초기화
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = window.i18n.getCurrentLanguage();
      languageSelect.addEventListener('change', (e) => {
        window.i18n.setLanguage(e.target.value);
        this.updateTexts();
      });
    }
    
    this.updateTexts();
  }

  updateTexts() {
    // data-i18n 속성을 가진 모든 요소 업데이트
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = window.i18n.t(key);
      
      // 섹션 제목의 경우 이모지를 유지
      if (element.classList.contains('section-title') || element.closest('.section-title')) {
        const sectionEmojiMap = {
          'audioControl': '🎵 ',
          'playbackQuality': '📺 ',
          'pipMiniPlayer': '📱 ',
          'bugFixes': '🔧 ',
          'advancedSettings': '🛠️ '
        };
        const emoji = sectionEmojiMap[key] || '';
        element.textContent = emoji + translation;
      } else {
        element.textContent = translation;
      }
    });

    // 슬라이더 값 표시 업데이트
    this.updateSliderValues();
  }

  updateSliderValues() {
    // 스테레오 패닝 값 표시
    const panSlider = document.querySelector('[data-setting="stereoPan"]');
    const panDisplay = document.getElementById('stereoPanValue');
    if (panSlider && panDisplay) {
      const value = parseInt(panSlider.value);
      if (value === 0) {
        panDisplay.textContent = window.i18n.t('center');
      } else if (value < 0) {
        panDisplay.textContent = `L${Math.abs(value)}`;
      } else {
        panDisplay.textContent = `R${value}`;
      }
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        // 버그 수정 관련 (모두 제거됨)
        
        // 오디오 설정
        volumeBoost: 100,
        enableCompressor: false,
        compressorRatio: 12,
        enableStereoPan: false,
        stereoPan: 0,
        
        // 재생 품질
        autoQuality: true,
        preferredQuality: 'auto',
        autoCodec: true,
        preferredCodec: 'auto',
        
        // 팝업/미니 재생기
        popupPlayer: false,
        miniPlayerSize: '480x270',
        miniPlayerPosition: 'bottom-right',
        
        // Picture-in-Picture 설정
        enablePIP: true,
        
        // 고급 설정
        enableDebugMode: false,
        customScripts: '',
        customTheme: '',
        
        // UI 상태 (접기/펼치기)
        collapsedSections: {
          bugFixes: false,     // 버그 수정은 기본적으로 펼쳐진 상태
          advanced: true       // 고급 설정은 기본적으로 접힌 상태
        }
      });
      
      this.settings = result;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showStatus('설정을 불러오는데 실패했습니다.', 'error');
    }
  }

  setupUI() {
    // 토글 스위치 설정
    document.querySelectorAll('.toggle').forEach(toggle => {
      const setting = toggle.dataset.setting;
      if (this.settings[setting]) {
        toggle.classList.add('active');
      }
    });

    // 셀렉트 박스 설정
    document.querySelectorAll('select').forEach(select => {
      const setting = select.dataset.setting;
      if (this.settings[setting]) {
        select.value = this.settings[setting];
      }
    });

    // 슬라이더 설정
    document.querySelectorAll('.slider').forEach(slider => {
      const setting = slider.dataset.setting;
      if (this.settings[setting] !== undefined) {
        slider.value = this.settings[setting];
      }
    });

    // 텍스트에어리어 설정
    document.querySelectorAll('textarea').forEach(textarea => {
      const setting = textarea.dataset.setting;
      if (this.settings[setting]) {
        textarea.value = this.settings[setting];
      }
    });

    // 접기/펼치기 상태 복원
    this.restoreCollapsedStates();

    // 현재 탭 확인
    this.checkYouTubeTab();
  }


  setupEventListeners() {
    // 토글 스위치 이벤트
    document.querySelectorAll('.toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleToggleClick(toggle);
      });
    });

    // 셀렉트 박스 이벤트
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', (e) => {
        this.handleSelectChange(select);
      });
    });

    // 슬라이더 이벤트
    document.querySelectorAll('.slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        this.handleSliderChange(slider);
      });
    });

    // 텍스트에어리어 이벤트
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        this.handleTextareaChange(textarea);
      });
    });

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });

    // 고급 설정 토글
    document.getElementById('advancedToggle')?.addEventListener('click', () => {
      this.toggleCollapsible('advancedToggle', 'advancedContent');
    });

    // 버튼 이벤트 리스너
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      this.exportSettings();
    });
    
    document.getElementById('importBtn')?.addEventListener('click', () => {
      this.importSettings();
    });
    
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetSettings();
    });

    // 파일 import 이벤트
    document.getElementById('importFile')?.addEventListener('change', (event) => {
      this.handleImport(event);
    });

    // 버그 수정 섹션 접기/펼치기
    document.getElementById('bugFixesToggle')?.addEventListener('click', () => {
      this.toggleCollapsible('bugFixesToggle', 'bugFixesContent');
    });

    // About 버튼 클릭
    document.getElementById('aboutBtn')?.addEventListener('click', () => {
      try {
        window.location.replace('about.html');
      } catch (e) {
        window.location.href = 'about.html';
      }
    });
  }

  updateSliderDisplays() {
    // 볼륨 부스트 표시
    const volumeSlider = document.querySelector('[data-setting="volumeBoost"]');
    const volumeDisplay = document.getElementById('volumeBoostValue');
    if (volumeSlider && volumeDisplay) {
      volumeDisplay.textContent = `${volumeSlider.value}%`;
    }

    // 컴프레서 비율 표시
    const compressorSlider = document.querySelector('[data-setting="compressorRatio"]');
    const compressorDisplay = document.getElementById('compressorRatioValue');
    if (compressorSlider && compressorDisplay) {
      compressorDisplay.textContent = `${compressorSlider.value}:1`;
    }

    // 스테레오 패닝 표시
    const panSlider = document.querySelector('[data-setting="stereoPan"]');
    const panDisplay = document.getElementById('stereoPanValue');
    if (panSlider && panDisplay) {
      const value = parseInt(panSlider.value);
      if (value < -10) {
        panDisplay.textContent = `L${Math.abs(value)}%`;
      } else if (value > 10) {
        panDisplay.textContent = `R${value}%`;
      } else {
        panDisplay.textContent = 'Center';
      }
    }

    // 컨트롤 표시/숨김 업데이트
    this.updateControlVisibility();
  }

  updateControlVisibility() {
    // 오디오 컴프레서 컨트롤 표시/숨김
    const compressorToggle = document.querySelector('[data-setting="enableCompressor"]');
    const compressorControls = document.getElementById('compressorControls');
    if (compressorToggle && compressorControls) {
      compressorControls.style.display = compressorToggle.classList.contains('active') ? 'block' : 'none';
    }

    // 스테레오 패닝 컨트롤 표시/숨김
    const panToggle = document.querySelector('[data-setting="enableStereoPan"]');
    const panControls = document.getElementById('panControls');
    if (panToggle && panControls) {
      panControls.style.display = panToggle.classList.contains('active') ? 'block' : 'none';
    }

    // 미니플레이어 컨트롤 활성화/비활성화
    const miniPlayerToggle = document.querySelector('[data-setting="popupPlayer"]');
    const miniPlayerSizeControl = document.querySelector('[data-setting="miniPlayerSize"]');
    const miniPlayerPositionControl = document.querySelector('[data-setting="miniPlayerPosition"]');
    
    if (miniPlayerToggle && miniPlayerSizeControl && miniPlayerPositionControl) {
      const isActive = miniPlayerToggle.classList.contains('active');
      
      // 비활성화 상태 설정
      miniPlayerSizeControl.disabled = !isActive;
      miniPlayerPositionControl.disabled = !isActive;
      
      // 시각적 스타일 적용
      miniPlayerSizeControl.style.opacity = isActive ? '1' : '0.5';
      miniPlayerPositionControl.style.opacity = isActive ? '1' : '0.5';
      miniPlayerSizeControl.style.cursor = isActive ? 'pointer' : 'not-allowed';
      miniPlayerPositionControl.style.cursor = isActive ? 'pointer' : 'not-allowed';
    }

    // 자동 품질 선택 컨트롤 활성화/비활성화
    const autoQualityToggle = document.querySelector('[data-setting="autoQuality"]');
    const qualityControl = document.querySelector('[data-setting="preferredQuality"]');
    
    if (autoQualityToggle && qualityControl) {
      const isActive = autoQualityToggle.classList.contains('active');
      
      // 비활성화 상태 설정
      qualityControl.disabled = !isActive;
      
      // 시각적 스타일 적용
      qualityControl.style.opacity = isActive ? '1' : '0.5';
      qualityControl.style.cursor = isActive ? 'pointer' : 'not-allowed';
    }

    // 자동 코덱 선택 컨트롤 활성화/비활성화
    const autoCodecToggle = document.querySelector('[data-setting="autoCodec"]');
    const codecControl = document.querySelector('[data-setting="preferredCodec"]');
    
    if (autoCodecToggle && codecControl) {
      const isActive = autoCodecToggle.classList.contains('active');
      
      // 비활성화 상태 설정
      codecControl.disabled = !isActive;
      
      // 시각적 스타일 적용
      codecControl.style.opacity = isActive ? '1' : '0.5';
      codecControl.style.cursor = isActive ? 'pointer' : 'not-allowed';
    }
  }

  async checkYouTubeTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url.includes('youtube.com')) {
        this.showStatus('이 확장 프로그램은 YouTube에서만 작동합니다.', 'error');
      } else {
        this.showStatus('YouTube에서 확장 프로그램이 활성화되었습니다.', 'success');
      }
    } catch (error) {
      console.error('Failed to check current tab:', error);
    }
  }

  async handleToggleClick(toggle) {
    const setting = toggle.dataset.setting;
    const newValue = !this.settings[setting];
    
    // UI 업데이트
    if (newValue) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }

    // 설정 저장
    this.settings[setting] = newValue;
    await this.saveSetting(setting, newValue);
    
    // 컨트롤 가시성 업데이트 (컴프레서, 스테레오 패닝, 미니플레이어, 품질, 코덱 토글용)
    if (setting === 'enableCompressor' || setting === 'enableStereoPan' || 
        setting === 'popupPlayer' || setting === 'autoQuality' || setting === 'autoCodec') {
      this.updateControlVisibility();
    }
    
    this.showStatus(`${this.getSettingDisplayName(setting)} ${newValue ? '활성화' : '비활성화'}됨`, 'success');
  }

  async handleSelectChange(select) {
    const setting = select.dataset.setting;
    const newValue = select.value;
    
    this.settings[setting] = newValue;
    await this.saveSetting(setting, newValue);
    
    this.showStatus(`${this.getSettingDisplayName(setting)} 변경됨: ${newValue}`, 'success');
  }

  async handleSliderChange(slider) {
    const setting = slider.dataset.setting;
    const newValue = parseInt(slider.value);
    
    this.settings[setting] = newValue;
    await this.saveSetting(setting, newValue);
    
    // 실시간 표시 업데이트
    this.updateSliderDisplays();
    
    // 오디오 설정은 즉시 적용 피드백
    if (['volumeBoost', 'stereoPan'].includes(setting)) {
      this.showStatus(`${this.getSettingDisplayName(setting)} 조정됨`, 'success');
    }
  }

  async handleTextareaChange(textarea) {
    const setting = textarea.dataset.setting;
    const newValue = textarea.value;
    
    this.settings[setting] = newValue;
    await this.saveSetting(setting, newValue);
  }

  async saveSetting(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
      
      // 활성 탭에 변경사항 알림
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingChanged',
          key: key,
          value: value
        }).catch(() => {
          // 메시지 전송 실패는 무시
        });
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      this.showStatus('설정 저장에 실패했습니다.', 'error');
    }
  }

  getSettingDisplayName(setting) {
    const displayNames = {
      // 버그 수정 (모두 제거됨)
      
      // 오디오
      enableCompressor: '오디오 컴프레서', // 전 volumeBoost
      enableStereoPan: '스테레오 패닝', // 전 stereoPan
      
      // 품질
      autoQuality: '자동 품질 선택',
      preferredQuality: '선호 화질',
      autoCodec: '자동 코덱 선택',
      preferredCodec: '선호 코덱',
      
      // 팝업/미니 재생기
      popupPlayer: '미니플레이어',
      miniPlayerSize: '미니플레이어 크기',
      miniPlayerPosition: '미니플레이어 위치',
      enablePIP: 'Picture-in-Picture(PIP)',
      
      // 고급 설정 (디버그 모드 제거)
    };
    
    return displayNames[setting] || setting;
  }


  restoreCollapsedStates() {
    // 버그 수정 섹션 상태 복원
    if (this.settings.collapsedSections.bugFixes) {
      this.setCollapsedState('bugFixesToggle', 'bugFixesContent', true);
    }
    
    // 고급 설정 섹션 상태 복원  
    if (this.settings.collapsedSections.advanced) {
      this.setCollapsedState('advancedToggle', 'advancedContent', true);
    }

  }

  setCollapsedState(toggleId, contentId, collapsed) {
    const toggle = document.getElementById(toggleId);
    const content = document.getElementById(contentId);
    
    if (toggle && content) {
      if (collapsed) {
        toggle.classList.add('collapsed');
        content.classList.add('collapsed');
      } else {
        toggle.classList.remove('collapsed');
        content.classList.remove('collapsed');
      }
    }
  }

  toggleCollapsible(toggleId, contentId) {
    const toggle = document.getElementById(toggleId);
    const content = document.getElementById(contentId);
    
    if (toggle && content) {
      const isCollapsed = content.classList.contains('collapsed');
      const newCollapsedState = !isCollapsed;
      
      // 상태 변경
      this.setCollapsedState(toggleId, contentId, newCollapsedState);
      
      // 상태 저장
      const sectionKey = this.getSectionKey(toggleId);
      if (sectionKey) {
        this.settings.collapsedSections[sectionKey] = newCollapsedState;
        this.saveSetting('collapsedSections', this.settings.collapsedSections);
      }
    }
  }

  getSectionKey(toggleId) {
    const sectionMap = {
      'bugFixesToggle': 'bugFixes',
      'advancedToggle': 'advanced'
    };
    return sectionMap[toggleId];
  }

  showStatus(message, type) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    
    // body에 추가
    document.body.appendChild(toast);

    // 약간의 딜레이 후 나타나기
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // 3초 후 사라지기
    setTimeout(() => {
      toast.classList.add('hide');
      
      // 애니메이션 완료 후 제거
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 3000);
  }

  async exportSettings() {
    try {
      const settings = await chrome.storage.sync.get();
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `youtube-player-enhancer-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showStatus('설정이 내보내졌습니다.', 'success');
    } catch (error) {
      console.error('Failed to export settings:', error);
      this.showStatus('설정 내보내기에 실패했습니다.', 'error');
    }
  }

  importSettings() {
    document.getElementById('importFile').click();
  }

  async handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const settings = JSON.parse(text);
      
      await chrome.storage.sync.set(settings);
      this.settings = settings;
      this.setupUI();
      
      this.showStatus('설정이 가져와졌습니다.', 'success');
    } catch (error) {
      console.error('Failed to import settings:', error);
      this.showStatus('설정 가져오기에 실패했습니다.', 'error');
    }
  }

  async resetSettings() {
    if (confirm('모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await chrome.storage.sync.clear();
        window.location.reload();
      } catch (error) {
        console.error('Failed to reset settings:', error);
        this.showStatus('설정 초기화에 실패했습니다.', 'error');
      }
    }
  }
}

// 팝업 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});