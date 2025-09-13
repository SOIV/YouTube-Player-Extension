# Locales / 언어 파일

This folder contains translation files for multi-language support.

이 폴더에는 다국어 지원을 위한 번역 파일들이 포함되어 있습니다.

## Supported Languages / 지원 언어

- `ko.json` - 한국어 (Korean)
- `en.json` - English (영어)
- `example.json` - Template file for adding new languages / 새로운 언어 추가 시 참고할 예제 파일

## Adding a New Language / 새로운 언어 추가하기

1. Copy the `example.json` file and rename it with the language code (e.g., `ja.json`, `zh.json`)
   
   `example.json` 파일을 복사하여 언어 코드로 이름을 바꿉니다 (예: `ja.json`, `zh.json`)

2. Translate all text content in the file to the target language
   
   파일 내의 모든 텍스트를 해당 언어로 번역합니다

3. Add the language code to the `supportedLanguages` array in `i18n.js`
   
   `i18n.js` 파일의 `supportedLanguages` 배열에 언어 코드를 추가합니다

4. Add a new option to the language selector in the popup UI
   
   팝업의 언어 선택기에 새로운 옵션을 추가합니다

## File Format / 파일 형식

Each language file must be a valid JSON file:

각 언어 파일은 올바른 JSON 파일 형태여야 합니다:

```json
{
  "key1": "Translation 1",
  "key2": "Translation 2",
  "_comment": "Comments can be added with underscore prefix (ignored by parser)"
}
```

## Dynamic Loading / 동적 로딩

Language files are loaded dynamically only when needed to optimize performance.

언어 파일들은 필요할 때만 동적으로 로드되어 성능을 최적화합니다.

## API Usage / API 사용법

### Adding languages programmatically / 프로그래밍 방식으로 언어 추가

```javascript
// Add a new language at runtime
await i18n.addLanguage('fr', {
  appName: 'Extension Lecteur YouTube™',
  // ... other translations
});

// Switch to the new language
await i18n.setLanguage('fr');
```

### Getting supported languages / 지원 언어 목록 가져오기

```javascript
const languages = i18n.getSupportedLanguages();
console.log(languages); // ['ko', 'en', 'fr']
```