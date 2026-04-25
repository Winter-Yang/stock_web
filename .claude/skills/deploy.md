---
name: deploy
description: 将 Web 项目构建、提交到 Git 后，SSH 登录腾讯云服务器自动 git pull 并重启 PM2
license: MIT
---

# 腾讯云部署 Skill

## 功能

一键完成 Web 项目从本地到腾讯云服务器的部署流程：
1. **本地构建**：执行 `vite build` 打包前端
2. **提交推送**：`git add/commit/push` 到远程仓库
3. **远程拉取**：SSH 到服务器执行 `git pull` 获取最新代码
4. **远程构建**：在服务器上重新 `vite build`
5. **重启服务**：`pm2 restart main` 重启 Express 服务

## 使用方法

**前置配置**：复制 `.deploy.env.example` 为 `.deploy.env`，填入服务器 IP 等信息。

**执行部署**：
```bash
./deploy.sh
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEPLOY_HOST` | 腾讯云服务器 IP | 需手动填写 |
| `DEPLOY_USER` | SSH 用户名 | `root` |
| `DEPLOY_PORT` | SSH 端口 | `22` |

## 服务器要求

- 已配置 SSH 免密登录（推荐）
- Node.js 已安装（当前服务器版本 v23.10.0）
- PM2 已安装并运行 `main` 进程
- 项目目录：`/root/ywd_program/stock/stock_web`

## 快速部署（跳过配置）

如果已配置 `.deploy.env`，直接运行：
```bash
source .deploy.env && ./deploy.sh
```
