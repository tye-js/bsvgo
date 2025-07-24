# 🚀 VPS Docker 部署完整指南

## 📋 部署概述

这是一个完整的 VPS Docker 部署方案，包含：
- PostgreSQL 数据库
- Next.js 应用
- Nginx 反向代理
- SSL 证书配置
- 自动化部署脚本

## 🛠️ 服务器要求

### 最低配置
- **CPU**: 1 核心
- **内存**: 2GB RAM
- **存储**: 20GB SSD
- **网络**: 1Mbps 带宽

### 推荐配置
- **CPU**: 2 核心
- **内存**: 4GB RAM
- **存储**: 40GB SSD
- **网络**: 5Mbps 带宽

### 操作系统支持
- Ubuntu 20.04+ (推荐)
- Debian 11+
- CentOS 8+
- 其他支持 Docker 的 Linux 发行版

## 🔧 服务器准备

### 1. 更新系统
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. 安装 Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker
```

### 3. 安装 Docker Compose
```bash
# 下载最新版本
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 4. 配置防火墙
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📦 部署步骤

### 1. 获取代码
```bash
# 克隆仓库
git clone <your-repo-url> bsvgo
cd bsvgo

# 或者上传代码到服务器
scp -r ./bsvgo user@your-server:/home/user/
```

### 2. 配置环境变量
```bash
# 运行部署脚本
./deploy-vps.sh

# 选择 "1. 完整部署"
# 脚本会自动创建 .env.production.local 文件
```

### 3. 编辑环境变量
```bash
# 编辑配置文件
nano .env.production.local
```

**必须配置的变量：**
```env
# 数据库密码 (请使用强密码)
POSTGRES_PASSWORD=your_very_secure_password_here

# NextAuth 密钥 (32位随机字符串)
NEXTAUTH_SECRET=your_very_secure_nextauth_secret_here

# 你的域名或服务器IP
NEXTAUTH_URL=http://your-domain.com
NEXT_PUBLIC_APP_URL=http://your-domain.com
```

**生成安全密钥：**
```bash
# 生成随机密码
openssl rand -base64 32

# 生成 NextAuth 密钥
openssl rand -hex 32
```

### 4. 执行部署
```bash
# 重新运行部署脚本
./deploy-vps.sh

# 选择 "1. 完整部署"
```

部署脚本会自动：
- ✅ 检查 Docker 环境
- ✅ 验证环境变量配置
- ✅ 构建 Docker 镜像
- ✅ 启动所有服务
- ✅ 初始化数据库
- ✅ 检查服务状态

### 5. 验证部署
```bash
# 检查容器状态
docker-compose -f docker-compose.prod.yml ps

# 检查应用健康状态
curl http://localhost:3000/api/health

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔒 SSL 证书配置 (可选但推荐)

### 1. 配置域名
确保你的域名已经指向服务器 IP：
```bash
# 检查 DNS 解析
nslookup your-domain.com
```

### 2. 运行 SSL 配置脚本
```bash
./setup-ssl.sh
```

脚本会自动：
- ✅ 安装 Certbot
- ✅ 获取 Let's Encrypt 证书
- ✅ 配置 Nginx SSL
- ✅ 更新环境变量为 HTTPS
- ✅ 设置证书自动续期
- ✅ 重启服务

### 3. 验证 HTTPS
```bash
# 检查 SSL 证书
curl -I https://your-domain.com

# 检查证书有效期
openssl s_client -connect your-domain.com:443 -servername your-domain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

## 🎯 访问应用

### 默认访问地址
- **HTTP**: `http://your-server-ip:3000`
- **HTTPS**: `https://your-domain.com` (配置 SSL 后)

### 默认管理员账号
- **邮箱**: `admin@bsvgo.com`
- **密码**: `admin123`

**⚠️ 重要：首次登录后请立即修改管理员密码！**

## 🔧 日常管理

### 服务管理
```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

### 数据库管理
```bash
# 连接数据库
docker-compose -f docker-compose.prod.yml exec postgres psql -U bsvgo -d bsvgo

# 备份数据库
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U bsvgo bsvgo > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U bsvgo -d bsvgo < backup.sql
```

### 应用管理
```bash
# 进入应用容器
docker-compose -f docker-compose.prod.yml exec app sh

# 重新初始化数据库
docker-compose -f docker-compose.prod.yml exec app npm run db:init

# 查看应用日志
docker-compose -f docker-compose.prod.yml logs -f app
```

### 更新应用
```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy-vps.sh
# 选择 "2. 仅构建和启动"
```

## 📊 监控和维护

### 系统监控
```bash
# 查看系统资源使用
htop
df -h
free -h

# 查看 Docker 资源使用
docker stats

# 清理 Docker 资源
docker system prune -f
```

### 日志管理
```bash
# 查看 Nginx 日志
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log

# 清理旧日志
docker-compose -f docker-compose.prod.yml exec nginx sh -c "echo '' > /var/log/nginx/access.log"
```

### 备份策略
```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backup"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U bsvgo bsvgo > $BACKUP_DIR/db_backup_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /var/lib/docker/volumes/bsvgo_app_uploads/_data .

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# 设置定时备份 (每天凌晨 2 点)
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -
```

## 🚨 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 查看详细错误
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
netstat -tlnp | grep :3000

# 重新构建镜像
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U bsvgo -d bsvgo

# 重启数据库
docker-compose -f docker-compose.prod.yml restart postgres

# 检查环境变量
docker-compose -f docker-compose.prod.yml exec app env | grep DATABASE_URL
```

#### 3. SSL 证书问题
```bash
# 检查证书状态
certbot certificates

# 手动续期
sudo certbot renew

# 重新获取证书
sudo certbot delete --cert-name your-domain.com
./setup-ssl.sh
```

#### 4. 内存不足
```bash
# 检查内存使用
free -h
docker stats

# 清理 Docker 缓存
docker system prune -a

# 重启服务
docker-compose -f docker-compose.prod.yml restart
```

## 🎉 部署完成

恭喜！你的 BSVGO 博客系统已经成功部署到 VPS 上。

### 下一步建议：
1. 🔐 修改默认管理员密码
2. 🔒 配置 SSL 证书 (如果还没有)
3. 📊 设置监控和备份
4. 🎨 自定义博客内容和样式
5. 📈 配置 SEO 和分析工具

### 技术支持：
- 📖 查看项目文档
- 🐛 提交 Issue
- 💬 社区讨论

享受你的新博客系统吧！🎊
