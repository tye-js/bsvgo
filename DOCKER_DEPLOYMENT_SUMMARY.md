# 🐳 Docker 部署方案总结

## 📋 部署架构概述

我已经为你的 Next.js 15 项目创建了完整的 Docker 部署方案，包括：

### 🏗️ 核心组件

1. **应用容器化**
   - ✅ Next.js 应用 Docker 镜像
   - ✅ 多阶段构建优化
   - ✅ 生产环境配置

2. **数据库服务**
   - ✅ PostgreSQL 16 容器
   - ✅ 数据持久化
   - ✅ 健康检查

3. **反向代理**
   - ✅ Nginx 容器
   - ✅ SSL 支持
   - ✅ 静态文件缓存

4. **自动化部署**
   - ✅ GitHub Actions CI/CD
   - ✅ 容器镜像构建
   - ✅ 自动部署到服务器

## 📁 文件结构

```
bsvgo/
├── 🐳 Docker 配置
│   ├── Dockerfile                 # 应用镜像构建
│   ├── docker-compose.yml         # 生产环境
│   ├── docker-compose.local.yml   # 本地完整环境
│   ├── docker-compose.dev.yml     # 开发环境 (仅服务)
│   ├── .dockerignore              # Docker 忽略文件
│   └── nginx.conf                 # Nginx 配置
│
├── 🚀 部署脚本
│   ├── deploy.sh                  # 完整部署脚本
│   └── quick-start.sh             # 快速启动脚本
│
├── ⚙️ 配置文件
│   ├── .env.example               # 环境变量模板
│   ├── next.config.js             # Next.js 配置
│   └── app/api/health/route.ts    # 健康检查 API
│
├── 🔄 CI/CD
│   └── .github/workflows/bsvgo.yml # GitHub Actions
│
└── 📚 文档
    ├── DEPLOYMENT_GUIDE.md        # 详细部署指南
    └── DOCKER_DEPLOYMENT_SUMMARY.md # 本文档
```

## 🚀 快速开始

### 1. 本地开发

```bash
# 快速启动 (交互式选择)
./quick-start.sh

# 或者直接启动开发环境
docker-compose -f docker-compose.dev.yml up -d
npm run dev
```

### 2. 本地完整测试

```bash
# 启动完整本地环境
docker-compose -f docker-compose.local.yml up -d --build

# 访问应用
open http://localhost:3000
```

### 3. 生产部署

```bash
# 服务器端部署
./deploy.sh

# 或者手动部署
docker-compose up -d --build
```

## 🔧 环境配置

### 必需的环境变量

```bash
# 数据库
POSTGRES_DB=bsvgo
POSTGRES_USER=bsvgo
POSTGRES_PASSWORD=your_secure_password

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 域名
DOMAIN=yourdomain.com
```

### GitHub Secrets 配置

在 GitHub 仓库设置中添加：

```
SERVER_IP=your_server_ip
SERVER_USER=your_server_username
SSH_PRIVATE_KEY=your_ssh_private_key
```

## 🔄 部署流程

### 自动部署 (推荐)

1. **推送代码触发部署**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **GitHub Actions 自动执行**
   - 构建 Docker 镜像
   - 推送到 GitHub Container Registry
   - SSH 连接服务器
   - 拉取最新镜像
   - 更新服务

### 手动部署

1. **服务器准备**
   ```bash
   # 安装 Docker 和 Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # 克隆项目
   git clone https://github.com/your-username/bsvgo.git
   cd bsvgo
   ```

2. **配置环境**
   ```bash
   # 复制环境变量
   cp .env.example .env
   nano .env
   
   # 配置 SSL 证书 (可选)
   mkdir ssl
   # 将证书文件放入 ssl/ 目录
   ```

3. **启动服务**
   ```bash
   # 使用部署脚本
   ./deploy.sh
   
   # 或手动启动
   docker-compose up -d --build
   ```

## 📊 监控和维护

### 服务状态检查

```bash
# 查看所有服务状态
./deploy.sh status

# 查看特定服务日志
./deploy.sh logs app

# 健康检查
curl http://localhost:3000/api/health
```

### 数据备份

```bash
# 备份数据库
./deploy.sh backup

# 恢复数据库
./deploy.sh restore backups/backup_20231201_120000.sql
```

### 服务管理

```bash
# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 清理资源
./deploy.sh cleanup
```

## 🔒 安全特性

### 网络安全
- ✅ 容器间网络隔离
- ✅ 只暴露必要端口
- ✅ Nginx 反向代理

### 数据安全
- ✅ 数据库密码保护
- ✅ Redis 密码认证
- ✅ 环境变量隔离

### 传输安全
- ✅ HTTPS/SSL 支持
- ✅ 安全头配置
- ✅ HSTS 启用

## 🎯 性能优化

### Docker 优化
- ✅ 多阶段构建减小镜像大小
- ✅ 层缓存优化
- ✅ 健康检查配置

### 应用优化
- ✅ Next.js standalone 输出
- ✅ 静态文件缓存
- ✅ Gzip 压缩

### 数据库优化
- ✅ 连接池配置
- ✅ 数据持久化
- ✅ 备份策略

## 🔧 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 查看详细日志
   docker-compose logs app
   
   # 检查配置
   docker-compose config
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose exec postgres pg_isready
   
   # 重启数据库
   docker-compose restart postgres
   ```

3. **端口冲突**
   ```bash
   # 查看端口占用
   sudo netstat -tulpn | grep :3000
   
   # 修改端口配置
   nano docker-compose.yml
   ```

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs -f app

# 查看最近日志
docker-compose logs --tail=50 app
```

## 📈 扩展建议

### 水平扩展
- 配置多个应用实例
- 使用负载均衡器
- 数据库读写分离

### 监控系统
- 添加 Prometheus 监控
- 配置 Grafana 仪表板
- 设置告警通知

### 备份策略
- 自动化数据备份
- 异地备份存储
- 定期恢复测试

## 🎉 部署完成

部署完成后，你的应用将具备：

- 🚀 **高可用性**：容器化部署，自动重启
- 🔒 **安全性**：HTTPS、密码保护、网络隔离
- 📊 **可监控性**：健康检查、日志记录
- 🔄 **可维护性**：自动化部署、备份恢复
- 📈 **可扩展性**：容器编排、负载均衡

访问你的应用：`https://yourdomain.com` 🎊

---

如有问题，请参考 `DEPLOYMENT_GUIDE.md` 或提交 GitHub Issue。
