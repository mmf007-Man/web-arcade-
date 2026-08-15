# 🕹️ 웹 오락실 (Web Arcade Lounge)

> **"npm / 빌드 설치 0개! 바이브 코딩으로 개발자의 의도에 맞춰 함께 완성하는 No-Build 웹 오락실 플랫폼"**

`web-arcade`는 Node.js나 `npm` 설치 없이 브라우저에서 직접 구동되는 순수 웹(No-Build) 오락실 플랫폼입니다. 다른 개발자가 작성한 게임을 `games/` 폴더에 넣고 `games/manifest.json`에 이름만 적어주면 자동으로 게재되어 플레이할 수 있습니다.

---

## 💡 바이브 코딩(Vibe Coding) 협업 원칙

1. **적극적인 소통 & 의사 확인**: 개발자의 요청 중 추가로 확인이나 구체화가 필요한 부분이 있다면 추측하여 독단적으로 개발하지 않고, **반드시 개발자에게 먼저 물어보고 의사를 확인**합니다.
2. **개발자 의도 최우선 존중**: 임의의 변경을 지양하고 **최대한 개발자(사용자)의 설계 의도와 요청 방향에 맞춰** 개발을 구현합니다.
3. **사전 승인 없는 자동 제출(Commit/Push) 금지**: 개발자의 명시적 요청 및 확인 없이 제멋대로 git commit 및 push를 수행하지 않습니다.

---

## 🌟 주요 특징

- **⚡ No-Build & 설치 0개**: Node.js, `npm`, `vite`, `build` 명령어가 **아예 0개**입니다. `index.html`을 클릭해 브라우저로 띄우거나 깃허브에 올리기만 하면 1초 만에 실행됩니다.
- **🔌 간편한 확장 구조**: `games/` 하위 폴더에 새 게임 코드 파일(`index.js`)을 만들고, `games/manifest.json` 배열에 게임 ID 한 줄만 추가하면 끝납니다.
- **📱 9:16 모바일 비율 최적화**: 스마트폰 세로 해상도 및 모바일 터치/제스처 조작(스와이프, 탭)을 완벽 지원합니다.
- **💣 다채로운 미니 게임**: 지뢰찾기(`minesweeper`), 스네이크(`snake`), 테트리스(`tetris`), 똥피하기(`dodge-poop`) 포함.

---

## 🚀 실행 방법 (Running)

별도의 `npm install`이나 `npm run dev` 과정이 **전혀 필요 없습니다!**

- **방법 1**: 브라우저에서 `index.html` 또는 `game.html`(더블클릭 단일 파일)을 바로 엽니다.
- **방법 2**: 깃허브(GitHub Pages)에 이 저장소를 올리면 자동으로 웹상에서 사이트가 실행됩니다.

---

## ➕ 새로운 게임 추가하는 방법 (For Contributors)

### 1단계: 게임 폴더 생성
`games/` 디렉터리 아래에 게임 전용 폴더를 생성합니다. (예: `games/flappy-bird/`)

### 2단계: `index.js` 작성 (표준 인터페이스 구현)
생성한 폴더 안에 `index.js`를 만들고, `meta` 객체와 `Game` 클래스를 `export` 합니다.

### 3단계: `games/manifest.json`에 1줄 추가
```json
[
  "minesweeper",
  "snake",
  "tetris",
  "flappy-bird"
]
```

---

## 📂 프로젝트 구조

```text
web-arcade/
├── index.html                # 9:16 모바일 최적화 오락실 HTML
├── game.html                 # 더블클릭 단일 통합 실행 파일
├── css/
│   └── style.css             # 메인 아케이드 테마 CSS
├── js/
│   ├── main.js               # 오락실 메인 애플리케이션 및 모달 제어
│   └── registry.js           # No-Build 동적 모듈 로더
├── games/
│   ├── manifest.json         # 등록된 게임 리스트
│   ├── minesweeper/          # 지뢰찾기
│   ├── snake/                # 스네이크
│   ├── tetris/               # 테트리스
│   └── dodge-poop/           # 똥피하기
└── docs/                     # 프로젝트 문서 모음
    ├── ARCHITECTURE.md       # 순수 ES 모듈 아키텍처
    ├── DEVELOPMENT_GUIDE.md  # 바이브 코딩 원칙 및 개발자 가이드
    ├── HISTORY.md            # 이력 관리
    └── PRD.md                # 제품 요구사항 정의서
```
