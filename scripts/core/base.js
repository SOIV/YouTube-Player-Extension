// YouTube Player Enhancer - Core Base Classes

// DOM 캐시 관리 클래스
class DOMCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      let element = null;
      switch (key) {
        case 'player':
          element = document.getElementById('movie_player') || 
                   document.querySelector('.html5-video-player');
          break;
        case 'video':
          element = document.querySelector('#movie_player video') || 
                   document.querySelector('video');
          break;
        default:
          element = document.querySelector(key);
      }
      if (element) {
        this.cache.set(key, element);
      }
    }
    return this.cache.get(key) || null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// 이벤트 관리 클래스
class EventManager {
  constructor() {
    this.listeners = new Set();
    this.intervals = new Set();
  }

  addEventListener(target, event, handler, options = false) {
    target.addEventListener(event, handler, options);
    this.listeners.add({ target, event, handler, options });
  }

  addInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.intervals.add(intervalId);
    return intervalId;
  }

  removeInterval(intervalId) {
    clearInterval(intervalId);
    this.intervals.delete(intervalId);
  }

  cleanup() {
    this.listeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.listeners.clear();
    this.intervals.clear();
  }
}

// 전역으로 내보내기
window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.DOMCache = DOMCache;
window.YouTubeEnhancer.EventManager = EventManager;