#!/bin/bash

# 部署脚本
# 使用方法: ./deploy.sh [environment]
# environment: development, staging, production (默认: production)

set -e  # 遇到错误立即退出

# 配置
ENVIRONMENT=${1:-production}
PROJECT_NAME="bsvgo"
COMPOSE_FILE="docker-compose.yml"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 检查环境变量文件
check_env_file() {
    log_info "检查环境变量文件..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log_warning ".env 文件不存在，从 .env.example 复制"
            cp .env.example .env
            log_warning "请编辑 .env 文件并设置正确的环境变量"
            exit 1
        else
            log_error ".env 和 .env.example 文件都不存在"
            exit 1
        fi
    fi
    
    log_success "环境变量文件检查完成"
}

# 构建镜像
build_images() {
    log_info "构建 Docker 镜像..."
    docker-compose build --no-cache
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 停止现有服务
    docker-compose down || true
    
    # 启动服务
    docker-compose up -d
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    # 等待数据库
    log_info "等待数据库启动..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-bsvgo} -d ${POSTGRES_DB:-bsvgo}; do sleep 2; done'
    
    # 等待应用
    log_info "等待应用启动..."
    timeout 120 bash -c 'until curl -f http://localhost:3000/api/health; do sleep 5; done'
    
    log_success "所有服务已就绪"
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."

    # 等待数据库完全启动
    log_info "等待数据库完全启动..."
    sleep 10

    # 运行数据库初始化
    log_info "初始化数据库表结构..."
    docker-compose exec -T app npm run db:init || {
        log_warning "数据库初始化失败，可能表已存在"
    }

    log_success "数据库迁移完成"
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    echo "=== Docker Compose 服务状态 ==="
    docker-compose ps
    
    echo -e "\n=== 应用健康检查 ==="
    curl -s http://localhost:3000/api/health | jq . || echo "健康检查失败"
    
    echo -e "\n=== 容器日志 (最近 20 行) ==="
    docker-compose logs --tail=20
}

# 清理资源
cleanup() {
    log_info "清理未使用的 Docker 资源..."
    docker system prune -f
    docker volume prune -f
    log_success "清理完成"
}

# 备份数据
backup_data() {
    log_info "备份数据库..."
    
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T postgres pg_dump -U ${POSTGRES_USER:-bsvgo} ${POSTGRES_DB:-bsvgo} > $BACKUP_FILE
    
    log_success "数据库备份完成: $BACKUP_FILE"
}

# 恢复数据
restore_data() {
    if [ -z "$2" ]; then
        log_error "请指定备份文件: ./deploy.sh restore <backup_file>"
        exit 1
    fi
    
    BACKUP_FILE=$2
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    log_info "恢复数据库从: $BACKUP_FILE"
    
    docker-compose exec -T postgres psql -U ${POSTGRES_USER:-bsvgo} -d ${POSTGRES_DB:-bsvgo} < $BACKUP_FILE
    
    log_success "数据库恢复完成"
}

# 显示日志
show_logs() {
    SERVICE=${2:-app}
    LINES=${3:-100}
    
    log_info "显示 $SERVICE 服务日志 (最近 $LINES 行)..."
    docker-compose logs --tail=$LINES -f $SERVICE
}

# 主函数
main() {
    case "${1:-deploy}" in
        "deploy")
            log_info "开始部署 $PROJECT_NAME ($ENVIRONMENT 环境)..."
            check_dependencies
            check_env_file
            build_images
            start_services
            wait_for_services
            run_migrations
            check_services
            log_success "部署完成!"
            ;;
        "start")
            start_services
            ;;
        "stop")
            log_info "停止服务..."
            docker-compose down
            log_success "服务已停止"
            ;;
        "restart")
            log_info "重启服务..."
            docker-compose restart
            log_success "服务已重启"
            ;;
        "status")
            check_services
            ;;
        "logs")
            show_logs $@
            ;;
        "backup")
            backup_data
            ;;
        "restore")
            restore_data $@
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "使用方法: $0 [command] [options]"
            echo ""
            echo "命令:"
            echo "  deploy          完整部署 (默认)"
            echo "  start           启动服务"
            echo "  stop            停止服务"
            echo "  restart         重启服务"
            echo "  status          检查服务状态"
            echo "  logs [service]  显示日志"
            echo "  backup          备份数据库"
            echo "  restore <file>  恢复数据库"
            echo "  cleanup         清理 Docker 资源"
            echo "  help            显示帮助"
            ;;
        *)
            log_error "未知命令: $1"
            echo "使用 '$0 help' 查看可用命令"
            exit 1
            ;;
    esac
}

# 执行主函数
main $@
