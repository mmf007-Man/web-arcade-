export const meta = {
  id: 'tetris',
  title: '테트리스 (Tetris)',
  description: '블록을 회전시키고 가득 채워 줄을 지워보세요! 화면 터치 제스처(탭:회전, 스와이프:이동/드롭) 지원',
  author: 'Arcade Contributor',
  category: '퍼즐 / 아케이드',
  icon: '🧱',
  thumbnailColor: 'linear-gradient(135deg, #a855f7 0%, #581c87 100%)',
  version: '1.2.0'
};

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 18;

const SHAPES = [
  [],
  [[1, 1, 1, 1]],         // I (Cyan)
  [[1, 0, 0], [1, 1, 1]], // J (Blue)
  [[0, 0, 1], [1, 1, 1]], // L (Orange)
  [[1, 1], [1, 1]],       // O (Yellow)
  [[0, 1, 1], [1, 1, 0]], // S (Green)
  [[0, 1, 0], [1, 1, 1]], // T (Purple)
  [[1, 1, 0], [0, 1, 1]]  // Z (Red)
];

const COLORS = [
  'none',
  '#06b6d4',
  '#3b82f6',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#a855f7',
  '#ef4444'
];

export class Game {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.nextCanvas = null;
    this.nextCtx = null;
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.score = 0;
    this.lines = 0;
    this.currentPiece = null;
    this.nextPiece = null;
    this.gameInterval = null;
    this.isGameOver = false;

    // 터치 제스처 트래킹
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  loadStyle() {
    if (!document.getElementById('style-tetris')) {
      const link = document.createElement('link');
      link.id = 'style-tetris';
      link.rel = 'stylesheet';
      link.href = new URL('./style.css', import.meta.url).href;
      document.head.appendChild(link);
    }
  }

  mount(container) {
    this.loadStyle();
    this.container = container;
    this.initUI();
    this.resetGame();
  }

  unmount() {
    this.stopGame();
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  initUI() {
    this.container.innerHTML = `
      <div class="tetris-container">
        <div class="tetris-dashboard">
          <div class="tetris-score-info">
            <span>점수: <span id="t-score">0</span></span>
            <span>줄: <span id="t-lines">0</span></span>
          </div>
          <div class="tetris-next-box">
            <span>NEXT</span>
            <canvas id="tetris-next-canvas" width="60" height="60" class="tetris-next-canvas"></canvas>
          </div>
        </div>

        <canvas id="tetris-canvas" width="180" height="360" class="tetris-canvas"></canvas>

        <div class="tetris-gesture-guide">
          <p>👇 <b>화면 터치 제스처 조작</b></p>
          <ul>
            <li>👆 <b>짧은 탭</b>: 블록 회전</li>
            <li>👈👉 <b>좌/우 스와이프</b>: 블록 이동</li>
            <li>👇 <b>아래 스와이프</b>: 하드 드롭</li>
          </ul>
        </div>

        <button class="t-btn t-btn-wide" id="t-btn-restart">다시 시작</button>
      </div>
    `;

    this.canvas = this.container.querySelector('#tetris-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.nextCanvas = this.container.querySelector('#tetris-next-canvas');
    this.nextCtx = this.nextCanvas.getContext('2d');

    this.container.querySelector('#t-btn-restart').addEventListener('click', () => this.resetGame());

    // 화면 터치 제스처 이벤트 등록
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });

    window.addEventListener('keydown', this.handleKeyDown);
  }

  handleTouchStart(e) {
    if (this.isGameOver) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  handleTouchEnd(e) {
    if (this.isGameOver) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const duration = Date.now() - this.touchStartTime;

    const minSwipeDist = 25;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > minSwipeDist) {
        this.moveRight();
      } else if (deltaX < -minSwipeDist) {
        this.moveLeft();
      }
    } else {
      if (deltaY > minSwipeDist) {
        this.hardDrop();
      } else if (Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15 && duration < 300) {
        this.rotate();
      }
    }
  }

  resetGame() {
    this.stopGame();
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.score = 0;
    this.lines = 0;
    this.isGameOver = false;
    this.nextPiece = this.generateRandomPiece();
    this.updateScoreUI();
    this.spawnPiece();
    this.gameInterval = setInterval(() => this.moveDown(), 500);
  }

  stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  generateRandomPiece() {
    const typeId = Math.floor(Math.random() * 7) + 1;
    const shape = SHAPES[typeId];
    return {
      typeId,
      shape,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: 0
    };
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.generateRandomPiece();

    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
      this.isGameOver = true;
      this.stopGame();
      alert(`🎮 Game Over! 최종 점수: ${this.score}`);
    }

    this.drawNextPiece();
  }

  handleKeyDown(e) {
    if (this.isGameOver) return;
    if (e.key === 'ArrowLeft') {
      this.moveLeft();
    } else if (e.key === 'ArrowRight') {
      this.moveRight();
    } else if (e.key === 'ArrowDown') {
      this.moveDown();
    } else if (e.key === 'ArrowUp' || e.key === 'z') {
      this.rotate();
    } else if (e.key === ' ') {
      e.preventDefault();
      this.hardDrop();
    }
  }

  moveLeft() {
    if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x--;
      this.draw();
    }
  }

  moveRight() {
    if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shape)) {
      this.currentPiece.x++;
      this.draw();
    }
  }

  moveDown() {
    if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
      this.currentPiece.y++;
      this.draw();
    } else {
      this.lockPiece();
      this.clearLines();
      this.spawnPiece();
      this.draw();
    }
  }

  hardDrop() {
    while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
      this.currentPiece.y++;
    }
    this.lockPiece();
    this.clearLines();
    this.spawnPiece();
    this.draw();
  }

  rotate() {
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map(row => row[i]).reverse()
    );
    if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
      this.currentPiece.shape = rotated;
      this.draw();
    }
  }

  checkCollision(x, y, shape) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && this.board[newY][newX] !== 0) return true;
        }
      }
    }
    return false;
  }

  getGhostY() {
    if (!this.currentPiece) return 0;
    let ghostY = this.currentPiece.y;
    while (!this.checkCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.shape)) {
      ghostY++;
    }
    return ghostY;
  }

  lockPiece() {
    const { x, y, shape, typeId } = this.currentPiece;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          if (y + r >= 0) {
            this.board[y + r][x + c] = typeId;
          }
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every(cell => cell !== 0)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(COLS).fill(0));
        linesCleared++;
        r++;
      }
    }

    if (linesCleared > 0) {
      const scoreMap = [0, 100, 300, 500, 800];
      this.score += scoreMap[linesCleared] || linesCleared * 200;
      this.lines += linesCleared;
      this.updateScoreUI();
    }
  }

  updateScoreUI() {
    const scoreEl = this.container.querySelector('#t-score');
    const linesEl = this.container.querySelector('#t-lines');
    if (scoreEl) scoreEl.textContent = this.score;
    if (linesEl) linesEl.textContent = this.lines;
  }

  drawNextPiece() {
    if (!this.nextPiece || !this.nextCtx) return;
    this.nextCtx.fillStyle = '#0f172a';
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    const shape = this.nextPiece.shape;
    const color = COLORS[this.nextPiece.typeId];
    const size = 12;
    const offsetX = (this.nextCanvas.width - shape[0].length * size) / 2;
    const offsetY = (this.nextCanvas.height - shape.length * size) / 2;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          this.nextCtx.fillStyle = color;
          this.nextCtx.fillRect(offsetX + c * size, offsetY + r * size, size - 1, size - 1);
        }
      }
    }
  }

  draw() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.board[r][c] !== 0) {
          this.drawBlock(c, r, COLORS[this.board[r][c]], 1.0);
        }
      }
    }

    if (this.currentPiece) {
      const ghostY = this.getGhostY();
      const { x, shape, typeId } = this.currentPiece;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            this.drawGhostBlock(x + c, ghostY + r, COLORS[typeId]);
          }
        }
      }
    }

    if (this.currentPiece) {
      const { x, y, shape, typeId } = this.currentPiece;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            this.drawBlock(x + c, y + r, COLORS[typeId], 1.0);
          }
        }
      }
    }
  }

  drawGhostBlock(x, y, color) {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
  }

  drawBlock(x, y, color, alpha = 1.0) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    this.ctx.restore();
  }
}
