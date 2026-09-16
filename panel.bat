@echo off
chcp 65001 >nul
title پنل مدیریت - عطر شالیزار
cd /d "%~dp0"
echo در حال اجرای پنل... مرورگر را باز کن: http://127.0.0.1:3001
node "%~dp0panel\server.cjs"
pause
