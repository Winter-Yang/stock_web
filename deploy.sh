#!/bin/bash
set -e

# 加载部署配置
ENV_FILE="$(cd "$(dirname "$0")" && pwd)/.deploy.env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

DEPLOY_MODE="${DEPLOY_MODE:-scp}"       # 默认 scp 模式
SSH_HOST="${DEPLOY_HOST:?错误: 请配置 .deploy.env 中的 DEPLOY_HOST}"
SSH_USER="${DEPLOY_USER:-root}"
SSH_PORT="${DEPLOY_PORT:-22}"
REMOTE_DIR="/root/ywd_program/stock/stock_web"
PM2_NAME="main"
WEB_DIR="$(cd "$(dirname "$0")" && pwd)/web"

echo "=========================================="
echo "  部署到腾讯云: $SSH_USER@$SSH_HOST"
echo "  模式: $DEPLOY_MODE"
echo "=========================================="

# ---- 步骤 1: 本地构建前端 ----
echo ""
echo "📦 [1/3] 构建前端..."
cd "$WEB_DIR"
./node_modules/.bin/vite build
echo "✅ 构建完成"

# ---- 步骤 2: 提交并推送 Git ----
cd "$(dirname "$0")"
echo ""
echo "📤 [2/3] 提交并推送 Git..."
git add -A
if git diff --cached --quiet; then
    echo "⚠️  无变更，跳过 commit"
else
    git commit -m "deploy: 自动部署 $(date '+%Y-%m-%d %H:%M:%S')"
fi
git push
echo "✅ Git 推送完成"

# ---- 步骤 3: 部署到服务器 ----
echo ""
if [ "$DEPLOY_MODE" = "git" ]; then
    echo "🔄 [3/3] 远程 git pull + 重启 PM2..."
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" << EOF
  set -e
  cd "$REMOTE_DIR"
  git pull
  cd web
  ./node_modules/.bin/vite build
  cd ..
  pm2 restart $PM2_NAME
  echo "✅ 完成"
EOF
else
    echo "📤 [3/3] SCP 上传构建产物 + 重启 PM2..."
    # 上传整个 YHybrid 目录（先删除再上传，保证干净）
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "rm -rf $REMOTE_DIR/web/YHybrid"
    scp -P "$SSH_PORT" -r "$WEB_DIR/YHybrid" "$SSH_USER@$SSH_HOST:$REMOTE_DIR/web/"
    # 重启 PM2
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "pm2 restart $PM2_NAME"
    echo "✅ 文件已上传，PM2 已重启"
fi

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
