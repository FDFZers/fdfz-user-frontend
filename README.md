# ffwiki

技术栈：React + Go

## 项目结构

```
ffwiki/
├── client/   # 前端：Vite + React 19 + TypeScript + Tailwind CSS v4 + HeroUI
├── server/   # 后端：Go
├── README.md
└── .gitignore
```

## 环境要求

- Node.js（v18 及以上）
- pnpm（9.x 及以上）
- Go（1.22 及以上）

## 启动前端（client）

```bash
cd client
pnpm install
pnpm dev
```

启动后访问 http://localhost:5173

常用命令：

- `pnpm dev` — 启动开发服务器（支持 HMR）
- `pnpm build` — 构建生产版本
- `pnpm preview` — 本地预览构建产物

> 开发环境下，前端会把 `/api` 请求代理到 `http://localhost:8080`（即后端服务）。

## 启动后端（server）& 前后端联调

`to be delivered`

## 构建生产版本

前端：

```bash
cd client
pnpm build
# 产物输出到 client/dist
```
