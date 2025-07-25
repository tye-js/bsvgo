#!/bin/bash

# VPS Docker 部署脚本
# 用于在 VPS 上部署 BSVGO 博客系统

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 配置变量
PROJECT_NAME="bsvgo"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo -e "${BLUE}🚀 BSVGO VPS 部署脚本${NC}"
echo "=================================="

# 检查 Docker 和 Docker Compose
check_docker() {
    echo -e "${BLUE}📋 检查 Docker 环境...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装${NC}"
        echo -e "${YELLOW}请先安装 Docker: https://docs.docker.com/engine/install/${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安装${NC}"
        echo -e "${YELLOW}请先安装 Docker Compose: https://docs.docker.com/compose/install/${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker 环境检查通过${NC}"
}

# 检查环境变量文件
check_env() {
    echo -e "${BLUE}📋 检查环境变量配置...${NC}"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}⚠️  环境变量文件不存在，正在创建...${NC}"
        cp .env $ENV_FILE
        
        echo -e "${RED}❌ 请编辑 $ENV_FILE 文件，填入正确的配置值${NC}"
        echo -e "${YELLOW}必须配置的变量:${NC}"
        echo "  - POSTGRES_PASSWORD (数据库密码)"
        echo "  - NEXTAUTH_SECRET (NextAuth 密钥)"
        echo "  - NEXTAUTH_URL (你的域名)"
        echo "  - NEXT_PUBLIC_APP_URL (你的域名)"
        echo ""
        echo -e "${YELLOW}配置完成后，重新运行此脚本${NC}"
        exit 1
    fi
    
    # 检查必要的环境变量
    source $ENV_FILE
    
    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your_very_secure_password_here" ]; then
        echo -e "${RED}❌ 请在 $ENV_FILE 中设置 POSTGRES_PASSWORD${NC}"
        exit 1
    fi
    
    if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "your_very_secure_nextauth_secret_here" ]; then
        echo -e "${RED}❌ 请在 $ENV_FILE 中设置 NEXTAUTH_SECRET${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 环境变量配置检查通过${NC}"
}

# 构建和启动服务
deploy() {
    echo -e "${BLUE}🔨 开始构建和部署...${NC}"
    
    # 停止现有服务
    echo -e "${YELLOW}🛑 停止现有服务...${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down || true
    
    # 清理旧镜像 (可选)
    read -p "是否清理旧的 Docker 镜像? (y/N): " clean_images
    if [[ $clean_images == "y" || $clean_images == "Y" ]]; then
        echo -e "${YELLOW}🧹 清理旧镜像...${NC}"
        docker system prune -f
        docker image prune -f
    fi
    
    # 构建镜像
    echo -e "${BLUE}🔨 构建应用镜像...${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE build --no-cache
    
    # 启动服务
    echo -e "${BLUE}🚀 启动服务...${NC}"
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
    
    # 等待服务启动
    echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
    sleep 30
    
    # 检查服务状态
    check_services
}

# 检查服务状态
check_services() {
    echo -e "${BLUE}📋 检查服务状态...${NC}"
    
    # 检查容器状态
    if docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps | grep -q "Up"; then
        echo -e "${GREEN}✅ 容器启动成功${NC}"
    else
        echo -e "${RED}❌ 容器启动失败${NC}"
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs
        exit 1
    fi
    
    # 检查数据库连接
    echo -e "${YELLOW}🔍 检查数据库连接...${NC}"
    if docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T postgres pg_isready -U bsvgo -d bsvgo; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        exit 1
    fi
    
    # 检查应用健康状态
    echo -e "${YELLOW}🔍 检查应用健康状态...${NC}"
    sleep 10
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 应用健康检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  应用可能还在启动中，请稍后检查${NC}"
    fi
}

# 初始化数据库
init_database() {
    echo -e "${BLUE}🗄️  初始化数据库...${NC}"
    
    # 等待数据库完全启动
    echo -e "${YELLOW}⏳ 等待数据库启动...${NC}"
    sleep 20
    
    # 执行数据库初始化
    if docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec app npm run db:init; then
        echo -e "${GREEN}✅ 数据库初始化成功${NC}"
    else
        echo -e "${YELLOW}⚠️  数据库初始化失败，可能已经初始化过了${NC}"
    fi
}

# 显示部署信息
show_info() {
    echo ""
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo "=================================="
    
    # 获取服务器 IP
    SERVER_IP=$(curl -s ifconfig.me || echo "localhost")
    
    echo -e "${BLUE}📱 访问信息:${NC}"
    echo "  应用地址: http://$SERVER_IP:3000"
    echo "  管理员账号: admin@bsvgo.com"
    echo "  管理员密码: admin123"
    echo ""
    
    echo -e "${BLUE}🔧 管理命令:${NC}"
    echo "  查看日志: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f"
    echo "  重启服务: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE restart"
    echo "  停止服务: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down"
    echo "  进入容器: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec app sh"
    echo ""
    
    echo -e "${BLUE}🗄️  数据库管理:${NC}"
    echo "  连接数据库: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec postgres psql -U bsvgo -d bsvgo"
    echo "  备份数据库: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec postgres pg_dump -U bsvgo bsvgo > backup.sql"
    echo "  恢复数据库: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T postgres psql -U bsvgo -d bsvgo < backup.sql"
    echo ""
    
    echo -e "${YELLOW}💡 提示:${NC}"
    echo "  - 首次部署后，请修改默认管理员密码"
    echo "  - 建议配置 SSL 证书以启用 HTTPS"
    echo "  - 定期备份数据库数据"
    echo "  - 监控服务器资源使用情况"
}

# 主菜单
main_menu() {
    echo ""
    echo -e "${BLUE}请选择操作:${NC}"
    echo "1. 完整部署 (推荐)"
    echo "2. 仅构建和启动"
    echo "3. 初始化数据库"
    echo "4. 检查服务状态"
    echo "5. 查看日志"
    echo "6. 停止服务"
    echo "7. 退出"
    echo ""
    read -p "请输入选择 (1-7): " choice
    
    case $choice in
        1)
            check_docker
            check_env
            deploy
            init_database
            show_info
            ;;
        2)
            check_docker
            check_env
            deploy
            ;;
        3)
            init_database
            ;;
        4)
            check_services
            ;;
        5)
            docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f
            ;;
        6)
            docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down
            echo -e "${GREEN}✅ 服务已停止${NC}"
            ;;
        7)
            echo -e "${GREEN}👋 再见！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 无效选择${NC}"
            main_menu
            ;;
    esac
}

# 运行主菜单
main_menu
