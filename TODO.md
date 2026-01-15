## Update & Fix completed
> **v1.0.8 updated**
- [x] 플로팅 플레이어(Floating Player)(구 미니 플레이어(MiniPlayer))의 표시 위치가 변경 되었습니다.
    - 최상단(15px) -> 헤더 하단으로(60px)
- [x] 각 버튼 툴팁 및 일부 기능에서 다국어 지원이 안되고 있는 부분을 수정
    - 소형 플레이어 버튼(Mini Player Button)은 제외되었습니다(툴팁 표시 문제 해결이 안 된 상태이므로 제외됨)

## To be updated
### v1.0.8 updated - 2~3월 중 작업 시작 예정
> **< 해당 문제의 버그를 다음과 같이 업데이트를 진행합니다. >**
> 1. MiniPlayer 파일 이름을 플로팅 플레이어(Floating Player)으로 하되
> 2. 기능 별 파일 분리 작업을 진행, 작업 종료 후
> 3. 즉시 플로팅 플레이어(Floating Player)으로 클래스명, 변수명, 주석, UI 문구 등을 변경하는 작업을 진행
> 4. 3번의 작업이 종료되면 플로팅 플레이어(Floating Player)의 리펙토링 작업을 진행
> 5. 리펙토링이 종료되면 테스트 진행 / 테스트 진행하면서 7번의 작업을 동시 진행
> 6. 정상적으로 작동이 된다라는 결정이 될 경우 다른 수정 작업을 진행
> 7. debug.js 파일을 추가하여 개발자 기능을 추가
> 8. 개발자 기능을 테스트 후 (UI/UX 추가)
> 9. 버전 업을 진행 후 파일 압축하여 신규 버전을 업로드(v1.0.7 -> v1.0.8)
- [ ] 내부 파일 시스템 개선
    - 일부 기능들끼리 하나의 파일로 통합되어 있는 것들을 분리합니다.
        - PIP button, Mini Player button, Floating Player
        - Audio Compressor, Stereo Panning (L/R)
    - 그 외 일부 시스템 및 기능 개선 작업
- [ ] 충돌 되는 미니 플레이어의 이름을 플로팅 플레이어(Floating Player)으로 변경<br> 
    > 해당 수정은 변수/함수명, CSS 클래스명, 설정/옵션 키, 텍스트(다국어), 주석 작성 내용을 전부 변경 및 수정을 해야되는 수정안이라 핫픽스(hotfix) 업데이트가 아닌 다음 업데이트(v1.0.8)에서 제공 됩니다.
    - 기능의 이름을 변경함에 따라 기존 사용하던 이름의 설정값들을 마이그레이션을 할 수 있도록 동시에 작업하여 업데이트가 진행될 예정입니다.<br> 다만 모든 작업을 진행하는데 기간은 약간 오래 걸릴 수도 있으며 현재 작업자가 사용하고 있는 Claude code를 사용하지 못하는 상태이므로 좀 더 시간이 걸릴 수 있음을 알립니다.
- [ ] 플로팅 플레이어(Floating Player)(구 미니 플레이어(MiniPlayer))가(이) 작동이 되지 않는 문제
    - 문제가 되었던 조건부를 완화하여 정상적으로 작동할 수 있도록 수정되었습니다. 추가로 일부 관련 시스템에서도 개선을 진행하였습니다.
        - +)추가 업데이트1 : 여전히 사이트 로딩에 관련하여 작동 여부가 달라지는 이슈가 존제합니다, 추후 수정 될 예정입니다.(25. 11. 25. AM 12:00)
        - +)추가 업데이트2 : v1.0.8 이전 상태로 되돌리고 일부 수정햇던 부분을 복구 후 스레드홀드 조건부인 타임만 수정(25. 11. 25. AM 1:30)
        - +)추가 업데이트3 : 디버그 작업 필요, 지속적으로 이슈가 유지 될 경우 v1.0.9로 이전하여 핫픽스 업데이트 지원 예정(25. 11. 26. AM 2:53)
    - 위 문제에서 표시되는 문제에 대해서는 어느 정도 해결이 되었으나 다른 버그가 발생하여 해당 버그와 함께 해결을 시도 중
- [ ] PIP 버튼의 툴팁을 수정
    - 기존 2개(PIP 모드 / PIP 모드 종료)로 표시되고 있는 부분을 한가지(PIP 모드)로 변경
    - 위 2가지 표시 방식에 대한 이슈로 PIP 모드 종료의 툴팁 표시에 정상적이지 않음을 해결
- [ ] 오디오 제어 관련 기능 미작동에 대한 이슈
    - 컴프, 스테레오 패닝 미작동 버그 해결
    - 슬라이더(Slider) 이동시에 상단에 알림이 지속적으로 표시 되려고 하는 부분을 수정

---

### v1.0.9 update
> **v2 지원 이전 마지막 업데이트 / Last update before v2 support**
> **마지막 업데이트가 아닐 수도 있습니다 / This may not be the last update**
- [ ] 돌아온 유튜브 자동 화질 고정(자동 품질 선택(Automatic quality selection)) 기능
    - 비디오 코덱 선택하는 기능은 추가되지 않습니다.
- [ ] 연속 재생 버튼(Loop button)
- [ ] 플로팅 플레이어(Floating Player)의 추가 미지원 기능 업데이트
    - 자동 영상 비율 인식 추가 / 16:9, 21:9, 4:3 등 자동으로 영상 사이즈에 맞게 표시 될 수 있도록
    - 화면 크기 추가 / 모니터 QHD, 4K 사용자를 위한 업데이트(thx for friend / 사용자 피드백 요청)
- [ ] 볼륨 퍼센트 표시 설정
    - 확정 추가 예정이 아님
    - 볼륨 조절시 퍼센트가 표시가 되지 않았던 것을 보여줄 수 있도록
- [ ] 버튼 최적화
    - 버튼을 추가 할 때 처음 창을 띄우게 되면 플레이어에서의 메뉴를 한번 표시해야 되는 문제를 해결해보기
    - 각 버튼 svg 코드를 추가
- [ ] Chrome Web Store 설치 방식 지원(Support for Chrome Web Store installation methods)
    - 개인정보처리방침(Privacy Policy) 추가 완료 및 추후 별도 업데이트 예정 [ YT Player Extension / LST 공동 및 그 외 제공되는 서비스 ]

---

### v2.0.0 major update
> Notice : v1.0.9 업데이트 이후로 당분간 v2 업데이트 준비로 인해 v1의 업데이트가 지연 될 수 있습니다.
- [ ] V2 UI/UX Update - v2.0.0 (Settings window & About)
    - v2 UI/UX의 업데이트를 진행하면서 About 또는 일부 기능의 내용이 수정 될 수 있습니다.
    - v2 업데이트에서는 사용자가 친화적으로 좀 더 좋은 UI에서 사용을 하고자 진행하는 필수 업데이트입니다.<br> 이러한 업데이트로 컨트롤 패널 및 기능 추가의 업데이트 또한 동시에 진행 될 예정입니다.(추가될 기능은 현제 계획되지 않았으나 상황에 따라 추가 될 예정이 존제함)
- [ ] Chrome 공식 i18n 마이그레이션
- [ ] 파일 구조 개선 (_locales/)
- [ ] manifest.json 다국어 적용

## Help me!
- [ ] 소형 플레이어의 툴팁을 유튜브의 기본 툴팁을 활용하여 표시
    - Display Miniplayer's tooltip using YouTube's default tooltip

## Idea? / updated List
> 이미 충분히 잘 작동하고 있는 확장 프로그램인 기능들은 추가 및 작업하지 않을 예정입니다.

> 아레 기능이 통합으로 추가 될 경우 확장 프로그램의 이름이 변경 될 수 있습니다. (ex. YouTube Player Extension -> Player Extension)<br>
모든 기능은 모듈 형식으로 활성화시 동적으로 기능을 불러오는 방식을 사용합니다.
- [ ] LST_PJ < Live Stream Translator(LST) Extension Project >
    - 프로젝트의 계획이 방대해짐에 따라 기존대로 독립 프로젝트로 재 변경 되었습니다.
    - LST 프로젝트 문서는 [LST-docs](https://github.com/SOIV/LST_Extension-Project/tree/main/docs/LST-PJ_V3)에서 계속 확인을 하실 수 있습니다.
    - GitHub Repositories : https://github.com/SOIV/LST_Extension-Project

## Update & Version History
### v1.0.0 ~ v1.0.7 Update History
- [x] 변경 및 업데이트 된 소형 플레이어 아이콘(SVG) 수정 (for YouTube default SVG)
    - Fixed and updated small player icons (SVG) (for YouTube default SVG)
- [x] /live/* 에서 PIP, 소형 플레이어 버튼, 미니플레이어 가 작동하지 않는 문제를 해결
    - Fixed an issue where PIP, small player buttons, and miniplayer did not work in /live/*