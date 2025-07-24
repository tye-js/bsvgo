# 使用官方 Node.js 22 镜像作为基础镜像
FROM node:22-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装依赖阶段
FROM base AS deps
# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 配置 npm 镜像源
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3 && \
    npm config set audit false

# 安装生产依赖
RUN npm ci --only=production --no-audit --verbose

# 构建阶段
FROM base AS builder
# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 配置 npm 以提高网络稳定性
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3 && \
    npm config set audit false

# 安装所有依赖（包括开发依赖）
RUN npm ci --no-audit --verbose

# 复制源代码
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# 生产阶段
FROM base AS runner

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制数据库脚本和入口脚本
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/db ./db

# 确保入口脚本可执行
USER root

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 使用入口脚本启动应用
CMD ["node", "server.js"]
