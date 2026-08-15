export const meta = {
  id: 'snake',
  title: '스네이크 (Snake Game)',
  description: '먹이를 먹으며 몸집을 키우세요! 모바일 스와이프 제스처 및 가상 D-Pad 터치 조작 완벽 지원',
  author: 'Arcade Contributor',
  category: '아케이드 / 액션',
  icon: '🐍',
  thumbnailColor: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
  version: '2.0.0'
};

// ========================================================
// 1. Web Audio API 효과음 매니저
// ========================================================
class SnakeSoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playEat() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playTurn() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playGameOver() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export class Game {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 20;
    this.tileCount = 15;
    this.snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    this.food = { x: 10, y: 7 };
    this.dx = 1;
    this.dy = 0;
    this.nextDx = 1;
    this.nextDy = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snake_high_score') || '0', 10);
    this.gameInterval = null;
    this.isGameOver = false;
    this.sound = new SnakeSoundManager();

    // 터치 스와이프 상태
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
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
      this.container.removeEventListener('touchstart', this.handleTouchStart);
      this.container.removeEventListener('touchmove', this.handleTouchMove);
      this.container.removeEventListener('touchend', this.handleTouchEnd);
      this.container.innerHTML = '';
    }
  }

  initUI() {
    this.container.innerHTML = `
      <div class="snake-app">
        <!-- 상단 스코어 보드 -->
        <div class="snake-header-bar">
          <div class="snake-stat-box">
            <span class="stat-label">SCORE</span>
            <span class="stat-value" id="snake-score">0</span>
          </div>
          <div class="snake-stat-box high">
            <span class="stat-label">BEST</span>
            <span class="stat-value" id="snake-best">${this.highScore}</span>
          </div>
        </div>

        <!-- 게임 캔버스 영역 -->
        <div class="snake-canvas-wrapper">
          <canvas id="snake-canvas" width="300" height="300" class="snake-canvas"></canvas>
          
          <!-- 게임오버 오버레이 -->
          <div class="snake-overlay" id="snake-overlay">
            <div class="overlay-card">
              <div class="overlay-icon">💀</div>
              <h2 class="overlay-title">GAME OVER</h2>
              <p class="overlay-score">최종 점수: <span id="snake-final-score">0</span></p>
              <button class="snake-action-btn" id="snake-retry-btn">다시 도전 🔄</button>
            </div>
          </div>
        </div>

        <!-- 모바일 가상 D-Pad 컨트롤러 -->
        <div class="snake-dpad-container">
          <div class="dpad-row">
            <button class="dpad-btn up" id="dpad-up" aria-label="Up">▲</button>
          </div>
          <div class="dpad-row middle">
            <button class="dpad-btn left" id="dpad-left" aria-label="Left">◀</button>
            <div class="dpad-center">🎮</div>
            <button class="dpad-btn right" id="dpad-right" aria-label="Right">▶</button>
          </div>
          <div class="dpad-row">
            <button class="dpad-btn down" id="dpad-down" aria-label="Down">▼</button>
          </div>
        </div>

        <div class="snake-guide-text">
          👆 <b>화면 스와이프</b> 또는 <b>하단 방향키 터치</b>로 조작하세요!
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#snake-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlayEl = this.container.querySelector('#snake-overlay');

    // 이벤트 바인딩: 키보드
    window.addEventListener('keydown', this.handleKeyDown);

    // 이벤트 바인딩: 화면 전체 터치 스와이프
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd, { passive: false });

    // 이벤트 바인딩: 가상 D-Pad 버튼
    const bindDpad = (id, direction) => {
      const btn = this.container.querySelector(`#dpad-${id}`);
      if (!btn) return;
      const trigger = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        this.changeDirection(direction);
      };
      btn.addEventListener('touchstart', trigger, { passive: false });
      btn.addEventListener('mousedown', trigger);
    };

    bindDpad('up', 'UP');
    bindDpad('down', 'DOWN');
    bindDpad('left', 'LEFT');
    bindDpad('right', 'RIGHT');

    // 재도전 버튼
    this.container.querySelector('#snake-retry-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.resetGame();
    });
  }

  handleTouchStart(e) {
    // 버튼 클릭이 아닌 경우에만 스와이프 시작점 기록
    if (e.target.closest('.dpad-btn') || e.target.closest('#snake-retry-btn')) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  handleTouchMove(e) {
    if (e.cancelable) e.preventDefault();
  }

  handleTouchEnd(e) {
    if (e.target.closest('.dpad-btn') || e.target.closest('#snake-retry-btn')) return;
    if (e.cancelable) e.preventDefault();
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const threshold = 15; // 스와이프 감도(px) - 15px로 민감도 향상

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) >= threshold) {
        if (deltaX > 0) this.changeDirection('RIGHT');
        else this.changeDirection('LEFT');
      }
    } else {
      if (Math.abs(deltaY) >= threshold) {
        if (deltaY > 0) this.changeDirection('DOWN');
        else this.changeDirection('UP');
      }
    }
  }

  changeDirection(dir) {
    if (this.isGameOver) return;

    if (dir === 'UP' && this.dy === 0) {
      this.nextDx = 0; this.nextDy = -1;
      this.sound.playTurn();
    } else if (dir === 'DOWN' && this.dy === 0) {
      this.nextDx = 0; this.nextDy = 1;
      this.sound.playTurn();
    } else if (dir === 'LEFT' && this.dx === 0) {
      this.nextDx = -1; this.nextDy = 0;
      this.sound.playTurn();
    } else if (dir === 'RIGHT' && this.dx === 0) {
      this.nextDx = 1; this.nextDy = 0;
      this.sound.playTurn();
    }
  }

  handleKeyDown(e) {
    if (this.isGameOver) return;

    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && this.dy === 0) {
      e.preventDefault();
      this.changeDirection('UP');
    } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && this.dy === 0) {
      e.preventDefault();
      this.changeDirection('DOWN');
    } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && this.dx === 0) {
      e.preventDefault();
      this.changeDirection('LEFT');
    } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && this.dx === 0) {
      e.preventDefault();
      this.changeDirection('RIGHT');
    }
  }

  resetGame() {
    this.stopGame();
    this.isGameOver = false;
    this.overlayEl.classList.remove('active');

    this.snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    this.dx = 1;
    this.dy = 0;
    this.nextDx = 1;
    this.nextDy = 0;
    this.score = 0;
    this.updateScoreUI();
    this.placeFood();
    this.draw();

    this.gameInterval = setInterval(() => this.gameLoop(), 120);
  }

  stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  placeFood() {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
      // 뱀 몸통 위에 음식이 생성되지 않도록 검사
      const collision = this.snake.some(part => part.x === newFood.x && part.y === newFood.y);
      if (!collision) break;
    }
    this.food = newFood;
  }

  gameLoop() {
    this.dx = this.nextDx;
    this.dy = this.nextDy;

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // 벽 충돌 검사
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    // 자기 몸 충돌 검사
    for (let i = 0; i < this.snake.length; i++) {
      if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // 먹이 섭취
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('snake_high_score', this.highScore.toString());
      }
      this.updateScoreUI();
      this.sound.playEat();
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  gameOver() {
    this.stopGame();
    this.isGameOver = true;
    this.sound.playGameOver();

    const finalScoreEl = this.container.querySelector('#snake-final-score');
    if (finalScoreEl) finalScoreEl.textContent = this.score;
    this.overlayEl.classList.add('active');
  }

  updateScoreUI() {
    const scoreEl = this.container.querySelector('#snake-score');
    const bestEl = this.container.querySelector('#snake-best');
    if (scoreEl) scoreEl.textContent = this.score;
    if (bestEl) bestEl.textContent = this.highScore;
  }

  draw() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const sz = this.gridSize;

    // 배경
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 은은한 그리드 배경
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += sz) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += sz) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 사과(먹이) 렌더링
    const fx = this.food.x * sz + sz / 2;
    const fy = this.food.y * sz + sz / 2;

    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(fx, fy, sz / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // 사과 꼭지 & 잎사귀
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(fx + 2, fy - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 뱀(Snake) 렌더링
    this.snake.forEach((part, index) => {
      const px = part.x * sz;
      const py = part.y * sz;
      const isHead = index === 0;

      ctx.save();
      if (isHead) {
        // 머리 (네온 그린 + 라운드 사각형)
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#22c55e';
        this.roundRect(ctx, px + 1, py + 1, sz - 2, sz - 2, 6);
        ctx.fill();

        // 뱀 눈(Eyes)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0f172a';
        let eye1X, eye1Y, eye2X, eye2Y;
        if (this.dx === 1) { // 우
          eye1X = px + sz - 6; eye1Y = py + 5;
          eye2X = px + sz - 6; eye2Y = py + sz - 5;
        } else if (this.dx === -1) { // 좌
          eye1X = px + 6; eye1Y = py + 5;
          eye2X = px + 6; eye2Y = py + sz - 5;
        } else if (this.dy === -1) { // 상
          eye1X = px + 5; eye1Y = py + 6;
          eye2X = px + sz - 5; eye2Y = py + 6;
        } else { // 하
          eye1X = px + 5; eye1Y = py + sz - 6;
          eye2X = px + sz - 5; eye2Y = py + sz - 6;
        }
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 2, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 몸통 (부드러운 그라데이션)
        const alpha = Math.max(0.4, 1 - (index / this.snake.length) * 0.6);
        ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
        this.roundRect(ctx, px + 2, py + 2, sz - 4, sz - 4, 4);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
