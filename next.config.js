/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 standalone 输出模式，用于 Docker 部署
  output: 'standalone',
  
  // 实验性功能
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: ['@node-rs/argon2'],
  },
  
  // 图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 重定向配置
  async redirects() {
    return [
      // 可以在这里添加重定向规则
    ];
  },
  
  // 重写配置
  async rewrites() {
    return [
      // 可以在这里添加重写规则
    ];
  },
  
  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 webpack 配置
    return config;
  },
  
  // 压缩配置
  compress: true,
  
  // 电源配置
  poweredByHeader: false,
  
  // 生成 ETags
  generateEtags: true,
  
  // 页面扩展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 严格模式
  reactStrictMode: true,
  
  // SWC 压缩
  swcMinify: true,
};

module.exports = nextConfig;
