# 📄 제품 요구사항 정의서 (PRD - No-Build 버전)

## 1. 비전 (Vision)
npm이나 빌드 설치 과정 없이 브라우저에서 직접 실행되는 **"100% No-Build 오픈 플러그앤플레이 웹 오락실 플랫폼"**을 구축한다.

---

## 2. 목표 (Goals)

1. **설치 과정 0개**: Node.js/npm 패키지 설치 및 빌드 과정 배제.
2. **간편한 게재 방식**: `games/` 폴더에 코드 추가 후 `games/manifest.json`에 ID 1줄 등록만으로 자동 출품.
3. **완벽한 웹 호환성**: GitHub Pages 및 모든 모던 브라우저(Chrome, Safari, Edge, Firefox)에서 별도 빌드 없이 즉시 가동.

---

## 3. 기능 요구사항 (Requirements)

| 번호 | 기능 | 설명 | 우선순위 |
| :--- | :--- | :--- | :--- |
| **FR-1** | No-Build 매니페스트 감지 | `games/manifest.json`을 fetch하여 게임 모듈 동적 임포트 | P0 |
| **FR-2** | 오락실 라운지 메인 UI | 레트로-모던 분위기 카탈로그 그리드 렌더링 | P0 |
| **FR-3** | 게임 뷰어 모달 | 게임 선택 시 모달에 `mount`, 닫을 때 `unmount` 호출 | P0 |
| **FR-4** | 기본 게임 탑재 | 지뢰찾기(`minesweeper`), 스네이크(`snake`) 탑재 | P0 |
| **FR-5** | 배포 가용성 | 브라우저 직접 실행 및 GitHub Pages 즉시 실행 보장 | P0 |
