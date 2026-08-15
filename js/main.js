import { gameRegistry } from './registry.js';

class ArcadeLoungeApp {
  constructor() {
    this.gameGridEl = document.getElementById('game-grid');
    this.gameCountEl = document.getElementById('game-count');
    this.modalEl = document.getElementById('game-modal');
    this.modalGameContainer = document.getElementById('modal-game-container');
    this.modalGameName = document.getElementById('modal-game-name');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    this.currentGameInstance = null;

    this.init();
  }

  async init() {
    this.bindEvents();
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

  renderCatalog(games) {
    this.gameCountEl.textContent = games.length;
    this.gameGridEl.innerHTML = '';

    if (games.length === 0) {
      this.gameGridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px;">
          등록된 게임이 없습니다. <code>games/manifest.json</code>에 첫 게임을 추가해보세요!
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

      card.addEventListener('click', () => {
        this.openGameModal(meta, GameClass);
      });

      this.gameGridEl.appendChild(card);
    });
  }

  openGameModal(meta, GameClass) {
    if (this.currentGameInstance) {
      this.currentGameInstance.unmount();
      this.currentGameInstance = null;
    }

    this.modalGameName.textContent = meta.title;
    this.modalEl.classList.add('active');

    this.currentGameInstance = new GameClass();
    this.currentGameInstance.mount(this.modalGameContainer);
  }

  closeGameModal() {
    if (this.currentGameInstance) {
      this.currentGameInstance.unmount();
      this.currentGameInstance = null;
    }
    this.modalEl.classList.remove('active');
    this.modalGameContainer.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ArcadeLoungeApp();
});
