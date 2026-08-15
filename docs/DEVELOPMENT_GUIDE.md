# 🛠️ 새로운 게임 추가 및 수정 개발자 가이드 (No-Build 버전)

본 가이드는 `web-arcade` 오락실 플랫폼에 자신이 만든 미니 게임을 추가하거나 기존 게임을 수정하려는 기여자를 위한 가이드입니다.

---

## 💡 바이브 코딩(Vibe Coding) & 개발 핵심 원칙

1. **개발자의 의도 존중 & 적극적 소통**: 
   - 바이브 코딩 시 개발자의 요청에 대해 추가로 확인이 필요하거나 모호한 부분이 있다면, 멋대로 추측하거나 임의로 판단하지 않고 **반드시 개발자에게 먼저 의사를 물어보고 소통**합니다.
   - 임의 판단을 지양하고 **최대한 개발자의 원래 설계 의도와 요청 방향에 맞춰** 유연하게 개발을 진행합니다.
2. **사전 승인 없는 자동 제출(Commit/Push) 금지**:
   - 코드 작성이나 수정이 끝난 후 개발자의 명시적 요청이나 승인 없이 마음대로 git commit / push를 진행하지 않습니다.
3. **Single Source of Truth**:
   - 모든 게임의 원본 코드는 **오직 `games/[게임명]/` 디렉터리 내부**에만 작성합니다.
4. **폴더 내 자율 구성**: 작성하는 모든 게임 관련 소스 코드(JS, CSS, 유틸 등)는 `games/[본인게임폴더]/` 내부에 포함되어야 합니다.
5. **리소스 Cleanup 필수**: `unmount()` 메서드에서 `setInterval`, `requestAnimationFrame`, `window.addEventListener` 등을 반드시 제거하여 다른 게임이나 메인 UI에 영향을 주지 않도록 해야 합니다.

---

## 📝 4단계 게임 작성 및 등록 방법

### 1단계: 폴더 만들기
`games/` 아래에 게임 식별자로 사용할 영문 폴더를 만듭니다.
예: `games/flappy-bird/`

### 2단계: `index.js` 및 `style.css` 작성하기
폴더 안에 `index.js`와 `style.css` 파일을 만들고 아래 표준 스펙대로 작성합니다.

```javascript
// games/flappy-bird/index.js

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

export class Game {
  constructor() {
    this.container = null;
  }

  loadStyle() {
    if (!document.getElementById('style-flappy-bird')) {
      const link = document.createElement('link');
      link.id = 'style-flappy-bird';
      link.rel = 'stylesheet';
      link.href = new URL('./style.css', import.meta.url).href;
      document.head.appendChild(link);
    }
  }

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

  unmount() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
```

### 3단계: 브라우저 새로고침(F5) ➔ 자동 등록 & 테스트 끝!
로컬 개발 서버(`scripts/server.js`)가 `games/` 디렉터리를 **실시간 자동 감지(Auto Discovery)**하므로, `manifest.json`을 수정할 필요 없이 폴더를 만들자마자 즉시 카탈로그에 등록됩니다!

```bash
npm run dev
```

1. 터미널에서 `npm run dev` 실행 후 브라우저(`http://localhost:3000`)에서 새로고침(F5)합니다.
2. 카드를 클릭해 게임이 정상 플레이되는지, 닫기를 눌렀을 때 리소스 정돈이 잘 되는지 확인합니다.
3. 확인 후 깃허브 저장소에 커밋/푸시하거나 Pull Request를 제출합니다.
