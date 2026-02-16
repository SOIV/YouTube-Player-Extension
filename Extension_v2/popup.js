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
    this.setupUI();
    this.setupTabs();
    this.setupEventListeners();
    this.updateSliderDisplays();
    this.updateTexts();
  }

  t(key) {
    return chrome.i18n.getMessage(key) || key;
  }

  updateTexts() {
    // data-i18n 속성을 가진 모든 요소 업데이트
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      element.textContent = translation;
    });

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
        panDisplay.textContent = this.t('center');
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
        debugMode: false
      });
      
      this.settings = result;
    } catch (error) {
      this.showStatus(this.t('settingsLoadFailed'), 'error');
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

  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button[data-tab]');
    const tabPanels = document.querySelectorAll('.tab-panel[data-tab-panel]');
    if (!tabButtons.length || !tabPanels.length) {
      return;
    }

    const activateTab = (tabId) => {
      tabButtons.forEach((button) => {
        const isActive = button.dataset.tab === tabId;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      tabPanels.forEach((panel) => {
        const isActive = panel.dataset.tabPanel === tabId;
        panel.classList.toggle('active', isActive);
      });
    };

    this.activateTab = activateTab;

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activateTab(button.dataset.tab);
      });
    });

    this.activateTab(tabButtons[0].dataset.tab);
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
        panDisplay.textContent = this.t('center');
      }
    }

    // 컨트롤 표시/숨김 업데이트
    this.updateControlVisibility();
  }
  
  updatePlaceholders() {
    // data-i18n-placeholder 속성을 가진 모든 요소 업데이트
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      element.placeholder = translation;
    });
  }
  
  updateSelectOptions() {
    // data-i18n 속성을 가진 option 요소들 업데이트
    document.querySelectorAll('option[data-i18n]').forEach(option => {
      const key = option.getAttribute('data-i18n');
      const translation = this.t(key);
      option.textContent = translation;
    });
    
    // span[data-i18n] 요소들도 업데이트 (기본값 표시용)
    document.querySelectorAll('span[data-i18n]').forEach(span => {
      const key = span.getAttribute('data-i18n');
      const translation = this.t(key);
      span.textContent = translation;
    });
  }

  updateControlVisibility() {
    // 오디오 컴프레서 컨트롤 표시/숨김
    const compressorToggle = document.querySelector('[data-setting="enableCompressor"]');
    const compressorControls = document.getElementById('compressorControls');
    if (compressorToggle && compressorControls) {
      compressorControls.classList.toggle('is-hidden', !compressorToggle.classList.contains('active'));
    }

    // 스테레오 패닝 컨트롤 표시/숨김
    const panToggle = document.querySelector('[data-setting="enableStereoPan"]');
    const panControls = document.getElementById('panControls');
    if (panToggle && panControls) {
      panControls.classList.toggle('is-hidden', !panToggle.classList.contains('active'));
    }

    const miniPlayerToggle = document.querySelector('[data-setting="popupPlayer"]');
    const floatingPlayerSubSettings = document.getElementById('floatingPlayerSubSettings');
    
    if (miniPlayerToggle && floatingPlayerSubSettings) {
      const isActive = miniPlayerToggle.classList.contains('active');
      floatingPlayerSubSettings.classList.toggle('is-hidden', !isActive);
    }


    // 자동 코덱 선택 컨트롤 활성화/비활성화
    const autoCodecToggle = document.querySelector('[data-setting="autoCodec"]');
    const codecControl = document.querySelector('[data-setting="preferredCodec"]');
    
    if (autoCodecToggle && codecControl) {
      const isActive = autoCodecToggle.classList.contains('active');
      
      codecControl.disabled = !isActive;
      codecControl.classList.toggle('is-disabled-control', !isActive);
    }
  }

  async checkYouTubeTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url.includes('youtube.com')) {
        this.showStatus(this.t('extensionYouTubeOnly'), 'error');
      } else {
        this.showStatus(this.t('extensionActivated'), 'success');
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
    
    this.showStatus(`${this.getSettingDisplayName(setting)} ${newValue ? this.t('enabledOn') : this.t('disabledOn')}`, 'success');
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

    this.showStatus(`${this.getSettingDisplayName(setting)} ${this.t('changed')}: ${displayValue}`, 'success');
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
          `${this.getSettingDisplayName(setting)} ${this.t('adjusted')}`,
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
      if (tab && tab.url && tab.url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingsChanged',
          changes: {
            [key]: {
              newValue: value
            }
          }
        }).catch(() => {
          // 메시지 전송 실패는 무시
        });

        chrome.tabs.sendMessage(tab.id, {
          action: 'settingChanged',
          key,
          value
        }).catch(() => {
          // 메시지 전송 실패는 무시
        });
      }
    } catch (error) {
      this.showStatus(this.t('settingSaveFailed'), 'error');
    }
  }

  getSettingDisplayName(setting) {
    const displayNames = {
      // 버그 수정 (모두 제거됨)
      
      // 오디오
      enableCompressor: this.t('audioCompressorName'), // 전 volumeBoost
      enableStereoPan: this.t('stereoPanningName'), // 전 stereoPan
      
      
      // 팝업/플로팅 재생기
      popupPlayer: this.t('floatingPlayerName'),
      miniPlayerSize: this.t('floatingPlayerSizeName'),
      miniPlayerPosition: this.t('floatingPlayerPositionName'),
      enablePIP: this.t('pipModeName'),
      enableSmallPlayerButton: this.t('smallPlayerButton'),
      
      // 슬라이더 설정
      volumeBoost: this.t('audioCompressorName'),
      stereoPan: this.t('stereoPanningName'),
      
      // 고급 설정 (디버그 모드 제거)
    };
    
    return displayNames[setting] || setting;
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
      this.showStatus(this.t('settingsExported'), 'success');
    } catch (error) {
      this.showStatus(this.t('settingsExportFailed'), 'error');
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
      
      this.showStatus(this.t('settingsImported'), 'success');
    } catch (error) {
      this.showStatus(this.t('settingsImportFailed'), 'error');
    }
  }

  async resetSettings() {
    if (confirm('모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await chrome.storage.sync.clear();
        window.location.reload();
      } catch (error) {
        this.showStatus(this.t('settingsResetFailed'), 'error');
      }
    }
  }
}

// 팝업 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
