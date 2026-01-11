// YouTube Playlist Sort Menu Revival
// 유튜브 재생목록에 사라진 정렬 메뉴를 부활시킵니다

(function() {
    'use strict';

    // 재생목록 페이지 체크
    function isPlaylistPage() {
        return window.location.href.includes('list=') && 
               window.location.pathname.includes('/watch');
    }

    // 재생목록 ID 추출
    function getPlaylistId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('list');
    }

    // 재생목록 항목들 가져오기
    function getPlaylistItems() {
        return Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'));
    }

    // 비디오 정보 추출
    function getVideoInfo(element) {
        const titleElement = element.querySelector('#video-title');
        const indexElement = element.querySelector('#index');
        const lengthElement = element.querySelector('#timestamp');
        
        return {
            element: element,
            title: titleElement ? titleElement.textContent.trim() : '',
            index: indexElement ? parseInt(indexElement.textContent) : 0,
            url: titleElement ? titleElement.href : '',
            length: lengthElement ? lengthElement.textContent.trim() : ''
        };
    }

    // 정렬 드롭다운 메뉴 생성
    function createSortMenu() {
        const container = document.createElement('div');
        container.id = 'playlist-sort-menu-revival';
        container.style.cssText = `
            position: relative;
            display: inline-block;
            margin: 8px 12px;
        `;

        const button = document.createElement('button');
        button.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;">
                    <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                </svg>
                <span>정렬</span>
                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: currentColor; transition: transform 0.2s;">
                    <path d="M7 10l5 5 5-5z"/>
                </svg>
            </div>
        `;
        button.style.cssText = `
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 18px;
            color: var(--yt-spec-text-primary);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            font-family: "YouTube Sans","Roboto",sans-serif;
            transition: all 0.2s;
        `;

        const menu = document.createElement('div');
        menu.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: var(--yt-spec-menu-background);
            border-radius: 12px;
            box-shadow: 0 4px 32px rgba(0, 0, 0, 0.3);
            min-width: 200px;
            display: none;
            z-index: 2000;
            overflow: hidden;
        `;

        const sortOptions = [
            { id: 'default', label: '기본 순서', icon: 'M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z' },
            { id: 'reverse', label: '역순', icon: 'M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z' },
            { id: 'title-asc', label: '제목순 (A-Z)', icon: 'M9.25 5L12.5 1.75 15.75 5H9.25zM15.75 19L12.5 22.25 9.25 19H15.75z' },
            { id: 'title-desc', label: '제목순 (Z-A)', icon: 'M9.25 5L12.5 1.75 15.75 5H9.25zM15.75 19L12.5 22.25 9.25 19H15.75z' }
        ];

        sortOptions.forEach(option => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 16px;
                cursor: pointer;
                transition: background 0.2s;
                color: var(--yt-spec-text-primary);
                font-size: 14px;
            `;
            
            item.innerHTML = `
                <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: currentColor;">
                    <path d="${option.icon}"/>
                </svg>
                <span>${option.label}</span>
            `;

            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--yt-spec-badge-chip-background)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });

            item.addEventListener('click', () => {
                applySorting(option.id);
                menu.style.display = 'none';
                button.querySelector('svg:last-child').style.transform = 'rotate(0deg)';
            });

            menu.appendChild(item);
        });

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.style.display === 'block';
            menu.style.display = isOpen ? 'none' : 'block';
            button.querySelector('svg:last-child').style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255, 255, 255, 0.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = 'transparent';
        });

        // 외부 클릭 시 메뉴 닫기
        document.addEventListener('click', () => {
            menu.style.display = 'none';
            button.querySelector('svg:last-child').style.transform = 'rotate(0deg)';
        });

        container.appendChild(button);
        container.appendChild(menu);
        return container;
    }

    // 정렬 적용
    function applySorting(sortType) {
        const items = getPlaylistItems();
        if (items.length === 0) return;

        const videoInfos = items.map(getVideoInfo);
        const container = items[0].parentElement;

        let sorted;
        switch (sortType) {
            case 'reverse':
                sorted = [...videoInfos].reverse();
                break;
            case 'title-asc':
                sorted = [...videoInfos].sort((a, b) => 
                    a.title.localeCompare(b.title, 'ko-KR')
                );
                break;
            case 'title-desc':
                sorted = [...videoInfos].sort((a, b) => 
                    b.title.localeCompare(a.title, 'ko-KR')
                );
                break;
            default: // 'default'
                sorted = [...videoInfos].sort((a, b) => a.index - b.index);
                break;
        }

        // DOM 재정렬
        sorted.forEach((info, newIndex) => {
            container.appendChild(info.element);
            // 인덱스 번호 업데이트
            const indexElement = info.element.querySelector('#index');
            if (indexElement) {
                indexElement.textContent = (newIndex + 1).toString();
            }
        });

        // 정렬 상태 저장
        const playlistId = getPlaylistId();
        sessionStorage.setItem(`playlist_${playlistId}_sort`, sortType);

        showNotification(`정렬 적용: ${getSortLabel(sortType)}`);
    }

    // 정렬 타입 레이블 가져오기
    function getSortLabel(sortType) {
        const labels = {
            'default': '기본 순서',
            'reverse': '역순',
            'title-asc': '제목순 (A-Z)',
            'title-desc': '제목순 (Z-A)'
        };
        return labels[sortType] || '기본 순서';
    }

    // 알림 표시
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--yt-spec-brand-background-solid);
            color: var(--yt-spec-text-primary-inverse);
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            animation: slideUp 0.3s ease-out;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translate(-50%, 20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        @keyframes slideDown {
            from {
                opacity: 1;
                transform: translate(-50%, 0);
            }
            to {
                opacity: 0;
                transform: translate(-50%, 20px);
            }
        }
    `;
    document.head.appendChild(style);

    // 메뉴 삽입
    function insertSortMenu() {
        // 이미 메뉴가 있으면 중복 방지
        if (document.getElementById('playlist-sort-menu-revival')) return;
        if (!isPlaylistPage()) return;

        // 재생목록 헤더 찾기
        const playlistHeader = document.querySelector('#top.ytd-playlist-panel-renderer');
        
        if (playlistHeader) {
            const menu = createSortMenu();
            
            // 헤더 내부에 버튼 추가를 위한 컨테이너 찾기 또는 생성
            let buttonContainer = playlistHeader.querySelector('.playlist-sort-container');
            if (!buttonContainer) {
                buttonContainer = document.createElement('div');
                buttonContainer.className = 'playlist-sort-container';
                buttonContainer.style.cssText = `
                    display: flex;
                    justify-content: flex-end;
                    padding: 0 12px 8px 12px;
                `;
                playlistHeader.appendChild(buttonContainer);
            }
            
            buttonContainer.appendChild(menu);

            // 저장된 정렬 복원
            const playlistId = getPlaylistId();
            const savedSort = sessionStorage.getItem(`playlist_${playlistId}_sort`);
            if (savedSort && savedSort !== 'default') {
                setTimeout(() => applySorting(savedSort), 500);
            }
        }
    }

    // 페이지 로드 및 URL 변경 감지
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(insertSortMenu, 1000);
        }
    });

    observer.observe(document, {subtree: true, childList: true});

    // 초기 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(insertSortMenu, 2000);
        });
    } else {
        setTimeout(insertSortMenu, 2000);
    }

    // YouTube 네비게이션 이벤트 감지
    document.addEventListener('yt-navigate-finish', () => {
        setTimeout(insertSortMenu, 1000);
    });

})();
