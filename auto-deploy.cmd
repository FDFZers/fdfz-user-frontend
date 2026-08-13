@echo off
setlocal EnableDelayedExpansion

echo ===========================
echo        自动部署已开始
echo ===========================

rem 先把常见安装目录加入 PATH，避免安装后当前会话立即识别不到
set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%LOCALAPPDATA%\npm;%LOCALAPPDATA%\pnpm"

echo 检测 Node.js ...
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js 未安装，开始自动安装...
    where winget >nul 2>nul
    if not errorlevel 1 (
        echo winget存在且可用，正在安装 Node.js LTS...
        winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    ) else (
        where choco >nul 2>nul
        if not errorlevel 1 (
            echo winget未被发现，choco存在且可用，正在安装 Node.js LTS...
            choco install nodejs-lts -y
        ) else (
            echo 未检测到 winget / choco，使用官方 MSI 安装包...
            set "NODE_MSI=%TEMP%\nodejs-latest.msi"
            powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v24.19.0/node-v24.19.0-x64.msi' -OutFile '%NODE_MSI%'"
            if exist "%NODE_MSI%" (
                msiexec /i "%NODE_MSI%" /qn
            ) else (
                echo Node.js 安装失败，请尝试手动下载安装，链接：https://nodejs.org/dist/v24.19.0/node-v24.19.0-x64.msi
                exit /b 1
            )
        )
    )

    rem 刷新 PATH
    set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%LOCALAPPDATA%\npm"
)

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js 安装失败，请尝试手动下载安装，链接：https://nodejs.org/dist/v24.19.0/node-v24.19.0-x64.msi
    exit /b 1
)

for /f "delims=" %%i in ('node -v 2^>nul') do set "NODE_VERSION=%%i"
echo Node.js 已安装: %NODE_VERSION%

rem ===== 检测 pnpm =====
where pnpm >nul 2>nul
if errorlevel 1 (
    echo pnpm 未安装，开始自动安装...
    where corepack >nul 2>nul
    if not errorlevel 1 (
        echo 使用 npm 全局安装 pnpm...
        npm install -g pnpm
    )
)

where pnpm >nul 2>nul
if errorlevel 1 (
    echo pnpm 安装后仍然无法识别，请重开命令行窗口再运行
    exit /b 1
)

for /f "delims=" %%i in ('pnpm -v 2^>nul') do set "PNPM_VERSION=%%i"
echo pnpm 已安装: %PNPM_VERSION%

rem 克隆github仓库并切换目录
echo 正在克隆仓库...
git clone https://github.com/FDFZers/fdfz-user-frontend.git C:\fdfz-user-frontend
cd C:\fdfz-user-frontend
rem 部署并启动
echo 正在安装依赖...
pnpm install
echo 正在启动...
start "" cmd /k "cd C:\fdfz-user-frontend && pnpm dev"

echo.
echo 脚本执行完成
exit /b 0