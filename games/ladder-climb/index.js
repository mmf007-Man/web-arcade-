/**
 * 사다리 탈출 (Ladder Escape)
 * - 5개 사다리 세로 아케이드 게임
 * - 위키(등반), 아래키(빠른 하강), 좌/우키(사다리 간 발로 부드러운 보행 이동)
 * - 떨어지는 굵은 통나무 피하기
 * - 정상(Top Platform) 도착 시 미션 성공!
 */

export const meta = {
  id: 'ladder-climb',
  title: '사다리 탈출 (Ladder Escape)',
  description: '위에서 떨어지는 굵은 통나무를 피해 사다리를 타고 정상까지 탈출하세요! 아래 방향키를 누르면 빠르게 하강합니다.',
  author: 'Antigravity Team',
  category: '아케이드 / 액션',
  icon: '🪜',
  thumbnailColor: 'linear-gradient(135deg, #eab308 0%, #854d0e 100%)',
  version: '1.0.0'
};

// ========================================================
// 1. Web Audio API 사운드 매니저
// ========================================================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
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
    return this.isMuted;
  }

  playClimb() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playFastDown() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playLogSplash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  playHit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.45);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
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

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.15, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.32);
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

  playHop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
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

    // 5개의 사다리 X 좌표 (가로 균등 배치)
    this.ladderXList = [50, 115, 180, 245, 310];

    // 정상 Y (승리) & 바닥 Y (시작)
    this.topY = 65;
    this.bottomY = 430;

    // 게임 상태: 'READY' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'
    this.gameState = 'READY';

    // 플레이어(졸라맨) 상태
    this.player = {
      ladderIndex: 2, // 0 ~ 4 (사다리 번호: 0=맨왼쪽, 2=중앙, 4=맨오른쪽)
      x: 180, // 중앙 사다리에서 시작
      y: 430, // 바닥 Y
      speedUp: 0.95, // 등반 속도 (느리고 신중한 등반)
      speedDownFast: 5.2, // 하강 속도 (시원하고 빠른 쾌속 슬라이딩 하강)
      facing: 1, // 1: 우, -1: 좌
      animFrame: 0,
      isClimbing: false,
      isFastDown: false,
      isJumping: false,
      jumpProgress: 0,
      jumpStartX: 180,
      jumpTargetX: 180,
      fallAngle: 0,
      danceTimer: 0
    };

    // 낙하하는 통나무 배열 & 파티클
    this.logs = [];
    this.particles = [];
    this.floatingTexts = [];

    // 통나무 스폰 타이머
    this.logSpawnTimer = 0;
    this.logSpawnInterval = 28; // 프레임 단위 스폰 간격 (약 0.45초마다)

    // 키 입력 상태
    this.keys = { up: false, down: false, left: false, right: false };

    // 바인딩
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.loop = this.loop.bind(this);
    this.animId = null;
    this.lastTime = 0;
  }

  loadStyle() {
    if (!document.getElementById('style-ladder-climb')) {
      const link = document.createElement('link');
      link.id = 'style-ladder-climb';
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
      <div class="lc-game-container">
        <!-- 상단 헤더 -->
        <div class="lc-header">
          <div class="lc-title-box">
            <span>🪜</span>
            <span>사다리 탈출</span>
          </div>
          <button class="lc-sound-btn" id="lc-sound-btn" title="소리 켜기/끄기">🔊</button>
        </div>

        <!-- 탈출 진행도 프로그레스 바 -->
        <div class="lc-progress-wrap">
          <div class="lc-progress-bar" id="lc-progress-bar"></div>
        </div>

        <!-- 캔버스 영역 -->
        <div class="lc-canvas-wrap">
          <canvas id="lc-canvas" class="lc-canvas"></canvas>

          <!-- 시작 화면 오버레이 -->
          <div class="lc-overlay" id="lc-overlay-ready">
            <div class="lc-overlay-icon">🪜🪵</div>
            <h2 class="lc-overlay-title">사다리 통나무 피하기</h2>
            <p class="lc-overlay-desc">
              떨어지는 통나무를 피해 사다리를 타고 정상까지 올라가세요!
            </p>
            <button class="lc-btn-primary" id="lc-btn-start">게임 시작하기 ▶</button>
          </div>

          <!-- 게임 오버 오버레이 -->
          <div class="lc-overlay hidden" id="lc-overlay-gameover">
            <div class="lc-overlay-icon">🪵💥😵</div>
            <h2 class="lc-overlay-title" style="color: #f87171;">GAME OVER</h2>
            <p class="lc-overlay-desc">
              통나무에 맞았습니다! 다시 도전해보세요.
            </p>
            <button class="lc-btn-primary" id="lc-btn-retry">다시 하기 🔄</button>
          </div>

          <!-- 승리 화면 오버레이 -->
          <div class="lc-overlay hidden" id="lc-overlay-victory">
            <div class="lc-overlay-icon">🏆🕺</div>
            <h2 class="lc-overlay-title" style="color: #4ade80;">MISSION CLEAR!</h2>
            <p class="lc-overlay-desc">
              축하합니다! 통나무를 무사히 피하고 정상 탈출에 성공했습니다!
            </p>
            <button class="lc-btn-primary" id="lc-btn-restart">다시 하기 🔄</button>
          </div>
        </div>

        <!-- 모바일 가상 조작 버튼 -->
        <div class="lc-controls">
          <button class="lc-touch-btn lc-btn-up" id="lc-btn-up">▲</button>
          <button class="lc-touch-btn lc-btn-left" id="lc-btn-left">◀</button>
          <button class="lc-touch-btn lc-btn-down" id="lc-btn-down">▼</button>
          <button class="lc-touch-btn lc-btn-right" id="lc-btn-right">▶</button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#lc-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvasDPI();

    this.readyOverlay = this.container.querySelector('#lc-overlay-ready');
    this.gameOverOverlay = this.container.querySelector('#lc-overlay-gameover');
    this.victoryOverlay = this.container.querySelector('#lc-overlay-victory');
    this.progressBar = this.container.querySelector('#lc-progress-bar');
    this.soundBtn = this.container.querySelector('#lc-sound-btn');
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

    // 오버레이 버튼 이벤트
    this.container.querySelector('#lc-btn-start').addEventListener('click', () => {
      this.sound.playClick();
      this.startGame();
    });

    this.container.querySelector('#lc-btn-retry').addEventListener('click', () => {
      this.sound.playClick();
      this.startGame();
    });

    this.container.querySelector('#lc-btn-restart').addEventListener('click', () => {
      this.sound.playClick();
      this.startGame();
    });

    this.soundBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.soundBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    // 모바일 터치 버튼 이벤트
    const btnUp = this.container.querySelector('#lc-btn-up');
    const btnDown = this.container.querySelector('#lc-btn-down');
    const btnLeft = this.container.querySelector('#lc-btn-left');
    const btnRight = this.container.querySelector('#lc-btn-right');

    const bindTouch = (btn, keyProp) => {
      const start = (e) => { e.preventDefault(); this.keys[keyProp] = true; btn.classList.add('active'); };
      const end = (e) => { e.preventDefault(); this.keys[keyProp] = false; btn.classList.remove('active'); };

      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    };

    bindTouch(btnUp, 'up');
    bindTouch(btnDown, 'down');
    bindTouch(btnLeft, 'left');
    bindTouch(btnRight, 'right');
  }

  unbindEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
  }

  onKeyUp(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
  }

  setGameState(state) {
    this.gameState = state;
    this.readyOverlay.classList.toggle('hidden', state !== 'READY');
    this.gameOverOverlay.classList.toggle('hidden', state !== 'GAMEOVER');
    this.victoryOverlay.classList.toggle('hidden', state !== 'VICTORY');
  }

  startGame() {
    this.logs = [];
    this.particles = [];
    this.floatingTexts = [];
    this.logSpawnTimer = 0;
    this.lastTime = 0;

    // 플레이어 초기화 (중앙 사다리 2번 맨 아래)
    this.player.ladderIndex = 2;
    this.player.x = this.ladderXList[2];
    this.player.y = this.bottomY;
    this.player.facing = 1;
    this.player.animFrame = 0;
    this.player.isClimbing = false;
    this.player.isFastDown = false;
    this.player.isJumping = false;
    this.player.jumpProgress = 0;
    this.player.jumpStartX = this.ladderXList[2];
    this.player.jumpTargetX = this.ladderXList[2];
    this.player.fallAngle = 0;
    this.player.danceTimer = 0;

    this.updateUI();
    this.setGameState('PLAYING');
  }

  updateUI() {
    // 정상 Y=65 부터 바닥 Y=430 까지의 진행률
    const progress = Math.min(100, Math.max(0, ((this.bottomY - this.player.y) / (this.bottomY - this.topY)) * 100));
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

    // 60 FPS 기준 Delta Time
    const dt = Math.min(2.0, Math.max(0.1, elapsed / 16.667));

    this.update(dt);
    this.draw();
    this.animId = requestAnimationFrame(this.loop);
  }

  // ========================================================
  // 3. 업데이트 로직
  // ========================================================
  update(dt = 1.0) {
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    if (this.gameState === 'READY') {
      this.player.animFrame += 0.05 * dt;
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
      if (Math.random() < 0.35 * dt) {
        this.createConfetti();
      }
      return;
    }

    // --- PLAYING 상태 ---
    this.player.isClimbing = false;
    this.player.isFastDown = false;

    // 1. 위쪽 등반 (속도 낮춤: 0.95)
    if (this.keys.up) {
      this.player.y -= this.player.speedUp * dt;
      this.player.isClimbing = true;
      this.sound.playClimb();
    }

    // 2. 아래쪽 하강 (속도 낮춤: 1.9)
    if (this.keys.down) {
      this.player.y += this.player.speedDownFast * dt;
      this.player.isFastDown = true;
      this.sound.playFastDown();
    }

    // 3. 사다리 간 점프 이동 (Left / Right Key)
    if (this.keys.left && !this.player.isJumping) {
      if (this.player.ladderIndex > 0) {
        this.player.ladderIndex--;
        this.player.isJumping = true;
        this.player.jumpProgress = 0;
        this.player.jumpStartX = this.player.x;
        this.player.jumpTargetX = this.ladderXList[this.player.ladderIndex];
        this.player.facing = -1;
        this.sound.playHop();
      }
      this.keys.left = false;
    }

    if (this.keys.right && !this.player.isJumping) {
      if (this.player.ladderIndex < this.ladderXList.length - 1) {
        this.player.ladderIndex++;
        this.player.isJumping = true;
        this.player.jumpProgress = 0;
        this.player.jumpStartX = this.player.x;
        this.player.jumpTargetX = this.ladderXList[this.player.ladderIndex];
        this.player.facing = 1;
        this.sound.playHop();
      }
      this.keys.right = false;
    }

    // 점프 이동 애니메이션 처리
    if (this.player.isJumping) {
      this.player.jumpProgress += 0.15 * dt;
      if (this.player.jumpProgress >= 1) {
        this.player.jumpProgress = 1;
        this.player.isJumping = false;
        this.player.x = this.player.jumpTargetX;
      } else {
        this.player.x = this.player.jumpStartX + (this.player.jumpTargetX - this.player.jumpStartX) * this.player.jumpProgress;
      }
    }

    if (this.player.y > this.bottomY) this.player.y = this.bottomY;
    if (this.player.y < this.topY) this.player.y = this.topY;

    // 애니메이션 프레임 업데이트
    if (this.player.isClimbing || this.player.isJumping || this.player.isFastDown) {
      this.player.animFrame += 0.2 * dt;
    } else {
      this.player.animFrame = 0;
    }

    this.updateUI();

    // 정상 도착 (승리 조건 체크)
    if (this.player.y <= this.topY) {
      this.triggerVictory();
      return;
    }

    // 4. 통나무 스폰 & 이동
    this.logSpawnTimer += dt;
    if (this.logSpawnTimer >= this.logSpawnInterval) {
      this.logSpawnTimer = 0;
      this.spawnLog();
    }

    for (let i = this.logs.length - 1; i >= 0; i--) {
      const log = this.logs[i];
      log.y += log.speed * dt;
      log.rot += log.rotSpeed * dt;

      // 바닥 도착 시 통나무 파괴 파티클 생성
      if (log.y >= 430) {
        this.createLogBreak(log.x, 432);
        this.sound.playLogSplash();
        this.logs.splice(i, 1);
        continue;
      }

      // 통나무 충돌 판정 (플레이어 히트박스: x, y - 22 중심 원/박스)
      const px = this.player.x;
      const py = this.player.y - 24;

      // 통나무 박스 크기: 가로 40px, 세로 22px
      const logMinX = log.x - 20;
      const logMaxX = log.x + 20;
      const logMinY = log.y - 11;
      const logMaxY = log.y + 11;

      // 충돌 여부 검사
      if (px >= logMinX - 10 && px <= logMaxX + 10 && py >= logMinY - 14 && py <= logMaxY + 14) {
        // 통나무 피격! 게임 오버
        this.triggerGameOver();
        return;
      }
    }
  }

  spawnLog() {
    // 5개의 사다리 중 무작위 1~2개 레인에서 스폰
    const ladderIndex = Math.floor(Math.random() * this.ladderXList.length);
    const x = this.ladderXList[ladderIndex];
    const speed = 3.2 + Math.random() * 1.6; // 적절한 떨어지는 속도

    this.logs.push({
      x,
      y: 20,
      speed,
      rot: Math.random() * Math.PI,
      rotSpeed: 0.08 + Math.random() * 0.06
    });
  }

  createLogBreak(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
      const speed = 1.8 + Math.random() * 3.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.2,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.5 ? '#78350f' : '#92400e',
        alpha: 1,
        life: 20 + Math.random() * 10
      });
    }
  }

  createConfetti() {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#ec4899'];
    this.particles.push({
      x: Math.random() * this.vWidth,
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
  }

  triggerVictory() {
    this.setGameState('VICTORY');
    this.sound.playVictory();
    this.createFloatingText('🏆 미션 성공!', 180, 120, '#4ade80');
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

    // 1. 배경
    this.drawBackground(ctx);

    // 2. 5개 사다리 & 정상/바닥 발판
    this.drawLaddersAndPlatforms(ctx);

    // 3. 통나무 장애물
    this.logs.forEach(log => this.drawLog(ctx, log));

    // 4. 파티클
    this.drawParticles(ctx);

    // 5. 졸라맨 캐릭터
    this.drawStickman(ctx);

    // 6. 플로팅 텍스트
    this.drawFloatingTexts(ctx);
  }

  drawBackground(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.vHeight);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.7, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.vWidth, this.vHeight);

    // 은은한 별빛
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    [[30, 30], [120, 70], [250, 40], [320, 100], [80, 150], [280, 180], [170, 90]].forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 2, 2);
    });
  }

  drawLaddersAndPlatforms(ctx) {
    const topY = this.topY;
    const bottomY = this.bottomY;

    // 1. 정상 플랫폼 (목표 도착 장소)
    const topGrad = ctx.createLinearGradient(0, topY - 18, 0, topY);
    topGrad.addColorStop(0, '#22c55e');
    topGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = topGrad;
    ctx.fillRect(10, topY - 18, this.vWidth - 20, 18);

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, topY - 18, this.vWidth - 20, 18);

    // 정상 안내 텍스트
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 GOAL (정상 탈출구)', this.vWidth / 2, topY - 5);

    // 2. 바닥 시작 발판
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, bottomY, this.vWidth, this.vHeight - bottomY);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, bottomY);
    ctx.lineTo(this.vWidth, bottomY);
    ctx.stroke();

    // 3. 5개의 세로 사다리 그리기 (독립형 촘촘한 발판)
    this.ladderXList.forEach(lx => {
      const halfW = 14;

      // 사다리 세로 기둥 (왼쪽, 오른쪽)
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.moveTo(lx - halfW, topY);
      ctx.lineTo(lx - halfW, bottomY);
      ctx.moveTo(lx + halfW, topY);
      ctx.lineTo(lx + halfW, bottomY);
      ctx.stroke();

      // 사다리 촘촘한 가로 발판 (Rungs - 11px 간격으로 매우 촘촘하게)
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      for (let y = topY + 8; y < bottomY; y += 11) {
        ctx.beginPath();
        ctx.moveTo(lx - halfW + 1, y);
        ctx.lineTo(lx + halfW - 1, y);
        ctx.stroke();
      }
    });
  }

  drawLog(ctx, log) {
    ctx.save();
    ctx.translate(log.x, log.y);

    const w = 40;
    const h = 22;

    // 통나무 회전 애니메이션
    ctx.rotate(Math.sin(log.rot) * 0.15);

    // 통나무 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);

    // 통나무 본체 (원목 그라데이션)
    const logGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    logGrad.addColorStop(0, '#a16207');
    logGrad.addColorStop(0.5, '#78350f');
    logGrad.addColorStop(1, '#451a03');

    ctx.fillStyle = logGrad;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // 나무 껍질 테두리 & 결 선
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, -h / 2 + 6);
    ctx.lineTo(w / 2 - 8, -h / 2 + 6);
    ctx.moveTo(-w / 2 + 5, h / 2 - 6);
    ctx.lineTo(w / 2 - 5, h / 2 - 6);
    ctx.stroke();

    // 양끝 단면 나무 나이테 원
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(-w / 2 + 3, 0, 3, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.ellipse(w / 2 - 3, 0, 3, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();

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
  // 5. 졸라맨(Stickman) 렌더링 & 모션
  // ========================================================
  drawStickman(ctx) {
    ctx.save();
    const p = this.player;

    // 점프 이동 시 호 형태의 포보선 Y 오프셋 적용
    const jumpArcY = p.isJumping ? -Math.sin(p.jumpProgress * Math.PI) * 16 : 0;
    ctx.translate(p.x, p.y + jumpArcY);

    if (this.gameState === 'GAMEOVER') {
      this.drawDeadStickman(ctx);
    } else if (this.gameState === 'VICTORY') {
      this.drawVictoryStickman(ctx);
    } else {
      this.drawActiveStickman(ctx);
    }

    ctx.restore();
  }

  drawActiveStickman(ctx) {
    const p = this.player;
    ctx.scale(p.facing, 1);

    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const frame = p.animFrame;
    const isJump = p.isJumping;
    const isClimb = p.isClimbing || p.isFastDown;

    const headCenterY = -48;
    const hipY = -20;
    const shoulderY = -38;

    // 1. 머리
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headCenterY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 눈 (방향)
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(3, headCenterY - 1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. 몸통 (척추)
    ctx.strokeStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(0, headCenterY + 9);
    ctx.lineTo(0, hipY);
    ctx.stroke();

    // 3. 다리 & 팔 모션 분기
    if (isJump) {
      // --- 사다리 사이 순간 점프 모션 ---
      // 팔 위로 벌림
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(-14, shoulderY - 14);
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(14, shoulderY - 14);
      ctx.stroke();

      // 무릎 굽혀 웅크린 점프 다리
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(-10, hipY + 8);
      ctx.lineTo(-6, hipY + 16);
      ctx.moveTo(0, hipY);
      ctx.lineTo(10, hipY + 8);
      ctx.lineTo(6, hipY + 16);
      ctx.stroke();

    } else if (isClimb) {
      // --- 사다리 등반 / 하강 동작 ---
      const limbSw = Math.sin(frame * 2) * 10;

      // 손으로 사다리 잡기 모션
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(-12, shoulderY - 8 + limbSw);
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(12, shoulderY - 8 - limbSw);
      ctx.stroke();

      // 다리로 사다리 디디기 모션
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(-10, hipY + 10 - limbSw);
      ctx.lineTo(-12, 0);

      ctx.moveTo(0, hipY);
      ctx.lineTo(10, hipY + 10 + limbSw);
      ctx.lineTo(12, 0);
      ctx.stroke();

    } else {
      // --- 사다리 사이 발로 걸어서 부드럽게 이동하는 보행 모션 ---
      const legSw = Math.sin(frame * 2.5) * 0.8;

      // 앞다리
      const knee1X = Math.sin(legSw) * 10 + 4;
      const foot1X = Math.sin(legSw) * 16 + 6;
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(knee1X, hipY + 10);
      ctx.lineTo(foot1X, 0);
      ctx.stroke();

      // 뒷다리
      const knee2X = -Math.sin(legSw) * 10 - 4;
      const foot2X = -Math.sin(legSw) * 16 - 6;
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(knee2X, hipY + 10);
      ctx.lineTo(foot2X, 0);
      ctx.stroke();

      // 팔 걸을 때 흔들기
      const armSw = -Math.sin(frame * 2.5) * 12;
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(armSw, shoulderY + 12);
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(-armSw, shoulderY + 12);
      ctx.stroke();

    } else {
      // --- 정지 대기 상태 ---
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(-6, -10);
      ctx.lineTo(-8, 0);
      ctx.moveTo(0, hipY);
      ctx.lineTo(6, -10);
      ctx.lineTo(8, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(-10, shoulderY + 10);
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(10, shoulderY + 10);
      ctx.stroke();
    }
  }

  drawDeadStickman(ctx) {
    const angle = this.player.fallAngle;
    ctx.rotate(angle);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const headCenterY = -44;

    // 머리
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headCenterY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // X X 눈표정
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5, headCenterY - 4); ctx.lineTo(-1, headCenterY);
    ctx.moveTo(-1, headCenterY - 4); ctx.lineTo(-5, headCenterY);
    ctx.moveTo(1, headCenterY - 4); ctx.lineTo(5, headCenterY);
    ctx.moveTo(5, headCenterY - 4); ctx.lineTo(1, headCenterY);
    ctx.stroke();

    // 찌그러진 몸체
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, headCenterY + 9);
    ctx.lineTo(0, -18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(-10, -5); ctx.lineTo(-14, 0);
    ctx.moveTo(0, -18); ctx.lineTo(10, -5); ctx.lineTo(14, 0);
    ctx.moveTo(0, -32); ctx.lineTo(-14, -24);
    ctx.moveTo(0, -32); ctx.lineTo(14, -24);
    ctx.stroke();
  }

  drawVictoryStickman(ctx) {
    const t = this.player.danceTimer;
    const bounce = Math.abs(Math.sin(t * 3)) * 6;
    const sw = Math.cos(t * 3) * 6;

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const headCenterY = -50 - bounce;

    // 승리 머리 & 왕관 👑
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(sw * 0.5, headCenterY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑', sw * 0.5, headCenterY - 11);

    // 몸체 & 만세 댄스 팔
    ctx.strokeStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(sw * 0.5, headCenterY + 9);
    ctx.lineTo(0, -20 - bounce);
    ctx.stroke();

    const armAngle = Math.sin(t * 3) * 14;
    ctx.beginPath();
    ctx.moveTo(sw * 0.5, headCenterY + 12);
    ctx.lineTo(-16, headCenterY + armAngle);
    ctx.lineTo(-24, headCenterY - 10 + armAngle);

    ctx.moveTo(sw * 0.5, headCenterY + 12);
    ctx.lineTo(16, headCenterY - armAngle);
    ctx.lineTo(24, headCenterY - 10 - armAngle);
    ctx.stroke();

    // 다리 탭댄스
    const dStep = Math.sin(t * 3);
    ctx.beginPath();
    ctx.moveTo(0, -20 - bounce);
    ctx.lineTo(-8 + dStep * 8, -10);
    ctx.lineTo(-8 + dStep * 8, 0);

    ctx.moveTo(0, -20 - bounce);
    ctx.lineTo(8 - dStep * 8, -10);
    ctx.lineTo(8 - dStep * 8, 0);
    ctx.stroke();
  }
}
