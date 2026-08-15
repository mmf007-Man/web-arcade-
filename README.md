# 🕹️ 웹 오락실 (Web Arcade Lounge)

> **"빌드 없이 실시간 개발! 바이브 코딩으로 개발자의 의도에 맞춰 함께 완성하는 순수 웹 오락실 플랫폼"**

`web-arcade`는 브라우저 표준 Native ES Module 기반의 순수 웹 오락실 플랫폼입니다. 모든 게임은 `games/` 폴더에 위치하며, `games/manifest.json`에 이름만 적어주면 자동으로 카탈로그에 게재되어 플레이할 수 있습니다.

---

## 💡 바이브 코딩(Vibe Coding) 협업 원칙

1. **적극적인 소통 & 의사 확인**: 개발자의 요청 중 추가로 확인이나 구체화가 필요한 부분이 있다면 추측하여 독단적으로 개발하지 않고, **반드시 개발자에게 먼저 물어보고 의사를 확인**합니다.
2. **개발자 의도 최우선 존중**: 임의의 변경을 지양하고 **최대한 개발자(사용자)의 설계 의도와 요청 방향에 맞춰** 개발을 구현합니다.
3. **사전 승인 없는 자동 제출(Commit/Push) 금지**: 개발자의 명시적 요청 및 확인 없이 제멋대로 git commit 및 push를 수행하지 않습니다.
4. **Single Source of Truth 준수**: 모든 게임 코드는 오직 `games/{게임명}/` 폴더에서만 관리합니다.

---

## 🌟 주요 특징

- **⚡ 빌드 없는 실시간 개발 (`npm run dev`)**: Node.js 내장 서버로 외부 패키지 설치 0개! `games/` 폴더의 코드를 수정하고 브라우저 새로고침(F5)만 누르면 즉시 반영됩니다.
- **🔌 간편한 확장 구조**: `games/` 하위 폴더에 새 게임 코드(`index.js`, `style.css`)를 만들고, `games/manifest.json` 배열에 게임 ID 한 줄만 추가하면 자동으로 로드됩니다.
- **📱 9:16 모바일 비율 최적화**: 스마트폰 세로 해상도 및 모바일 터치/제스처 조작(드래그, 스와이프, 탭)을 완벽 지원합니다.
- **💣 다채로운 미니 게임**: 지뢰찾기(`minesweeper`), 스네이크(`snake`), 테트리스(`tetris`), 똥피하기(`dodge-poop`), 사다리 탈출(`ladder-climb`) 포함.

---

## 🚀 실행 및 개발 방법 (Running & Development)

### 💻 1. 원클릭 실행 (배치 / 쉘스크립트)
* **Mac / Linux**: 터미널에서 `./start.sh` 실행 (브라우저 자동 오픈)
* **Windows**: `start.bat` 더블클릭 실행 (브라우저 자동 오픈)
* **명령어 직접 실행**: `npm run dev` 또는 `npm start`

* **종료 방법**: 터미널 창에서 `Ctrl + C`를 누르거나 터미널 창을 닫으면 종료됩니다.

### 🌐 2. 웹 배포 (GitHub Pages / Live Server)
* **GitHub Pages**: 저장소 배포 시 웹 브라우저에서 URL로 바로 접속 가능
* **VS Code Live Server**: `index.html` 우클릭 후 `Open with Live Server`

---

## ➕ 새로운 게임 추가하는 방법 (For Contributors)

### 1단계: 게임 폴더 생성 & `index.js` 작성
`games/` 디렉터리 아래에 폴더를 만들고 `index.js` 및 `style.css`를 작성합니다. (예: `games/flappy-bird/index.js`)

### 2단계: 브라우저 새로고침(F5) ➔ 자동 등록 완료! 🚀
개발 서버(`scripts/server.js`)가 `games/` 디렉터리를 **실시간으로 자동 감지(Auto Discovery)**하므로, `manifest.json`이나 다른 설정 파일을 일절 수정할 필요 없이 즉시 카탈로그에 등록됩니다!

```bash
npm run dev
```

---

## 📂 프로젝트 구조

```text
web-arcade/
├── index.html                # 9:16 모바일 최적화 오락실 메인 (ES Module 로더)
├── play.html                 # 🚀 로컬 서버(http://localhost:3000) 바로가기
├── package.json              # 실행 스크립트 정의
├── scripts/
│   └── server.js             # 제로 의존성 로컬 개발 서버
├── css/
│   └── style.css             # 메인 아케이드 공통 테마 CSS
├── js/
│   ├── main.js               # 오락실 메인 애플리케이션 및 모달 제어
│   └── registry.js           # No-Build 동적 모듈 로더
├── games/                    # ⭐️ 모든 게임 소스 (Single Source of Truth)
│   ├── manifest.json         # 등록된 게임 리스트
│   ├── minesweeper/          # 지뢰찾기
│   ├── snake/                # 스네이크
│   ├── dodge-poop/           # 똥피하기
│   ├── tetris/               # 테트리스
│   └── ladder-climb/         # 사다리 탈출
└── docs/                     # 프로젝트 문서 모음
    ├── ARCHITECTURE.md       # 순수 ES 모듈 아키텍처
    ├── DEVELOPMENT_GUIDE.md  # 바이브 코딩 원칙 및 개발자 가이드
    ├── HISTORY.md            # 이력 관리
    └── PRD.md                # 제품 요구사항 정의서
```
