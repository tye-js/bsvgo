#!/bin/bash

# 本地构建脚本
# 用于测试 Docker 镜像构建

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐳 开始本地 Docker 构建测试${NC}"

# 选择 Dockerfile
echo -e "${YELLOW}选择构建方式:${NC}"
echo "1. 使用优化后的 Dockerfile (推荐)"
echo "2. 使用备用 Dockerfile"
echo "3. 使用本地 Docker Compose 构建"
read -p "请输入选择 (1-3): " choice

case $choice in
    1)
        DOCKERFILE="Dockerfile"
        echo -e "${BLUE}📦 使用优化后的 Dockerfile 构建...${NC}"
        ;;
    2)
        DOCKERFILE="Dockerfile.alternative"
        echo -e "${BLUE}📦 使用备用 Dockerfile 构建...${NC}"
        ;;
    3)
        echo -e "${BLUE}📦 使用 Docker Compose 构建...${NC}"
        docker-compose -f docker-compose.local.yml build --no-cache
        echo -e "${GREEN}✅ Docker Compose 构建完成${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

# 构建镜像
IMAGE_NAME="bsvgo-local:latest"

echo -e "${BLUE}🔨 构建 Docker 镜像...${NC}"
echo "Dockerfile: $DOCKERFILE"
echo "镜像名称: $IMAGE_NAME"

# 执行构建
if docker build -f $DOCKERFILE -t $IMAGE_NAME . --no-cache; then
    echo -e "${GREEN}✅ 镜像构建成功${NC}"
    
    # 显示镜像信息
    echo -e "${BLUE}📊 镜像信息:${NC}"
    docker images $IMAGE_NAME
    
    # 询问是否运行测试
    read -p "是否运行容器测试? (y/n): " run_test
    
    if [[ $run_test == "y" || $run_test == "Y" ]]; then
        echo -e "${BLUE}🚀 启动测试容器...${NC}"
        
        # 停止现有容器
        docker stop bsvgo-test 2>/dev/null || true
        docker rm bsvgo-test 2>/dev/null || true
        
        # 启动测试容器
        docker run -d \
            --name bsvgo-test \
            -p 3001:3000 \
            -e DATABASE_URL="postgresql://bsvgo:test123@host.docker.internal:5432/bsvgo" \
            -e NEXTAUTH_SECRET="test-secret" \
            -e NEXTAUTH_URL="http://localhost:3001" \
            $IMAGE_NAME
        
        echo -e "${YELLOW}⏳ 等待容器启动...${NC}"
        sleep 10
        
        # 检查容器状态
        if docker ps | grep bsvgo-test > /dev/null; then
            echo -e "${GREEN}✅ 容器启动成功${NC}"
            echo -e "${BLUE}📱 应用地址: http://localhost:3001${NC}"
            echo -e "${BLUE}📋 查看日志: docker logs -f bsvgo-test${NC}"
            echo -e "${BLUE}🛑 停止容器: docker stop bsvgo-test${NC}"
        else
            echo -e "${RED}❌ 容器启动失败${NC}"
            echo -e "${YELLOW}📋 查看日志:${NC}"
            docker logs bsvgo-test
        fi
    fi
    
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 构建测试完成${NC}"
