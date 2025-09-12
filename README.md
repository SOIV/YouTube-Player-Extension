# YouTube Player Extension

YouTube 플레이어 버그를 수정하고 고급 오디오/비디오 기능을 제공하는 브라우저 확장 프로그램입니다.

## 주요 기능

### 플레이어 버그 수정
- YouTube 플레이어 버그 자동 수정
- 비디오 재생 안정성 향상

### 오디오 향상
- Web Audio API를 활용한 오디오 처리
- 오디오 컨텍스트 최적화
- 백그라운드 재생 개선

### 비디오 품질 제어
- 자동 화질 설정
- 품질 제어 옵션

### Picture-in-Picture (PiP)
- 향상된 PiP 기능
- 멀티태스킹 지원

## 설치 방법

1. 이 저장소를 클론하거나 다운로드합니다
2. Chrome 브라우저에서 chrome://extensions/ 페이지로 이동
3. 우측 상단의 "개발자 모드" 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 클릭
5. 이 프로젝트 폴더를 선택

## 사용 방법

1. YouTube 페이지로 이동
2. 확장 프로그램 아이콘을 클릭하여 설정 창 열기
3. 원하는 기능을 활성화/비활성화
4. 설정이 자동으로 저장됩니다

## 파일 구조

```
YouTube Player Extension/
├── manifest.json          # 확장 프로그램 메타데이터
├── popup.html/js          # 설정 팝업 UI
├── content.js            # 메인 콘텐츠 스크립트
├── background.js         # 백그라운드 서비스 워커
├── about.html/js         # 정보 페이지
├── i18n.js              # 다국어 지원
├── styles.css           # 스타일시트
├── scripts/
│   ├── core/
│   │   ├── base.js      # 기본 유틸리티
│   │   └── settings.js  # 설정 관리
│   └── features/
│       ├── audio.js     # 오디오 향상 기능
│       ├── quality.js   # 화질 제어 기능
│       └── pip.js       # PiP 기능
└── icons/               # 확장 프로그램 아이콘
```

## 기술 스택

- **Manifest Version**: 3
- **JavaScript**: ES6+
- **Web APIs**: 
  - Web Audio API
  - Picture-in-Picture API
  - Chrome Extension APIs
  - YouTube API 통합

## 권한

- storage: 사용자 설정 저장
- activeTab: 현재 탭 접근
- scripting: 스크립트 주입
- contextMenus: 컨텍스트 메뉴 추가

## 호스트 권한

- *.youtube.com/*: YouTube 사이트 접근
- *.googlevideo.com/*: 비디오 스트림 접근

## 개발자 정보

YouTube 사용 경험 개선을 위한 오픈소스 프로젝트입니다.

## 라이선스

이 프로젝트는 MIT License 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.