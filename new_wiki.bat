@echo off
cd /d "%~dp0"
set /p "postTitle=Wiki title: "
call npm run new:wiki -- "%postTitle%"
