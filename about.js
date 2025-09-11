document.addEventListener('DOMContentLoaded', () => {
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