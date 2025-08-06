# 多阶段构建 Dockerfile
FROM node:20-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码和配置文件
COPY . .

# prisma
RUN pnpm run db:generate

# 构建应用
RUN pnpm run build

# 生产阶段
FROM node:20-alpine AS production

# 设置工作目录
WORKDIR /app

# 从构建阶段复制 standalone 输出
# 文档：cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
COPY --from=builder /app/.next/standalone/ .
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public/ ./public

# 设置环境变量
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]