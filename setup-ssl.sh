#!/bin/bash

# SSL 证书配置脚本
# 使用 Let's Encrypt 为 BSVGO 配置 HTTPS

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔒 BSVGO SSL 证书配置脚本${NC}"
echo "=================================="

# 检查域名
check_domain() {
    echo -e "${BLUE}📋 检查域名配置...${NC}"
    
    read -p "请输入你的域名 (例如: blog.example.com): " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}❌ 域名不能为空${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🔍 检查域名 DNS 解析...${NC}"
    if nslookup $DOMAIN > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 域名解析正常${NC}"
    else
        echo -e "${RED}❌ 域名解析失败，请检查 DNS 配置${NC}"
        exit 1
    fi
}

# 安装 Certbot
install_certbot() {
    echo -e "${BLUE}📦 安装 Certbot...${NC}"
    
    if command -v certbot &> /dev/null; then
        echo -e "${GREEN}✅ Certbot 已安装${NC}"
        return
    fi
    
    # 检测操作系统
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        sudo apt update
        sudo apt install -y certbot
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        sudo yum install -y epel-release
        sudo yum install -y certbot
    else
        echo -e "${RED}❌ 不支持的操作系统，请手动安装 Certbot${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Certbot 安装完成${NC}"
}

# 获取 SSL 证书
get_certificate() {
    echo -e "${BLUE}🔒 获取 SSL 证书...${NC}"
    
    # 停止 Nginx (如果正在运行)
    docker-compose -f docker-compose.prod.yml down nginx || true
    
    # 使用 standalone 模式获取证书
    sudo certbot certonly \
        --standalone \
        --preferred-challenges http \
        --email admin@$DOMAIN \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL 证书获取成功${NC}"
    else
        echo -e "${RED}❌ SSL 证书获取失败${NC}"
        exit 1
    fi
}

# 配置 Nginx SSL
configure_nginx_ssl() {
    echo -e "${BLUE}⚙️  配置 Nginx SSL...${NC}"
    
    # 创建 SSL 目录
    mkdir -p ssl
    
    # 复制证书文件
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
    sudo chown $(whoami):$(whoami) ssl/*.pem
    
    # 更新 Nginx 配置
    cat > nginx-ssl.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # 基本配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 上游服务器
    upstream nextjs_backend {
        server app:3000;
    }

    # HTTP 服务器 (重定向到 HTTPS)
    server {
        listen 80;
        server_name $DOMAIN;
        
        # Let's Encrypt 验证
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # 重定向到 HTTPS
        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    # HTTPS 服务器
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # SSL 安全配置
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 静态文件缓存
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
            proxy_pass http://nextjs_backend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Next.js 应用
        location / {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 86400;
        }

        # API 路由特殊处理
        location /api/ {
            proxy_pass http://nextjs_backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 300;
            proxy_connect_timeout 300;
            proxy_send_timeout 300;
        }
    }
}
EOF

    # 备份原配置
    cp nginx.conf nginx.conf.backup
    
    # 使用新的 SSL 配置
    cp nginx-ssl.conf nginx.conf
    
    echo -e "${GREEN}✅ Nginx SSL 配置完成${NC}"
}

# 更新环境变量
update_env() {
    echo -e "${BLUE}⚙️  更新环境变量...${NC}"
    
    if [ -f .env.production.local ]; then
        # 更新 URL 为 HTTPS
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|g" .env.production.local
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://$DOMAIN|g" .env.production.local
        
        echo -e "${GREEN}✅ 环境变量更新完成${NC}"
    else
        echo -e "${YELLOW}⚠️  环境变量文件不存在，请手动配置${NC}"
    fi
}

# 设置自动续期
setup_auto_renewal() {
    echo -e "${BLUE}🔄 设置证书自动续期...${NC}"
    
    # 创建续期脚本
    cat > renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL 证书自动续期脚本

# 续期证书
certbot renew --quiet

# 如果证书更新了，重新启动 Nginx
if [ $? -eq 0 ]; then
    # 复制新证书
    cp /etc/letsencrypt/live/*/fullchain.pem ssl/cert.pem
    cp /etc/letsencrypt/live/*/privkey.pem ssl/key.pem
    
    # 重启 Nginx
    docker-compose -f docker-compose.prod.yml restart nginx
fi
EOF

    chmod +x renew-ssl.sh
    
    # 添加到 crontab
    (crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/renew-ssl.sh") | crontab -
    
    echo -e "${GREEN}✅ 自动续期设置完成${NC}"
}

# 重启服务
restart_services() {
    echo -e "${BLUE}🔄 重启服务...${NC}"
    
    docker-compose -f docker-compose.prod.yml --env-file .env.production.local down
    docker-compose -f docker-compose.prod.yml --env-file .env.production.local up -d
    
    echo -e "${GREEN}✅ 服务重启完成${NC}"
}

# 显示完成信息
show_completion() {
    echo ""
    echo -e "${GREEN}🎉 SSL 配置完成！${NC}"
    echo "=================================="
    echo -e "${BLUE}🔒 HTTPS 地址: https://$DOMAIN${NC}"
    echo -e "${BLUE}📱 应用现在可以通过 HTTPS 访问${NC}"
    echo ""
    echo -e "${YELLOW}💡 提示:${NC}"
    echo "  - 证书有效期为 90 天"
    echo "  - 已设置自动续期 (每天凌晨 3 点检查)"
    echo "  - 可以使用 ./renew-ssl.sh 手动续期"
    echo "  - 建议定期检查证书状态"
}

# 主流程
main() {
    check_domain
    install_certbot
    get_certificate
    configure_nginx_ssl
    update_env
    setup_auto_renewal
    restart_services
    show_completion
}

# 运行主流程
main
