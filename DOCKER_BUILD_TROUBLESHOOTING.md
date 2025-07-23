# 🐳 Docker 构建问题解决指南

## 📋 问题分析

你遇到的错误是网络连接问题导致的 npm 安装失败：
```
npm error code ECONNRESET
npm error network aborted
npm error network This is a problem related to network connectivity.
```

## 🔧 解决方案

### 1. 优化后的 Dockerfile

我已经优化了 Dockerfile，添加了以下改进：

#### 网络配置优化
```dockerfile
# 配置 npm 以提高网络稳定性
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 3
```

#### 新增 .npmrc 配置文件
```
registry=https://registry.npmmirror.com/
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
fetch-retries=3
fetch-timeout=300000
```

### 2. 多种构建方式

#### 方式 1: 使用优化后的 Dockerfile (推荐)
```bash
# 本地测试构建
./build-local.sh
# 选择 1: 使用优化后的 Dockerfile

# 或直接构建
docker build -t bsvgo:latest . --no-cache
```

#### 方式 2: 使用备用 Dockerfile
```bash
# 使用备用构建策略
./build-local.sh
# 选择 2: 使用备用 Dockerfile

# 或直接构建
docker build -f Dockerfile.alternative -t bsvgo:latest . --no-cache
```

#### 方式 3: 使用 Docker Compose
```bash
# 使用 Docker Compose 构建
./build-local.sh
# 选择 3: 使用 Docker Compose 构建

# 或直接构建
docker-compose -f docker-compose.local.yml build --no-cache
```

### 3. 网络问题解决

#### 检查网络连接
```bash
# 测试网络连接
curl -I https://registry.npmmirror.com/
curl -I https://registry.npmjs.org/

# 测试 DNS 解析
nslookup registry.npmmirror.com
```

#### 配置代理 (如果需要)
```bash
# 如果在公司网络环境下
docker build --build-arg HTTP_PROXY=http://proxy:port \
             --build-arg HTTPS_PROXY=http://proxy:port \
             -t bsvgo:latest .
```

#### 使用本地缓存
```bash
# 清理 Docker 缓存
docker system prune -f

# 使用构建缓存
docker build -t bsvgo:latest . --cache-from bsvgo:latest
```

## 🚀 推荐的构建流程

### 本地开发环境

1. **首次构建测试**
   ```bash
   # 使用构建脚本测试
   ./build-local.sh
   ```

2. **如果网络问题持续**
   ```bash
   # 尝试不同的镜像源
   docker build --build-arg NPM_REGISTRY=https://registry.npmjs.org/ -t bsvgo:latest .
   
   # 或使用国内镜像
   docker build --build-arg NPM_REGISTRY=https://registry.npmmirror.com/ -t bsvgo:latest .
   ```

3. **使用本地 node_modules**
   ```bash
   # 先在本地安装依赖
   npm install
   
   # 然后构建 (会复制 node_modules)
   docker build -t bsvgo:latest .
   ```

### 生产环境部署

1. **GitHub Actions 优化**
   ```yaml
   # 在 .github/workflows/bsvgo.yml 中添加重试机制
   - name: Build Docker image with retry
     uses: nick-invision/retry@v2
     with:
       timeout_minutes: 30
       max_attempts: 3
       command: docker build -t bsvgo:latest .
   ```

2. **使用多阶段构建缓存**
   ```bash
   # 构建时使用缓存
   docker build --target builder -t bsvgo:builder .
   docker build --cache-from bsvgo:builder -t bsvgo:latest .
   ```

## 🔍 故障排除

### 常见错误及解决方案

#### 1. ECONNRESET 错误
```bash
# 解决方案：使用国内镜像源
npm config set registry https://registry.npmmirror.com/

# 或在 Dockerfile 中设置
RUN npm config set registry https://registry.npmmirror.com/
```

#### 2. 超时错误
```bash
# 增加超时时间
npm config set fetch-timeout 600000
npm config set fetch-retry-maxtimeout 120000
```

#### 3. 代理问题
```bash
# 检查代理设置
npm config get proxy
npm config get https-proxy

# 清除代理设置
npm config delete proxy
npm config delete https-proxy
```

#### 4. 缓存问题
```bash
# 清理 npm 缓存
npm cache clean --force

# 清理 Docker 缓存
docker system prune -a
```

### 调试技巧

#### 1. 详细日志
```bash
# 构建时显示详细日志
docker build --progress=plain -t bsvgo:latest .

# npm 详细日志
RUN npm ci --verbose --loglevel=verbose
```

#### 2. 分步构建
```bash
# 只构建到依赖安装阶段
docker build --target deps -t bsvgo:deps .

# 检查依赖安装结果
docker run -it bsvgo:deps sh
```

#### 3. 网络诊断
```bash
# 在容器中测试网络
docker run -it node:22-alpine sh
# 然后在容器中执行
apk add curl
curl -I https://registry.npmmirror.com/
```

## 📊 性能优化建议

### 1. 使用 .dockerignore
```
node_modules
.git
.next
.env*
README.md
*.log
```

### 2. 多阶段构建优化
```dockerfile
# 使用更小的基础镜像
FROM node:22-alpine AS base

# 分离依赖安装和代码复制
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
```

### 3. 构建缓存策略
```bash
# 使用 BuildKit 缓存
export DOCKER_BUILDKIT=1
docker build --cache-from type=local,src=/tmp/.buildx-cache \
             --cache-to type=local,dest=/tmp/.buildx-cache \
             -t bsvgo:latest .
```

## 🎯 最佳实践

1. **网络环境**
   - 使用稳定的网络连接
   - 配置合适的镜像源
   - 设置重试机制

2. **构建策略**
   - 使用多阶段构建
   - 合理利用缓存
   - 分离依赖和代码

3. **错误处理**
   - 添加重试逻辑
   - 详细的错误日志
   - 备用构建方案

## ✅ 验证清单

- [x] 优化 Dockerfile 网络配置
- [x] 添加 .npmrc 配置文件
- [x] 创建备用 Dockerfile
- [x] 提供本地构建测试脚本
- [x] 添加多种构建方式
- [x] 配置重试机制
- [x] 优化缓存策略

## 🎉 总结

现在你有多种方式解决 Docker 构建问题：

1. **立即尝试**: `./build-local.sh` 选择合适的构建方式
2. **网络优化**: 使用国内镜像源和重试机制
3. **备用方案**: 多个 Dockerfile 和构建策略
4. **调试工具**: 详细的日志和诊断方法

选择最适合你网络环境的构建方式即可！🚀
