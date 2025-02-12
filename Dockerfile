# syntax = docker/dockerfile:1

# 設定 Node.js 版本
ARG NODE_VERSION=18.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# 設定工作目錄
WORKDIR /app

# 設定環境變數
ENV NODE_ENV="production"

# Build stage
FROM base AS build

# 安裝必要的系統工具
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# 複製 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 安裝所有依賴（包含開發環境）
RUN npm ci --include=dev

# 複製專案所有檔案
COPY . .

# 執行 `npm run build`
RUN npm run build

# 刪除開發依賴，減少 Docker 體積
RUN npm prune --omit=dev

# Final stage
FROM base

# 設定最終的工作目錄
WORKDIR /app

# 複製 `build` 階段的 `api/` 目錄到 `app/`
COPY --from=build /app/api /app/api

# 暴露 3000 端口
EXPOSE 3000

# 執行 `npm run start`
CMD ["npm", "run", "start"]
