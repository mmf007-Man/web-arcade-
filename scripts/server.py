"""
scripts/server.py

[Zero-Dependency Local Dev Server with Auto Game Discovery & Manifest Sync]
파이썬 내장 http.server 모듈을 사용하여 외부 패키지 설치(pip install) 0개로
index.html과 games/ 모듈들을 브라우저에 실시간 서빙합니다.
"""

import os
import sys
import json
import socket
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote

# Windows 콘솔 유니코드/이모지 출력 인코딩 오류 방지
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))

MIME_TYPES = {
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
}

DEFAULT_PORT = int(os.environ.get('PORT', 3000))

def get_discovered_games():
    games_dir = os.path.join(ROOT_DIR, 'games')
    if not os.path.exists(games_dir):
        return []

    game_ids = []
    try:
        for entry in os.listdir(games_dir):
            entry_path = os.path.join(games_dir, entry)
            if os.path.isdir(entry_path):
                if os.path.exists(os.path.join(entry_path, 'index.js')):
                    game_ids.append(entry)
    except Exception as e:
        print(f"⚠️ games 디렉터리 스캔 중 오류 발생: {e}")
        return []

    game_ids.sort()

    try:
        manifest_path = os.path.join(games_dir, 'manifest.json')
        current_content = ""
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r', encoding='utf-8') as f:
                current_content = f.read()

        new_content = json.dumps(game_ids, indent=2) + '\n'
        if current_content != new_content:
            with open(manifest_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("🔄 [Auto Sync] games/manifest.json이 최신 게임 목록으로 자동 갱신되었습니다.")
    except Exception as e:
        print(f"⚠️ manifest.json 동기화 실패: {e}")

    return game_ids

class ArcadeHTTPRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed_url = urlparse(self.path)
        req_path = unquote(parsed_url.path)

        if req_path in ('/api/games', '/games/manifest.json'):
            game_ids = get_discovered_games()
            response_data = json.dumps(game_ids, indent=2).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Content-Length', str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)
            return

        if req_path == '/':
            req_path = '/index.html'

        safe_path = os.path.normpath(req_path.lstrip('/'))
        file_path = os.path.join(ROOT_DIR, safe_path)
        
        real_root = os.path.realpath(ROOT_DIR)
        real_file = os.path.realpath(file_path)

        if not real_file.startswith(real_root):
            self.send_response(403)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b'403 Forbidden')
            return

        if not os.path.exists(real_file) or not os.path.isfile(real_file):
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(f"404 Not Found: {req_path}".encode('utf-8'))
            return

        _, ext = os.path.splitext(real_file.lower())
        content_type = MIME_TYPES.get(ext, 'application/octet-stream')

        try:
            with open(real_file, 'rb') as f:
                file_data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Content-Length', str(len(file_data)))
            self.end_headers()
            self.wfile.write(file_data)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(f"500 Internal Server Error: {e}".encode('utf-8'))

def start_server(port):
    try:
        server = HTTPServer(('localhost', port), ArcadeHTTPRequestHandler)
        detected = get_discovered_games()
        print(f"""
==========================================================
🕹️  [Web Arcade Dev Server (Python)] 실행 완료!
----------------------------------------------------------
👉 로컬 주소: http://localhost:{port}
👉 탐색된 게임 목록 ({len(detected)}개): {', '.join(detected)}
----------------------------------------------------------
💡 games/ 폴더에 새 게임 폴더(index.js)만 추가하면
    GitHub Pages용 manifest.json도 알아서 자동 갱신됩니다!
==========================================================
""")
        sys.stdout.flush()
        server.serve_forever()
    except OSError as e:
        if e.errno in (98, 10048):
            print(f"⚠️  Port {port} is in use. Trying port {port + 1}...")
            start_server(port + 1)
        else:
            print(f"Server error: {e}")
    except KeyboardInterrupt:
        print("\n👋 서버를 종료합니다.")
        sys.exit(0)

if __name__ == '__main__':
    start_server(DEFAULT_PORT)
