import { MinesweeperGame, DIFFICULTY_PRESETS } from './logic/minesweeperCore.js';
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
  version: '1.0.0'
};

export class Game {
  constructor() {
    this.container = null;
    this.currentDifficultyKey = 'EASY';
    this.game = null;
    this.timer = null;
    this.styleLink = null;
    this._resizeObserver = null;
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
          <button class="ms-difficulty-btn active" data-level="EASY">초급 💣~10%</button>
          <button class="ms-difficulty-btn" data-level="MEDIUM">중급 💣~24%</button>
          <button class="ms-difficulty-btn" data-level="HARD">상급 💣~40%</button>
        </div>

        <div class="ms-game-header">
          <div class="ms-status-box">
            <span>🚩</span>
            <span id="ms-mine-count">10</span>
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

    // 화면 크기 변경 시 그리드 + 셀 크기 재계산 (ge임 중이지 않을 때만)
    if (window.ResizeObserver) {
      this._resizeObserver = new ResizeObserver(() => {
        // 게임 시작 전(첫 클릭 전)에만 그리드 자동 재계산
        if (this.game.isFirstClick) {
          this._applyDynamicGrid();
        }
        this.renderBoard();
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
    // 리셋 전 실제 화면 공간 기준으로 그리드 재계산
    this._applyDynamicGrid();
    this.game.reset();
    this.timer.reset();
    const resetBtn = this.container.querySelector('#ms-reset-btn');
    if (resetBtn) resetBtn.textContent = '🙂';
    this.updateMineCountUI();
    this.updateBestScoreDisplay();
    this.renderBoard();
  }

  // 실제 화면 높이/너비를 측정하여 게임에 그리드 적용
  _applyDynamicGrid() {
    const dims = this.computeGridDimensions();
    this.game.applyGrid(dims.cols, dims.rows);
  }

  // 화면 실제 가용 공간을 측정하여 cols, rows, cellSize를 자동 계산
  computeGridDimensions() {
    const containerEl = this.container.querySelector('.ms-game-container');
    const boardEl = this.container.querySelector('#ms-board');
    if (!containerEl || !boardEl) return { cols: 9, rows: 16, cellSize: 26 };

    // 보드를 제외한 나머지 UI 요소들의 센세로 가용 높이 계산
    const containerH = containerEl.clientHeight;
    const siblingsH = Array.from(containerEl.children)
      .filter(el => el !== boardEl)
      .reduce((sum, el) => sum + el.offsetHeight, 0);
    const gapCount = containerEl.children.length - 1;
    const gapTotal = 16 * gapCount; // CSS gap: 16px
    const availableH = Math.max(100, containerH - siblingsH - gapTotal - 8);
    const availableW = Math.max(100, containerEl.clientWidth - 16); // 패딩 8px 좌우

    // 개수에 따라 세포시즈를 계산: 최소 24px, 최대 36px
    // 목표: 유효한 캠 제거 후 알맞는 셀 수를 체움
    const CELL_MIN = 24;
    const CELL_MAX = 36;
    const GAP = 2;

    // 사용 가능 공간에 맞는 최대 열/행 계산 (최소 셀 기준)
    const maxCols = Math.floor((availableW + GAP) / (CELL_MIN + GAP));
    const maxRows = Math.floor((availableH + GAP) / (CELL_MIN + GAP));

    // 끝 그리드 크기로 백�하지 않도록 클램프
    const cols = Math.max(6, Math.min(20, maxCols));
    const rows = Math.max(8, Math.min(30, maxRows));

    // 그 가용 공간에 배비되는 실제 셀 크기
    const cellByW = Math.floor((availableW - GAP * (cols - 1)) / cols);
    const cellByH = Math.floor((availableH - GAP * (rows - 1)) / rows);
    const cellSize = Math.max(CELL_MIN, Math.min(CELL_MAX, Math.min(cellByW, cellByH)));

    return { cols, rows, cellSize };
  }

  renderBoard() {
    const boardEl = this.container.querySelector('#ms-board');
    if (!boardEl) return;

    // 화면 크기에 맞는 셀 크기 동적 계산
    const { cols, rows, cellSize } = this.computeGridDimensions();
    boardEl.style.setProperty('--ms-cell-size', `${cellSize}px`);
    boardEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    boardEl.innerHTML = '';

    for (let r = 0; r < this.game.rows; r++) {
      for (let c = 0; c < this.game.cols; c++) {
        const cell = this.game.board[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'ms-cell';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

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

        cellEl.addEventListener('click', () => this.handleCellClick(r, c));
        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.handleCellRightClick(r, c);
        });

        boardEl.appendChild(cellEl);
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
    this.renderBoard();

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
    this.renderBoard();
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
