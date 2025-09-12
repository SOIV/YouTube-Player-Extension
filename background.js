// YouTube Bug Fixer - Background Script (Service Worker)
class BackgroundManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupContextMenus();
    this.checkForUpdates();
  }

  setupEventListeners() {
    // 확장 프로그램 설치/업데이트 시
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.handleFirstInstall();
      } else if (details.reason === 'update') {
        this.handleUpdate(details.previousVersion);
      }
    });

    // 탭 업데이트 감지
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
        this.handleYouTubeTabUpdate(tabId, tab);
      }
    });

    // 메시지 리스너
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // 비동기 응답을 위해
    });

    // 스토리지 변경 감지
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });
  }

  async handleFirstInstall() {
    // 기본 설정 저장
    const defaultSettings = {
      // 버그 수정 관련 (기본적으로 모두 활성화)
      
      // Enhancer 기능들 (사용자 선택에 맞게 기본값 설정)
      autoHD: true,
      targetQuality: '1080p',
      removeAds: false, // 광고 차단은 기본적으로 비활성화
      customSpeed: true,
      autoSkipAds: true,
      hideComments: false,
      hideRecommendations: false,
      autoExpandDescription: false,
      
      
      // 내부 설정
      extensionVersion: '1.0.0',
      installDate: new Date().toISOString(),
      lastUpdateCheck: new Date().toISOString()
    };

    try {
      await chrome.storage.sync.set(defaultSettings);
      
      // 환영 탭 열기 (비활성화)
      // chrome.tabs.create({
      //   url: chrome.runtime.getURL('welcome.html')
      // });
      
      console.log('YouTube Bug Fixer installed with default settings');
    } catch (error) {
      console.error('Failed to set default settings:', error);
    }
  }

  async handleUpdate(previousVersion) {
    try {
      const settings = await chrome.storage.sync.get();
      
      // 버전별 마이그레이션 로직
      if (this.compareVersions(previousVersion, '1.0.0') < 0) {
        // 1.0.0 이전 버전에서 업데이트하는 경우
        await this.migrateToV1_0_0(settings);
      }
      
      // 업데이트 정보 저장
      await chrome.storage.sync.set({
        extensionVersion: '1.0.0',
        lastUpdateCheck: new Date().toISOString(),
        previousVersion: previousVersion
      });
      
      console.log(`YouTube Bug Fixer updated from ${previousVersion} to 1.0.0`);
    } catch (error) {
      console.error('Failed to handle update:', error);
    }
  }

  async migrateToV1_0_0(settings) {
    // 이전 버전의 설정을 새 버전에 맞게 변환
    const migrations = {};
    
    // 예: 이전 버전의 설정명이 다른 경우
    if ('oldSettingName' in settings) {
      migrations.newSettingName = settings.oldSettingName;
      // 이전 설정 제거는 선택사항
    }
    
    if (Object.keys(migrations).length > 0) {
      await chrome.storage.sync.set(migrations);
    }
  }

  compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;
      
      if (partA < partB) return -1;
      if (partA > partB) return 1;
    }
    
    return 0;
  }

  async handleYouTubeTabUpdate(tabId, tab) {
    try {
      // YouTube 페이지가 로드되면 컨텐트 스크립트 주입 확인
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          // 컨텐트 스크립트가 이미 로드되었는지 확인
          if (!window.youTubeBugFixerLoaded) {
            window.youTubeBugFixerLoaded = true;
            console.log('YouTube Bug Fixer content script loaded');
          }
        }
      });
    } catch (error) {
      // 스크립트 주입 실패는 정상적인 경우일 수 있음 (권한 없는 페이지 등)
      console.log('Failed to inject script:', error.message);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'getSettings':
          const settings = await chrome.storage.sync.get();
          sendResponse({ success: true, settings });
          break;

        case 'saveSettings':
          await chrome.storage.sync.set(message.settings);
          sendResponse({ success: true });
          break;

        case 'resetSettings':
          await chrome.storage.sync.clear();
          await this.handleFirstInstall();
          sendResponse({ success: true });
          break;

        case 'exportSettings':
          const exportSettings = await chrome.storage.sync.get();
          sendResponse({ 
            success: true, 
            settings: exportSettings,
            filename: `youtube-bug-fixer-settings-${new Date().toISOString().split('T')[0]}.json`
          });
          break;

        case 'reportBug':
          await this.handleBugReport(message.bugData);
          sendResponse({ success: true });
          break;

        case 'checkForUpdates':
          const updateInfo = await this.checkForUpdates();
          sendResponse({ success: true, updateInfo });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  handleStorageChange(changes, namespace) {
    if (namespace === 'sync') {
      // 설정 변경을 모든 YouTube 탭에 알림
      chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'settingsChanged',
            changes: changes
          }).catch(() => {
            // 메시지 전송 실패는 무시
          });
        });
      });
    }
  }

  setupContextMenus() {
    // 우클릭 컨텍스트 메뉴 추가
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'youtube-bug-fixer-main',
        title: 'YouTube Bug Fixer',
        contexts: ['all'],
        documentUrlPatterns: ['*://*.youtube.com/*']
      });

      chrome.contextMenus.create({
        id: 'toggle-ad-blocker',
        parentId: 'youtube-bug-fixer-main',
        title: '광고 차단 토글',
        contexts: ['all']
      });

      chrome.contextMenus.create({
        id: 'toggle-comments',
        parentId: 'youtube-bug-fixer-main',
        title: '댓글 표시/숨김',
        contexts: ['all']
      });

      chrome.contextMenus.create({
        id: 'report-bug',
        parentId: 'youtube-bug-fixer-main',
        title: '버그 신고',
        contexts: ['all']
      });
    });

    // 컨텍스트 메뉴 클릭 이벤트
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });
  }

  async handleContextMenuClick(info, tab) {
    try {
      switch (info.menuItemId) {
        case 'toggle-ad-blocker':
          await this.toggleSetting('removeAds', tab.id);
          break;

        case 'toggle-comments':
          await this.toggleSetting('hideComments', tab.id);
          break;

        case 'report-bug':
          chrome.tabs.create({
            url: chrome.runtime.getURL('bug-report.html')
          });
          break;
      }
    } catch (error) {
      console.error('Error handling context menu click:', error);
    }
  }

  async toggleSetting(settingName, tabId) {
    try {
      const settings = await chrome.storage.sync.get(settingName);
      const newValue = !settings[settingName];
      
      await chrome.storage.sync.set({ [settingName]: newValue });
      
      // 탭에 변경사항 알림
      chrome.tabs.sendMessage(tabId, {
        action: 'settingChanged',
        key: settingName,
        value: newValue
      });
      
      // 알림 표시
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'YouTube Bug Fixer',
        message: `${this.getSettingDisplayName(settingName)} ${newValue ? '활성화' : '비활성화'}됨`
      });
    } catch (error) {
      console.error('Failed to toggle setting:', error);
    }
  }

  getSettingDisplayName(setting) {
    const displayNames = {
      removeAds: '광고 차단',
      hideComments: '댓글 숨기기',
      hideRecommendations: '추천 영상 숨기기',
      autoSkipAds: '광고 자동 건너뛰기'
    };
    
    return displayNames[setting] || setting;
  }

  async handleBugReport(bugData) {
    // 버그 리포트 처리 (예: 로컬 스토리지에 저장)
    try {
      const reports = await chrome.storage.local.get('bugReports') || { bugReports: [] };
      reports.bugReports.push({
        ...bugData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        extensionVersion: '1.0.0'
      });
      
      await chrome.storage.local.set({ bugReports: reports.bugReports });
      console.log('Bug report saved:', bugData);
    } catch (error) {
      console.error('Failed to save bug report:', error);
    }
  }

  async checkForUpdates() {
    try {
      // 실제 구현에서는 서버에서 업데이트 정보를 가져올 수 있음
      const lastCheck = await chrome.storage.sync.get('lastUpdateCheck');
      const now = new Date();
      const lastCheckDate = new Date(lastCheck.lastUpdateCheck || 0);
      
      // 24시간마다 체크
      if (now - lastCheckDate > 24 * 60 * 60 * 1000) {
        await chrome.storage.sync.set({
          lastUpdateCheck: now.toISOString()
        });
        
        return {
          hasUpdate: false,
          currentVersion: '1.0.0',
          latestVersion: '1.0.0',
          lastChecked: now.toISOString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }
}

// 백그라운드 스크립트 초기화
new BackgroundManager();