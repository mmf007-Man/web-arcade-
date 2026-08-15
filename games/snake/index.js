export const meta = {
  id: 'snake',
  title: '스네이크 (Snake Game)',
  description: '먹이를 먹으며 몸집을 키우세요! 자신의 몸이나 벽에 부딪히지 않게 조심하세요.',
  author: 'Arcade Contributor',
  category: '아케이드 / 액션',
  icon: '🐍',
  thumbnailColor: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
  version: '1.0.0'
};

export class Game {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 20;
    this.tileCount = 15;
    this.snake = [{ x: 7, y: 7 }];
    this.food = { x: 3, y: 3 };
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.gameInterval = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  loadStyle() {
    if (!document.getElementById('style-snake')) {
      const link = document.createElement('link');
      link.id = 'style-snake';
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
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  initUI() {
    this.container.innerHTML = `
      <div class="snake-container">
        <div class="snake-score-board">
          <span>점수: <span id="snake-score">0</span></span>
        </div>
        <canvas id="snake-canvas" width="300" height="300" class="snake-canvas"></canvas>
        <div class="snake-controls">
          <button class="snake-btn" id="snake-restart-btn">다시 시작</button>
        </div>
        <p style="font-size: 0.8rem; color: #94a3b8;">키보드 방향키(↑ ↓ ← →)로 뱀을 조종하세요.</p>
      </div>
    `;

    this.canvas = this.container.querySelector('#snake-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.container.querySelector('#snake-restart-btn').addEventListener('click', () => {
      this.resetGame();
    });

    window.addEventListener('keydown', this.handleKeyDown);
  }

  resetGame() {
    this.stopGame();
    this.snake = [{ x: 7, y: 7 }];
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.updateScoreUI();
    this.placeFood();
    this.gameInterval = setInterval(() => this.gameLoop(), 120);
  }

  stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  placeFood() {
    this.food = {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount)
    };
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowUp' && this.dy === 0) {
      this.dx = 0; this.dy = -1;
    } else if (e.key === 'ArrowDown' && this.dy === 0) {
      this.dx = 0; this.dy = 1;
    } else if (e.key === 'ArrowLeft' && this.dx === 0) {
      this.dx = -1; this.dy = 0;
    } else if (e.key === 'ArrowRight' && this.dx === 0) {
      this.dx = 1; this.dy = 0;
    }
  }

  gameLoop() {
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    for (let i = 0; i < this.snake.length; i++) {
      if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.updateScoreUI();
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  gameOver() {
    this.stopGame();
    alert(`🎮 Game Over! 최종 점수: ${this.score}`);
  }

  updateScoreUI() {
    const scoreEl = this.container.querySelector('#snake-score');
    if (scoreEl) scoreEl.textContent = this.score;
  }

  draw() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.snake.forEach((part, index) => {
      this.ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
      this.ctx.fillRect(
        part.x * this.gridSize + 1,
        part.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });
  }
}
