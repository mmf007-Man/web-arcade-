# 🏛️ 순수 웹(No-Build) 오락실 아키텍처 문서 (Architecture)

## 1. 개요 (Overview)

본 플랫폼은 `npm`, Node.js 번들러(Vite, Webpack 등)에 대한 의존성을 100% 제거하고, 브라우저 표준 **Native ES Modules (`import()`)** 및 **Fetch API**를 사용하여 동작하도록 설계되었습니다.

---

## 2. 아키텍처 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Arcade Lounge UI                         │
│             (index.html / js/main.js / css/style.css)       │
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
┌─────────────────────────────┐┌─────────────────────────────┐
│   [Game Module 1]           ││   [Game Module 2]           │
│   games/minesweeper/        ││   games/snake/              │
│   - meta                    ││   - meta                    │
│   - mount / unmount         ││   - mount / unmount         │
└─────────────────────────────┘└─────────────────────────────┘
```

### (1) Main Lounge Shell
- **파일**: `index.html`, `js/main.js`, `css/style.css`
- **역할**: 오락실 라운지 메인 화면 렌더링, 게임 카탈로그 그리드 구성, 게임 플레이 모달 관리.

### (2) Native Game Registry Engine
- **파일**: `js/registry.js`
- **작동 원리**:
  1. `fetch('./games/manifest.json')`을 통해 게재된 게임 ID 목록을 불러옵니다.
  2. 브라우저 내장 동적 임포트 `import('./games/' + id + '/index.js')`를 호출하여 각 게임 모듈의 `meta` 정보와 `Game` 클래스를 인메모리에 등록합니다.

### (3) Game Module Specification
- **위치**: `games/[game-id]/index.js`
- **규약**:
  - `export const meta`: 타이틀, 아이콘, 카테고리, 저자 등 메타 정보.
  - `export class Game`: `mount(container)` 및 `unmount()` 생명주기 메서드 구현.

---

## 3. 게임 생명주기 (Lifecycle)

1. **Mounting**: 사용자가 카드를 클릭 시 `new GameClass()` 인스턴스를 생성하고 모달 내부 컨테이너 DOM을 `mount(container)`에 주입합니다.
2. **Unmounting**: 모달을 닫을 때 `unmount()`를 호출하여 실행 중이던 타이머, 인터벌, 이벤트 리스너를 정돈하고 DOM을 비웁니다.
