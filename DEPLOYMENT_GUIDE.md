# 🚀 部署指南

## 📋 概述

本项目使用 Docker + GitHub Actions 实现自动化部署，支持以下特性：

- 🐳 **Docker 容器化**：应用、数据库全部容器化
- 🔄 **自动化部署**：GitHub Actions 自动构建和部署
- 🛡️ **安全配置**：Nginx 反向代理，SSL 支持
- 📊 **健康检查**：应用和服务健康监控
- 🔧 **环境隔离**：开发、测试、生产环境分离

## 🏗️ 架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│ GitHub Actions  │───▶│   Server        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Nginx       │◀───│  Docker Compose │
                       │  (Reverse Proxy)│    └─────────────────┘
                       └─────────────────┘             │
                                │                      │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Next.js App   │    │   PostgreSQL    │
                       │   (Container)   │    │   (Container)   │
                       └─────────────────┘    └─────────────────┘
                                │                      │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   File Storage  │    │     Volumes     │
                       │   (Volumes)     │    │   (Persistent)  │
                       └─────────────────┘    └─────────────────┘
```

## 🛠️ 服务器准备

### 1. 系统要求

- **操作系统**：Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**：最少 2GB，推荐 4GB+
- **存储**：最少 20GB，推荐 50GB+
- **网络**：公网 IP，开放 80/443 端口

### 2. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 3. 创建项目目录

```bash
# 创建项目目录
mkdir -p /home/$USER/bsvgo
cd /home/$USER/bsvgo

# 克隆项目
git clone https://github.com/your-username/bsvgo.git .
```

## ⚙️ 环境配置

### 1. 环境变量设置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**必须配置的环境变量：**

```bash
# 数据库配置
POSTGRES_DB=bsvgo
POSTGRES_USER=bsvgo
POSTGRES_PASSWORD=your_secure_password_here

# NextAuth 配置
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 域名配置
DOMAIN=yourdomain.com
```

### 2. SSL 证书配置

```bash
# 创建 SSL 目录
mkdir -p ssl

# 使用 Let's Encrypt (推荐)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

## 🔧 GitHub Actions 配置

### 1. 设置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

```
SERVER_IP=your_server_ip
SERVER_USER=your_server_username
SSH_PRIVATE_KEY=your_ssh_private_key
```

### 2. 生成 SSH 密钥

```bash
# 在本地生成 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions"

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your_server_ip

# 将私钥内容添加到 GitHub Secrets
cat ~/.ssh/id_rsa
```

## 🚀 部署流程

### 1. 自动部署

推送代码到 main 分支即可触发自动部署：

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 2. 手动部署

在服务器上手动部署：

```bash
# 使用部署脚本
./deploy.sh

# 或者使用 Docker Compose
docker-compose up -d --build
```

### 3. 部署验证

```bash
# 检查服务状态
./deploy.sh status

# 查看日志
./deploy.sh logs

# 健康检查
curl http://localhost:3000/api/health
```

## 📊 监控和维护

### 1. 服务监控

```bash
# 查看所有容器状态
docker-compose ps

# 查看资源使用情况
docker stats

# 查看日志
docker-compose logs -f app
```

### 2. 数据备份

```bash
# 备份数据库
./deploy.sh backup

# 恢复数据库
./deploy.sh restore backups/backup_20231201_120000.sql
```

### 3. 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy.sh deploy
```

## 🔧 常用命令

```bash
# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看状态
./deploy.sh status

# 查看日志
./deploy.sh logs [service_name]

# 清理资源
./deploy.sh cleanup
```

## 🐛 故障排除

### 1. 常见问题

**容器启动失败：**
```bash
# 查看详细日志
docker-compose logs app

# 检查环境变量
docker-compose config
```

**数据库连接失败：**
```bash
# 检查数据库状态
docker-compose exec postgres pg_isready

# 重启数据库
docker-compose restart postgres
```

**Nginx 配置错误：**
```bash
# 测试 Nginx 配置
docker-compose exec nginx nginx -t

# 重新加载配置
docker-compose exec nginx nginx -s reload
```

### 2. 性能优化

**内存优化：**
```bash
# 限制容器内存使用
# 在 docker-compose.yml 中添加：
deploy:
  resources:
    limits:
      memory: 512M
```

**磁盘清理：**
```bash
# 清理未使用的镜像
docker image prune -f

# 清理未使用的卷
docker volume prune -f

# 清理系统
docker system prune -f
```

## 📈 扩展配置

### 1. 负载均衡

可以配置多个应用实例：

```yaml
# docker-compose.yml
app:
  scale: 3  # 运行 3 个应用实例
```

### 2. 数据库集群

可以配置 PostgreSQL 主从复制：

```yaml
postgres-master:
  # 主数据库配置

postgres-slave:
  # 从数据库配置
```

### 3. 监控系统

可以添加 Prometheus + Grafana 监控：

```yaml
prometheus:
  image: prom/prometheus

grafana:
  image: grafana/grafana
```

## 🔒 安全建议

1. **定期更新**：保持系统和 Docker 镜像最新
2. **防火墙**：只开放必要端口（80, 443, 22）
3. **SSL 证书**：使用 HTTPS 加密传输
4. **密码安全**：使用强密码和密钥认证
5. **备份策略**：定期备份数据和配置
6. **日志监控**：监控异常访问和错误日志

## 📞 支持

如果遇到问题，请：

1. 查看日志：`./deploy.sh logs`
2. 检查状态：`./deploy.sh status`
3. 查看文档：本指南和 README
4. 提交 Issue：GitHub Issues

---

🎉 **部署完成后，你的应用将在 `https://yourdomain.com` 上运行！**
