@echo off
chcp 65001 > nul
title 👾 Web Arcade Lounge Server

echo ========================================================
echo 🕹️  Web Arcade Lounge 로컬 서버를 실행합니다...
echo ========================================================
echo.

cd /d "%~dp0"

:: 1.5초 후 기본 웹 브라우저에서 오락실 페이지 자동 열기
start "" http://localhost:3000

:: 로컬 개발 서버 실행
set PYTHONUNBUFFERED=1
python scripts/server.py

pause
