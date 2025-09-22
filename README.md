# YouTube Player Extension

[![English](https://img.shields.io/badge/README-English-blue)](README_EN.md)
[![최신 릴리즈](https://img.shields.io/github/v/release/SOIV/YouTube-Player-Extension)](https://github.com/SOIV/YouTube-Player-Extension/releases)
[![총 다운로드](https://img.shields.io/github/downloads/SOIV/YouTube-Player-Extension/total)](https://github.com/SOIV/YouTube-Player-Extension/releases)
[![최신 버전 다운로드](https://img.shields.io/github/downloads/SOIV/YouTube-Player-Extension/latest/total)](https://github.com/SOIV/YouTube-Player-Extension/releases)

유튜브 재생기의 다양한 기능을 향상시키는 브라우저 확장 프로그램입니다.

## 주요 기능

### 🎵 오디오 향상
- **볼륨 부스트**: 기본 볼륨보다 더 크게 재생 (최대 500%)
- **오디오 컴프레서**: 소리의 다이나믹 레인지 조절로 더 균일한 음량
- **스테레오 패닝**: 좌우 음향 밸런스 조정 (-100% ~ +100%)

### 📱 플레이어 기능
- **Picture-in-Picture**: 작은 창으로 비디오 시청
- **미니플레이어**: 스크롤 시 작은 플레이어로 계속 시청 (크기 및 위치 설정 가능)

### 🛠️ 고급 설정
- **커스텀 스크립트**: JavaScript 코드 실행으로 추가 기능 구현
- **커스텀 테마**: CSS 스타일 커스터마이징
- **다국어 지원**: 한국어, 영어

## 설치 방법

> ※ 해당 확장 프로그램은 자동 업데이트를 지원하지 않습니다.

### 🏪 Chrome 웹 스토어 (예정)

> 📅 **Chrome 웹 스토어 업로드 예정**: 더 편리한 설치와 업데이트를 위해 Chrome 웹 스토어 등록을 준비 중입니다.

### 📦 릴리즈에서 다운로드 (권장)

1. [Releases 페이지](https://github.com/SOIV/YouTube-Player-Extension/releases)에서 최신 버전 다운로드
2. 다운로드한 ZIP 파일을 원하는 폴더에 압축 해제
3. Chrome 브라우저에서 `chrome://extensions/` 접속
4. 우측 상단의 "개발자 모드" 토글 활성화
5. "압축해제된 확장 프로그램을 로드합니다." 클릭
6. 압축 해제한 폴더 선택
7. 확장 프로그램이 설치되고 YouTube에서 사용 가능

### 🔧 개발자 설치 (소스코드 직접 설치)

```bash
# 레포지토리 클론
git clone https://github.com/SOIV/YouTube-Player-Extension.git
cd YouTube-Player-Extension
```

1. Chrome 브라우저에서 `chrome://extensions/` 페이지로 이동
2. 우측 상단의 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 클론한 프로젝트 폴더를 선택

## 사용 방법

1. YouTube 페이지로 이동
2. 확장 프로그램 아이콘을 클릭하여 설정 창 열기
3. 원하는 기능을 활성화/비활성화
4. 설정이 자동으로 저장됩니다

## 스크린샷

![스크린샷 1](docs/screenshot/스크린샷%202025-09-13%20163509.png)
![스크린샷 2](docs/screenshot/스크린샷%202025-09-13%20163528.png)
![스크린샷 3](docs/screenshot/스크린샷%202025-09-13%20163546.png)
![스크린샷 4](docs/screenshot/스크린샷%202025-09-13%20163555.png)

## 브라우저 호환성

- ✅ **Chrome** (권장)
- ✅ **Microsoft Edge**
- ✅ **NAVER Whale**
- ✅ **Opera**
- ⚠️ **Firefox** (제한적 지원)

## 파일 구조

```
YouTube Player Extension/
├── manifest.json          # 확장 프로그램 매니페스트
├── popup.html             # 팝업 UI
├── popup.js               # 팝업 로직
├── content.js             # 메인 콘텐츠 스크립트
├── background.js          # 백그라운드 서비스 워커
├── about.html             # 정보 페이지
├── i18n.js               # 다국어 지원 시스템
├── styles.css            # 스타일시트
├── scripts/
│   ├── core/
│   │   ├── base.js       # 기본 유틸리티
│   │   └── settings.js   # 설정 관리자
│   └── features/
│       ├── audio.js      # 오디오 향상 모듈
│       └── pip.js        # PiP 및 미니플레이어 모듈
├── locales/              # 언어 파일
│   ├── ko.json          # 한국어
│   ├── en.json          # 영어
│   └── example.json     # 번역 템플릿
├── icons/               # 확장 프로그램 아이콘
└── docs/                # 문서
```

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Extension API**: Chrome Extension Manifest V3
- **Audio Processing**: Web Audio API
- **Video APIs**: Picture-in-Picture API
- **Storage**: Chrome Storage API
- **Internationalization**: JSON 기반 다국어 지원

## 권한 및 호스트

### 확장 프로그램 권한
- `storage`: 사용자 설정 저장
- `activeTab`: 현재 탭 접근
- `scripting`: 스크립트 주입
- `contextMenus`: 컨텍스트 메뉴 추가

### 호스트 권한
- `*.youtube.com/*`: YouTube 사이트 접근
- `*.googlevideo.com/*`: 비디오 스트림 접근

## 자주 묻는 질문 (FAQ)

### ❓ 확장 프로그램을 설치했는데 YouTube에서 작동하지 않아요
- Chrome 브라우저에서 `chrome://extensions/`로 이동
- YouTube Player Extension이 **활성화** 상태인지 확인
- 페이지 새로고침 후 다시 시도
- 브라우저를 완전히 종료한 후 재시작

### ❓ 확장 프로그램 아이콘이 보이지 않아요
- Chrome 주소창 오른쪽 **퍼즐 조각 아이콘(확장 프로그램)** 클릭
- YouTube Player Extension 옆의 **핀 아이콘** 클릭하여 툴바에 고정

### ❓ 설정을 변경했는데 적용되지 않아요
- YouTube 페이지를 **새로고침** 해주세요
- 여러 개의 YouTube 탭이 열려있다면 모든 탭을 새로고침
- 브라우저 캐시 삭제 후 재시도

### ❓ 오디오 컴프레서가 작동하지 않아요
- 브라우저에서 해당 탭의 음소거가 해제되어 있는지 확인
- 시스템 볼륨이 적절한 수준인지 확인
- 다른 오디오 향상 기능과 함께 사용시 충돌 가능성 확인

### ❓ Firefox에서 일부 기능이 작동하지 않아요
- Firefox는 **제한적 지원**으로 일부 기능이 정상 작동하지 않을 수 있습니다
- 최적의 경험을 위해 **Chromium 기반 브라우저** (Chrome, Edge, Whale 등) 사용을 권장합니다

### ❓ 미니플레이어에서 오류나 버그가 발생해요
- YouTube 사이트가 **완전히 로딩되기 전에 스크롤**을 내리면 미니플레이어 관련 오류가 발생할 수 있습니다
- **해결 방법**: YouTube 페이지가 완전히 로딩된 후 스크롤하거나 확장 프로그램 기능을 사용해주세요
- 페이지 새로고침 후 잠시 기다린 다음 사용하시면 문제를 피할 수 있습니다
- 해당 이슈는 **향후 업데이트**에서 수정될 수 있습니다.

### ❓ 확장 프로그램이 업데이트되나요?
- 현재 **자동 업데이트를 지원하지 않습니다**
- 새 버전은 [Releases 페이지](https://github.com/SOIV/YouTube-Player-Extension/releases)에서 다운로드
- Chrome 웹 스토어 등록 후에는 자동 업데이트 지원 예정

## 기여하기

1. 이 저장소를 Fork합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 문제 신고

버그나 기능 요청은 [Issues](https://github.com/SOIV/YouTube-Player-Extension/issues)에서 신고해 주세요.

## 라이선스

이 프로젝트는 MIT License 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**주의사항**: 이 확장 프로그램은 YouTube의 공식 제품이 아닙니다. YouTube는 Google Inc.의 상표입니다.