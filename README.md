# ffwiki

React + Go 的 Monorepo 项目。

## 项目结构

```
ffwiki/
├── client/   # 前端：Vite + React 19 + TypeScript + Tailwind CSS v4 + HeroUI
├── server/   # 后端：Go（目录结构）
├── README.md
└── .gitignore
```

## 环境要求

- Node.js（建议 v18 及以上）
- pnpm（建议 9.x 及以上）
- Go（建议 1.22 及以上）

## 启动前端（client）

```bash
cd client
pnpm install
pnpm dev
```

启动后访问 http://localhost:5173 。

常用命令：

- `pnpm dev` — 启动开发服务器（支持 HMR）
- `pnpm build` — 构建生产版本
- `pnpm preview` — 本地预览构建产物

> 开发环境下，前端会把 `/api` 请求代理到 `http://localhost:8080`（即后端服务）。

## 启动后端（server）

```bash
cd server
go mod tidy
go run ./cmd/server
```

启动后服务默认监听 http://localhost:8080 。

## 前后端联调

1. 终端 A：启动后端（见上文）
2. 终端 B：启动前端（见上文）
3. 前端通过 `/api` 代理访问后端接口

## 构建生产版本

前端：

```bash
cd client
pnpm build
# 产物输出到 client/dist
```

## 忽略规则

根目录 `.gitignore` 已忽略 `node_modules`、`dist`、`.env.local` 等文件。
