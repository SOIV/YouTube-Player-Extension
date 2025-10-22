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
                   document.querySelector('.html5-video-player') ||
                   document.querySelector('ytd-player#ytd-player');
          break;
        case 'video':
          element = document.querySelector('#movie_player video') || 
                   document.querySelector('.html5-video-player video') ||
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
  
  // 유틸리티 함수들
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return (...args) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
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
  
  removeEventListener(target, event, handler, options = false) {
    target.removeEventListener(event, handler, options);
    // Set에서 해당 리스너 찾아서 제거
    for (const listener of this.listeners) {
      if (listener.target === target && listener.event === event && 
          listener.handler === handler && listener.options === options) {
        this.listeners.delete(listener);
        break;
      }
    }
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