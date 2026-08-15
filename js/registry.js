/**
 * 순수 웹(No-Build) Game Registry Engine
 * 
 * `games/manifest.json` 파일에 등록된 게임 목록 배열을 fetch하고,
 * 브라우저 Native ES Module dynamic import(`import()`)를 이용해 게임 모듈들을 수집합니다.
 * 빌드 과정(npm, vite 등)이 100% 필요 없으며 브라우저에서 직접 구동됩니다.
 */

export class GameRegistry {
  constructor() {
    this.gamesMap = new Map();
    this.isLoaded = false;
  }

  async loadAllGames() {
    if (this.isLoaded) return Array.from(this.gamesMap.values());

    let gameIds = ["minesweeper", "snake", "dodge-poop"];

    try {
      const response = await fetch('./games/manifest.json');
      if (response.ok) {
        gameIds = await response.json();
      }
    } catch (err) {
      console.warn('[Arcade Registry] file:// 프로토콜 또는 fetch 제한 감지. 내장 목록으로 구동합니다.', err);
    }

    for (const id of gameIds) {
      try {
        const modulePath = `../games/${id}/index.js`;
        const module = await import(modulePath);

        if (module.meta && module.Game) {
          this.gamesMap.set(module.meta.id, {
            meta: module.meta,
            GameClass: module.Game,
            id
          });
        }
      } catch (err) {
        console.error(`[Arcade Registry] 게임 모듈 로딩 실패: ${id}`, err);
      }
    }

    this.isLoaded = true;
    return Array.from(this.gamesMap.values());
  }

  getGame(id) {
    return this.gamesMap.get(id);
  }
}

export const gameRegistry = new GameRegistry();
