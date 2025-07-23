#!/bin/bash

# 快速启动脚本
# 用于本地开发环境快速启动

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 启动 BSVGO 本地开发环境${NC}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 创建环境变量文件...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ 已创建 .env 文件，请根据需要修改配置${NC}"
fi

# 选择启动模式
echo -e "${BLUE}请选择启动模式:${NC}"
echo "1. 本地开发 (仅数据库)"
echo "2. 完整本地环境 (包含应用容器)"
echo "3. 生产环境模拟"
read -p "请输入选择 (1-3): " choice

case $choice in
    1)
        echo -e "${BLUE}🔧 启动开发环境 (仅基础服务)...${NC}"
        docker-compose -f docker-compose.dev.yml up -d
        echo -e "${GREEN}✅ 开发环境已启动${NC}"
        echo -e "${YELLOW}💡 现在可以运行 'npm run dev' 启动开发服务器${NC}"
        echo -e "${YELLOW}💡 如果是首次启动，请先运行 'npm run db:init' 初始化数据库${NC}"
        ;;
    2)
        echo -e "${BLUE}🔧 启动完整本地环境...${NC}"
        docker-compose -f docker-compose.local.yml up -d --build
        echo -e "${GREEN}✅ 本地环境已启动${NC}"
        echo -e "${YELLOW}💡 应用将在 http://localhost:3000 运行${NC}"
        ;;
    3)
        echo -e "${BLUE}🔧 启动生产环境模拟...${NC}"
        docker-compose up -d --build
        echo -e "${GREEN}✅ 生产环境已启动${NC}"
        echo -e "${YELLOW}💡 应用将在 http://localhost 运行 (通过 Nginx)${NC}"
        ;;
    *)
        echo -e "${YELLOW}❌ 无效选择${NC}"
        exit 1
        ;;
esac

# 等待服务启动
echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 10

# 显示服务状态
echo -e "${BLUE}📊 服务状态:${NC}"
case $choice in
    1)
        docker-compose -f docker-compose.dev.yml ps
        ;;
    2)
        docker-compose -f docker-compose.local.yml ps
        ;;
    3)
        docker-compose ps
        ;;
esac

echo -e "${GREEN}🎉 启动完成！${NC}"

# 显示有用的命令
echo -e "${BLUE}📋 常用命令:${NC}"
case $choice in
    1)
        echo "  查看日志: docker-compose -f docker-compose.dev.yml logs -f"
        echo "  停止服务: docker-compose -f docker-compose.dev.yml down"
        echo "  启动开发: npm run dev"
        ;;
    2)
        echo "  查看日志: docker-compose -f docker-compose.local.yml logs -f"
        echo "  停止服务: docker-compose -f docker-compose.local.yml down"
        echo "  访问应用: http://localhost:3000"
        ;;
    3)
        echo "  查看日志: docker-compose logs -f"
        echo "  停止服务: docker-compose down"
        echo "  访问应用: http://localhost"
        ;;
esac

echo "  查看健康状态: curl http://localhost:3000/api/health"
