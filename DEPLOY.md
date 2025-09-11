# 크롬 웹 스토어 배포 가이드

## 🚀 배포 전 체크리스트

### 1. 버전 업데이트
- [ ] `manifest.json`에서 버전 번호 확인
- [ ] 변경 로그 준비

### 2. 배포 파일 정리

#### ✅ 포함할 파일/폴더:
```
📁 YouTube Bug Fixer & Enhancer - Release/
├── 📁 scripts/           # 모듈화된 JavaScript
├── 📁 icons/             # 확장 프로그램 아이콘들
├── 📄 manifest.json      # 확장 프로그램 설정
├── 📄 content.js         # 메인 스크립트
├── 📄 background.js      # 백그라운드 스크립트
├── 📄 popup.html         # 설정 UI
├── 📄 popup.js           # 설정 UI 로직
└── 📄 styles.css         # 스타일시트
```

#### ❌ 제외할 파일/폴더:
- `docs/` - 개발 문서
- `legacy/` - 사용하지 않는 코드
- `.git/` - Git 저장소
- `node_modules/` - 개발 의존성
- `DEPLOY.md` - 이 파일
- `README.md` - 개발 문서 (선택사항)

### 3. 배포 방법

#### 옵션 A: 배포 전용 폴더 사용
```bash
# 이미 생성된 Release 폴더 사용
cd "YouTube Bug Fixer & Enhancer - Release"
# 이 폴더를 압축해서 업로드
```

#### 옵션 B: 수동 선택
크롬 개발자 대시보드에서 업로드할 때:
1. 필요한 파일들만 선택해서 압축
2. 또는 전체 압축 후 크롬에서 불필요한 파일 제외

### 4. 배포 확인사항

- [ ] 모든 기능이 정상 작동하는지 테스트
- [ ] 콘솔 에러가 없는지 확인
- [ ] 권한 요청이 적절한지 검토
- [ ] 아이콘이 모든 크기에서 정상 표시되는지 확인

### 5. 파일 크기 최적화

현재 Release 폴더 크기:
- 전체: ~80KB
- JavaScript: ~50KB
- Icons: ~20KB
- 기타: ~10KB

**크롬 웹 스토어 제한:**
- 최대 파일 크기: 128MB (충분함)
- 압축 권장

---

## 🎯 빠른 배포 명령어

```bash
# Release 폴더로 이동
cd "../YouTube Bug Fixer & Enhancer - Release"

# 압축 파일 생성 (선택사항)
zip -r "youtube-enhancer-v1.0.0.zip" .

# 업로드할 폴더: YouTube Bug Fixer & Enhancer - Release
```

---
*배포 준비 완료: 2024년 9월 12일*