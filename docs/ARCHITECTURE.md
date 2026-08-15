# 🏛️ 웹 오락실 플랫폼 아키텍처 문서 (Architecture)

## 1. 개요 (Overview)

본 플랫폼은 번들러나 빌드 과정에 대한 복잡성을 제거하고, 브라우저 표준 **Native ES Module (`import()`)**과 초경량 로컬 개발 서버(`scripts/server.js`)를 통해 실시간으로 동작하도록 설계되었습니다.

---

## 2. 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    Arcade Lounge UI                         │
│       (index.html / play.html / js/main.js / css/style.css) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Native ES Game Registry Engine               │
│                     (js/registry.js)                        │
│                                                             │
│ 1. fetch('./games/manifest.json') ──> ["minesweeper", ...]  │
│ 2. Dynamic import('./games/' + id + '/index.js')            │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐
│   [Game Module 1]           ││   [Game Module 2]           ││   [Game Module 3]           │
│   games/minesweeper/        ││   games/dodge-poop/         ││   games/ladder-climb/       │
│   - meta                    ││   - meta                    ││   - meta                    │
│   - mount / unmount         ││   - mount / unmount         ││   - mount / unmount         │
└─────────────────────────────┘└─────────────────────────────┘└─────────────────────────────┘
```

---

## 3. 핵심 컴포넌트

### (1) Main Lounge Shell
- **파일**: `index.html`, `play.html`, `js/main.js`, `css/style.css`
- **역할**: 9:16 모바일 비율의 오락실 라운지 메인 화면 렌더링, 게임 카탈로그 그리드 구성, 게임 플레이 모달 관리.

### (2) Native Game Registry Engine
- **파일**: `js/registry.js`
- **작동 원리**:
  1. `fetch('./games/manifest.json')`을 통해 게재된 게임 ID 목록을 불러옵니다.
  2. 브라우저 내장 동적 임포트 `import('./games/' + id + '/index.js')`를 호출하여 각 게임 모듈의 `meta` 정보와 `Game` 클래스를 메모리에 등록합니다.

### (3) Local Dev Server (`scripts/server.js`)
- **실행**: `npm run dev` 또는 `npm start`
- **역할**: Node.js 내장 `http` 모듈로 외부 패키지 설치 0개로 `index.html`과 `games/` 디렉터리를 브라우저에 다이렉트 서빙합니다.
- **장점**: 빌드 과정 없이 `games/` 소스를 수정하고 브라우저 새로고침(F5)만으로 실시간 반영됩니다.

### (4) Game Module Specification
- **위치**: `games/[game-id]/index.js`
- **규약**:
  - `export const meta`: 타이틀, 아이콘, 카테고리, 저자 등 메타 정보.
  - `export class Game`: `mount(container)` 및 `unmount()` 생명주기 메서드 구현.

---

## 4. 게임 생명주기 (Lifecycle)

1. **Mounting**: 사용자가 카드를 클릭 시 `new GameClass()` 인스턴스를 생성하고 모달 내부 컨테이너 DOM을 `mount(container)`에 주입합니다.
2. **Unmounting**: 모달을 닫을 때 `unmount()`를 호출하여 실행 중이던 타이머, 인터벌, 이벤트 리스너를 정돈하고 DOM을 비웁니다.
