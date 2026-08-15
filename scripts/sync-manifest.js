/**
 * scripts/sync-manifest.js
 * 
 * games/ 디렉터리를 스캔하여 index.js를 보유한 모든 게임 폴더를 찾고
 * games/manifest.json 파일을 자동으로 갱신합니다.
 * (GitHub Actions 및 로컬 공용)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function syncManifest() {
  const gamesDir = path.join(ROOT_DIR, 'games');
  if (!fs.existsSync(gamesDir)) {
    console.error('❌ games directory not found');
    process.exit(1);
  }

  const entries = fs.readdirSync(gamesDir, { withFileTypes: true });
  const gameIds = entries
    .filter(entry => {
      if (!entry.isDirectory()) return false;
      const entryJs = path.join(gamesDir, entry.name, 'index.js');
      return fs.existsSync(entryJs);
    })
    .map(entry => entry.name)
    .sort();

  const manifestPath = path.join(gamesDir, 'manifest.json');
  const newContent = JSON.stringify(gameIds, null, 2) + '\n';
  const currentContent = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf-8') : '';

  if (currentContent !== newContent) {
    fs.writeFileSync(manifestPath, newContent, 'utf-8');
    console.log(`✅ [Auto Sync] games/manifest.json updated with ${gameIds.length} games: ${gameIds.join(', ')}`);
  } else {
    console.log(`✨ [Up to Date] games/manifest.json is already up to date (${gameIds.length} games).`);
  }
}

syncManifest();
