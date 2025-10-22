document.addEventListener('DOMContentLoaded', async () => {
  // i18n이 로드될 때까지 기다린 후 다국어 텍스트 업데이트
  await window.waitForI18n();
  updateTexts();
  
  // 뒤로 버튼 이벤트
  document.getElementById('backBtn').addEventListener('click', () => {
    // 여러 방법 시도
    try {
      window.location.replace('popup.html');
    } catch (e) {
      try {
        window.location.href = 'popup.html';
      } catch (e2) {
        // 마지막 대안으로 창 닫기
        window.close();
      }
    }
  });
});

function updateTexts() {
  // data-i18n 속성을 가진 모든 요소 업데이트
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = window.i18n.t(key);
    
    // 특별한 처리가 필요한 요소들
    if (key === 'backButton') {
      element.textContent = `← ${translation}`;
    } else if (key === 'appDescriptionLong') {
      // 줄바꿈을 <br>로 변환
      element.innerHTML = translation.replace(/\n/g, '<br>');
    } else {
      element.textContent = translation;
    }
  });
}