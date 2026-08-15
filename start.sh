#!/usr/bin/env bash

# ========================================================
# 👾 Web Arcade Lounge Server Launcher (Mac / Linux)
# ========================================================

cd "$(dirname "$0")"

echo "========================================================"
echo "🕹️  Web Arcade Lounge 로컬 서버를 실행합니다..."
echo "========================================================"
echo ""

# 브라우저 자동 오픈 (Mac: open, Linux: xdg-open)
if command -v open > /dev/null; then
  (sleep 1 && open http://localhost:3000) &
elif command -v xdg-open > /dev/null; then
  (sleep 1 && xdg-open http://localhost:3000) &
fi

# 로컬 개발 서버 실행
node scripts/server.js
