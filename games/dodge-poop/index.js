/**
 * 똥 피하기 게임 (Avoid Poop Game)
 * - PC 키보드 & 모바일 가상 방향키 완벽 지원
 * - 졸라맨 캐릭터 (달리기, 쓰러짐, 승리 댄스 모션)
 * - 똥 낙하 및 바닥 스플래시 연출
 * - 황금 코인 수집 (50개 목표) 및 승리 팡파레
 * - Web Audio API 자체 신스 사운드 시스템
 */

export const meta = {
  id: 'dodge-poop',
  title: '똥 피하기 (Avoid Poop)',
  description: '하늘에서 떨어지는 똥을 피하고 황금 코인 50개를 모아 탈출하세요! 춤추는 졸라맨의 유쾌한 액션!',
  author: 'Antigravity Team',
  category: '아케이드 / 액션',
  icon: '💩',
  thumbnailColor: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
  version: '1.0.0'
};

// ========================================================
// 1. Web Audio API 신디사이저 사운드 매니저
// ========================================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playSplash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playHit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.12, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.28);
    });
  }

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }
}

// ========================================================
// 2. 메인 게임 클래스
// ========================================================
export class Game {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.sound = new SoundManager();

    // 캔버스 가상 논리 해상도
    this.vWidth = 360;
    this.vHeight = 480;

    // 게임 상태: 'READY' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'
    this.gameState = 'READY';
    this.targetScore = 50;
    this.score = 0;

    // 플레이어(졸라맨) 상태
    this.player = {
      x: 180,
      y: 430, // 발바닥 기준 바닥 Y 좌표
      vx: 0,
      speed: 4.8,
      facing: 1, // 1: 우, -1: 좌
      walkFrame: 0,
      isMoving: false,
      fallAngle: 0, // 쓰러질 때 회전 각도
      danceTimer: 0, // 승리 춤 타이머
      hasUmbrella: false // ☂️ 코인 10개마다 획득하는 똥 1회 방어 우산
    };

    // 낙하물 및 파티클
    this.poops = [];
    this.coins = [];
    this.particles = [];
    this.floatingTexts = [];

    // 스폰 타이머 & 밸런스 (너무 빠르지 않게 조절)
    this.poopSpawnTimer = 0;
    this.poopSpawnInterval = 32; // 프레임 단위 (약 0.5초마다)
    this.coinSpawnTimer = 0;
    this.coinSpawnInterval = 130; // 약 2.1초마다

    // 키 입력 상태
    this.keys = { left: false, right: false };

    // 바인딩
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.loop = this.loop.bind(this);
    this.animId = null;
    this.lastTime = 0;
  }

  loadStyle() {
    if (!document.getElementById('style-dodge-poop')) {
      const link = document.createElement('link');
      link.id = 'style-dodge-poop';
      link.rel = 'stylesheet';
      link.href = new URL('./style.css', import.meta.url).href;
      document.head.appendChild(link);
    }
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
    this.stopLoop();
    this.unbindEvents();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="dp-game-container">
        <!-- 상단 헤더 -->
        <div class="dp-header">
          <div class="dp-score-box">
            <span class="dp-coin-icon">🪙</span>
            <span id="dp-score-txt">0</span> / ${this.targetScore}
            <span class="dp-target-badge">목표 50</span>
          </div>
          <div class="dp-actions">
            <button class="dp-sound-btn" id="dp-sound-btn" title="소리 켜기/끄기">🔊</button>
          </div>
        </div>

        <!-- 코인 달성도 프로그레스 바 -->
        <div class="dp-progress-wrap">
          <div class="dp-progress-bar" id="dp-progress-bar"></div>
        </div>

        <!-- 캔버스 영역 -->
        <div class="dp-canvas-wrap">
          <canvas id="dp-canvas" class="dp-canvas"></canvas>

          <!-- 시작 화면 오버레이 -->
          <div class="dp-overlay" id="dp-overlay-ready">
            <div class="dp-overlay-icon">💩</div>
            <h2 class="dp-overlay-title">똥 피하기 게임</h2>
            <p class="dp-overlay-desc">
              하늘에서 무작위로 떨어지는 똥을 피하세요!<br>
              반짝이는 <strong>금색 코인 50개(🪙)</strong>를 모으면<br>
              졸라맨이 신나게 춤을 춥니다!
            </p>
            <button class="dp-btn-primary" id="dp-btn-start">게임 시작하기 ▶</button>
          </div>

          <!-- 게임 오버 오버레이 -->
          <div class="dp-overlay hidden" id="dp-overlay-gameover">
            <div class="dp-overlay-icon">💥😵</div>
            <h2 class="dp-overlay-title" style="color: #f87171;">GAME OVER</h2>
            <p class="dp-overlay-desc">
              으악! 똥에 맞아 쓰러졌습니다...
            </p>
            <div class="dp-result-score" id="dp-result-gameover">
              획득 코인: 0개
            </div>
            <button class="dp-btn-primary" id="dp-btn-retry">다시 하기 🔄</button>
          </div>

          <!-- 승리 화면 오버레이 -->
          <div class="dp-overlay hidden" id="dp-overlay-victory">
            <div class="dp-overlay-icon">🎉🕺</div>
            <h2 class="dp-overlay-title" style="color: #4ade80;">MISSION CLEAR!</h2>
            <p class="dp-overlay-desc">
              축하합니다! 코인 50개를 모두 모았습니다!<br>
              졸라맨의 승리 댄스를 감상하세요!
            </p>
            <div class="dp-result-score" style="border-color: #4ade80; color: #4ade80;">
              목표 50점 완벽 달성! ⭐⭐⭐
            </div>
            <button class="dp-btn-primary dp-btn-victory" id="dp-btn-restart">다시 하기 🔄</button>
          </div>
        </div>

        <!-- 모바일 가상 조작 버튼 -->
        <div class="dp-controls">
          <button class="dp-touch-btn" id="dp-btn-left">◀ 왼쪽</button>
          <button class="dp-touch-btn" id="dp-btn-right">오른쪽 ▶</button>
        </div>
        <p class="dp-keyboard-hint">PC: 키보드 좌/우 방향키(← →) 또는 [A], [D] 키</p>
      </div>
    `;

    this.canvas = this.container.querySelector('#dp-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvasDPI();

    this.readyOverlay = this.container.querySelector('#dp-overlay-ready');
    this.gameOverOverlay = this.container.querySelector('#dp-overlay-gameover');
    this.victoryOverlay = this.container.querySelector('#dp-overlay-victory');
    this.scoreText = this.container.querySelector('#dp-score-txt');
    this.progressBar = this.container.querySelector('#dp-progress-bar');
    this.soundBtn = this.container.querySelector('#dp-sound-btn');
  }

  setupCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.vWidth * dpr;
    this.canvas.height = this.vHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // 버튼 이벤트
    this.container.querySelector('#dp-btn-start').addEventListener('click', () => {
      this.sound.playClick();
      this.startGame();
    });

    this.container.querySelector('#dp-btn-retry').addEventListener('click', () => {
      this.sound.playClick();
      this.startGame();
    });

    this.container.querySelector('#dp-btn-restart').addEventListener('click', () => {
      this.sound.playClick();
      this.startGame();
    });

    this.soundBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.soundBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    // 모바일 터치 버튼 이벤트
    const btnLeft = this.container.querySelector('#dp-btn-left');
    const btnRight = this.container.querySelector('#dp-btn-right');

    const handleLeftStart = (e) => { e.preventDefault(); this.keys.left = true; btnLeft.classList.add('active'); };
    const handleLeftEnd = (e) => { e.preventDefault(); this.keys.left = false; btnLeft.classList.remove('active'); };
    const handleRightStart = (e) => { e.preventDefault(); this.keys.right = true; btnRight.classList.add('active'); };
    const handleRightEnd = (e) => { e.preventDefault(); this.keys.right = false; btnRight.classList.remove('active'); };

    btnLeft.addEventListener('mousedown', handleLeftStart);
    btnLeft.addEventListener('mouseup', handleLeftEnd);
    btnLeft.addEventListener('mouseleave', handleLeftEnd);
    btnLeft.addEventListener('touchstart', handleLeftStart, { passive: false });
    btnLeft.addEventListener('touchend', handleLeftEnd, { passive: false });

    btnRight.addEventListener('mousedown', handleRightStart);
    btnRight.addEventListener('mouseup', handleRightEnd);
    btnRight.addEventListener('mouseleave', handleRightEnd);
    btnRight.addEventListener('touchstart', handleRightStart, { passive: false });
    btnRight.addEventListener('touchend', handleRightEnd, { passive: false });
  }

  unbindEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'A', 'd', 'D'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.keys.left = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.keys.right = true;
    }
  }

  onKeyUp(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'A', 'd', 'D'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.keys.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.keys.right = false;
    }
  }

  setGameState(state) {
    this.gameState = state;
    this.readyOverlay.classList.toggle('hidden', state !== 'READY');
    this.gameOverOverlay.classList.toggle('hidden', state !== 'GAMEOVER');
    this.victoryOverlay.classList.toggle('hidden', state !== 'VICTORY');
  }

  startGame() {
    this.score = 0;
    this.updateUI();
    this.poops = [];
    this.coins = [];
    this.particles = [];
    this.floatingTexts = [];
    this.poopSpawnTimer = 0;
    this.coinSpawnTimer = 0;
    this.lastTime = 0;

    // 플레이어 초기화
    this.player.x = this.vWidth / 2;
    this.player.y = 430;
    this.player.vx = 0;
    this.player.facing = 1;
    this.player.walkFrame = 0;
    this.player.fallAngle = 0;
    this.player.danceTimer = 0;
    this.player.hasUmbrella = false;

    this.setGameState('PLAYING');
  }

  updateUI() {
    this.scoreText.textContent = this.score;
    const progress = Math.min(100, (this.score / this.targetScore) * 100);
    this.progressBar.style.width = `${progress}%`;
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

    // 60 FPS (16.667ms = 1.0) 기준 Delta Time 계산
    // 탭 이동 후 재진입 시 급격한 위치 튐을 방지하기 위해 0.1 ~ 2.0 범위로 제한
    const dt = Math.min(2.0, Math.max(0.1, elapsed / 16.667));

    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame(this.loop);
  }

  // ========================================================
  // 3. 업데이트 로직
  // ========================================================
  update(dt = 1.0) {
    // 1. 파티클 및 텍스트 업데이트 (모든 상태에서 갱신)
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    if (this.gameState === 'READY') {
      this.player.walkFrame += 0.05 * dt;
      return;
    }

    if (this.gameState === 'GAMEOVER') {
      if (this.player.fallAngle < Math.PI / 2) {
        this.player.fallAngle += 0.12 * dt;
      }
      return;
    }

    if (this.gameState === 'VICTORY') {
      this.player.danceTimer += 0.1 * dt;
      // 축하 컨페티 지속 생성
      if (Math.random() < 0.35 * dt) {
        this.createConfetti();
      }
      return;
    }

    // --- PLAYING 상태 ---
    // 플레이어 이동
    this.player.isMoving = false;
    if (this.keys.left) {
      this.player.x -= this.player.speed * dt;
      this.player.facing = -1;
      this.player.isMoving = true;
    }
    if (this.keys.right) {
      this.player.x += this.player.speed * dt;
      this.player.facing = 1;
      this.player.isMoving = true;
    }

    // 경계 제한
    const pMargin = 18;
    if (this.player.x < pMargin) this.player.x = pMargin;
    if (this.player.x > this.vWidth - pMargin) this.player.x = this.vWidth - pMargin;

    if (this.player.isMoving) {
      this.player.walkFrame += 0.25 * dt;
    } else {
      this.player.walkFrame = 0;
    }

    // 똥 스폰 & 이동
    this.poopSpawnTimer += dt;
    if (this.poopSpawnTimer >= this.poopSpawnInterval) {
      this.poopSpawnTimer = 0;
      this.spawnPoop();
    }

    for (let i = this.poops.length - 1; i >= 0; i--) {
      const p = this.poops[i];
      p.y += p.speed * dt;
      p.rotation += p.rotSpeed * dt;

      // 바닥 충돌 (y >= 430)
      if (p.y >= 424) {
        this.createPoopSplash(p.x, 428);
        this.sound.playSplash();
        this.poops.splice(i, 1);
        continue;
      }

      // 플레이어와 충돌 판정 (원-박스 / 히트박스 판정)
      // 졸라맨 히트박스: x: player.x - 12 ~ player.x + 12, y: 385 ~ 430
      const px = this.player.x;
      const py = 405; // 졸라맨 중심
      const dist = Math.hypot(p.x - px, p.y - py);

      if (dist < p.radius + 16) {
        if (this.player.hasUmbrella) {
          // ☂️ 우산이 똥을 1회 방어!
          this.player.hasUmbrella = false;
          this.createPoopSplash(p.x, p.y);
          this.createUmbrellaSparkle(px, py - 35);
          this.createFloatingText('☂️ 우산 방어!', px, py - 40, '#38bdf8');
          this.sound.playSplash();
          this.poops.splice(i, 1);
          continue;
        }

        // 피격! 게임 오버
        this.triggerGameOver();
        return;
      }
    }

    // 코인 스폰 & 이동
    this.coinSpawnTimer += dt;
    if (this.coinSpawnTimer >= this.coinSpawnInterval) {
      this.coinSpawnTimer = 0;
      this.spawnCoin();
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.y += c.speed * dt;
      c.anim += 0.08 * dt;

      // 바닥에 닿으면 사라짐
      if (c.y >= 430) {
        this.coins.splice(i, 1);
        continue;
      }

      // 플레이어와 충돌 (코인 획득 - 우산은 코인을 통과시켜 정상 획득됨)
      const px = this.player.x;
      const py = 405;
      const dist = Math.hypot(c.x - px, c.y - py);

      if (dist < c.radius + 18) {
        this.score++;
        this.updateUI();
        this.sound.playCoin();
        this.createCoinSparkle(c.x, c.y);
        this.createFloatingText('+1', c.x, c.y, '#fbbf24');

        // 코인 10개마다 우산 보상 획득!
        if (this.score % 10 === 0 && this.score < this.targetScore) {
          this.player.hasUmbrella = true;
          this.sound.playVictory();
          this.createFloatingText('☂️ 우산 획득!', px, py - 40, '#38bdf8');
          this.createUmbrellaSparkle(px, py - 35);
        }

        this.coins.splice(i, 1);

        // 50점 달성 시 승리!
        if (this.score >= this.targetScore) {
          this.triggerVictory();
          return;
        }
      }
    }
  }

  spawnPoop() {
    // 똥 평균 낙하 속도를 살짝 높임 (2.5 ~ 4.4 px/frame, 평균 3.45 px/frame)
    const speed = 2.5 + Math.random() * 1.9;
    const radius = 13 + Math.random() * 5;
    const x = radius + Math.random() * (this.vWidth - radius * 2);

    this.poops.push({
      x,
      y: -20,
      radius,
      speed,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }

  spawnCoin() {
    const speed = 1.8 + Math.random() * 1.2; // 부드럽고 가볍게 하강
    const radius = 12;
    const x = radius + Math.random() * (this.vWidth - radius * 2);

    this.coins.push({
      x,
      y: -20,
      radius,
      speed,
      anim: Math.random() * Math.PI
    });
  }

  createPoopSplash(x, y) {
    // 바닥에 똥이 철퍽 닿을 때 튀기는 갈색 파티클
    for (let i = 0; i < 9; i++) {
      const angle = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.2,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#854d0e' : '#713f12',
        alpha: 1,
        life: 20 + Math.random() * 10
      });
    }
  }

  createUmbrellaSparkle(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.05,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#38bdf8' : '#818cf8',
        alpha: 1,
        life: 25 + Math.random() * 15
      });
    }
  }

  createCoinSparkle(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.1,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#fde047' : '#fbbf24',
        alpha: 1,
        life: 25 + Math.random() * 15
      });
    }
  }

  createConfetti() {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#ec4899'];
    const x = Math.random() * this.vWidth;
    this.particles.push({
      x,
      y: -10,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      gravity: 0.05,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: 60 + Math.random() * 30,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2
    });
  }

  createFloatingText(text, x, y, color) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.5,
      alpha: 1,
      color,
      life: 30
    });
  }

  updateParticles(dt = 1.0) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;
      if (p.rot !== undefined) p.rot += (p.vRot || 0) * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 30);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateFloatingTexts(dt = 1.0) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 30);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  triggerGameOver() {
    this.setGameState('GAMEOVER');
    this.sound.playHit();
    this.container.querySelector('#dp-result-gameover').textContent = `획득 코인: ${this.score} / ${this.targetScore}개`;
  }

  triggerVictory() {
    this.setGameState('VICTORY');
    this.sound.playVictory();
    for (let i = 0; i < 40; i++) {
      this.createConfetti();
    }
  }

  // ========================================================
  // 4. 렌더링 시스템
  // ========================================================
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.vWidth, this.vHeight);

    // 1. 배경 (그라데이션 밤하늘 + 그리드 바닥)
    this.drawBackground(ctx);

    // 2. 바닥 착지선
    this.drawGround(ctx);

    // 3. 똥 그리기
    this.poops.forEach(p => this.drawPoop(ctx, p));

    // 4. 코인 그리기
    this.coins.forEach(c => this.drawCoin(ctx, c));

    // 5. 파티클 그리기
    this.drawParticles(ctx);

    // 6. 플레이어 (졸라맨) 그리기
    this.drawStickman(ctx);

    // 7. 플로팅 텍스트 그리기
    this.drawFloatingTexts(ctx);
  }

  drawBackground(ctx) {
    // 밤하늘 배경
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.vHeight);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.7, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.vWidth, this.vHeight);

    // 은은한 별빛
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    const stars = [
      [30, 40], [120, 80], [250, 45], [320, 110], [70, 160], [290, 190], [180, 70]
    ];
    stars.forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 2, 2);
    });
  }

  drawGround(ctx) {
    const groundY = 430;

    // 바닥 라인
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(this.vWidth, groundY);
    ctx.stroke();

    // 바닥 채우기
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY, this.vWidth, this.vHeight - groundY);

    // 바닥 그리드 패턴
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.vWidth; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, this.vHeight);
      ctx.stroke();
    }
  }

  drawPoop(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    const r = p.radius;

    // 똥 기본 덩어리 층 (3단 소용돌이 모양)
    // 1단 (하단)
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.4, r * 1.1, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2단 (중단)
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.85, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3단 꼭지 (상단 뿔)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.2);
    ctx.quadraticCurveTo(0, -r * 1.2, r * 0.4, -r * 1.1);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.5, r * 0.5, -r * 0.2);
    ctx.fill();

    // 귀여운 눈망울
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.05, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.05, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-r * 0.35 + 1, -r * 0.05, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.35 + 1, -r * 0.05, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // 윤기 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-r * 0.5, r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawCoin(ctx, c) {
    ctx.save();
    ctx.translate(c.x, c.y);

    // 3D 회전 스케일 효과
    const scaleX = Math.cos(c.anim);
    ctx.scale(Math.abs(scaleX) < 0.15 ? 0.15 : scaleX, 1);

    const r = c.radius;

    // 외부 금빛 광채
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;

    // 코인 테두리 & 본체
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
    ctx.fill();

    // 내부 $ 마크 또는 별
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#b45309';
    ctx.font = `bold ${Math.floor(r * 1.1)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    ctx.restore();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (p.rot !== undefined) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  drawFloatingTexts(ctx) {
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px "JetBrains Mono", Pretendard, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  // ========================================================
  // 5. 졸라맨(Stickman) 렌더링 & 애니메이션
  // ========================================================
  drawStickman(ctx) {
    ctx.save();
    const p = this.player;

    ctx.translate(p.x, p.y);

    // 상태에 따른 렌더링 분기
    if (this.gameState === 'GAMEOVER') {
      this.drawDeadStickman(ctx);
    } else if (this.gameState === 'VICTORY') {
      this.drawDancingStickman(ctx);
    } else {
      this.drawActiveStickman(ctx);
    }

    ctx.restore();
  }

  // 기본 달리기 / 대기 상태 졸라맨
  drawActiveStickman(ctx) {
    const p = this.player;
    ctx.scale(p.facing, 1); // 좌우 반전

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const isRun = p.isMoving;
    const frame = p.walkFrame;

    // 호흡 바운스
    const bounceY = isRun ? Math.abs(Math.sin(frame)) * 4 : Math.sin(frame) * 2;

    // 신체 관절 좌표 계산 (발바닥 Y = 0 기준)
    const hipY = -22 - bounceY;
    const spineTopY = -42 - bounceY;
    const headCenterY = -52 - bounceY;

    // 1. 머리 (원)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headCenterY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 표정 (눈 & 입)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(3, headCenterY - 1, 1.8, 0, Math.PI * 2); // 눈
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (isRun) {
      // 달릴 때 비장한 입
      ctx.moveTo(1, headCenterY + 4);
      ctx.lineTo(5, headCenterY + 3);
    } else {
      // 대기 시 미소 입
      ctx.arc(2, headCenterY + 2, 3, 0.1, Math.PI * 0.8);
    }
    ctx.stroke();

    // 2. 몸통 (척추)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, headCenterY + 9);
    ctx.lineTo(0, hipY);
    ctx.stroke();

    // 3. 다리 (앞다리 & 뒷다리 관절 애니메이션)
    const legSwing = isRun ? Math.sin(frame) * 0.8 : 0;

    // 앞다리 (골반 -> 무릎 -> 발)
    const knee1X = Math.sin(legSwing) * 10 + (isRun ? 4 : 2);
    const knee1Y = hipY + 12;
    const foot1X = Math.sin(legSwing) * 16 + (isRun ? 6 : 4);
    const foot1Y = 0;

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(knee1X, knee1Y);
    ctx.lineTo(foot1X, foot1Y);
    ctx.stroke();

    // 뒷다리
    const knee2X = -Math.sin(legSwing) * 10 - (isRun ? 4 : 2);
    const knee2Y = hipY + 12;
    const foot2X = -Math.sin(legSwing) * 16 - (isRun ? 6 : 4);
    const foot2Y = 0;

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(knee2X, knee2Y);
    ctx.lineTo(foot2X, foot2Y);
    ctx.stroke();

    // 4. 팔 (앞팔 & 뒷팔 스윙)
    const armSwing = isRun ? -Math.sin(frame) * 0.9 : Math.sin(frame * 0.5) * 0.2;
    const shoulderY = spineTopY + 3;

    // 앞팔
    const hand1X = Math.sin(armSwing) * 14 + (isRun ? 6 : 3);
    const hand1Y = shoulderY + 12 + Math.cos(armSwing) * 4;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(hand1X * 0.6, shoulderY + 7);
    ctx.lineTo(hand1X, hand1Y);
    ctx.stroke();

    // 뒷팔
    const hand2X = -Math.sin(armSwing) * 14 - (isRun ? 6 : 3);
    const hand2Y = shoulderY + 12 - Math.cos(armSwing) * 4;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(hand2X * 0.6, shoulderY + 7);
    ctx.lineTo(hand2X, hand2Y);
    ctx.stroke();

    // 5. ☂️ 우산 렌더링 (hasUmbrella 일 때 머리 위 방어 우산)
    if (p.hasUmbrella) {
      ctx.save();
      const umbY = headCenterY - 14;

      // 우산 신비로운 네온 푸른빛 아우라
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;

      // 우산 돔 그라데이션
      const umbGrad = ctx.createLinearGradient(0, umbY - 22, 0, umbY);
      umbGrad.addColorStop(0, '#38bdf8');
      umbGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = umbGrad;

      ctx.beginPath();
      ctx.arc(0, umbY, 26, Math.PI * 1.05, Math.PI * 1.95);
      ctx.closePath();
      ctx.fill();

      // 우산 하단 곡선 굴곡
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const startX = -26 + i * 13;
        ctx.arc(startX + 6.5, umbY, 6.5, Math.PI, 0, true);
      }
      ctx.fill();

      // 우산 골선
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, umbY, 26, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      // 우산 손잡이 댓살 (손 위치까지)
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, umbY);
      ctx.lineTo(0, headCenterY + 4);
      ctx.stroke();

      // 우산 꼭지 팁
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, umbY - 26, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // 똥 맞고 쓰러진 졸라맨
  drawDeadStickman(ctx) {
    const angle = this.player.fallAngle;
    ctx.rotate(angle); // 쓰러지는 모션

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const hipY = -20;
    const headCenterY = -48;

    // 머리
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headCenterY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // X X 눈표정
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    // 왼쪽 눈 X
    ctx.beginPath();
    ctx.moveTo(-5, headCenterY - 4); ctx.lineTo(-1, headCenterY);
    ctx.moveTo(-1, headCenterY - 4); ctx.lineTo(-5, headCenterY);
    // 오른쪽 눈 X
    ctx.moveTo(1, headCenterY - 4); ctx.lineTo(5, headCenterY);
    ctx.moveTo(5, headCenterY - 4); ctx.lineTo(1, headCenterY);
    ctx.stroke();

    // 입 벌린 표정 O
    ctx.beginPath();
    ctx.arc(0, headCenterY + 4, 2, 0, Math.PI * 2);
    ctx.stroke();

    // 머리 위에 얹어진 똥 모자 💩
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💩', 0, headCenterY - 10);

    // 몸통
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, headCenterY + 9);
    ctx.lineTo(0, hipY);
    ctx.stroke();

    // 축 늘어진 팔다리
    // 다리
    ctx.beginPath();
    ctx.moveTo(0, hipY); ctx.lineTo(-8, -5); ctx.lineTo(-12, 0);
    ctx.moveTo(0, hipY); ctx.lineTo(8, -5); ctx.lineTo(14, 0);
    // 팔
    ctx.moveTo(0, -36); ctx.lineTo(-14, -28);
    ctx.moveTo(0, -36); ctx.lineTo(14, -28);
    ctx.stroke();

    // 어지러운 별 빙글빙글
    const starTimer = Date.now() * 0.005;
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 3; i++) {
      const sAng = starTimer + (i * Math.PI * 2 / 3);
      const sx = Math.cos(sAng) * 16;
      const sy = headCenterY - 14 + Math.sin(sAng) * 5;
      ctx.fillRect(sx, sy, 3, 3);
    }
  }

  // 50점 달성 후 신나게 춤추는 졸라맨
  drawDancingStickman(ctx) {
    const t = this.player.danceTimer;
    const danceStep = Math.sin(t * 3);
    const sideSwing = Math.cos(t * 3) * 6;

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const bounce = Math.abs(Math.sin(t * 3)) * 6;
    const hipY = -22 - bounce;
    const headCenterY = -52 - bounce;

    // 머리 (리듬에 맞춰 좌우 흔들흔들)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(sideSwing * 0.5, headCenterY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 환호하는 눈 (> <) & 크게 웃는 입
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1.8;
    // 왼쪽 눈 >
    ctx.beginPath();
    ctx.moveTo(sideSwing * 0.5 - 5, headCenterY - 3);
    ctx.lineTo(sideSwing * 0.5 - 2, headCenterY - 1);
    ctx.lineTo(sideSwing * 0.5 - 5, headCenterY + 1);
    // 오른쪽 눈 <
    ctx.moveTo(sideSwing * 0.5 + 5, headCenterY - 3);
    ctx.lineTo(sideSwing * 0.5 + 2, headCenterY - 1);
    ctx.lineTo(sideSwing * 0.5 + 5, headCenterY + 1);
    ctx.stroke();

    // 활짝 웃는 입
    ctx.beginPath();
    ctx.arc(sideSwing * 0.5, headCenterY + 2, 4, 0, Math.PI);
    ctx.stroke();

    // 머리 위 승리 왕관 👑
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑', sideSwing * 0.5, headCenterY - 12);

    // 몸통
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sideSwing * 0.5, headCenterY + 9);
    ctx.lineTo(0, hipY);
    ctx.stroke();

    // 양팔 만세 댄스 (디스코 포즈 또는 Y.M.C.A 바운스)
    const armL_Y = -42 - bounce + Math.sin(t * 3) * 14;
    const armR_Y = -42 - bounce - Math.sin(t * 3) * 14;

    ctx.beginPath();
    ctx.moveTo(sideSwing * 0.5, -40 - bounce);
    ctx.lineTo(-16, armL_Y);
    ctx.lineTo(-24, armL_Y - 8);

    ctx.moveTo(sideSwing * 0.5, -40 - bounce);
    ctx.lineTo(16, armR_Y);
    ctx.lineTo(24, armR_Y - 8);
    ctx.stroke();

    // 신나는 탭댄스 다리
    const legL_X = -8 + danceStep * 8;
    const legR_X = 8 - danceStep * 8;
    const legL_Y = Math.max(0, -danceStep * 8);
    const legR_Y = Math.max(0, danceStep * 8);

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(legL_X * 0.7, hipY + 12);
    ctx.lineTo(legL_X, -legL_Y);

    ctx.moveTo(0, hipY);
    ctx.lineTo(legR_X * 0.7, hipY + 12);
    ctx.lineTo(legR_X, -legR_Y);
    ctx.stroke();
  }
}
