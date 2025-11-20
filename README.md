# Flec-Web

> 基于 Vue 3 + TypeScript + Pinia 的现代化博客前台展示系统

[![Vue Version](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 技术栈

- **框架**: [Vue 3](https://vuejs.org) - 渐进式 JavaScript 框架
- **构建工具**: [Vite](https://vitejs.dev) - 下一代前端构建工具
- **语言**: [TypeScript](https://www.typescriptlang.org) - JavaScript 的超集
- **状态管理**: [Pinia](https://pinia.vuejs.org) - Vue 官方状态管理库
- **路由**: [Vue Router](https://router.vuejs.org) - Vue 官方路由
- **HTTP 客户端**: [Axios](https://axios-http.com) - Promise 基于的 HTTP 客户端
- **Markdown 渲染**: [markdown-it](https://github.com/markdown-it/markdown-it) - Markdown 解析器
- **代码高亮**: [highlight.js](https://highlightjs.org) - 语法高亮
- **音乐播放器**: [APlayer](https://aplayer.js.org) - HTML5 音乐播放器
- **样式**: [SCSS](https://sass-lang.com) - CSS 预处理器

## 🚀 快速开始

### 前置要求

- Node.js 22+
- npm 或 yarn 或 pnpm

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/talen8/Flec-Web.git
cd Flec-Web

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置后端 API 地址

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 本地预览生产构建
npm run preview
```

### Docker 部署

#### 方式一: 使用 Docker Compose (推荐)

1. 创建 `docker-compose.yml` 文件（或使用项目中的）：

```yaml
services:
  web:
    image: talen8/flec-web:latest
    container_name: flec_web
    restart: unless-stopped
    environment:
      VITE_API_BASE_URL: http://your-api-server:8080/api/v1
    ports:
      - "8082:80"
```

2. 启动服务：

```bash
docker-compose up -d
```

#### 方式二: 使用 Docker 命令

```bash
# 拉取镜像
docker pull talen8/flec-web:latest

# 运行容器
docker run -d \
  --name flec_web \
  -p 8082:80 \
  -e VITE_API_BASE_URL=http://your-api-server:8080/api/v1 \
  talen8/flec-web:latest
```

访问 http://localhost:8082 查看应用。

## ⚙️ 配置说明

在 `.env` 文件中配置以下参数:

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

更多配置项请参考 `.env.example` 文件。

## 📦 构建产物

构建后的静态文件位于 `dist` 目录，可以部署到任何静态文件服务器：

- **Nginx** - 推荐用于生产环境
- **Apache** - 传统的 Web 服务器
- **Vercel** - 现代化的部署平台
- **Netlify** - JAMstack 部署平台

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🗂️ 项目结构

```
.
├── public/           # 静态资源
├── src/              # 源代码
│   ├── api/          # API 接口
│   ├── assets/       # 资源文件
│   ├── components/   # 公共组件
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia 状态管理
│   ├── utils/        # 工具函数
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   └── main.ts       # 入口文件
├── .env.example      # 环境变量示例
├── Dockerfile        # Docker 镜像构建文件
├── docker-compose.yml # Docker Compose 配置
├── nginx.conf        # Nginx 配置文件
├── index.html        # HTML 模板
├── package.json      # 项目依赖
├── tsconfig.json     # TypeScript 配置
└── vite.config.ts    # Vite 配置
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 🔗 相关链接

- [后端仓库](https://github.com/talen8/Flec-Server)
- [后台管理](https://github.com/talen8/Flec-Admin)
- [问题反馈](https://github.com/talen8/Flec-Web/issues)

## 💬 联系方式

如有问题，请通过以下方式联系:

- 📧 Email: talen2004@163.com
- 🐛 Issues: [GitHub Issues](https://github.com/talen8/Flec-Web/issues)
