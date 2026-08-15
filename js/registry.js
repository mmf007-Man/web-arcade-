/**
 * Game Registry Engine
 * 
 * `games/manifest.json`에 등록된 게임 목록을 읽어와
 * 브라우저 Native ES Module dynamic import(`import()`)를 통해 게임 모듈들을 수집합니다.
 * 별도의 번들/빌드 단계 없이 소스 코드 변경 사항이 실시간으로 즉시 반영됩니다.
 */

export class GameRegistry {
  constructor() {
    this.gamesMap = new Map();
    this.isLoaded = false;
  }

  async loadAllGames() {
    if (this.isLoaded) return Array.from(this.gamesMap.values());

    let gameIds = ['minesweeper', 'snake', 'dodge-poop', 'tetris', 'ladder-climb'];

    try {
      const response = await fetch('./games/manifest.json');
      if (response.ok) {
        gameIds = await response.json();
      }
    } catch (err) {
      console.warn('[Arcade Registry] manifest fetch failed, using default list:', err);
    }

    for (const id of gameIds) {
      try {
        const module = await import(`../games/${id}/index.js`);
        if (module && module.meta && module.Game) {
          this.gamesMap.set(module.meta.id, {
            meta: module.meta,
            GameClass: module.Game,
            id: module.meta.id
          });
        }
      } catch (err) {
        console.error(`[Arcade Registry] Failed to load game module: ${id}`, err);
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
