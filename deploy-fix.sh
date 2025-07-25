#!/bin/bash

# 修复版部署脚本

set -e

echo "🚀 Starting BSVGO deployment..."

# 进入项目目录
cd /home/***/bsvgo || {
  echo "Project directory not found, creating..."
  mkdir -p /home/***/bsvgo
  cd /home/***/bsvgo
}

# 拉取最新代码
if [ -d ".git" ]; then
  echo "📥 Pulling latest code..."
  git pull origin main
else
  echo "📥 Cloning repository..."
  git clone https://github.com/tye-js/bsvgo.git .
fi

# 创建环境变量文件
echo "⚙️  Creating environment file..."
cat > .env << 'EOF'
# 数据库配置
POSTGRES_DB=bsvgo_db
POSTGRES_USER=bsvgo
POSTGRES_PASSWORD=Ty6413ty521
DATABASE_URL=postgresql://bsvgo:Ty6413ty521@postgres:5432/bsvgo_db

# NextAuth 配置
NEXTAUTH_URL=https://bsvgo.com
NEXTAUTH_SECRET=Ty6413ty521

# GitHub OAuth 配置
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 应用配置
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://bsvgo.com

# 域名配置
DOMAIN=bsvgo.com
EOF

# 登录到 GitHub Container Registry
echo "🔐 Logging into GitHub Container Registry..."
echo *** | docker login ghcr.io -u tye-js --password-stdin

# 拉取最新镜像
echo "📦 Pulling latest Docker image..."
DEPLOY_IMAGE_TAG="ghcr.io/tye-js/bsvgo:main"
echo "Pulling: ${DEPLOY_IMAGE_TAG}"
docker pull "${DEPLOY_IMAGE_TAG}"

# 更新 docker-compose.yml 中的镜像标签
echo "🔧 Updating docker-compose.yml..."
sed -i "s|image: ghcr.io/tye-js/bsvgo:.*|image: ${DEPLOY_IMAGE_TAG}|g" docker-compose.yml

# 停止现有服务
echo "🛑 Stopping existing services..."
docker-compose down || true

# 清理未使用的镜像
echo "🧹 Cleaning up unused images..."
docker image prune -f || true

# 分步启动服务
echo "🗄️  Starting PostgreSQL..."
docker-compose up -d postgres

# 等待数据库启动
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U bsvgo -d bsvgo_db > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    echo -n "."
    sleep 2
done

# 创建数据库（如果不存在）
echo "📊 Ensuring database exists..."
docker-compose exec -T postgres psql -U bsvgo -c "CREATE DATABASE bsvgo_db;" 2>/dev/null || echo "Database already exists"

# 启动应用
echo "🖥️  Starting application..."
docker-compose up -d app

# 等待应用启动
echo "⏳ Waiting for application to be ready..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application is ready"
        break
    fi
    echo -n "."
    sleep 2
done

# 启动 Nginx
echo "🌐 Starting Nginx..."
docker-compose up -d nginx

# 等待所有服务启动
echo "⏳ Waiting for all services..."
sleep 10

# 检查服务状态
echo "📋 Checking service status..."
docker-compose ps

# 检查应用健康状态
echo "🔍 Checking application health..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application health check passed"
else
    echo "❌ Application health check failed"
fi

# 检查 Nginx 访问
echo "🔍 Checking Nginx access..."
if curl -I http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx access successful"
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📱 Access your application at: http://$(curl -s ifconfig.me)"
    echo "🔐 Admin login: admin@bsvgo.com / admin123"
else
    echo "❌ Nginx access failed"
    echo "📋 Checking logs..."
    docker-compose logs nginx
fi

echo "✨ Deployment script finished!"
