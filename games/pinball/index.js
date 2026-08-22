// ========================================================
// 🎰 핀볼 클래식 (Pinball Classic - Smooth Flipper Rolling Physics)
// ========================================================

export const meta = {
  id: 'pinball',
  title: '핀볼 (Pinball Classic)',
  description: '우하단 스프링을 당겨 공을 상단 게임장으로 유연하게 발사하고 핀볼 테이블을 공략하세요!',
  author: 'Antigravity Team',
  category: '아케이드 / 액션',
  icon: '🎰',
  thumbnailColor: 'linear-gradient(135deg, #eab308 0%, #854d0e 100%)'
};

// ========================================================
// 1. 사운드 매니저 (8-bit 칩튠 BGM)
// ========================================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
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

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  playChime(multiplier = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * multiplier, now + i * 0.04);

      gain.gain.setValueAtTime(0.12, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.14);
    });
  }

  playHazard() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  playLaunch(power = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(800 * (0.5 + power * 0.5), now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playFlipper() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playDrain() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  startBGM() {
    if (this.isMuted || this.bgmTimer) return;
    this.init();
    if (!this.ctx) return;

    const melody = [
      523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 880.00, 1046.50,
      587.33, 698.46, 880.00, 1174.66, 880.00, 698.46, 783.99, 1046.50,
      659.25, 783.99, 987.77, 1318.51, 987.77, 783.99, 880.00, 1046.50,
      523.25, 659.25, 783.99, 1046.50, 1174.66, 1318.51, 1567.98, 1046.50
    ];

    const bassline = [
      130.81, 130.81, 164.81, 130.81, 146.83, 146.83, 174.61, 146.83,
      164.81, 164.81, 196.00, 164.81, 130.81, 130.81, 196.00, 130.81
    ];

    this.bgmStep = 0;
    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      const mFreq = melody[this.bgmStep % melody.length];
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();

      mOsc.type = 'square';
      mOsc.frequency.setValueAtTime(mFreq, now);

      mGain.gain.setValueAtTime(0.025, now);
      mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      mOsc.connect(mGain);
      mGain.connect(this.ctx.destination);

      mOsc.start(now);
      mOsc.stop(now + 0.10);

      if (this.bgmStep % 2 === 0) {
        const bFreq = bassline[Math.floor(this.bgmStep / 2) % bassline.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();

        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bFreq, now);

        bGain.gain.setValueAtTime(0.045, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);

        bOsc.start(now);
        bOsc.stop(now + 0.12);
      }

      this.bgmStep++;
    }, 110);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// ========================================================
// 2. 메인 게임 클래스 (자연스러운 슬라이딩 & 롤링 물리)
// ========================================================
export class Game {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.sound = new SoundManager();

    this.vWidth = 360;
    this.vHeight = 480;

    this.gameState = 'READY';
    this.score = 0;
    this.highScore = Number(localStorage.getItem('pb_highscore') || 0);

    this.ball = {
      x: 340,
      y: 430,
      vx: 0,
      vy: 0,
      radius: 7,
      inPlunger: true
    };

    this.plunger = {
      x: 340,
      y: 450,
      charge: 0,
      isCharging: false,
      minPower: 11.5,
      maxPower: 19.0
    };

    // 화면 정중앙 X = 180 기준 플리퍼 막대
    this.leftFlipper = {
      pivotX: 108,
      pivotY: 415,
      length: 56,
      angle: 0.42,
      targetAngle: 0.42,
      restAngle: 0.42,
      upAngle: -0.45,
      isUp: false
    };

    this.rightFlipper = {
      pivotX: 252,
      pivotY: 415,
      length: 56,
      angle: Math.PI - 0.42,
      targetAngle: Math.PI - 0.42,
      restAngle: Math.PI - 0.42,
      upAngle: Math.PI + 0.45,
      isUp: false
    };

    this.bumpers = [
      { id: 'b1', type: 'star', x: 120, y: 135, radius: 17, score: 5, hitTimer: 0, color: '#facc15' },
      { id: 'b2', type: 'star', x: 180, y: 115, radius: 17, score: 5, hitTimer: 0, color: '#facc15' },
      { id: 'b3', type: 'star', x: 240, y: 135, radius: 17, score: 5, hitTimer: 0, color: '#facc15' },
      { id: 'b4', type: 'round', x: 180, y: 190, radius: 16, score: 2, hitTimer: 0, color: '#4ade80' },
      { id: 'b5', type: 'round', x: 110, y: 220, radius: 14, score: 1, hitTimer: 0, color: '#38bdf8' },
      { id: 'b6', type: 'round', x: 250, y: 220, radius: 14, score: 1, hitTimer: 0, color: '#38bdf8' },
      { id: 'b7', type: 'round', x: 180, y: 250, radius: 14, score: 2, hitTimer: 0, color: '#a855f7' },
      { id: 'b8', type: 'hazard', x: 130, y: 285, radius: 15, score: -2, hitTimer: 0, color: '#ef4444' },
      { id: 'b9', type: 'hazard', x: 230, y: 285, radius: 15, score: -2, hitTimer: 0, color: '#ef4444' }
    ];

    this.slingshots = [
      { id: 'sl1', x1: 60, y1: 345, x2: 100, y2: 395, score: 3, hitTimer: 0, color: '#f43f5e' },
      { id: 'sl2', x1: 285, y1: 345, x2: 245, y2: 395, score: 3, hitTimer: 0, color: '#f43f5e' }
    ];

    this.targets = [
      { x: 90, y: 70, w: 16, h: 6, score: 1, hitTimer: 0 },
      { x: 150, y: 60, w: 16, h: 6, score: 1, hitTimer: 0 },
      { x: 210, y: 60, w: 16, h: 6, score: 1, hitTimer: 0 },
      { x: 270, y: 70, w: 16, h: 6, score: 1, hitTimer: 0 }
    ];

    this.walls = [
      { x1: 20, y1: 420, x2: 20, y2: 100 },
      { x1: 20, y1: 100, x2: 50, y2: 45 },
      { x1: 50, y1: 45, x2: 110, y2: 22 },
      { x1: 110, y1: 22, x2: 250, y2: 22 },
      { x1: 250, y1: 22, x2: 310, y2: 45 },
      { x1: 310, y1: 45, x2: 355, y2: 100 },
      { x1: 355, y1: 100, x2: 355, y2: 450 },
      { x1: 325, y1: 450, x2: 355, y2: 450 },
      { x1: 325, y1: 110, x2: 325, y2: 450 },
      { x1: 20, y1: 320, x2: 108, y2: 415 },
      { x1: 325, y1: 320, x2: 252, y2: 415 }
    ];

    this.particles = [];
    this.floatingTexts = [];

    this.keys = { left: false, right: false, launch: false };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.loop = this.loop.bind(this);
    this.animId = null;
    this.lastTime = 0;
  }

  mount(container) {
    this.loadStyle();
    this.container = container;
    this.initDOM();
    this.bindEvents();
    this.setGameState('READY');
    this.startLoop();
  }

  unmount() {
    this.sound.stopBGM();
    this.stopLoop();
    this.unbindEvents();
    if (this.container) this.container.innerHTML = '';
  }

  loadStyle() {
    if (!document.getElementById('style-pinball')) {
      const link = document.createElement('link');
      link.id = 'style-pinball';
      link.rel = 'stylesheet';
      link.href = new URL('./style.css', import.meta.url).href;
      document.head.appendChild(link);
    }
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="pb-game-container">
        <div class="pb-header">
          <div class="pb-score-box">
            <span>SCORE:</span>
            <span class="pb-score-digits" id="pb-score-txt">0</span>
            <span class="pb-high-score">BEST: ${this.highScore}</span>
          </div>
          <div class="pb-actions">
            <button class="pb-sound-btn" id="pb-sound-btn">🔊</button>
          </div>
        </div>

        <div class="pb-canvas-wrap">
          <canvas id="pb-canvas" class="pb-canvas"></canvas>

          <div class="pb-overlay" id="pb-overlay-ready">
            <div class="pb-overlay-icon">🎰⚽</div>
            <h2 class="pb-overlay-title">핀볼 클래식</h2>
            <p class="pb-overlay-desc">
              우하단 스프링을 당겨 공을 상단 게임장으로 힘차게 튕기세요!<br>
              장애물마다 점수가 다르고 <strong>☠️ 마이너스 장애물(-2점)</strong>도 존재합니다!
            </p>
            <button class="pb-btn-primary" id="pb-btn-start">게임 시작 ▶</button>
          </div>

          <div class="pb-overlay hidden" id="pb-overlay-gameover">
            <div class="pb-overlay-icon">💀😵</div>
            <h2 class="pb-overlay-title" style="color: #f87171;">GAME OVER</h2>
            <p class="pb-overlay-desc">공이 아웃홀 구멍으로 떨어졌습니다!</p>
            <div class="pb-result-score" id="pb-result-score">최종 점수: 0점</div>
            <button class="pb-btn-primary" id="pb-btn-retry">다시 하기 🔄</button>
          </div>
        </div>

        <div class="pb-controls">
          <button class="pb-touch-btn" id="pb-btn-f-left">◀ 좌 플리퍼</button>
          <button class="pb-touch-btn pb-btn-launch" id="pb-btn-launch">🚀 발사</button>
          <button class="pb-touch-btn" id="pb-btn-f-right">우 플리퍼 ▶</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#pb-canvas');
    this.ctx = this.canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.vWidth * dpr;
    this.canvas.height = this.vHeight * dpr;
    this.ctx.scale(dpr, dpr);

    this.readyOverlay = this.container.querySelector('#pb-overlay-ready');
    this.gameOverOverlay = this.container.querySelector('#pb-overlay-gameover');
    this.scoreTxt = this.container.querySelector('#pb-score-txt');
    this.resultScoreTxt = this.container.querySelector('#pb-result-score');
    this.soundBtn = this.container.querySelector('#pb-sound-btn');
  }

  bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.container.querySelector('#pb-btn-start').addEventListener('click', () => this.startGame());
    this.container.querySelector('#pb-btn-retry').addEventListener('click', () => this.startGame());

    this.soundBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.soundBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    const btnL = this.container.querySelector('#pb-btn-f-left');
    const btnR = this.container.querySelector('#pb-btn-f-right');
    const btnLaunch = this.container.querySelector('#pb-btn-launch');

    const bindTouch = (btn, keyName) => {
      const start = (e) => { e.preventDefault(); this.keys[keyName] = true; btn.classList.add('active'); };
      const end = (e) => { e.preventDefault(); this.keys[keyName] = false; btn.classList.remove('active'); };

      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    };

    bindTouch(btnL, 'left');
    bindTouch(btnR, 'right');
    bindTouch(btnLaunch, 'launch');
  }

  unbindEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'a', 'A', 'd', 'D', 's', 'S', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === ' ') this.keys.launch = true;
  }

  onKeyUp(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'a', 'A', 'd', 'D', 's', 'S', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === ' ') this.keys.launch = false;
  }

  setGameState(state) {
    this.gameState = state;
    this.readyOverlay.classList.toggle('hidden', state !== 'READY');
    this.gameOverOverlay.classList.toggle('hidden', state !== 'GAMEOVER');
  }

  startGame() {
    this.score = 0;
    this.updateUI();

    this.ball = {
      x: 340,
      y: 430,
      vx: 0,
      vy: 0,
      radius: 7,
      inPlunger: true
    };

    this.plunger.charge = 0;
    this.plunger.isCharging = false;

    this.particles = [];
    this.floatingTexts = [];
    this.setGameState('PLAYING');
    this.sound.startBGM();
  }

  updateUI() {
    this.scoreTxt.textContent = this.score;
  }

  startLoop() {
    if (!this.animId) {
      this.lastTime = 0;
      this.animId = requestAnimationFrame(this.loop);
    }
  }

  stopLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.lastTime = 0;
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp || performance.now();
    const elapsed = timestamp ? (timestamp - this.lastTime) : 16.667;
    this.lastTime = timestamp || performance.now();

    const dt = Math.min(2.0, Math.max(0.1, elapsed / 16.667));

    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame(this.loop);
  }

  update(dt = 1.0) {
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    if (this.gameState !== 'PLAYING') return;

    if (this.ball.inPlunger) {
      this.ball.x = 340;
      this.ball.vx = 0;

      if (this.keys.launch) {
        this.plunger.charge = Math.min(1.0, this.plunger.charge + 0.035 * dt);
        this.plunger.isCharging = true;
        this.ball.y = 430 + this.plunger.charge * 16;
      } else if (this.plunger.isCharging) {
        const launchPower = this.plunger.minPower + this.plunger.charge * (this.plunger.maxPower - this.plunger.minPower);
        this.ball.vy = -launchPower;
        this.ball.vx = -0.5;
        this.ball.inPlunger = false;
        this.plunger.isCharging = false;
        this.sound.playLaunch(this.plunger.charge);
        this.plunger.charge = 0;
      }
    }

    this.leftFlipper.isUp = this.keys.left;
    this.rightFlipper.isUp = this.keys.right;

    if (this.keys.left && !this.leftFlipper.prevUp) this.sound.playFlipper();
    if (this.keys.right && !this.rightFlipper.prevUp) this.sound.playFlipper();

    this.leftFlipper.prevUp = this.keys.left;
    this.rightFlipper.prevUp = this.keys.right;

    this.updateFlipper(this.leftFlipper, dt);
    this.updateFlipper(this.rightFlipper, dt);

    if (!this.ball.inPlunger) {
      const subSteps = 8;
      const subDt = dt / subSteps;
      const gravity = (0.24 * dt) / subSteps;
      const frictionX = Math.pow(0.993, subDt);
      const frictionY = Math.pow(0.996, subDt);

      for (let s = 0; s < subSteps; s++) {
        if (this.gameState !== 'PLAYING' || this.ball.inPlunger) break;

        this.ball.vy += gravity;
        this.ball.vx *= frictionX;
        this.ball.vy *= frictionY;

        // 공 최고 속도 제한 (클램핑)
        const speed = Math.hypot(this.ball.vx, this.ball.vy);
        const maxSpeed = 15.0;
        if (speed > maxSpeed) {
          this.ball.vx = (this.ball.vx / speed) * maxSpeed;
          this.ball.vy = (this.ball.vy / speed) * maxSpeed;
        }

        // 플런저 레인(우측 발사 통로) 바운더리 처리
        if (this.ball.x > 325 && this.ball.y > 110) {
          this.ball.x = 340;
          this.ball.vx = 0;

          if (this.ball.y > 425 && this.ball.vy > 0) {
            this.ball.y = 430;
            this.ball.vy = 0;
            this.ball.inPlunger = true;
            break;
          }
        }

        this.ball.x += this.ball.vx * subDt;
        this.ball.y += this.ball.vy * subDt;

        // 하드 바운더리 안전망 (외곽 벽 탈출 방지)
        const rad = this.ball.radius;
        if (this.ball.x < 20 + rad) {
          this.ball.x = 20 + rad;
          if (this.ball.vx < 0) this.ball.vx = -this.ball.vx * 0.8;
        }
        if (this.ball.y < 22 + rad) {
          this.ball.y = 22 + rad;
          if (this.ball.vy < 0) this.ball.vy = -this.ball.vy * 0.8;
        }
        if (this.ball.x > 355 - rad) {
          this.ball.x = 355 - rad;
          if (this.ball.vx > 0) this.ball.vx = -this.ball.vx * 0.8;
        } else if (this.ball.x > 325 - rad && this.ball.y < 110) {
          this.ball.x = 325 - rad;
          if (this.ball.vx > 0) this.ball.vx = -this.ball.vx * 0.8;
        }

        this.handleWallCollisions();
        this.handleBumperCollisions();
        this.handleSlingshotCollisions();
        this.handleTargetCollisions();
        this.handleFlipperCollisions(this.leftFlipper, subDt);
        this.handleFlipperCollisions(this.rightFlipper, subDt);

        if (this.ball.y > 438 && this.ball.x > 135 && this.ball.x < 225) {
          this.onBallDrain();
          break;
        }
      }
    }
  }

  updateFlipper(flipper, dt) {
    const target = flipper.isUp ? flipper.upAngle : flipper.restAngle;
    flipper.angle += (target - flipper.angle) * 0.48 * dt;
  }

  handleWallCollisions() {
    const b = this.ball;

    this.walls.forEach(w => {
      const fx = w.x2 - w.x1;
      const fy = w.y2 - w.y1;
      const lenSq = fx * fx + fy * fy;
      if (lenSq === 0) return;

      let t = ((b.x - w.x1) * fx + (b.y - w.y1) * fy) / lenSq;
      t = Math.max(0, Math.min(1, t));

      const closestX = w.x1 + t * fx;
      const closestY = w.y1 + t * fy;

      const dx = b.x - closestX;
      const dy = b.y - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < b.radius) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        b.x = closestX + nx * b.radius;
        b.y = closestY + ny * b.radius;

        const dot = b.vx * nx + b.vy * ny;
        if (dot < 0) {
          b.vx = (b.vx - 2 * dot * nx) * 0.82;
          b.vy = (b.vy - 2 * dot * ny) * 0.82;
        }
      }
    });
  }

  handleBumperCollisions() {
    const b = this.ball;
    this.bumpers.forEach(bmp => {
      if (bmp.hitTimer > 0) bmp.hitTimer--;

      const dx = b.x - bmp.x;
      const dy = b.y - bmp.y;
      const dist = Math.hypot(dx, dy);
      const minDist = b.radius + bmp.radius;

      if (dist < minDist) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        b.x = bmp.x + nx * minDist;
        b.y = bmp.y + ny * minDist;

        const bouncePower = bmp.type === 'hazard' ? 5.5 : 8.5;
        b.vx = nx * bouncePower;
        b.vy = ny * bouncePower;

        if (bmp.hitTimer <= 0) {
          bmp.hitTimer = 15;
          this.addScore(bmp.score, bmp.x, bmp.y, bmp.type === 'hazard');
          this.createHitParticles(bmp.x, bmp.y, bmp.color);
        }
      }
    });
  }

  handleSlingshotCollisions() {
    const b = this.ball;
    this.slingshots.forEach(sl => {
      if (sl.hitTimer > 0) sl.hitTimer--;

      const fx = sl.x2 - sl.x1;
      const fy = sl.y2 - sl.y1;
      const lenSq = fx * fx + fy * fy;
      let t = ((b.x - sl.x1) * fx + (b.y - sl.y1) * fy) / lenSq;
      t = Math.max(0, Math.min(1, t));

      const closestX = sl.x1 + t * fx;
      const closestY = sl.y1 + t * fy;
      const dx = b.x - closestX;
      const dy = b.y - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < b.radius + 4) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        b.x = closestX + nx * (b.radius + 4);
        b.y = closestY + ny * (b.radius + 4);

        b.vx = nx * 9.5;
        b.vy = ny * 9.5;

        if (sl.hitTimer <= 0) {
          sl.hitTimer = 15;
          this.addScore(sl.score, closestX, closestY, false);
          this.createHitParticles(closestX, closestY, sl.color);
        }
      }
    });
  }

  handleTargetCollisions() {
    const b = this.ball;
    this.targets.forEach(tgt => {
      if (tgt.hitTimer > 0) tgt.hitTimer--;

      if (b.x > tgt.x - tgt.w / 2 && b.x < tgt.x + tgt.w / 2 &&
          b.y > tgt.y - tgt.h / 2 && b.y < tgt.y + tgt.h / 2) {
        b.vy = Math.abs(b.vy) * 0.8;

        if (tgt.hitTimer <= 0) {
          tgt.hitTimer = 20;
          this.addScore(tgt.score, tgt.x, tgt.y, false);
        }
      }
    });
  }

  // 🏓 [자연스러운 플리퍼 슬라이딩/롤링 물리 구현]:
  // 1. 방향키를 누른 상태(isUp): 통 튕겨 올려 발사!
  // 2. 방향키를 뗀 상태(!isUp): 공이 멈추지 않고 막대 경사면을 따라 미끄러져 내려감!
  handleFlipperCollisions(flipper, dt = 1.0) {
    const b = this.ball;
    const endX = flipper.pivotX + Math.cos(flipper.angle) * flipper.length;
    const endY = flipper.pivotY + Math.sin(flipper.angle) * flipper.length;

    const fx = endX - flipper.pivotX;
    const fy = endY - flipper.pivotY;
    const lenSq = fx * fx + fy * fy;
    let t = ((b.x - flipper.pivotX) * fx + (b.y - flipper.pivotY) * fy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = flipper.pivotX + t * fx;
    const closestY = flipper.pivotY + t * fy;

    const dx = b.x - closestX;
    const dy = b.y - closestY;
    const dist = Math.hypot(dx, dy);

    if (dist < b.radius + 4) {
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);

      // 공 위치를 막대 표면에 맞춤
      b.x = closestX + nx * (b.radius + 4);
      b.y = closestY + ny * (b.radius + 4);

      if (flipper.isUp) {
        // 🚀 키를 눌러 막대를 쳐올릴 때는 강력 발사!
        b.vx = nx * 11 + (Math.random() - 0.5) * 2;
        b.vy = -13.5;
      } else {
        // 🏄‍♂️ 가만히 있을 때는 공이 안 튀기면서 막대 경사면을 따라 미끄러짐!
        // 접선 유닛 벡터 (막대 가이드 방향)
        const tx = Math.cos(flipper.angle);
        const ty = Math.sin(flipper.angle);

        // 법선 방향 반발은 억제 (bounce=0.1)
        let vNorm = b.vx * nx + b.vy * ny;
        if (vNorm < 0) vNorm = -vNorm * 0.1;

        // 접선 방향 속도 및 경사면 중력 가속도 추가 (멈추지 않고 미끄러짐)
        let vTang = b.vx * tx + b.vy * ty;
        vTang += 0.28 * ty * dt; // 막대 아래쪽 가속

        b.vx = tx * vTang + nx * vNorm;
        b.vy = ty * vTang + ny * vNorm;
      }
    }
  }

  addScore(pts, x, y, isHazard = false) {
    this.score += pts;
    if (this.score < 0) this.score = 0;
    this.updateUI();

    if (isHazard) {
      this.sound.playHazard();
      this.floatingTexts.push({ text: `${pts}점`, x, y: y - 10, vy: -1, alpha: 1, color: '#ef4444', life: 30 });
    } else {
      this.sound.playChime(pts >= 5 ? 1.2 : 1.0);
      this.floatingTexts.push({ text: `+${pts}점`, x, y: y - 10, vy: -1.2, alpha: 1, color: '#facc15', life: 30 });
    }
  }

  onBallDrain() {
    this.sound.playDrain();
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('pb_highscore', this.highScore);
    }

    this.resultScoreTxt.textContent = `최종 점수: ${this.score}점`;
    this.setGameState('GAMEOVER');
  }

  createHitParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        life: 25
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 25);
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 30);
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.vWidth, this.vHeight);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.vHeight);
    bgGrad.addColorStop(0, '#070a12');
    bgGrad.addColorStop(0.7, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.vWidth, this.vHeight);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    this.walls.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();
    });

    this.slingshots.forEach(sl => {
      ctx.save();
      if (sl.hitTimer > 0) {
        ctx.shadowColor = sl.color;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.strokeStyle = sl.color;
      }
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sl.x1, sl.y1);
      ctx.lineTo(sl.x2, sl.y2);
      ctx.stroke();
      ctx.restore();
    });

    this.targets.forEach(tgt => {
      ctx.fillStyle = tgt.hitTimer > 0 ? '#ffffff' : '#38bdf8';
      ctx.fillRect(tgt.x - tgt.w / 2, tgt.y - tgt.h / 2, tgt.w, tgt.h);
    });

    this.bumpers.forEach(bmp => {
      ctx.save();
      ctx.translate(bmp.x, bmp.y);

      if (bmp.hitTimer > 0) {
        ctx.shadowColor = bmp.color;
        ctx.shadowBlur = 18;
      }

      ctx.fillStyle = bmp.hitTimer > 0 ? '#ffffff' : bmp.color;
      ctx.beginPath();
      ctx.arc(0, 0, bmp.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (bmp.type === 'star') ctx.fillText('⭐', 0, 0);
      else if (bmp.type === 'hazard') ctx.fillText('☠️', 0, 1);
      else ctx.fillText(`+${bmp.score}`, 0, 1);

      ctx.restore();
    });

    this.drawFlipper(ctx, this.leftFlipper, '#0284c7');
    this.drawFlipper(ctx, this.rightFlipper, '#0284c7');

    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fillRect(138, 435, 84, 45);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💀 DRAIN 💀', 180, 460);

    ctx.fillStyle = '#475569';
    ctx.fillRect(328, 440, 24, 40);

    const pullY = 440 + this.plunger.charge * 16;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(331, pullY, 18, 10);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = pullY + 10; y < 475; y += 4) {
      ctx.lineTo(y % 8 === 0 ? 333 : 347, y);
    }
    ctx.stroke();

    this.drawParticles(ctx);
    this.drawFloatingTexts(ctx);

    const b = this.ball;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;

    const ballGrad = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, b.radius);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.6, '#e2e8f0');
    ballGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawFlipper(ctx, flipper, color) {
    ctx.save();
    ctx.translate(flipper.pivotX, flipper.pivotY);
    ctx.rotate(flipper.angle);

    ctx.fillStyle = color;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(0, -6, flipper.length, 12, 6);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawFloatingTexts(ctx) {
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 15px "JetBrains Mono", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
