@echo off
chcp 65001 >nul
echo ===================================
echo   旅行摄影日志 - 部署工具
echo ===================================
echo.
echo 选择部署方式：
echo.
echo [1] GitHub Pages（推荐，最稳定）
echo [2] Vercel（最快，推荐）
echo [3] 查看详细教程
echo.
set /p choice=请输入选项 (1/2/3):

if "%choice%"=="1" goto github
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto tutorial
goto end

:github
echo.
echo ===================================
echo   GitHub Pages 部署步骤
echo ===================================
echo.
echo 1. 访问 https://github.com 注册账号
echo.
echo 2. 创建新仓库：
echo    - 点击右上角 '+' 然后选 'New repository'
echo    - 仓库名: travel-journal
echo    - 选择 'Public'
echo    - 点击 'Create repository'
echo.
echo 3. 在当前目录打开终端，执行：
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/travel-journal.git
echo    git push -u origin main
echo.
echo 4. 开启 GitHub Pages：
echo    - 进入仓库 -^> Settings -^> Pages
echo    - Source 选择 'Deploy from a branch'
echo    - Branch 选择 'main'，文件夹选择 '/ (root)'
echo    - 点击 Save
echo.
echo 5. 等待几分钟后访问：
echo    https://YOUR_USERNAME.github.io/travel-journal/
echo.
goto end

:vercel
echo.
echo ===================================
echo   Vercel 部署步骤（推荐，速度最快）
echo ===================================
echo.
echo 第一步：上传代码到 GitHub
echo.
echo 1. 访问 https://github.com 注册账号
echo.
echo 2. 创建新仓库：
echo    - 点击 '+' -^> 'New repository'
echo    - 仓库名: travel-journal
echo    - 选择 'Public'
echo    - 点击 'Create repository'
echo.
echo 3. 在当前目录打开终端，执行：
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/travel-journal.git
echo    git push -u origin main
echo.
echo 第二步：连接 Vercel
echo.
echo 1. 访问 https://vercel.com
echo.
echo 2. 点击 'Sign Up' -^> 选择 'Continue with GitHub'
echo.
echo 3. 登录后点击 'Add New...' -^> 'Project'
echo.
echo 4. 找到 travel-journal 仓库，点击 'Import'
echo.
echo 5. 配置：
echo    - Framework Preset: Other
echo    - Root Directory: ./
echo    - Build Command: 留空
echo    - Output Directory: .
echo.
echo 6. 点击 'Deploy'
echo.
echo 等待 1-2 分钟，你将获得链接：
echo https://travel-journal-xxx.vercel.app
echo.
echo 以后修改代码只需 git push，Vercel 会自动重新部署！
echo.
goto end

:tutorial
echo.
echo 详细教程请查看：
echo.
echo - VERCEL.md    （Vercel 部署教程）
echo - DEPLOY.md    （GitHub Pages 教程）
echo.
echo 打开方式：用记事本或任意文本编辑器打开
echo.
goto end

:end
echo.
pause
