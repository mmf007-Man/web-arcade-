# 🕹️ 웹 오락실 (Web Arcade Lounge)

> **"Single Source of Truth(games/) 기반으로 코드 불일치 제로! 바이브 코딩으로 개발자의 의도에 맞춰 함께 완성하는 No-Build 웹 오락실 플랫폼"**

`web-arcade`는 브라우저 표준 Native ES Module 기반의 순수 웹 오락실 플랫폼입니다. 모든 게임의 원본(Single Source of Truth)은 `games/` 폴더에 위치하며, `games/manifest.json`에 이름만 적어주면 자동으로 카탈로그에 게재됩니다.

또한 로컬 서버 없이 어디서나 더블클릭(`file://`)만으로 단일 파일 구동이 가능하도록 **원클릭 자동 동기화 번들러(`scripts/build.js`)**를 제공하여 코드 불일치를 원천 차단합니다.

---

## 💡 바이브 코딩(Vibe Coding) 협업 원칙

1. **적극적인 소통 & 의사 확인**: 개발자의 요청 중 추가로 확인이나 구체화가 필요한 부분이 있다면 추측하여 독단적으로 개발하지 않고, **반드시 개발자에게 먼저 물어보고 의사를 확인**합니다.
2. **개발자 의도 최우선 존중**: 임의의 변경을 지양하고 **최대한 개발자(사용자)의 설계 의도와 요청 방향에 맞춰** 개발을 구현합니다.
3. **사전 승인 없는 자동 제출(Commit/Push) 금지**: 개발자의 명시적 요청 및 확인 없이 제멋대로 git commit 및 push를 수행하지 않습니다.
4. **Single Source of Truth 준수**: 모든 게임 수정은 반드시 `games/{게임명}/` 원본 소스에서만 수행하며, `game.html`은 자동 빌드 스크립트를 통해 동기화합니다.

---

## 🌟 주요 특징

- **⚡ No-Build & 표준 모듈 로더**: `index.html`은 별도 빌드 없이 Native ES Module 동적 임포트(`import()`)로 `games/` 폴더의 게임을 직접 실행합니다.
- **🔄 코드 불일치 0% 자동 동기화**: `npm run build` 또는 `node scripts/build.js` 한 번으로 `games/`의 최신 게임 코드를 단일 파일 `game.html`로 1초 만에 자동 생성/동기화합니다.
- **🔌 간편한 확장 구조**: `games/` 하위 폴더에 새 게임 코드(`index.js`, `style.css`)를 만들고, `games/manifest.json` 배열에 게임 ID 한 줄만 추가하면 끝납니다.
- **📱 9:16 모바일 비율 최적화**: 스마트폰 세로 해상도 및 모바일 터치/제스처 조작(드래그, 스와이프, 탭)을 완벽 지원합니다.
- **💣 다채로운 미니 게임**: 지뢰찾기(`minesweeper`), 스네이크(`snake`), 테트리스(`tetris`), 똥피하기(`dodge-poop`), 사다리 탈출(`ladder-climb`) 포함.

---

## 🚀 실행 방법 (Running)

### 방법 1: 웹 서버 또는 GitHub Pages (표준 모듈 방식)
* **VS Code Live Server**: `index.html` 우클릭 후 `Open with Live Server`
* **터미널**: `python3 -m http.server 8080` 후 브라우저에서 `http://localhost:8080` 접속
* **GitHub Pages**: 저장소 배포 시 웹 브라우저에서 URL로 바로 접속 가능

### 방법 2: 서버 없이 더블클릭 단일 파일 실행
* 탐색기/Finder에서 **`game.html`을 더블클릭**하면 로컬 서버나 인터넷 연결 없이도 모든 게임이 즉시 구동됩니다.

---

## 🔄 단일 파일(game.html) 동기화 빌드

`games/` 폴더의 게임을 수정하거나 새 게임을 추가한 후, 더블클릭 단일 파일(`game.html`)을 갱신하려면 아래 명령어를 실행합니다:

```bash
npm run build
# 또는
node scripts/build.js
```

---

## ➕ 새로운 게임 추가하는 방법 (For Contributors)

### 1단계: 게임 폴더 생성
`games/` 디렉터리 아래에 게임 식별자로 사용할 영문 폴더를 만듭니다. (예: `games/flappy-bird/`)

### 2단계: `index.js` 및 `style.css` 작성
폴더 안에 `index.js`를 만들고 `meta` 객체와 `Game` 클래스를 `export` 합니다.

### 3단계: `games/manifest.json`에 1줄 추가
```json
[
  "minesweeper",
  "snake",
  "dodge-poop",
  "tetris",
  "ladder-climb",
  "flappy-bird"
]
```

### 4단계: 동기화 빌드 & 테스트
```bash
npm run build
```
`index.html`과 `game.html` 양쪽에서 정상 동작을 확인한 후 커밋합니다.

---

## 📂 프로젝트 구조

```text
web-arcade/
├── index.html                # 9:16 모바일 최적화 오락실 메인 (ES Module 로더)
├── game.html                 # [자동생성] 더블클릭 단일 통합 실행 파일
├── package.json              # 빌드/동기화 스크립트 정의
├── scripts/
│   └── build.js              # games/ -> game.html 자동 번들러 스크립트
├── css/
│   └── style.css             # 메인 아케이드 공통 테마 CSS
├── js/
│   ├── main.js               # 오락실 메인 애플리케이션 및 모달 제어
│   └── registry.js           # No-Build 동적 모듈 로더
├── games/                    # ⭐️ Single Source of Truth (모든 게임 원본)
│   ├── manifest.json         # 등록된 게임 리스트
│   ├── minesweeper/          # 지뢰찾기
│   ├── snake/                # 스네이크
│   ├── dodge-poop/           # 똥피하기
│   ├── tetris/               # 테트리스
│   └── ladder-climb/         # 사다리 탈출
└── docs/                     # 프로젝트 문서 모음
    ├── ARCHITECTURE.md       # 순수 ES 모듈 및 빌드 아키텍처
    ├── DEVELOPMENT_GUIDE.md  # 바이브 코딩 원칙 및 개발자 가이드
    ├── HISTORY.md            # 이력 관리
    └── PRD.md                # 제품 요구사항 정의서
```
