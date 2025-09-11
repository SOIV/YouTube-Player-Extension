# Legacy Code Archive

이 폴더에는 모듈화 과정에서 사용하지 않게 된 코드들이 보관되어 있습니다.

## 보관된 파일들

### `content-old.js`
- **설명**: 모듈화 이전의 단일 파일 content.js
- **크기**: 약 1000줄의 통합 코드
- **포함 기능**: 
  - 모든 기능이 하나의 파일에 통합됨
  - DOM 캐시, 이벤트 관리, 오디오 향상, 품질 제어, PIP 등
- **사용 중단 이유**: 모듈화로 인한 코드 분리 및 성능 최적화

### `audio-processor.js`
- **설명**: 별도 오디오 처리를 위한 웹 워커/프로세서 파일
- **사용 중단 이유**: 현재 모듈화된 오디오 시스템에서 불필요

## 모듈화 개선사항

**이전 (Legacy):**
```
content.js (1000+ lines)
├── DOM 캐시
├── 이벤트 관리  
├── 설정 관리
├── 오디오 향상
├── 품질 제어
├── PIP 기능
└── 기타 모든 기능
```

**현재 (Modular):**
```
scripts/
├── core/
│   ├── base.js (DOM, Event 관리)
│   └── settings.js (설정 관리)
├── features/
│   ├── audio.js (오디오 전용)
│   ├── quality.js (품질 전용)
│   └── pip.js (PIP 전용)
└── content.js (진입점, 100줄)
```

## 성능 개선

- ✅ **메모리 사용량 감소**: OFF된 기능은 로드되지 않음
- ✅ **초기화 시간 단축**: 필요한 모듈만 로드
- ✅ **관리 효율성**: 기능별 독립적 수정 가능
- ✅ **코드 재사용성**: 모듈 단위 재활용 가능

## 복원 방법

필요시 `content-old.js`를 `content.js`로 이름 변경하고 manifest.json을 다음과 같이 수정:

```json
"content_scripts": [
  {
    "matches": ["*://*.youtube.com/*"],
    "js": ["content.js"],
    "css": ["styles.css"],
    "run_at": "document_start"
  }
]
```

---
*보관일: 2024년 9월 12일*  
*모듈화 작업 완료 후 백업*