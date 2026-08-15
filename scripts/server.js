/**
 * scripts/server.js
 * 
 * [Zero-Dependency Local Dev Server with Auto Game Discovery & Manifest Sync]
 * Node.js 내장 http 모듈을 사용하여 외부 패키지 설치(npm i) 0개로
 * index.html과 games/ 모듈들을 브라우저에 실시간 서빙합니다.
 * 
 * ⭐️ 자동 게임 감지 & GitHub Pages 자동 동기화:
 *   - games/ 디렉터리를 실시간으로 자동 스캔합니다.
 *   - 새 게임 폴더가 감지되면 정적 호스팅(GitHub Pages)용 `games/manifest.json`도 
 *     자동으로 최신화하여 저장하므로, GitHub 배포 시에도 100% 동일하게 자동 동작합니다!
 * 
 * 실행 방법:
 *   npm run dev  또는  npm start  또는  node scripts/server.js
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2'
};

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// games/ 디렉터리 내에 index.js를 보유한 모든 게임 폴더 목록을 자동 탐색 & manifest.json 동기화
function getDiscoveredGames() {
  const gamesDir = path.join(ROOT_DIR, 'games');
  if (!fs.existsSync(gamesDir)) return [];

  const entries = fs.readdirSync(gamesDir, { withFileTypes: true });
  const gameIds = entries
    .filter(entry => {
      if (!entry.isDirectory()) return false;
      const entryJs = path.join(gamesDir, entry.name, 'index.js');
      return fs.existsSync(entryJs);
    })
    .map(entry => entry.name);

  // ⭐️ GitHub Pages(정적 호스팅)를 위해 manifest.json 자동 동기화 저장
  try {
    const manifestPath = path.join(gamesDir, 'manifest.json');
    const currentContent = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf-8') : '';
    const newContent = JSON.stringify(gameIds, null, 2) + '\n';
    if (currentContent !== newContent) {
      fs.writeFileSync(manifestPath, newContent, 'utf-8');
      console.log(`🔄 [Auto Sync] games/manifest.json이 최신 게임 목록으로 자동 갱신되었습니다.`);
    }
  } catch (err) {
    console.warn('⚠️ manifest.json 동기화 실패:', err);
  }

  return gameIds;
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    // URL 디코딩 및 쿼리스트링 제거
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    let reqPath = decodeURIComponent(reqUrl.pathname);

    // ⭐️ 1. 자동 게임 목록 API (manifest.json 요청 또는 /api/games 요청 시 실시간 폴더 스캔 반환)
    if (reqPath === '/api/games' || reqPath === '/games/manifest.json') {
      const gameIds = getDiscoveredGames();
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(JSON.stringify(gameIds, null, 2));
      return;
    }

    if (reqPath === '/') {
      reqPath = '/index.html';
    }

    const filePath = path.join(ROOT_DIR, reqPath);

    // 보안 검사: ROOT_DIR 외부 접근 차단
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${reqPath}`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // CORS 및 캐시 비활성화 (개발 편의성)
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    const detected = getDiscoveredGames();
    console.log(`
==========================================================
🕹️  [Web Arcade Dev Server] 실행 완료!
----------------------------------------------------------
👉 로컬 주소: http://localhost:${port}
👉 탐색된 게임 목록 (${detected.length}개): ${detected.join(', ')}
----------------------------------------------------------
💡 games/ 폴더에 새 게임 폴더(index.js)만 추가하면
   GitHub Pages용 manifest.json도 알아서 자동 갱신됩니다!
==========================================================
`);
  });
}

startServer(DEFAULT_PORT);
