# 📜 프로젝트 작업 히스토리 (Project History)

본 문서는 `web-arcade` 프로젝트의 초기 단일 게임 작성 단계부터 100% No-Build 순수 웹 오락실 플랫폼으로 개편되기까지의 전체 작업 및 결정을 기록한 히스토리 문서입니다.

---

## 📅 작업 기록 (2026년 8월 15일)

### 1. 프로젝트 성격 전환 (지뢰찾기 단일 게임 ➔ 웹 오락실 플랫폼)
- **배경**: 기존에는 단일 지뢰찾기 웹 게임 프로젝트였으나, 여러 개발자가 독립적으로 게임을 작성하여 제출(Submit)하면 메인 코드 수정 없이 지속적으로 게임이 추가되는 "웹 오락실 라운지"로 성격을 전환.
- **방향성**: 개발자들이 자신만의 게임 폴더를 커밋/PR 하는 것만으로 오락실 메인 화면에 카드가 자동으로 생성되고 실행되도록 설계.

---

### 2. npm 의존성 100% 제거 (No-Build 순수 웹 개편)
- **배경**: 초기에는 Vite 번들러 기반으로 구축했으나, `npm install`이나 빌드 명령어 없이 브라우저에서 1초 만에 바로 가동되기를 원함.
- **조치 사항**:
  - `package.json`, `node_modules`, `vite.config.js` 등 npm 및 번들러 관련 파일 전면 삭제.
  - 브라우저 표준 **Native ES Modules (`import()`)** 및 **Fetch API** 기반의 100% No-Build 아키텍처로 개편.
  - `games/manifest.json` 배열에 게임 ID만 등록하면 자동 수집되도록 구현.

---

### 3. 단일 실행 파일 `game.html` 복원 및 독립 구동 지원
- **배경**: 로컬 컴퓨터 환경에서 서버 실행 없이 `file:///`로 바로 파일만 더블 클릭해서 열었을 때, 브라우저 보안(CORS) 에러 없이 `index.html`과 100% 동일한 오락실 화면 및 게임 플레이가 가능하기를 요구.
- **조치 사항**:
  - 모든 메인 UI, 지뢰찾기 모듈, 스네이크 모듈을 단일 Inline 스크립트로 내장한 [`game.html`](file:///Users/jeong-yuyeong/Documents/samplgame/web-arcade/game.html) 파일 새로 작성.
  - 서버나 설치 0개로 `game.html` 더블 클릭만으로 100% 오락실 메인 화면 및 모든 게임 즉시 가동.

---

### 4. 게임 탑재 및 폴더 구조 정비
- **지뢰찾기 (`games/minesweeper/`)**: 난이도 선택(초급/중급/상급), 타이머, 깃발, 사운드가 포함된 첫 번째 게임 모듈로 이관.
- **스네이크 (`games/snake/`)**: 동적 게임 수집 및 2번째 출품작 검증용 게임 모듈 추가 작성.

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
