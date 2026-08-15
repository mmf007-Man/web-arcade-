/**
 * Game Registry Engine
 * 
 * 정적 ES 모듈 임포트를 통해 file:// 로컬 환경 및 브라우저 보안 제약 없이
 * 모든 게임 모듈을 100% 보장하며 즉시 수집합니다.
 */

import * as minesweeper from '../games/minesweeper/index.js';
import * as snake from '../games/snake/index.js';
import * as dodgePoop from '../games/dodge-poop/index.js';
import * as tetris from '../games/tetris/index.js';
import * as ladderClimb from '../games/ladder-climb/index.js';

export class GameRegistry {
  constructor() {
    this.gamesMap = new Map();
    this.isLoaded = false;
    this.initDefaultGames();
  }

  initDefaultGames() {
    const modules = [minesweeper, snake, dodgePoop, tetris, ladderClimb];
    modules.forEach(mod => {
      if (mod && mod.meta && mod.Game) {
        this.gamesMap.set(mod.meta.id, {
          meta: mod.meta,
          GameClass: mod.Game,
          id: mod.meta.id
        });
      }
    });
  }

  async loadAllGames() {
    return Array.from(this.gamesMap.values());
  }

  getGame(id) {
    return this.gamesMap.get(id);
  }
}

export const gameRegistry = new GameRegistry();
