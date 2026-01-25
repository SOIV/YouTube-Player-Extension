// YouTube Player Extension - Popup Script
class PopupManager {
  constructor() {
    this.settings = {};
    
    // 디바운스 타이머 추가
    this.sliderDebounceTimer = null;
    this.statusDebounceTimer = null;
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.initI18n();
    this.setupUI();
    this.setupEventListeners();
    this.updateSliderDisplays();
  }

  async initI18n() {
    // i18n이 로드될 때까지 대기
    await window.waitForI18n();
    
    // 언어 선택기 초기화
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = window.i18n.getCurrentLanguage();
      languageSelect.addEventListener('change', async (e) => {
        const success = await window.i18n.setLanguage(e.target.value);
        if (success) {
          this.updateTexts();
          // 언어 변경이 성공했음을 사용자에게 알림 (선택사항)
        } else {
          // 언어 변경 실패 시 이전 값으로 되돌림
          languageSelect.value = window.i18n.getCurrentLanguage();
        }
      });
    }
    
    this.updateTexts();
  }

  updateTexts() {
    // data-i18n 속성을 가진 모든 요소 업데이트
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = window.i18n.t(key);
      
      element.textContent = translation;
    });

    // 언어 선택기 값 동기화
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect && languageSelect.value !== window.i18n.getCurrentLanguage()) {
      languageSelect.value = window.i18n.getCurrentLanguage();
    }

    // 슬라이더 값 표시 업데이트
    this.updateSliderValues();
    
    // placeholder 텍스트 업데이트
    this.updatePlaceholders();
    
    // select 옵션 텍스트 업데이트
    this.updateSelectOptions();
    
    // 설정 표시 이름들을 새로 고침하기 위해 getSettingDisplayName 캐시 무효화
    // (실제로는 함수가 매번 새로 계산하므로 별도 작업 불필요)
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
        
        autoCodec: true,
        preferredCodec: 'auto',
        
        // 팝업/미니 재생기
        popupPlayer: false,
        miniPlayerSize: '480x270',
        miniPlayerPosition: 'bottom-right',
        
        // Picture-in-Picture 설정
        enablePIP: true,
        
        // 소형 플레이어 버튼 설정
        enableSmallPlayerButton: true,
        
        // 고급 설정
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
      this.showStatus(window.i18n.t('settingsLoadFailed'), 'error');
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

    // 슬라이더 이벤트 - 디바운싱 적용
    document.querySelectorAll('.slider').forEach(slider => {
      // 실시간 UI 업데이트용 (디바운싱 없음)
      slider.addEventListener('input', (e) => {
        this.handleSliderInput(slider);
      });
      
      // 설정 저장 및 알림용 (디바운싱 적용)
      slider.addEventListener('change', (e) => {
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

  // 슬라이더 실시간 UI 업데이트 (디바운싱 없음)
  handleSliderInput(slider) {
    // 실시간 표시만 업데이트 (저장 안 함)
    this.updateSliderDisplays();
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
  
  updatePlaceholders() {
    // data-i18n-placeholder 속성을 가진 모든 요소 업데이트
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = window.i18n.t(key);
      element.placeholder = translation;
    });
  }
  
  updateSelectOptions() {
    // data-i18n 속성을 가진 option 요소들 업데이트
    document.querySelectorAll('option[data-i18n]').forEach(option => {
      const key = option.getAttribute('data-i18n');
      const translation = window.i18n.t(key);
      option.textContent = translation;
    });
    
    // span[data-i18n] 요소들도 업데이트 (기본값 표시용)
    document.querySelectorAll('span[data-i18n]').forEach(span => {
      const key = span.getAttribute('data-i18n');
      const translation = window.i18n.t(key);
      span.textContent = translation;
    });
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
        this.showStatus(window.i18n.t('extensionYouTubeOnly'), 'error');
      } else {
        this.showStatus(window.i18n.t('extensionActivated'), 'success');
      }
    } catch (error) {
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
    
    // 컨트롤 가시성 업데이트 (컴프레서, 스테레오 패닝, 미니플레이어, 품질 토글용)
    if (setting === 'enableCompressor' || setting === 'enableStereoPan' ||
        setting === 'popupPlayer') {
      this.updateControlVisibility();
    }
    
    // 소형 플레이어 버튼은 기본 메시지 사용 (다국어 지원)
    
    this.showStatus(`${this.getSettingDisplayName(setting)} ${newValue ? window.i18n.t('enabledOn') : window.i18n.t('disabledOn')}`, 'success');
  }

  async handleSelectChange(select) {
    const setting = select.dataset.setting;
    
    // 언어 선택기는 data-setting이 없으므로 무시
    if (!setting) return;
    
    const newValue = select.value;
    
    this.settings[setting] = newValue;
    await this.saveSetting(setting, newValue);
    
    // 코덱 설정은 사용자 친화적 이름으로 표시
    let displayValue = newValue;

    this.showStatus(`${this.getSettingDisplayName(setting)} ${window.i18n.t('changed')}: ${displayValue}`, 'success');
  }

  // 슬라이더 최종 값 저장 및 알림 (디바운싱 적용)
  async handleSliderChange(slider) {
    const setting = slider.dataset.setting;
    const newValue = parseInt(slider.value);
    
    // 기존 타이머 취소
    if (this.sliderDebounceTimer) {
      clearTimeout(this.sliderDebounceTimer);
    }
    
    // 디바운싱 적용 (드래그 끝나고 500ms 후 실행)
    this.sliderDebounceTimer = setTimeout(async () => {
      // 설정 저장
      this.settings[setting] = newValue;
      await this.saveSetting(setting, newValue);
      
      // 실시간 표시 업데이트
      this.updateSliderDisplays();
      
      // 오디오 설정은 적용 피드백 (디바운싱 적용)
      if (['volumeBoost', 'stereoPan', 'compressorRatio'].includes(setting)) {
        this.showStatusDebounced(
          `${this.getSettingDisplayName(setting)} ${window.i18n.t('adjusted')}`,
          'success'
        );
      }
      
      this.sliderDebounceTimer = null;
    }, 500);
  }

  // 디바운싱이 적용된 상태 표시 메서드
  showStatusDebounced(message, type) {
    // 기존 타이머 취소
    if (this.statusDebounceTimer) {
      clearTimeout(this.statusDebounceTimer);
    }
    
    // 200ms 디바운싱
    this.statusDebounceTimer = setTimeout(() => {
      this.showStatus(message, type);
      this.statusDebounceTimer = null;
    }, 200);
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
      this.showStatus(window.i18n.t('settingSaveFailed'), 'error');
    }
  }

  getSettingDisplayName(setting) {
    // i18n이 사용 가능한지 확인
    if (!window.i18n || typeof window.i18n.t !== 'function') {
      // 기본 한국어 설정 이름들
      const fallbackNames = {
        enableCompressor: '오디오 컴프레서',
        enableStereoPan: '스테레오 패닝',
        popupPlayer: '미니플레이어',
        miniPlayerSize: '미니플레이어 크기',
        miniPlayerPosition: '미니플레이어 위치',
        enablePIP: 'Picture-in-Picture(PIP)',
        enableSmallPlayerButton: '소형 플레이어 버튼',
        volumeBoost: '볼륨 부스트',
        stereoPan: '스테레오 패닝'
      };
      return fallbackNames[setting] || setting;
    }
    
    const displayNames = {
      // 버그 수정 (모두 제거됨)
      
      // 오디오
      enableCompressor: window.i18n.t('audioCompressorName'), // 전 volumeBoost
      enableStereoPan: window.i18n.t('stereoPanningName'), // 전 stereoPan
      
      
      // 팝업/미니 재생기
      popupPlayer: window.i18n.t('miniPlayerName'),
      miniPlayerSize: window.i18n.t('miniPlayerSizeName'),
      miniPlayerPosition: window.i18n.t('miniPlayerPositionName'),
      enablePIP: window.i18n.t('pipModeName'),
      enableSmallPlayerButton: window.i18n.t('smallPlayerButton'),
      
      // 슬라이더 설정
      volumeBoost: window.i18n.t('audioCompressorName'),
      stereoPan: window.i18n.t('stereoPanningName'),
      
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

  // 기존 showStatus 메서드는 그대로 유지
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
      a.download = `youtube-player-extension-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showStatus(window.i18n.t('settingsExported'), 'success');
    } catch (error) {
      this.showStatus(window.i18n.t('settingsExportFailed'), 'error');
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
      
      this.showStatus(window.i18n.t('settingsImported'), 'success');
    } catch (error) {
      this.showStatus(window.i18n.t('settingsImportFailed'), 'error');
    }
  }

  async resetSettings() {
    if (confirm('모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await chrome.storage.sync.clear();
        window.location.reload();
      } catch (error) {
        this.showStatus(window.i18n.t('settingsResetFailed'), 'error');
      }
    }
  }
}

// 팝업 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});