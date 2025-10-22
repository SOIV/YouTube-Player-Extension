// 다국어 지원 시스템
class I18n {
  constructor() {
    this.currentLanguage = 'ko';
    this.translations = {};
    this.supportedLanguages = ['ko', 'en'];
    this.loadedLanguages = new Set();
    
    // 기본적으로 현재 언어를 로드
    this.init();
  }
  
  async init() {
    await this.detectLanguage();
    await this.loadLanguage(this.currentLanguage);
  }
  
  async loadLanguage(lang) {
    // 이미 로드된 언어는 다시 로드하지 않음
    if (this.loadedLanguages.has(lang)) {
      return true;
    }
    
    try {
      // JSON 파일로 로드 (CSP 안전)
      const response = await fetch(chrome.runtime.getURL(`locales/${lang}.json`));
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      
      const translations = await response.json();
      this.translations[lang] = translations;
      this.loadedLanguages.add(lang);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async addLanguage(langCode, translations) {
    // 새로운 언어를 동적으로 추가
    if (typeof translations === 'object') {
      this.translations[langCode] = translations;
      this.supportedLanguages.push(langCode);
      this.loadedLanguages.add(langCode);
      return true;
    }
    return false;
  }
  
  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }
  
  async detectLanguage() {
    // Chrome Extension Storage를 사용하여 저장된 언어 확인
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(['ytpe-language']);
        const savedLang = result['ytpe-language'];
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
          this.currentLanguage = savedLang;
          return;
        }
      }
    } catch (error) {
    }
    
    // Chrome Storage가 없으면 localStorage 사용
    try {
      const savedLang = localStorage.getItem('ytpe-language');
      if (savedLang && this.supportedLanguages.includes(savedLang)) {
        this.currentLanguage = savedLang;
        return;
      }
    } catch (error) {
      console.log('localStorage not available');
    }
    
    // 저장된 언어가 없으면 브라우저 언어 감지
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('ko')) {
      this.currentLanguage = 'ko';
    } else {
      this.currentLanguage = 'en';
    }
  }
  
  async setLanguage(lang) {
    // 지원되는 언어인지 확인
    if (!this.supportedLanguages.includes(lang)) {
      return false;
    }
    
    // 언어 파일을 로드
    const loaded = await this.loadLanguage(lang);
    if (loaded) {
      this.currentLanguage = lang;
      
      // Chrome Extension Storage에 저장 시도
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({'ytpe-language': lang});
        }
      } catch (error) {
      }
      
      // localStorage에도 저장 (폴백)
      try {
        localStorage.setItem('ytpe-language', lang);
      } catch (error) {
      }
      
      return true;
    }
    return false;
  }
  
  t(key) {
    // 현재 언어의 번역이 있으면 반환, 없으면 키 자체를 반환
    const currentTranslations = this.translations[this.currentLanguage];
    if (currentTranslations && currentTranslations[key] !== undefined) {
      return currentTranslations[key];
    }
    
    // 폴백: 영어로 시도
    if (this.currentLanguage !== 'en' && this.translations.en && this.translations.en[key] !== undefined) {
      return this.translations.en[key];
    }
    
    // 마지막 폴백: 키 자체를 반환
    return key;
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// 전역 인스턴스 (비동기 초기화)
window.i18n = new I18n();

// i18n이 완전히 로드될 때까지 대기하는 유틸리티 함수
window.waitForI18n = async () => {
  while (!window.i18n.loadedLanguages.has(window.i18n.currentLanguage)) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  return window.i18n;
};