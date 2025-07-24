#!/bin/bash

# 服务启动脚本 - 确保正确的启动顺序

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo -e "${BLUE}🚀 启动 BSVGO 服务...${NC}"

# 停止现有服务
echo -e "${YELLOW}🛑 停止现有服务...${NC}"
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down

# 1. 启动数据库
echo -e "${BLUE}📊 启动数据库...${NC}"
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d postgres

# 等待数据库启动
echo -e "${YELLOW}⏳ 等待数据库启动...${NC}"
for i in {1..30}; do
    if docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T postgres pg_isready -U bsvgo -d bsvgo > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据库启动成功${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# 2. 启动应用
echo -e "${BLUE}🖥️  启动应用...${NC}"
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d app

# 等待应用启动
echo -e "${YELLOW}⏳ 等待应用启动...${NC}"
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 应用启动成功${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# 3. 启动 Nginx
echo -e "${BLUE}🌐 启动 Nginx...${NC}"
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d nginx

# 等待 Nginx 启动
echo -e "${YELLOW}⏳ 等待 Nginx 启动...${NC}"
sleep 10

# 检查 Nginx 状态
if docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps nginx | grep -q "Up"; then
    echo -e "${GREEN}✅ Nginx 启动成功${NC}"
else
    echo -e "${RED}❌ Nginx 启动失败${NC}"
    echo -e "${YELLOW}查看 Nginx 日志:${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs nginx
    exit 1
fi

# 最终检查
echo -e "${BLUE}🔍 最终服务检查...${NC}"
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps

# 测试访问
echo -e "${BLUE}🧪 测试访问...${NC}"
if curl -I http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服务访问正常${NC}"
    echo -e "${GREEN}🎉 所有服务启动完成！${NC}"
    echo ""
    echo -e "${BLUE}访问地址:${NC}"
    echo "  本地: http://localhost"
    echo "  IP: http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
    echo ""
    echo -e "${BLUE}管理员账号:${NC}"
    echo "  邮箱: admin@bsvgo.com"
    echo "  密码: admin123"
else
    echo -e "${RED}❌ 服务访问失败${NC}"
    echo -e "${YELLOW}查看所有日志:${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs
fi
