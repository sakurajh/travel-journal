#!/bin/bash
# ===== 旅行摄影日志 - 部署脚本 =====
# 使用 GitHub Pages 部署

echo "==================================="
echo "  旅行摄影日志 - 部署工具"
echo "==================================="
echo ""

# 检查是否安装了 git
if ! command -v git &> /dev/null; then
    echo "❌ 未检测到 Git，请先安装 Git"
    echo "下载地址: https://git-scm.com/downloads"
    exit 1
fi

# 创建部署目录
DEPLOY_DIR="deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "📦 准备部署文件..."

# 复制必要文件
cp index.html $DEPLOY_DIR/
cp style.css $DEPLOY_DIR/
cp app.js $DEPLOY_DIR/
cp storage.js $DEPLOY_DIR/

# 创建 .nojekyll 文件（GitHub Pages 需要）
touch $DEPLOY_DIR/.nojekyll

echo "✅ 文件准备完成"
echo ""
echo "==================================="
echo "  部署步骤"
echo "==================================="
echo ""
echo "1. 访问 https://github.com 注册账号（如果没有）"
echo ""
echo "2. 创建新仓库："
echo "   - 点击右上角 '+' -> 'New repository'"
echo "   - 仓库名: travel-journal"
echo "   - 选择 'Public'"
echo "   - 点击 'Create repository'"
echo ""
echo "3. 在当前目录打开终端，执行以下命令："
echo ""
echo "   cd deploy"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/你的用户名/travel-journal.git"
echo "   git push -u origin main"
echo ""
echo "4. 开启 GitHub Pages："
echo "   - 进入仓库 -> Settings -> Pages"
echo "   - Source 选择 'Deploy from a branch'"
echo "   - Branch 选择 'main'，文件夹选择 '/ (root)'"
echo "   - 点击 Save"
echo ""
echo "5. 等待几分钟后访问："
echo "   https://你的用户名.github.io/travel-journal/"
echo ""
echo "==================================="
echo ""
echo "部署文件已准备在 deploy 目录中"
