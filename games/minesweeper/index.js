import { MinesweeperGame, DIFFICULTY_PRESETS } from './logic/minesweeperCore.js?v=1.0.7';
import { GameTimer } from './logic/timer.js';
import { soundFx } from './utils/sound.js';
import { getBestScores, saveBestScore } from './utils/storage.js';

export const meta = {
  id: 'minesweeper',
  title: '지뢰찾기 (Minesweeper)',
  description: '지뢰를 피해 모든 안전한 칸을 열어보세요! 추억의 명작 스릴 게임',
  author: 'Antigravity Team',
  category: '퍼즐 / 전략',
  icon: '💣',
  thumbnailColor: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
  version: '1.0.7'
};

export class Game {
  constructor() {
    this.container = null;
    this.currentDifficultyKey = 'EASY';
    this.game = null;
    this.timer = null;
    this.styleLink = null;
    this._resizeObserver = null;
    this.cellElements = [];
    this.longPressTimer = null;
  }

  loadStyle() {
    if (!document.getElementById('style-minesweeper')) {
      const link = document.createElement('link');
      link.id = 'style-minesweeper';
      link.rel = 'stylesheet';
      link.href = new URL('./style.css', import.meta.url).href;
      document.head.appendChild(link);
      this.styleLink = link;
    }
  }

  mount(container) {
    this.loadStyle();
    this.container = container;
    this.game = new MinesweeperGame(DIFFICULTY_PRESETS[this.currentDifficultyKey]);
    this.timer = new GameTimer((sec) => this.updateTimerUI(sec));
    this.initUI();
    this.resetGame();
  }

  unmount() {
    if (this.timer) {
      this.timer.stop();
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  initUI() {
    this.container.innerHTML = `
      <div class="ms-game-container">
        <div class="ms-difficulty-selector">
          <button class="ms-difficulty-btn active" data-level="EASY">초급 (9×9)</button>
          <button class="ms-difficulty-btn" data-level="MEDIUM">중급 (12×12)</button>
          <button class="ms-difficulty-btn" data-level="HARD">상급 (15×15)</button>
        </div>

        <div class="ms-game-header">
          <div class="ms-status-box">
            <span>🚩</span>
            <span id="ms-mine-count">15</span>
          </div>
          
          <button class="ms-reset-btn" id="ms-reset-btn">🙂</button>

          <div class="ms-status-box">
            <span>⏱️</span>
            <span id="ms-timer">000</span>
          </div>
        </div>

        <div class="ms-board" id="ms-board"></div>

        <div id="ms-best-score" style="font-size: 0.85rem; color: #94a3b8;">
          🏆 최고 기록: <span id="ms-best-score-val">없음</span>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.ms-difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const level = e.target.dataset.level;
        this.changeDifficulty(level);
      });
    });

    this.container.querySelector('#ms-reset-btn').addEventListener('click', () => {
      this.resetGame();
    });

    this.updateBestScoreDisplay();

    if (window.ResizeObserver) {
      this._resizeObserver = new ResizeObserver(() => {
        this.adjustCellSize();
      });
      const containerEl = this.container.querySelector('.ms-game-container');
      if (containerEl) this._resizeObserver.observe(containerEl);
    }
  }

  changeDifficulty(levelKey) {
    this.currentDifficultyKey = levelKey;
    this.container.querySelectorAll('.ms-difficulty-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === levelKey);
    });

    this.game.setDifficulty(DIFFICULTY_PRESETS[levelKey]);
    this.resetGame();
  }

  resetGame() {
    this.game.reset();
    this.timer.reset();
    const resetBtn = this.container.querySelector('#ms-reset-btn');
    if (resetBtn) resetBtn.textContent = '🙂';
    this.updateMineCountUI();
    this.updateBestScoreDisplay();
    this.buildBoardDOM();
    this.updateBoardDOM();
  }

  computeCellSize() {
    const containerEl = this.container.querySelector('.ms-game-container');
    const boardEl = this.container.querySelector('#ms-board');
    if (!containerEl || !boardEl) return 30;

    const containerH = containerEl.clientHeight || 500;
    const siblingsH = Array.from(containerEl.children)
      .filter(el => el !== boardEl)
      .reduce((sum, el) => sum + el.offsetHeight, 0);
    const gapCount = containerEl.children.length - 1;
    const gapTotal = 16 * gapCount;
    const availableH = Math.max(150, containerH - siblingsH - gapTotal - 10);
    const availableW = Math.max(150, (containerEl.clientWidth || 340) - 16);

    const GAP = 2;
    const cellByW = Math.floor((availableW - GAP * (this.game.cols - 1)) / this.game.cols);
    const cellByH = Math.floor((availableH - GAP * (this.game.rows - 1)) / this.game.rows);

    return Math.max(18, Math.min(38, Math.min(cellByW, cellByH)));
  }

  adjustCellSize() {
    const boardEl = this.container.querySelector('#ms-board');
    if (!boardEl) return;
    const cellSize = this.computeCellSize();
    boardEl.style.setProperty('--ms-cell-size', `${cellSize}px`);
    boardEl.style.gridTemplateColumns = `repeat(${this.game.cols}, ${cellSize}px)`;
  }

  buildBoardDOM() {
    const boardEl = this.container.querySelector('#ms-board');
    if (!boardEl) return;

    this.adjustCellSize();
    boardEl.innerHTML = '';
    this.cellElements = Array.from({ length: this.game.rows }, () => []);

    for (let r = 0; r < this.game.rows; r++) {
      for (let c = 0; c < this.game.cols; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'ms-cell';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        let isLongPress = false;

        const handlePress = () => {
          isLongPress = false;
          this.longPressTimer = setTimeout(() => {
            isLongPress = true;
            this.handleCellRightClick(r, c);
          }, 350);
        };

        const handleRelease = (e) => {
          if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
          }
          if (isLongPress) {
            e.preventDefault();
            return;
          }
        };

        cellEl.addEventListener('click', (e) => {
          if (isLongPress) {
            e.preventDefault();
            return;
          }
          this.handleCellClick(r, c);
        });

        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.handleCellRightClick(r, c);
        });

        cellEl.addEventListener('touchstart', handlePress, { passive: true });
        cellEl.addEventListener('touchend', handleRelease);
        cellEl.addEventListener('touchmove', () => {
          if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
          }
        }, { passive: true });

        this.cellElements[r][c] = cellEl;
        boardEl.appendChild(cellEl);
      }
    }
  }

  updateBoardDOM() {
    for (let r = 0; r < this.game.rows; r++) {
      for (let c = 0; c < this.game.cols; c++) {
        const cell = this.game.board[r][c];
        const cellEl = this.cellElements[r]?.[c];
        if (!cellEl) continue;

        cellEl.className = 'ms-cell';
        cellEl.textContent = '';
        delete cellEl.dataset.count;

        if (cell.isRevealed) {
          cellEl.classList.add('revealed');
          if (cell.isMine) {
            cellEl.classList.add('mine');
            cellEl.textContent = '💣';
          } else if (cell.neighborMines > 0) {
            cellEl.dataset.count = cell.neighborMines;
            cellEl.textContent = cell.neighborMines;
          }
        } else if (cell.isFlagged) {
          cellEl.classList.add('flagged');
          cellEl.textContent = '🚩';
        }
      }
    }
  }

  handleCellClick(r, c) {
    if (this.game.isGameOver || this.game.board[r][c].isFlagged) return;

    if (this.game.isFirstClick) {
      this.timer.start();
    }

    const wasSuccess = this.game.revealCell(r, c);
    if (!wasSuccess) return;

    soundFx.playClick();
    this.updateBoardDOM();

    if (this.game.isGameOver) {
      this.timer.stop();
      if (this.game.isWin) {
        soundFx.playWin();
        const resetBtn = this.container.querySelector('#ms-reset-btn');
        if (resetBtn) resetBtn.textContent = '😎';
        const isNewRecord = saveBestScore(this.currentDifficultyKey, this.timer.seconds);
        this.updateBestScoreDisplay();
        alert(isNewRecord ? `🎉 축하합니다! 최고 기록 달성! (${this.timer.seconds}초)` : `🎉 승리했습니다! (${this.timer.seconds}초)`);
      } else {
        soundFx.playExplosion();
        const resetBtn = this.container.querySelector('#ms-reset-btn');
        if (resetBtn) resetBtn.textContent = '😵';
      }
    }
  }

  handleCellRightClick(r, c) {
    if (this.game.isGameOver || this.game.board[r][c].isRevealed) return;

    this.game.toggleFlag(r, c);
    soundFx.playFlag();
    this.updateMineCountUI();
    this.updateBoardDOM();
  }

  updateTimerUI(sec) {
    const timerEl = this.container.querySelector('#ms-timer');
    if (timerEl) {
      timerEl.textContent = String(sec).padStart(3, '0');
    }
  }

  updateMineCountUI() {
    const mineCountEl = this.container.querySelector('#ms-mine-count');
    if (mineCountEl) {
      const remainingMines = this.game.totalMines - this.game.flagCount;
      mineCountEl.textContent = remainingMines;
    }
  }

  updateBestScoreDisplay() {
    const scores = getBestScores();
    const currentBest = scores[this.currentDifficultyKey];
    const scoreValEl = this.container.querySelector('#ms-best-score-val');
    if (scoreValEl) {
      scoreValEl.textContent = currentBest !== null ? `${currentBest}초` : '없음';
    }
  }
}
