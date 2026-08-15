import { gameRegistry } from './registry.js';

class ArcadeLoungeApp {
  constructor() {
    this.catalogContainer = document.getElementById('arcade-catalog');
    this.gameGridEl = document.getElementById('game-grid');
    this.gameCountEl = document.getElementById('game-count');
    this.modalEl = document.getElementById('game-modal');
    this.modalGameContainer = document.getElementById('modal-game-container');
    this.modalGameName = document.getElementById('modal-game-name');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    this.currentGameInstance = null;
    this.isDragging = false;
    this.hasMoved = false;

    this.init();
  }

  async init() {
    this.bindEvents();
    this.setupDragScroll();
    const games = await gameRegistry.loadAllGames();
    this.renderCatalog(games);
  }

  bindEvents() {
    this.modalCloseBtn.addEventListener('click', () => this.closeGameModal());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.closeGameModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('active')) {
        this.closeGameModal();
      }
    });
  }

  // ⭐️ 카탈로그 영역 전용 마우스 드래그 스크롤
  setupDragScroll() {
    const container = this.catalogContainer;
    if (!container) return;

    let startY = 0;
    let scrollTop = 0;

    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.hasMoved = false;
      startY = e.pageY - container.offsetTop;
      scrollTop = container.scrollTop;
      container.classList.add('is-dragging');
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        container.classList.remove('is-dragging');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const y = e.pageY - container.offsetTop;
      const walk = (y - startY) * 1.3; // 스크롤 이동 거리 및 감도

      if (Math.abs(walk) > 4) {
        this.hasMoved = true;
      }
      container.scrollTop = scrollTop - walk;
    });
  }

  renderCatalog(games) {
    this.gameCountEl.textContent = games.length;
    this.gameGridEl.innerHTML = '';

    if (games.length === 0) {
      this.gameGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px;">
          등록된 게임이 없습니다. <code>games/</code> 폴더에 첫 게임을 추가해보세요!
        </div>
      `;
      return;
    }

    games.forEach(({ meta, GameClass }) => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <div class="card-thumbnail" style="background: ${meta.thumbnailColor || 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)'}">
          ${meta.icon || '🎮'}
        </div>
        <div class="card-body">
          <span class="card-category">${meta.category || 'Arcade'}</span>
          <h3 class="card-title">${meta.title}</h3>
          <p class="card-desc">${meta.description || ''}</p>
          <div class="card-footer">
            <span>By ${meta.author || 'Anonymous'}</span>
            <span class="play-badge">PLAY ▶</span>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        // 드래그 중인 경우 클릭 방지
        if (this.hasMoved) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        this.openGameModal(meta, GameClass);
      });

      this.gameGridEl.appendChild(card);
    });
  }

  openGameModal(meta, GameClass) {
    if (this.currentGameInstance) {
      try { this.currentGameInstance.unmount(); } catch (e) { console.error(e); }
      this.currentGameInstance = null;
    }

    this.modalGameName.textContent = meta.title;
    this.modalEl.classList.add('active');

    this.currentGameInstance = new GameClass();
    this.currentGameInstance.mount(this.modalGameContainer);
  }

  closeGameModal() {
    if (this.currentGameInstance) {
      try { this.currentGameInstance.unmount(); } catch (e) { console.error(e); }
      this.currentGameInstance = null;
    }
    this.modalEl.classList.remove('active');
    this.modalGameContainer.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ArcadeLoungeApp();
});
