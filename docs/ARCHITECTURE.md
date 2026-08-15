# 🏛️ 웹 오락실 플랫폼 아키텍처 문서 (Architecture)

## 1. 개요 (Overview)

본 플랫폼은 **Single Source of Truth(단일 진실 공급원)** 원칙을 기반으로, `games/` 디렉터리에 작성된 원본 게임 모듈 하나로 다음 두 가지 실행 방식을 모두 완벽하게 지원합니다.

1. **Native ES Module 모드 (`index.html`)**: 로컬 서버 / GitHub Pages 환경에서 빌드 없이 브라우저 Native ES Module(`import()`)로 다이렉트 실행.
2. **Standalone 단일 파일 모드 (`game.html`)**: 서버 없이 더블클릭(`file://`)만으로 실행 가능한 단일 HTML 배포 파일. (자동 번들러 `scripts/build.js`로 동기화)

---

## 2. 아키텍처 다이어그램

```
                           ┌──────────────────────────────┐
                           │   games/ (Single Source)     │
                           │   - manifest.json            │
                           │   - [game-id]/index.js       │
                           │   - [game-id]/style.css      │
                           └──────────────┬───────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
      [Target 1: ES Module 실행]               [Target 2: Standalone 빌드]
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│  index.html + js/registry.js         │     │  scripts/build.js (npm run build)    │
│  - Dynamic import('./games/...')     │     │  - Read games/ CSS & JS              │
│  - Zero Build, Browser Direct        │     │  - Inlines into self-contained HTML  │
│  - (Live Server / GitHub Pages)      │     │  - Output: game.html (더블클릭 실행) │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

---

## 3. 핵심 컴포넌트

### (1) Main Lounge Shell
- **파일**: `index.html`, `js/main.js`, `css/style.css`
- **역할**: 9:16 모바일 비율의 오락실 라운지 메인 화면 렌더링, 게임 카탈로그 그리드 구성, 게임 플레이 모달 관리.

### (2) Native Game Registry Engine
- **파일**: `js/registry.js`
- **작동 원리**:
  1. `fetch('./games/manifest.json')`을 통해 게재된 게임 ID 목록을 불러옵니다.
  2. 브라우저 내장 동적 임포트 `import('./games/' + id + '/index.js')`를 호출하여 각 게임 모듈의 `meta` 정보와 `Game` 클래스를 메모리에 등록합니다.

### (3) Standalone Builder (`scripts/build.js`)
- **역할**: `games/` 디렉터리의 원본 소스를 취합하여, 서버가 없는 로컬 환경(`file://`)에서도 즉시 실행되는 `game.html` 단일 파일을 1초 만에 자동 생성합니다.
- **특징**: 외부 의존성(Webpack, Rollup 등) 없이 Node.js 내장 모듈만으로 구동되며, 개발자의 수동 복사-붙여넣기 실수를 원천 방지합니다.

### (4) Game Module Specification
- **위치**: `games/[game-id]/index.js`
- **규약**:
  - `export const meta`: 타이틀, 아이콘, 카테고리, 저자 등 메타 정보.
  - `export class Game`: `mount(container)` 및 `unmount()` 생명주기 메서드 구현.

---

## 4. 게임 생명주기 (Lifecycle)

1. **Mounting**: 사용자가 카드를 클릭 시 `new GameClass()` 인스턴스를 생성하고 모달 내부 컨테이너 DOM을 `mount(container)`에 주입합니다.
2. **Unmounting**: 모달을 닫을 때 `unmount()`를 호출하여 실행 중이던 타이머, 인터벌, 이벤트 리스너를 정돈하고 DOM을 비웁니다.
