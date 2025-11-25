> 이 곳의 영어 작성은 Google Translate를 사용하였습니다.<br> The English text here was written using Google Translate.

## Update & Fix completed
- [x] 플로팅 플레이어(Floating Player)(구 미니 플레이어)의 표시 위치가 변경 되었습니다.
    - 최상단(15px) -> 헤더 하단으로(60px)
- [x] 각 버튼 툴팁 및 일부 기능에서 다국어 지원이 안되고 있는 부분을 수정
    - Fixed the lack of multilingual support in each button tooltip and some functions.
    - 소형 플레이어 버튼(Mini Player Button)은 제외되었습니다(툴팁 표시 문제 해결이 안 된 상태이므로 제외됨)

## To be updated
### [ v2 지원 이전 마지막 업데이트 / Last update before v2 support - v1.0.8 ]
> **This may not be the last update;; / 마지막 업데이트가 아닐 수도 있습니다;;**
- [ ] 플로팅 플레이어(Floating Player)(구 미니 플레이어)가(이) 작동이 되지 않는 문제
    - 문제가 되었던 조건부를 완화하여 정상적으로 작동할 수 있도록 수정되었습니다. 추가로 일부 관련 시스템에서도 개선을 진행하였습니다.
        - +)추가 업데이트 : 여전히 사이트 로딩에 관련하여 작동 여부가 달라지는 이슈가 존제합니다 추후 수정 될 예정입니다.(25. 11. 25. AM 12:00)
        - ++)추가 업데이트 : v1.0.8 이전 상태로 되돌리고 일부 수정햇던 부분을 복구 후 스레드홀드 조건부인 타임만 수정(11. 25. AM 1:30)
- [ ] PIP 버튼의 툴팁을 수정
    - 기존 2개(PIP 모드 / PIP 모드 종료)로 표시되고 있는 부분을 한가지(PIP 모드)로 변경
    - 위 2가지 표시 방식에 대한 이슈로 PIP 모드 종료의 툴팁 표시에 정상적이지 않음을 해결
- [ ] 충돌 되는 미니 플레이어의 이름을 플로팅 플레이어(Floating Player)으로 변경<br> 해당 수정은 변수/함수명, CSS 클래스명, 설정/옵션 키, 텍스트(다국어), 주석 작성 내용을 전부 변경 및 수정을 해야되는 수정안이라 핫픽스(hotfix)으로 업데이트가 아닌 다음 업데이트에서 제공 됩니다.
    - Rename the conflicting mini-player to Floating Player<br> This fix requires changing and modifying all variable/function names, CSS class names, setting/option keys, text (multilingual), and comment content, so it will be provided in the next update, not as a hotfix.
    - 기능의 이름을 변경함에 따라 기존 사용하던 이름의 설정값들을 마이그레이션을 할 수 있도록 동시에 작업하여 업데이트가 진행될 예정입니다.<br> 다만 모든 작업을 진행하는데 기간은 약간 오래 걸릴 수도 있으며 현재 작업자가 사용하고 있는 Claude code를 사용하지 못하는 상태이므로 좀 더 시간이 걸릴 수 있음을 알립니다.

### v2.0.0 major update
- [ ] V2 UI/UX Update - v2.0.0 (Settings window & About)
    - v2 UI/UX의 업데이트를 진행하면서 About 또는 일부 기능의 내용이 수정 될 수 있습니다.
        - As we update the v2 UI/UX, the About section or some features may be modified.
    - v2 업데이트에서는 사용자가 친화적으로 좀 더 좋은 UI에서 사용을 하고자 진행하는 필수 업데이트입니다.<br> 이러한 업데이트로 컨트롤 패널 및 기능 추가의 업데이트 또한 동시에 진행 될 예정입니다.(추가될 기능은 현제 계획되지 않았으나 상황에 따라 추가 될 예정이 존제함)
        - The v2 update is a mandatory update designed to provide a more user-friendly and improved UI.<br> This update will also include updates to the control panel and additional features. (Additional features are not currently planned, but may be added depending on the situation.)
- [ ] v2.0.0 기념 Chrome Web Store 설치 방식 지원
    - Support for Chrome Web Store installation method in commemoration of v2.0.0
- [ ] 내부 파일 시스템 개선
    - 일부 기능들끼리 하나의 파일로 통합되어 있는 것들을 분리합니다.
        - PIP button, Mini Player button, Floating Player
        - Audio Compressor, Stereo Panning (L/R)
    - 그 외 일부 시스템 및 기능 개선 작업

## Help me!
- [ ] 소형 플레이어의 툴팁을 유튜브의 기본 툴팁을 활용하여 표시
    - Display Miniplayer's tooltip using YouTube's default tooltip

---

## Idea? / updated List
> This paragraph is not translated. If you wish to check the content, please use a translation tool.

> 확장 프로그램인 [Transpose](https://chromewebstore.google.com/detail/transpose-%E2%96%B2%E2%96%BC-pitch-%E2%96%B9-spee/ioimlbgefgadofblnajllknopjboejda), [AHA Music](https://chromewebstore.google.com/detail/aha-music-song-finder-for/dpacanjfikmhoddligfbehkpomnbgblf), [Dark Reader](https://chromewebstore.google.com/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh)에 있는 기능들은 추가 및 작업하지 않을 예정입니다.<br> 
(이미 충분히 잘 작동하고 많은 사람들이 사용하는 확장 프로그램이라 딱히 여기서 만들고자 하는 생각이 없음)

> 아레 기능이 통합으로 추가 될 경우 확장 프로그램의 이름이 변경 될 수 있습니다. (ex. YouTube Player Extension -> Player Extension)<br>
모든 기능은 모듈 형식으로 활성화시 동적으로 기능을 불러오는 방식을 사용합니다.
- [ ] Live Stream Translator
    - 별도 확장 프로그램으로 개발 중이였으나 v2 업데이트로 하나의 확장 프로그램으로 추후 통합 예정
- [ ] YouTube Video Downloader / YouTube Mp3 Converter / Soundcloud Music Downloader
    - [Flixmate](https://flixmate.net/)을 사용하여 다운로드하는 기능을 추후 추가 예정이 있음(확정이 아님)
    - 기존 Emulator/sandboxed 환경에서 사용 가능한 [확장 프로그램](https://addoncrop.com/v34/)을 참고함

---

## Update & Version History
- [x] 변경 및 업데이트 된 소형 플레이어 아이콘(SVG) 수정 (for YouTube default SVG)
    - Fixed and updated small player icons (SVG) (for YouTube default SVG)
- [x] /live/* 에서 PIP, 소형 플레이어 버튼, 미니플레이어 가 작동하지 않는 문제를 해결
    - Fixed an issue where PIP, small player buttons, and miniplayer did not work in /live/*