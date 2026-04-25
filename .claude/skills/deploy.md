---
name: deploy
description: 一键部署 Web 项目到腾讯云服务器。触发词：部署、部署到腾讯云、部署到服务器、开始部署、发布、publish、deploy、上线
license: MIT
---

# 腾讯云部署 Skill

## 触发词

当用户提到以下任一关键词时，执行部署流程：
- 部署 / 部署到腾讯云 / 部署到服务器 / 开始部署
- 发布 / 上线 / publish / deploy
- 更新到线上 / 同步到服务器

## 部署流程

### 步骤 1：确认配置
检查 `.deploy.env` 是否存在且配置正确。

### 步骤 2：执行部署脚本
```bash
./deploy.sh
```

脚本自动完成：
1. **本地构建**：`vite build` 打包前端
2. **Git 提交**：`git add/commit/push`
3. **部署到服务器**（根据 `DEPLOY_MODE`）：
   - `scp`（默认）：SCP 上传 `web/YHybrid` + `main.js`，然后 `pm2 restart`
   - `git`：SSH 到服务器 `git pull` + `vite build` + `pm2 restart`

### 步骤 3：验证
部署完成后验证关键页面：
```bash
# 验证板块排行
curl -s http://服务器IP:8233/BlockRankPage | grep -o 'id="app"'

# 验证涨停梯队
curl -s http://服务器IP:8233/LimitUpLadder | grep -o 'id="app"'

# 验证 API 代理
curl -s http://服务器IP:8233/api/10jqka/pick/block/... | python3 -m json.tool
```

## 配置说明

`.deploy.env` 文件：
```
DEPLOY_HOST=tencent-stock      # SSH Host（~/.ssh/config 中的 Host 名或服务器 IP）
DEPLOY_USER=root               # SSH 用户名
DEPLOY_PORT=22                 # SSH 端口
DEPLOY_MODE=scp                # scp（直接传文件） 或 git（服务器 git pull）
```

## 故障排查

### PM2 重启失败
服务器上 PM2 路径可能变化，用完整路径：
```
/root/.nvm/nvm-0.39.1/versions/node/v23.10.0/bin/node /root/.nvm/npm-versions/lib/node_modules/pm2/bin/pm2 restart main
```

### API 代理 404
说明 `main.js` 未同步到服务器，SCP 模式需要上传 `main.js`。

### 端口问题
Express 监听 `3000`，但外部域名可能通过 Nginx 反代到 `8233`，验证时用 `8233` 端口。
