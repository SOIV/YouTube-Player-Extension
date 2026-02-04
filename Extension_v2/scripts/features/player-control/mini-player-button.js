// YouTube Player Enhancer - Small Player Button Module

class SmallPlayerButtonController {
  constructor(settingsManager, domCache, eventManager) {
    this.settings = settingsManager;
    this.domCache = domCache;
    this.eventManager = eventManager;
  }

  isEnabled() {
    return this.settings.getSetting('enableSmallPlayerButton');
  }

  init() {
    if (!this.isEnabled()) {
      return;
    }

    this.setupSmallPlayerButton();
  }

  setupSmallPlayerButton() {
    this.eventManager.addEventListener(document, 'yt-navigate-finish', () => {
      setTimeout(() => {
        if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
          this.applySmallPlayerButtonSettings();
        }
      }, 1000);
    });

    if (window.location.pathname.includes('/watch') || window.location.pathname.includes('/live')) {
      setTimeout(() => {
        this.applySmallPlayerButtonSettings();
      }, 2000);
    }
  }

  applySmallPlayerButtonSettings() {
    try {
      if (this.settings.getSetting('enableSmallPlayerButton')) {
        this.addSmallPlayerButton();
      }
    } catch (error) {
    }
  }

  addSmallPlayerButton() {
    if (!this.settings.getSetting('enableSmallPlayerButton')) return;

    try {
      const controlsRightContainer = document.querySelector('.ytp-right-controls-right');
      if (!controlsRightContainer) return;

      const existingButton = document.querySelector('.ytp-efyt-small-player-button');
      if (existingButton) existingButton.remove();

      const smallPlayerText = chrome.i18n.getMessage('smallPlayerButton');

      const smallPlayerButton = document.createElement('button');
      smallPlayerButton.className = 'ytp-efyt-small-player-button ytp-button';
      smallPlayerButton.title = '';
      smallPlayerButton.setAttribute('data-priority', '11');
      smallPlayerButton.setAttribute('data-title-no-tooltip', smallPlayerText);
      smallPlayerButton.setAttribute('aria-label', smallPlayerText);
      smallPlayerButton.setAttribute('data-tooltip-title', smallPlayerText);
      smallPlayerButton.setAttribute('data-tooltip-target-id', 'ytp-small-player-button');

      const clonedSvg = this.getSmallPlayerSvgFromMenu();
      
      if (clonedSvg) {
        smallPlayerButton.appendChild(clonedSvg);
      } else {
        smallPlayerButton.innerHTML = `
          <svg height="24" viewBox="0 0 24 24" width="24">
            <path d="M21.20 3.01C21.66 3.05 22.08 3.26 22.41 3.58C22.73 3.91 22.94 4.33 22.98 4.79L23 5V19C23.00 19.49 22.81 19.97 22.48 20.34C22.15 20.70 21.69 20.93 21.20 20.99L21 21H3L2.79 20.99C2.30 20.93 1.84 20.70 1.51 20.34C1.18 19.97 .99 19.49 1 19V13H3V19H21V5H11V3H21L21.20 3.01ZM1.29 3.29C1.10 3.48 1.00 3.73 1.00 4C1.00 4.26 1.10 4.51 1.29 4.70L5.58 9H3C2.73 9 2.48 9.10 2.29 9.29C2.10 9.48 2 9.73 2 10C2 10.26 2.10 10.51 2.29 10.70C2.48 10.89 2.73 11 3 11H9V5C9 4.73 8.89 4.48 8.70 4.29C8.51 4.10 8.26 4 8 4C7.73 4 7.48 4.10 7.29 4.29C7.10 4.48 7 4.73 7 5V7.58L2.70 3.29C2.51 3.10 2.26 3.00 2 3.00C1.73 3.00 1.48 3.10 1.29 3.29ZM19.10 11.00L19 11H12L11.89 11.00C11.66 11.02 11.45 11.13 11.29 11.29C11.13 11.45 11.02 11.66 11.00 11.89L11 12V17C10.99 17.24 11.09 17.48 11.25 17.67C11.42 17.85 11.65 17.96 11.89 17.99L12 18H19L19.10 17.99C19.34 17.96 19.57 17.85 19.74 17.67C19.90 17.48 20.00 17.24 20 17V12L19.99 11.89C19.97 11.66 19.87 11.45 19.70 11.29C19.54 11.13 19.33 11.02 19.10 11.00ZM13 16V13H18V16H13Z" fill="white"></path>
          </svg>
        `;
      }

      smallPlayerButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerSmallPlayerFromMenu();
      });

      const fullscreenButton = controlsRightContainer.querySelector('.ytp-fullscreen-button');
      if (fullscreenButton) {
        controlsRightContainer.insertBefore(smallPlayerButton, fullscreenButton);
      } else {
        controlsRightContainer.appendChild(smallPlayerButton);
      }

    } catch (error) {
    }
  }

  getSmallPlayerSvgFromMenu() {
    try {
      let contextMenu = document.querySelector('.ytp-popup.ytp-contextmenu');
      const menuWasOpen = !!contextMenu;
      
      if (!contextMenu) {
        const video = document.querySelector('video');
        if (!video) return null;
        
        video.dispatchEvent(new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: 100,
          clientY: 100
        }));
        
        contextMenu = document.querySelector('.ytp-popup.ytp-contextmenu');
        if (!contextMenu) return null;
      }

      const menuItems = contextMenu.querySelectorAll('.ytp-menuitem');
      
      for (const item of menuItems) {
        const label = item.querySelector('.ytp-menuitem-label');
        if (label) {
          const text = label.textContent.trim();
          if (text.includes('소형') || text.toLowerCase().includes('miniplayer')) {
            const svg = item.querySelector('svg');
            if (svg) {
              const cloned = svg.cloneNode(true);
              
              if (!menuWasOpen) {
                setTimeout(() => document.body.click(), 50);
              }
              
              return cloned;
            }
          }
        }
      }
      
      if (!menuWasOpen) {
        setTimeout(() => document.body.click(), 50);
      }
      
      return null;
      
    } catch (error) {
      return null;
    }
  }

  triggerSmallPlayerFromMenu() {
    try {
      const video = document.querySelector('video');
      if (!video) {
        return;
      }

      video.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      }));

      setTimeout(() => {
        this.clickSmallPlayerMenuItem();
      }, 150);

    } catch (error) {
    }
  }

  clickSmallPlayerMenuItem() {
    try {
      const contextMenu = document.querySelector('.ytp-contextmenu');
      if (!contextMenu) {
        return;
      }

      const menuItems = contextMenu.querySelectorAll('.ytp-menuitem');
      let smallPlayerItem = null;

      for (const item of menuItems) {
        const text = item.textContent.trim();
        const ariaLabel = item.getAttribute('aria-label') || '';
        
        if (text.includes('소형') || 
            text.includes('미니') ||
            text.includes('mini') || 
            text.includes('small') ||
            text.includes('picture') ||
            ariaLabel.includes('소형') ||
            ariaLabel.includes('mini') ||
            ariaLabel.includes('small')) {
          smallPlayerItem = item;
          break;
        }
      }

      if (smallPlayerItem) {
        smallPlayerItem.click();
        
        setTimeout(() => {
          document.body.click();
        }, 50);
        
      } else {
        document.body.click();
      }

    } catch (error) {
      document.body.click();
    }
  }

  onSettingsChanged(changedSettings) {
    if (changedSettings.includes('enableSmallPlayerButton')) {
      const existingButton = document.querySelector('.ytp-efyt-small-player-button');
      if (existingButton) {
        existingButton.remove();
      }
      
      if (this.settings.getSetting('enableSmallPlayerButton')) {
        setTimeout(() => {
          this.addSmallPlayerButton();
        }, 100);
      }
    }
  }

  cleanup() {
    const smallPlayerButton = document.querySelector('.ytp-efyt-small-player-button');
    if (smallPlayerButton) smallPlayerButton.remove();
  }
}

window.YouTubeEnhancer = window.YouTubeEnhancer || {};
window.YouTubeEnhancer.SmallPlayerButtonController = SmallPlayerButtonController;
