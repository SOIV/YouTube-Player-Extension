> 이 곳의 영어 작성은 Google Translate를 사용하였습니다.<br> The English text here was written using Google Translate.

## Update completed
- [x] 변경 및 업데이트 된 소형 플레이어 아이콘(SVG) 수정 (for YouTube default SVG)
    - Fixed and updated small player icons (SVG) (for YouTube default SVG)
- [x] /live/* 에서 PIP, 소형 플레이어 버튼, 미니플레이어 가 작동하지 않는 문제를 해결
    - Fixed an issue where PIP, small player buttons, and miniplayer did not work in /live/*

## To be updated
> [ v2 지원 이전 마지막 업데이트 - v1.0.8 ]<br> [ Last update before v2 support - v1.0.8 ]
- [ ] 각 버튼 툴팁 및 일부 기능에서 다국어 지원이 안되고 있는 부분을 수정
    - Fixed the lack of multilingual support in each button tooltip and some functions.
- [ ] 충돌 되는 미니 플레이어의 이름을 플로팅 플레이어(Floating Player)으로 변경<br> 해당 수정은 변수/함수명, CSS 클래스명, 설정/옵션 키, 텍스트(다국어), 주석 작성 내용을 전부 변경 및 수정을 해야되는 수정안이라 핫픽스(hotfix)으로 업데이트가 아닌 다음 업데이트에서 제공 됩니다.
    - Rename the conflicting mini-player to Floating Player<br> This fix requires changing and modifying all variable/function names, CSS class names, setting/option keys, text (multilingual), and comment content, so it will be provided in the next update, not as a hotfix.
- [x] 플로팅 플레이어(Floating Player)(구 미니 플레이어)가(이) 작동이 되지 않는 문제
    - 문제가 되었던 조건부를 완화하여 정상적으로 작동할 수 있도록 수정되었습니다. 추가로 일부 관련 시스템에서도 개선을 진행하였습니다.
    - 플로팅 플레이어(Floating Player)와 같이 정상 작동하고 있던 기능들이 작동하지 않는 다면 이슈탭에 알려주세요.

## Help me!
- [ ] 소형 플레이어의 툴팁을 유튜브의 기본 툴팁을 활용하여 표시
    - Display Miniplayer's tooltip using YouTube's default tooltip

## Wiki page To be addition
- v2.0.0 업데이트 이후 해당 Repo의 Wiki page에 FAQ 및 해당 Repo에 관련된 모든 내용을 작성을 하고자 합니다.<br> 해당 프로젝트는 오픈소스로 MIT License가 적용되어 있으며 비록 해당 작업이 AI를 사용하여 코딩이 진행되었지만 해당 관련 기능이 필요한 사람들과 이 오픈소스를 사용하여 무언가 만들어 보고 싶은 사람들을 위해 해당 프로젝트의 Wiki를 작성해 보고자 합니다.
    - After the v2.0.0 update, I would like to write a FAQ and all contents related to the repo on the wiki page of the repo. <br> The project is open source and MIT License is applied, and although the work was coded using AI, I would like to write a wiki for the project for those who need the related functions and those who want to create something using this open source.
- 작성은 언제가 될지는 모르겠으나 언젠간 작성을 해두겠죠?..
    - I don't know when I'll write it, but I'll write it someday, right?

---

## v2.0.0 major update
- [ ] V2 UI/UX Update - v2.0.0 (Settings window & About)
    - v2 UI/UX의 업데이트를 진행하면서 About 또는 일부 기능의 내용이 수정 될 수 있습니다.
        - As we update the v2 UI/UX, the About section or some features may be modified.
    - v2 업데이트에서는 사용자가 친화적으로 좀 더 좋은 UI에서 사용을 하고자 진행하는 필수 업데이트입니다.<br> 이러한 업데이트로 컨트롤 패널 및 기능 추가의 업데이트 또한 동시에 진행 될 예정입니다.(추가될 기능은 현제 계획되지 않았으나 상황에 따라 추가 될 예정이 존제함)
        - The v2 update is a mandatory update designed to provide a more user-friendly and improved UI.<br> This update will also include updates to the control panel and additional features. (Additional features are not currently planned, but may be added depending on the situation.)
- [ ] v2.0.0 기념 Chrome Web Store 설치 방식 지원
    - Support for Chrome Web Store installation method in commemoration of v2.0.0

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