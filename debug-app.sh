#!/bin/bash

# 应用调试脚本

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 BSVGO 应用调试脚本${NC}"
echo "=================================="

# 1. 检查环境变量
echo -e "${BLUE}📋 检查环境变量...${NC}"
if [ -f .env.production ]; then
    echo -e "${GREEN}✅ .env.production 文件存在${NC}"
    echo "关键环境变量:"
    grep -E "^(DATABASE_URL|POSTGRES_|NEXTAUTH_)" .env.production | sed 's/=.*/=***/'
else
    echo -e "${RED}❌ .env.production 文件不存在${NC}"
    exit 1
fi

# 2. 检查数据库连接
echo -e "${BLUE}🗄️  检查数据库连接...${NC}"
if docker ps | grep -q bsvgo-postgres; then
    echo -e "${GREEN}✅ PostgreSQL 容器运行中${NC}"
    
    # 测试数据库连接
    if docker exec bsvgo-postgres psql -U bsvgo -d bsvgo_db -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        echo "尝试连接到默认数据库..."
        if docker exec bsvgo-postgres psql -U bsvgo -d bsvgo -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  连接到 'bsvgo' 数据库成功，但配置中是 'bsvgo_db'${NC}"
        fi
    fi
else
    echo -e "${RED}❌ PostgreSQL 容器未运行${NC}"
fi

# 3. 检查应用容器状态
echo -e "${BLUE}🖥️  检查应用容器...${NC}"
if docker ps -a | grep -q bsvgo-app; then
    APP_STATUS=$(docker ps -a --filter name=bsvgo-app --format "{{.Status}}")
    echo "应用容器状态: $APP_STATUS"
    
    if [[ $APP_STATUS == *"Restarting"* ]]; then
        echo -e "${RED}❌ 应用容器一直在重启${NC}"
        echo -e "${YELLOW}查看最近的日志:${NC}"
        docker logs bsvgo-app --tail 20
    fi
else
    echo -e "${RED}❌ 应用容器不存在${NC}"
fi

# 4. 检查网络
echo -e "${BLUE}🌐 检查 Docker 网络...${NC}"
if docker network ls | grep -q bsvgo; then
    echo -e "${GREEN}✅ bsvgo 网络存在${NC}"
    docker network inspect bsvgo_bsvgo-network --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}'
else
    echo -e "${RED}❌ bsvgo 网络不存在${NC}"
fi

# 5. 尝试手动启动应用进行调试
echo -e "${BLUE}🧪 尝试手动调试应用...${NC}"
echo "停止现有应用容器..."
docker stop bsvgo-app 2>/dev/null || true
docker rm bsvgo-app 2>/dev/null || true

echo "手动启动应用容器进行调试..."
docker run --rm -it \
    --name bsvgo-app-debug \
    --network bsvgo_bsvgo-network \
    --env-file .env.production \
    -p 3000:3000 \
    bsvgo-app sh -c "
        echo '🔍 检查环境变量...'
        echo 'NODE_ENV:' \$NODE_ENV
        echo 'DATABASE_URL:' \$DATABASE_URL
        echo ''
        echo '🔍 测试数据库连接...'
        node -e \"
            const { Pool } = require('pg');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            pool.query('SELECT 1')
                .then(() => console.log('✅ 数据库连接成功'))
                .catch(err => console.error('❌ 数据库连接失败:', err.message))
                .finally(() => pool.end());
        \"
        echo ''
        echo '🚀 启动应用...'
        npm start
    "
