# 🛠️ 새로운 게임 추가 개발자 가이드 (No-Build 버전)

본 가이드는 `web-arcade` 오락실 플랫폼에 자신이 만든 미니 게임을 추가하려는 기여자를 위한 가이드입니다.

---

## 💡 개발 원칙 (Design Principles)

1. **설치/빌드 도구 없음**: Node.js나 `npm` 패키지 설치가 필요 없으며, 브라우저 표준 Native ES Module을 사용합니다.
2. **폴더 내 자율 구성**: 작성하는 모든 게임 관련 소스 코드(JS, CSS, 유틸 등)는 `games/[본인게임폴더]/` 내부에 넣어야 합니다.
3. **리소스 Cleanup 필수**: `unmount()` 메서드에서 `setInterval`, `requestAnimationFrame`, `window.addEventListener` 등을 반드시 제거하여 다른 게임이나 메인 UI에 영향을 주지 않도록 해야 합니다.

---

## 📝 4단계 게임 작성 및 등록 방법

### 1단계: 폴더 만들기
`games/` 아래에 게임 식별자로 사용할 영문 폴더를 만듭니다.
예: `games/flappy-bird/`

### 2단계: `index.js` 작성하기
폴더 안에 `index.js` 파일을 만들고 아래 표준 스펙대로 작성합니다.

```javascript
// games/flappy-bird/index.js

// 1. 메타 데이터 정의 및 export (필수)
export const meta = {
  id: 'flappy-bird',                  // 고유 ID (영문, 하이픈)
  title: '플래피 버드 (Flappy Bird)',   // 메인 화면 표시 이름
  description: '장애물을 피해 새를 날려보세요!', // 간단한 게임 소개
  author: '개발자 이름',               // 개발자 ID / 이름
  category: '아케이드',               // 카테고리
  icon: '🐤',                         // 이모지 아이콘
  thumbnailColor: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', // 카드 배경색
  version: '1.0.0'
};

// 2. Game 클래스 정의 및 export (필수)
export class Game {
  constructor() {
    this.container = null;
  }

  /**
   * 전용 CSS 파일이 있을 경우 동적 로드 (선택 사항)
   */
  loadStyle() {
    if (!document.getElementById('style-flappy')) {
      const link = document.createElement('link');
      link.id = 'style-flappy';
      link.rel = 'stylesheet';
      link.href = new URL('./style.css', import.meta.url).href;
      document.head.appendChild(link);
    }
  }

  /**
   * 게임이 모달 창에 띄워질 때 호출됩니다.
   * @param {HTMLElement} container - 게임이 그려질 DOM 컨테이너
   */
  mount(container) {
    this.loadStyle();
    this.container = container;
    
    this.container.innerHTML = `
      <div class="flappy-game">
        <h2>🐤 플래피 버드</h2>
        <canvas id="flappy-canvas" width="320" height="480"></canvas>
      </div>
    `;

    this.start();
  }

  start() {
    // 게임 루프 실행...
  }

  /**
   * 사용자가 모달을 닫거나 게임을 종료할 때 호출됩니다.
   */
  unmount() {
    // 타이머, 이벤트 리스너 해제 및 DOM 정리
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
```

### 3단계: `games/manifest.json`에 1줄 등록하기
`games/manifest.json` 파일의 리스트에 생성한 폴더 이름을 한 줄 추가합니다.

```json
[
  "minesweeper",
  "snake",
  "flappy-bird"
]
```

### 4단계: 테스트 및 제출 (PR)
1. 브라우저에서 `index.html`을 열어 내가 만든 게임 카드가 메인 화면에 뜨는지 확인합니다.
2. 카드를 클릭해 게임이 정상 플레이되는지, 닫기를 눌렀을 때 오류가 없는지 테스트합니다.
3. 깃허브 저장소에 `push` 하거나 Pull Request를 제출합니다.
