# ffwiki

技术栈：React + TypeScript + Tailwind CSS + HeroUI

## 环境要求

- Node.js（v24 及以上）
- pnpm（11.x 及以上）

## 启动项目
<!-- ### 快速部署
执行
```powershell
powershell -ExecutionPolicy Bypass -Command "(New-Object Net.WebClient).DownloadString('https://example.com/script.ps1') | Invoke-Expression"
```
或者手动下载脚本 [>下载<]() -->
### 手动部署
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
