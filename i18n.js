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
    this.detectLanguage();
    await this.loadLanguage(this.currentLanguage);
  }
  
  async loadLanguage(lang) {
    // 이미 로드된 언어는 다시 로드하지 않음
    if (this.loadedLanguages.has(lang)) {
      return true;
    }
    
    try {
      // locales 폴더에서 언어 파일을 동적으로 로드
      const response = await fetch(chrome.runtime.getURL(`locales/${lang}.js`));
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.js`);
      }
      
      const text = await response.text();
      
      // ES6 모듈 형태의 파일을 동적으로 평가
      const module = new Function('', `${text.replace('export default', 'return')}`);
      this.translations[lang] = module();
      
      this.loadedLanguages.add(lang);
      return true;
    } catch (error) {
      console.error(`Failed to load language ${lang}:`, error);
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
  
  detectLanguage() {
    // 브라우저 언어 감지
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('ko')) {
      this.currentLanguage = 'ko';
    } else {
      this.currentLanguage = 'en';
    }
    
    // 저장된 언어 설정 확인
    const savedLang = localStorage.getItem('ytpe-language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
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
      localStorage.setItem('ytpe-language', lang);
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