@echo off
chcp 65001 >nul
title سایت + پنل - عطر شالیزار
cd /d "%~dp0"
echo سایت:   http://localhost:8080
echo پنل:    http://127.0.0.1:3001
start "Panel" cmd /k "chcp 65001 >nul & node "%~dp0panel\server.cjs""
node "%~dp0node_modules\vite\bin\vite.js" --host --port 8080
pause
