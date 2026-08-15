# 📜 프로젝트 작업 히스토리 (Project History)

본 문서는 `web-arcade` 프로젝트의 초기 단일 게임 작성 단계부터 100% No-Build 순수 웹 오락실 플랫폼으로 개편되기까지의 전체 작업 및 결정을 기록한 히스토리 문서입니다.

---

## 📅 작업 기록 (2026년 8월 15일)

### 1. 바이브 코딩(Vibe Coding) 협업 개발 가이드라인 수록 ⭐ (New)
- **내용**: 
  - 개발자의 요청에 추가로 필요한 내용이나 의문이 있다면 추측하지 않고 **반드시 개발자에게 먼저 물어보고 의사를 확인**.
  - 독단적인 판단을 지양하고 **최대한 개발자의 원래 설계 의도와 요청 방향에 맞춰** 개발 진행.
  - 사전 명시적 승인 없는 자동 제출(Commit & Push) 금지 원칙 명시.
- **관련 파일**: [`README.md`](file:///Users/jeong-yuyeong/Documents/web-arcade/README.md), [`docs/DEVELOPMENT_GUIDE.md`](file:///Users/jeong-yuyeong/Documents/web-arcade/docs/DEVELOPMENT_GUIDE.md)

---

### 2. 🧱 테트리스(Tetris) 게임 개발 및 완성
- **특징**: 7가지 테트로미노, 회전, 소프트/하드드롭, **하단 그림자(Ghost Piece)**, **다음 블록 미리보기(NEXT)**, **화면 터치 제스처 조작(탭:회전, 스와이프:이동/드롭)** 구현.
- **관련 파일**: [`games/tetris/index.js`](file:///Users/jeong-yuyeong/Documents/web-arcade/games/tetris/index.js), [`games/tetris/style.css`](file:///Users/jeong-yuyeong/Documents/web-arcade/games/tetris/style.css), [`games/manifest.json`](file:///Users/jeong-yuyeong/Documents/web-arcade/games/manifest.json), [`game.html`](file:///Users/jeong-yuyeong/Documents/web-arcade/game.html)

---

### 3. 📱 9:16 모바일 세로 프레임 레이아웃 개편
- **내용**: PC 접속 시 모바일 프레임 중앙 정렬, 모바일 접속 시 100% 터치 세로 비율 최적화.

---

### 4. 프로젝트 성격 전환 & npm 의존성 100% 제거 (No-Build)
- **내용**:
  - `package.json`, `node_modules` 전면 제거 및 순수 브라우저 Native ES Modules (`import()`) 전환.
  - 로컬 더블클릭 단일 파일 `game.html` 구축.

---

### 5. 문서 100% 한글화 & 가이드 정비
- **[README.md](file:///Users/jeong-yuyeong/Documents/samplgame/web-arcade/README.md)**: No-Build 프로젝트 소개 및 게임 추가 방법 가이드.
- **[DEVELOPMENT_GUIDE.md](file:///Users/jeong-yuyeong/Documents/samplgame/web-arcade/docs/DEVELOPMENT_GUIDE.md)**: 기여자를 위한 4단계 게임 개발 및 `manifest.json` 등록 가이드.
- **[ARCHITECTURE.md](file:///Users/jeong-yuyeong/Documents/samplgame/web-arcade/docs/ARCHITECTURE.md)** & **[PRD.md](file:///Users/jeong-yuyeong/Documents/samplgame/web-arcade/docs/PRD.md)**: 아키텍처 및 요구사항 정의서.

---

### 6. 최상위 루트 디렉터리 명칭 변경
- **변경 전**: `/Users/jeong-yuyeong/Documents/samplgame/minesweeper`
- **변경 후**: `/Users/jeong-yuyeong/Documents/samplgame/web-arcade`

---

### 7. 똥 피하기 (Avoid Poop) 게임 탑재 및 전 플랫폼 동기화
- **배경**: 모바일 및 PC 지원, 졸라맨 캐릭터 애니메이션(달리기, 피격 쓰러짐, 승리 댄스), 똥 낙하 및 바닥 스플래시 파티클, 황금 코인 50개 목표 시스템을 갖춘 신규 아케이드 게임 요청.
- **조치 사항**:
  - `games/dodge-poop/index.js` 및 `style.css` 신규 개발.
  - `games/manifest.json`, `js/registry.js`, `game.html`, `README.md` 전 파일 카탈로그 100% 동기화.
  - Web Audio API 기반 효과음(코인 챠링, 스플래시, 피격음, 승리 팡파레) 자체 합성 내장.
