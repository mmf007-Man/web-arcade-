/**
 * scripts/build.js
 * 
 * [Source of Truth: games/ 폴더]
 * games/ 폴더의 게임 모듈(index.js, style.css)들과 manifest.json을 자동으로 번들링하여
 * 더블클릭(file://)만으로 실행 가능한 단일 통합 파일 `game.html`을 생성합니다.
 * 
 * 실행 방법:
 *  node scripts/build.js
 *  또는 npm run build / npm run sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function resolveModuleFiles(entryFilePath) {
  const visited = new Set();
  const fileContents = [];

  function traverse(filePath) {
    const absPath = path.resolve(filePath);
    if (visited.has(absPath)) return;
    visited.add(absPath);

    if (!fs.existsSync(absPath)) {
      console.warn(`[Build Warning] File not found: ${absPath}`);
      return;
    }

    const dir = path.dirname(absPath);
    let code = fs.readFileSync(absPath, 'utf-8');

    // Find local relative imports (e.g., import ... from './logic/...js')
    const importRegex = /import\s+(?:[\w*\s{},]+from\s+)?['"](\.\/[^'"]+)['"];?/g;
    let match;
    const dependencies = [];
    while ((match = importRegex.exec(code)) !== null) {
      let depRelPath = match[1];
      if (!depRelPath.endsWith('.js')) depRelPath += '.js';
      dependencies.push(path.resolve(dir, depRelPath));
    }

    // Traverse dependencies first (depth-first)
    for (const dep of dependencies) {
      traverse(dep);
    }

    // Clean code for inlining: remove imports, strip exports, and safely handle import.meta
    let cleanedCode = code
      .replace(/import\s+[^;]+;?/g, '') // remove import statements
      .replace(/export\s+const\s+/g, 'const ')
      .replace(/export\s+let\s+/g, 'let ')
      .replace(/export\s+var\s+/g, 'var ')
      .replace(/export\s+function\s+/g, 'function ')
      .replace(/export\s+class\s+/g, 'class ')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s*\{[^}]*\};?/g, '') // remove export { ... }
      .replace(/import\.meta\.url/g, 'window.location.href'); // fallback for standard script tags

    fileContents.push({ path: absPath, code: cleanedCode });
  }

  traverse(entryFilePath);
  return fileContents;
}

function build() {
  console.log('🚀 [Web Arcade Builder] Starting standalone game.html generation...');

  const manifestPath = path.join(ROOT_DIR, 'games', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('games/manifest.json not found!');
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`📦 Registered games in manifest: ${manifest.join(', ')}`);

  // 1. Read Base CSS
  const mainCssPath = path.join(ROOT_DIR, 'css', 'style.css');
  const mainCss = fs.existsSync(mainCssPath) ? fs.readFileSync(mainCssPath, 'utf-8') : '';

  // 2. Collect Games CSS & Bundle Games JS
  let gameStylesHtml = '';
  let bundledGamesCode = '';

  manifest.forEach((gameId) => {
    const gameDir = path.join(ROOT_DIR, 'games', gameId);
    const stylePath = path.join(gameDir, 'style.css');
    const entryJsPath = path.join(gameDir, 'index.js');

    if (!fs.existsSync(entryJsPath)) {
      console.warn(`⚠️ [Skip] Entry file not found: games/${gameId}/index.js`);
      return;
    }

    // Game CSS
    if (fs.existsSync(stylePath)) {
      const styleContent = fs.readFileSync(stylePath, 'utf-8');
      gameStylesHtml += `\n    <style id="style-${gameId}">\n    /* Game Style: ${gameId} */\n    ${styleContent}\n    </style>\n`;
    }

    // Game JS
    const modules = resolveModuleFiles(entryJsPath);
    let combinedJs = modules.map(m => m.code).join('\n\n');

    bundledGamesCode += `
    // ========================================================
    // Game Plugin: ${gameId}
    // ========================================================
    const GamePlugin_${gameId.replace(/[^a-zA-Z0-9_]/g, '_')} = (function() {
      ${combinedJs}
      return { meta, GameClass: typeof Game !== 'undefined' ? Game : null };
    })();
    REGISTERED_GAMES.push(GamePlugin_${gameId.replace(/[^a-zA-Z0-9_]/g, '_')});
`;
  });

  // 3. Construct complete standalone game.html
  const standaloneHtml = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>👾 웹 오락실 (9:16 Mobile Arcade Lounge - Standalone)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
    /* ========================================================
       1. Base Lounge CSS
       ======================================================== */
    ${mainCss}
    </style>
    <!-- ========================================================
         2. Inlined Game Styles
         ======================================================== -->
    ${gameStylesHtml}
  </head>
  <body>
    <!-- 9:16 모바일 뷰포트 래퍼 -->
    <div class="mobile-app-wrapper">
      <header class="arcade-header">
        <div class="arcade-logo">
          <span>🕹️</span> ARCADE LOUNGE
        </div>
        <div class="arcade-tagline">
          9:16 모바일 스마트폰 특화 웹 오락실 (더블클릭 단일 실행용)
        </div>
      </header>

      <main class="arcade-container">
        <section class="hero-banner">
          <h1 class="hero-title">MOBILE ARCADE 🎮</h1>
          <p class="hero-subtitle">
            더블클릭만으로 서버 없이 즉시 구동되는 9:16 모바일 스마트폰 비율의 웹 오락실입니다.
          </p>
        </section>

        <section>
          <h2 class="section-title">
            <span>🎯</span> 게임 카탈로그 (<span id="game-count">0</span>)
          </h2>
          <div class="game-grid" id="game-grid">
            <!-- 동적 모듈 카드가 렌더링됩니다 -->
          </div>
        </section>
      </main>

      <!-- 모바일 실행 모달 -->
      <div class="modal-overlay" id="game-modal">
        <div class="modal-window">
          <div class="modal-header">
            <div class="modal-title" id="modal-title">
              <span>🎮</span> <span id="modal-game-name">게임 제목</span>
            </div>
            <button class="modal-close-btn" id="modal-close-btn">&times;</button>
          </div>
          <div class="modal-content" id="modal-game-container">
            <!-- 선택된 게임이 mount 됩니다 -->
          </div>
        </div>
      </div>
    </div>

    <script>
    // ========================================================
    // Standalone Arcade Runtime Engine
    // (Generated by scripts/build.js - Do NOT edit manually)
    // ========================================================
    const REGISTERED_GAMES = [];

    ${bundledGamesCode}

    class StandaloneArcadeApp {
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

      init() {
        this.bindEvents();
        this.renderCatalog(REGISTERED_GAMES);
      }

      bindEvents() {
        this.modalCloseBtn.addEventListener('click', () => this.closeGameModal());
        this.modalEl.addEventListener('click', (e) => {
          if (e.target === this.modalEl) this.closeGameModal();
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

        games.forEach(({ meta, GameClass }) => {
          if (!meta || !GameClass) return;

          const card = document.createElement('div');
          card.className = 'game-card';
          card.innerHTML = \`
            <div class="card-thumbnail" style="background: \${meta.thumbnailColor || 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)'}">
              \${meta.icon || '🎮'}
            </div>
            <div class="card-body">
              <span class="card-category">\${meta.category || 'Arcade'}</span>
              <h3 class="card-title">\${meta.title}</h3>
              <p class="card-desc">\${meta.description || ''}</p>
              <div class="card-footer">
                <span>By \${meta.author || 'Anonymous'}</span>
                <span class="play-badge">PLAY ▶</span>
              </div>
            </div>
          \`;

          card.addEventListener('click', () => {
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
      new StandaloneArcadeApp();
    });
    </script>
  </body>
</html>
`;

  const outputPath = path.join(ROOT_DIR, 'game.html');
  fs.writeFileSync(outputPath, standaloneHtml, 'utf-8');
  console.log(`✅ [Success] Successfully generated standalone ${outputPath}`);
  console.log(`📊 Total games bundled: ${manifest.length} (${(standaloneHtml.length / 1024).toFixed(1)} KB)`);
}

build();
