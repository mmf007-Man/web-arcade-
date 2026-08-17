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

---

### 8. ⭐️ Single Source of Truth 아키텍처 및 자동 동기화 번들러 구축
- **배경**: `games/` 원본 코드와 `game.html` 단일 파일 간의 수동 코드 복사로 인한 코드 불일치(PC 조작 미반영 등) 문제 해결 요청.
- **조치 사항**:
  - **Single Source of Truth 확립**: 모든 게임의 유일한 원본을 `games/` 디렉터리로 단일화.
  - **자동 번들러(`scripts/build.js`) 구현**: Node.js 내장 모듈만으로 외부 의존성 없이 `games/`의 CSS와 JS를 수집하여 더블클릭 실행용 `game.html`을 1초 만에 자동 생성(`npm run build`).
  - **문서화 완료**: `README.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/ARCHITECTURE.md`에 개발 및 빌드 워크플로우 명시.

---

### 9. 🚀 제로 의존성 로컬 개발 서버(`npm run dev`) 구축 및 game.html 제거
- **배경**: 매번 게임 코드를 수정할 때마다 `game.html`을 다시 빌드해야 하는 개발 피로도 및 비용 절감 요청.
- **조치 사항**:
  - **경량 로컬 서버(`scripts/server.js`) 구축**: Node.js 내장 `http` 모듈로 외부 패키지 설치 없이 즉시 실행 가능한 정적 파일 서버 구현 (`npm run dev`).
  - **`index.html` 기반 실시간 핫 서빙**: `games/` 폴더 내 소스 코드를 수정 후 브라우저 새로고침(F5)만으로 빌드 없이 즉시 반영되는 쾌적한 개발 환경 완성.
  - **동적 모듈 로더 연동**: `js/registry.js`가 `games/manifest.json`을 읽어 신규 게임 모듈을 자동 인식하도록 최적화.
  - **`game.html` 및 빌더 제거**: 중복된 대용량 단일 배포 파일과 빌드 스크립트를 제거하고, 더블클릭 바로가기용 `play.html` 제공으로 프로젝트 구조를 극도로 단순화.

---

### 10. 🎰 핀볼(Pinball Classic) 게임 개발 및 물리/사운드/레이아웃 개선
- **배경**: 우하단 스프링 발사, 점수/마이너스 장애물, 또로또롱 사운드와 신나는 노래, 모바일 지원, 정중앙 아웃홀 및 튀지 않는 미끄러짐 물리를 갖춘 핀볼 게임 요구사항 반영.
- **조치 사항**:
  - **스프링 물리 발사기**: 우하단 스프링(Plunger) 조작 및 상단 곡선 유도 아치를 이용한 부드러운 상단 필드 진입 구현.
  - **다채로운 장애물 & 점수**: ⭐ 스타 범퍼(+5점), 🟢 라운드 범퍼(+1점/+2점), 🔺 슬링샷 반사벽(+3점), 🎯 타겟 스위치(+1점), ☠️ 마이너스 트랩 해골 범퍼(-2점) 및 백 단위가 아닌 1단위 점수 체계 적용.
  - **8-Bit 아케이드 BGM & 사운드**: Web Audio API 기반 "또로또롱" 아르페지오 Chime 효과음과 110ms 쾌속 템포 칩튠 배경음악 탑재.
  - **모바일 & PC 완벽 지원**: 방향키(`A`/`D`/`Left`/`Right`/`Space`) 및 모바일 3버튼 터치 컨트롤 패드 구현.
  - **화면 정중앙(`X=180`) 아웃홀 & 슬라이딩 물리**: 좌우 완벽 대칭 플리퍼와 정중앙 아웃홀 배치, 방향키 미입력 시 공이 튀지 않고 경사면을 따라 미끄러지는 물리 엔진 탑재.
- **관련 파일**: [`games/pinball/index.js`](file:///c:/Users/xojhj/Desktop/게임/web-arcade--main/web-arcade--main/games/pinball/index.js), [`games/pinball/style.css`](file:///c:/Users/xojhj/Desktop/게임/web-arcade--main/web-arcade--main/games/pinball/style.css), [`games/manifest.json`](file:///c:/Users/xojhj/Desktop/게임/web-arcade--main/web-arcade--main/games/manifest.json), [`js/registry.js`](file:///c:/Users/xojhj/Desktop/게임/web-arcade--main/web-arcade--main/js/registry.js)




