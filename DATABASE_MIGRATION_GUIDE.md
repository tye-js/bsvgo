# 🗄️ 数据库迁移指南

## 📋 问题解决

你遇到的数据库连接报错是因为 Docker 容器启动后，PostgreSQL 数据库是空的，没有创建表结构。我已经为你添加了完整的数据库迁移解决方案。

## 🔧 解决方案

### 1. 自动化数据库初始化

#### 新增文件

- ✅ `init.sql` - PostgreSQL 初始化脚本
- ✅ `scripts/init-db.ts` - TypeScript 数据库初始化脚本
- ✅ `scripts/migrate.ts` - Drizzle 迁移脚本
- ✅ `docker-entrypoint.sh` - Docker 容器入口脚本

#### 更新文件

- ✅ `Dockerfile` - 添加数据库脚本和入口脚本
- ✅ `package.json` - 添加数据库相关命令
- ✅ `deploy.sh` - 添加数据库迁移步骤
- ✅ `quick-start.sh` - 添加初始化提示

### 2. 数据库表结构

自动创建以下表：

```sql
📋 表结构:
├── users (用户表)
├── categories (分类表)  
├── tags (标签表)
├── documents (文档表)
├── document_tags (文档标签关联表)
├── comments (评论表)
└── favorites (收藏表)
```

### 3. 默认数据

自动插入：
- 🔑 **管理员用户**: `admin@bsvgo.com` / `admin123`
- 📁 **默认分类**: 技术分享、生活随笔、项目展示、学习笔记
- 🏷️ **默认标签**: JavaScript、TypeScript、React、Next.js 等

## 🚀 使用方法

### 本地开发环境

#### 方法 1: 仅启动数据库服务
```bash
# 启动数据库
./quick-start.sh
# 选择 1: 本地开发 (仅数据库)

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev
```

#### 方法 2: 完整容器化环境
```bash
# 启动完整环境 (自动初始化数据库)
./quick-start.sh
# 选择 2: 完整本地环境

# 应用将在 http://localhost:3000 运行
```

### 生产环境部署

#### 自动部署
```bash
# 推送代码自动部署 (包含数据库初始化)
git add .
git commit -m "Add database migration"
git push origin main
```

#### 手动部署
```bash
# 服务器端手动部署
./deploy.sh
# 会自动执行数据库初始化
```

## 📝 可用的数据库命令

```bash
# 初始化数据库 (创建表和默认数据)
npm run db:init

# 生成 Drizzle 迁移文件
npm run db:generate

# 执行 Drizzle 迁移
npm run db:migrate

# 推送 schema 到数据库
npm run db:push

# 打开 Drizzle Studio
npm run db:studio

# 重置数据库 (等同于 db:init)
npm run db:reset
```

## 🔍 数据库连接验证

### 检查数据库状态
```bash
# 在容器中检查
docker-compose exec postgres psql -U bsvgo -d bsvgo -c "\dt"

# 检查表数量
docker-compose exec postgres psql -U bsvgo -d bsvgo -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# 检查用户数据
docker-compose exec postgres psql -U bsvgo -d bsvgo -c "SELECT email, name, is_admin FROM users;"
```

### 应用健康检查
```bash
# 检查应用健康状态
curl http://localhost:3000/api/health

# 查看应用日志
docker-compose logs app
```

## 🛠️ 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 重启数据库
docker-compose restart postgres
```

#### 2. 表不存在错误
```bash
# 手动初始化数据库
docker-compose exec app npm run db:init

# 或者重新构建容器
docker-compose down
docker-compose up -d --build
```

#### 3. 权限错误
```bash
# 检查数据库用户权限
docker-compose exec postgres psql -U bsvgo -d bsvgo -c "\du"

# 重新创建数据库
docker-compose down -v  # 删除数据卷
docker-compose up -d
```

### 日志查看

```bash
# 查看应用启动日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f postgres

# 查看所有服务日志
docker-compose logs -f
```

## 📊 数据库监控

### 性能监控
```sql
-- 查看活跃连接
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🔄 数据备份与恢复

### 备份数据
```bash
# 使用部署脚本备份
./deploy.sh backup

# 手动备份
docker-compose exec postgres pg_dump -U bsvgo bsvgo > backup.sql
```

### 恢复数据
```bash
# 使用部署脚本恢复
./deploy.sh restore backup.sql

# 手动恢复
docker-compose exec -T postgres psql -U bsvgo -d bsvgo < backup.sql
```

## 🎯 最佳实践

### 开发环境
1. 使用 `./quick-start.sh` 快速启动
2. 定期备份开发数据
3. 使用 `npm run db:studio` 可视化管理数据

### 生产环境
1. 定期自动备份数据库
2. 监控数据库性能和连接数
3. 定期更新和维护索引

### 数据迁移
1. 在生产环境部署前先在测试环境验证
2. 重要更新前先备份数据
3. 使用事务确保数据一致性

## ✅ 验证清单

- [x] 数据库初始化脚本已创建
- [x] Docker 入口脚本已配置
- [x] 自动化迁移已集成到部署流程
- [x] 默认数据已配置
- [x] 数据库索引已优化
- [x] 健康检查已实现
- [x] 备份恢复方案已提供

## 🎉 完成

现在你的项目具备了完整的数据库迁移功能：

- 🚀 **自动初始化**: 容器启动时自动创建表结构
- 📊 **默认数据**: 自动创建管理员用户和基础数据
- 🔧 **多种方式**: 支持本地开发和生产部署
- 📈 **性能优化**: 包含索引和触发器
- 🛡️ **数据安全**: 支持备份和恢复

启动后你可以使用以下账号登录：
- **邮箱**: `admin@bsvgo.com`
- **密码**: `admin123`

数据库连接问题已彻底解决！🎊
