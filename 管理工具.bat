@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   ZionyasVan 内容管理工具
echo ========================================
echo.
echo 正在启动服务器...
start /b node "%~dp0manage-server.cjs"
ping -n 2 127.0.0.1 >nul
start "" http://localhost:3456
echo.
echo 浏览器已打开，请勿关闭此窗口。
echo 使用完毕后按任意键退出...
pause >nul
