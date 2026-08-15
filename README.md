# 🕹️ 웹 오락실 (Web Arcade Lounge)

> **"npm / 빌드 설치 0개! 누구나 게임을 만들어 함께 완성하는 No-Build 웹 오락실 플랫폼"**

`web-arcade`는 Node.js나 `npm` 설치 없이 브라우저에서 직접 구동되는 순수 웹(No-Build) 오락실 플랫폼입니다. 다른 개발자가 작성한 게임을 `games/` 폴더에 넣고 `games/manifest.json`에 이름만 적어주면 자동으로 게재되어 플레이할 수 있습니다.

---

## 🌟 주요 특징

- **⚡ No-Build & 설치 0개**: Node.js, `npm`, `vite`, `build` 명령어가 **아예 0개**입니다. `index.html`을 클릭해 브라우저로 띄우거나 깃허브에 올리기만 하면 1초 만에 실행됩니다.
- **🔌 간편한 확장 구조**: `games/` 하위 폴더에 새 게임 코드 파일(`index.js`)을 만들고, `games/manifest.json` 배열에 게임 ID 한 줄만 추가하면 끝납니다.
- **🎮 레트로-모던 오락실 UI**: 다채로운 게임 카탈로그 카드를 클릭하여 모달을 통해 즉시 플레이할 수 있습니다.
- **💣 기본 탑재 게임**: 지뢰찾기(`minesweeper`), 스네이크(`snake`) 포함.

---

## 🕹️ 탑재된 게임 목록

1. **💣 지뢰찾기 (Minesweeper)**
   - 위치: `games/minesweeper/`
   - 난이도 선택(초급/중급/상급), 타이머, 깃발 표시, Web Audio 효과음 지원.
2. **🐍 스네이크 (Snake Game)**
   - 위치: `games/snake/`
   - 방향키 조작, 먹이 섭취 및 점수 계산, 자기 몸/벽 충돌 감지.
3. **💩 똥 피하기 (Avoid Poop)**
   - 위치: `games/dodge-poop/`
   - 졸라맨 캐릭터, 똥 피하기 및 바닥 스플래시, 황금 코인 50개 수집 클리어 및 승리 댄스 모션.

---

## 🚀 실행 방법 (Running)

별도의 `npm install`이나 `npm run dev` 과정이 **전혀 필요 없습니다!**

- **방법 1**: 브라우저에서 `index.html` 파일을 바로 엽니다. (또는 Live Server 등의 기본 웹 서버)
- **방법 2**: 깃허브(GitHub Pages)에 이 저장소를 올리면 자동으로 웹상에서 사이트가 실행됩니다.

---

## ➕ 새로운 게임 추가하는 방법 (For Contributors)

새로운 개발자가 자신의 게임을 오락실에 추가할 때, **npm이나 메인 소스코드는 건드릴 필요가 없습니다.**

### 1단계: 게임 폴더 생성
`games/` 디렉터리 아래에 게임 전용 폴더를 생성합니다. (예: `games/tetris/`)

### 2단계: `index.js` 작성 (표준 인터페이스 구현)
생성한 폴더 안에 `index.js`를 만들고, `meta` 객체와 `Game` 클래스를 `export` 합니다.

```javascript
// games/tetris/index.js

export const meta = {
  id: 'tetris',
  title: '테트리스 (Tetris)',
  description: '블록을 차곡차곡 쌓아 줄을 지워보세요!',
  author: '홍길동',
  category: '퍼즐',
  icon: '🧱',
  thumbnailColor: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
  version: '1.0.0'
};

export class Game {
  mount(container) {
    container.innerHTML = `<h1>테트리스 게임 화면</h1>`;
  }

  unmount() {
    // 이벤트 리스너, 타이머 정돈 작업
  }
}
```

### 3단계: `games/manifest.json`에 1줄 추가
`games/manifest.json` 파일의 리스트 배열에 생성한 폴더 이름(게임 ID)을 추가해 줍니다:

```json
[
  "minesweeper",
  "snake",
  "tetris"
]
```

### 4단계: Commit & Push
코드를 깃허브 저장소에 `push` 또는 `Pull Request` 하면 오락실 메인 화면에 내 게임 카드가 **자동으로 노출 및 실행**됩니다! 🎉

---

## 📂 프로젝트 구조

```text
web-arcade/
├── index.html                # 오락실 메인 라운지 HTML
├── css/
│   └── style.css             # 메인 아케이드 테마 CSS
├── js/
│   ├── main.js               # 오락실 메인 애플리케이션 및 모달 제어
│   └── registry.js           # No-Build 동적 모듈 로더 (Dynamic import)
├── games/
│   ├── manifest.json         # 등록된 게임 리스트 (["minesweeper", "snake", "dodge-poop"])
│   ├── minesweeper/          # [게임 1] 지뢰찾기
│   ├── snake/                # [게임 2] 스네이크
│   ├── dodge-poop/           # [게임 3] 똥 피하기 (Avoid Poop)
│   └── [your-game]/          # [신규] 개발자가 추가할 게임 폴더
└── docs/                     # 프로젝트 문서 모음
    ├── ARCHITECTURE.md       # 순수 ES 모듈 아키텍처
    ├── DEVELOPMENT_GUIDE.md  # 게임 추가 상세 개발자 가이드
    └── PRD.md                # 제품 요구사항 정의서
```
