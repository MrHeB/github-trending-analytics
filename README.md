# GitHub Trending Analytics

每日 GitHub 热门项目趋势分析平台。系统每天早上 8:00 自动抓取 GitHub 上 star 增长最快的前 10 个项目，通过 DeepSeek AI 生成深度分析报告，用户可在网页上浏览和查看。

## 功能特性

- **自动抓取**：每天 08:00 自动获取 GitHub 趋势项目
- **AI 分析**：DeepSeek 自动生成项目分析报告（概览、技术亮点、适用场景、上手建议）
- **Star 趋势图**：可视化展示项目 star 增长趋势
- **Markdown 渲染**：分析报告以 Markdown 格式展示
- **手动触发**：支持通过 API 手动触发抓取任务

## 技术栈

- Next.js 16 + React 19
- Prisma 7 + PostgreSQL
- Tailwind CSS v4 + shadcn/ui
- DeepSeek API（AI 分析）
- node-cron（定时任务）
- Docker Compose（一键部署）

## 1Panel 图形界面部署指南（不使用域名）

### 前提条件

- 已安装 1Panel 面板的服务器
- 服务器可以访问 GitHub（国内服务器可能需要配置代理）
- 已获取 DeepSeek API Key（从 https://platform.deepseek.com 申请）

---

### 第一步：确认 Docker 已安装

1. 打开浏览器，访问你的 1Panel 面板地址（通常是 `http://服务器IP:端口`）
2. 输入用户名和密码登录
3. 在左侧菜单栏中点击 **容器**
4. 如果能看到容器列表页面，说明 Docker 已安装，继续下一步
5. 如果提示未安装，点击页面上的 **安装 Docker** 按钮，等待安装完成

---

### 第二步：放行防火墙端口

1. 在 1Panel 左侧菜单点击 **主机 → 防火墙**
2. 点击 **创建规则** 或 **添加端口规则**
3. 填写以下信息：
   - **端口**：`3000`
   - **协议**：`TCP`
   - **策略**：`允许`（或 `放行`）
   - **备注**：`GitHub Trending Analytics`
4. 点击 **确认** 保存

> **注意**：如果你使用的是云服务器（阿里云、腾讯云、华为云等），还需要在云服务商控制台的 **安全组** 中放行 3000 端口。操作路径一般为：云控制台 → 实例 → 安全组 → 添加规则 → 入方向 → TCP 3000 端口 → 允许。

---

### 第三步：下载项目代码到服务器

1. 在 1Panel 左侧菜单点击 **主机 → 终端**
2. 在终端中执行以下命令：

```bash
cd /opt
git clone https://github.com/MrHeB/github-trending-analytics.git
```

3. 等待克隆完成，看到 `done` 提示即可

> 如果 `git` 命令不存在，先执行：
> - CentOS/AlmaLinux：`yum install git -y`
> - Ubuntu/Debian：`apt install git -y`

---

### 第四步：创建环境变量文件

1. 在 1Panel 左侧菜单点击 **主机 → 文件管理**
2. 在左侧目录树中依次点击进入：`/opt/github-trending-analytics/`
3. 找到 `.env.example` 文件，点击文件名打开编辑
4. 你会看到以下内容：

```
# 数据库连接
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/github_trending?schema=public"

# DeepSeek API
DEEPSEEK_API_KEY="your_deepseek_api_key"

# GitHub Token（可选，不填则有速率限制）
GITHUB_TOKEN=""

# 代理设置（可选，服务器无法访问 GitHub 时配置）
HTTP_PROXY=""
HTTPS_PROXY=""
```

5. 修改为你的实际配置：

```
# 数据库连接 —— 把 your_password 改成你自己的密码（记住这个密码，后面要用）
DATABASE_URL="postgresql://postgres:Abc123456!@db:5432/github_trending?schema=public"

# DeepSeek API —— 填入你的 DeepSeek API Key
DEEPSEEK_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"

# GitHub Token（可选，建议填写以提高 API 请求限额）
# 去 https://github.com/settings/tokens 创建一个 Personal Access Token
GITHUB_TOKEN=""

# 代理设置（如果服务器在国内无法访问 GitHub，填入你的代理地址）
HTTP_PROXY=""
HTTPS_PROXY=""
```

6. 点击 **保存**
7. 点击文件列表上方的 **新建文件** 按钮
8. 文件名输入 `.env`
9. 把刚才修改好的内容粘贴进去
10. 点击 **保存**

> **提示**：也可以在终端中执行以下命令一步完成：
> ```bash
> cd /opt/github-trending-analytics
> cp .env.example .env
> vi .env
> ```
> 按 `i` 进入编辑模式，修改完成后按 `Esc`，输入 `:wq` 保存退出。

---

### 第五步：创建 Docker Compose 编排

1. 在 1Panel 左侧菜单点击 **容器 → 编排**
2. 点击右上角 **创建编排** 按钮
3. 填写以下信息：

   - **名称**：`github-trending`
   - **工作目录**：点击输入框，选择或输入 `/opt/github-trending-analytics`

4. 在下方的 YAML 编辑框中，粘贴以下内容：

```yaml
services:
  app:
    build: /opt/github-trending-analytics
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/github_trending
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN:-}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=github_trending
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

5. 点击 **创建** 按钮
6. 系统会自动开始构建镜像，这个过程大约需要 **3-5 分钟**（取决于服务器网速）
7. 你可以在编排列表中看到 `github-trending`，状态会从 "构建中" 变为 "运行中"

> **构建进度查看**：如果构建时间较长，可以在 1Panel 左侧点击 **容器 → 编排**，找到 `github-trending`，点击名称进入详情，查看构建日志。

---

### 第六步：初始化数据库

构建完成、容器状态变为 "运行中" 后，需要初始化数据库表结构：

1. 在 1Panel 左侧菜单点击 **容器 → 编排**
2. 找到 `github-trending`，点击名称进入详情
3. 在服务列表中找到 `app` 容器，点击右侧的 **终端** 图标（一个类似 `>_` 的按钮）
4. 这会打开一个容器内部的终端窗口
5. 在终端中执行：

```bash
npx prisma migrate dev --name init
```

6. 等待执行完成，看到类似以下输出说明成功：

```
✔ The following migration(s) have been created and applied from new schema changes:

migrations/
  └> init/
      └> migration.sql

Your database is now in sync with your Prisma schema.
```

7. 关闭终端窗口

> **如果报错 "DatabaseAccessDenied"**：说明 `.env` 文件中的数据库密码与编排中的密码不一致。请回到第四步检查 `.env` 文件，确保密码一致。

---

### 第七步：验证部署

1. 打开浏览器
2. 在地址栏输入：`http://你的服务器IP:3000`
3. 你应该能看到页面显示 "GitHub Trending Analytics" 标题和 "暂无数据" 提示
4. 这说明部署成功！

---

### 第八步：手动触发第一次抓取

系统要到明天早上 8:00 才会自动执行，你可以手动触发一次测试：

**方式 A（推荐）：通过浏览器**

1. 在浏览器中打开一个新标签页
2. 如果你有浏览器插件可以发 POST 请求（如 Postman、RESTClient），直接对 `http://你的服务器IP:3000/api/cron` 发送 POST 请求

**方式 B：通过 1Panel 终端**

1. 在 1Panel 左侧菜单点击 **主机 → 终端**
2. 执行：

```bash
curl -X POST http://localhost:3000/api/cron
```

3. 等待执行完成（第一次执行需要调用 GitHub API 和 DeepSeek API，大约需要 1-2 分钟）
4. 看到 `{"success":true}` 说明执行成功
5. 回到浏览器刷新页面，应该能看到项目数据了

> **首次执行说明**：系统会抓取 10 个热门项目，每个项目都会调用 DeepSeek 生成分析报告。如果 DeepSeek API Key 不正确，项目仍会被抓取，但分析内容会显示 "AI 分析暂时不可用"。

---

### 常见问题排查

#### 1. 页面打不开（无法访问）

- 检查容器是否在运行：**容器 → 编排 → github-trending**，确认状态是 "运行中"
- 检查防火墙：确认 3000 端口已放行
- 检查云服务商安全组：确认 3000 端口已添加入方向规则

#### 2. 容器启动失败

- 在 1Panel 中点击 **容器 → 编排 → github-trending** 查看日志
- 常见原因：端口 3000 被其他程序占用，修改 docker-compose.yml 中的端口为 `"3001:3000"`

#### 3. 手动触发失败

- 检查 `.env` 中 `DEEPSEEK_API_KEY` 是否正确
- 检查服务器是否能访问 GitHub API：在终端执行 `curl -s https://api.github.com/rate_limit`
- 如果无法访问 GitHub，需要配置代理：在 `.env` 中设置 `HTTP_PROXY` 和 `HTTPS_PROXY`

#### 4. 数据库连接失败

- 确认数据库容器（db）已启动且健康：**容器 → 编排 → github-trending**，`db` 容器状态应为 "healthy"
- 确认 `.env` 中密码与编排配置中的 `POSTGRES_PASSWORD` 一致

---

### 日常维护

| 操作 | 方法 |
|------|------|
| 查看日志 | 1Panel → 容器 → 编排 → github-trending → app → 日志 |
| 重启服务 | 1Panel → 容器 → 编排 → github-trending → 重启 |
| 更新代码 | 1Panel → 主机 → 终端 → `cd /opt/github-trending-analytics && git pull && docker compose up -d --build` |
| 备份数据 | 数据存储在 Docker volume `pgdata` 中，通过 1Panel → 容器 → 卷管理可以查看 |

## 本地开发

```bash
# 安装依赖
pnpm install

# 生成 Prisma 客户端
npx prisma generate

# 创建数据库迁移
npx prisma migrate dev

# 启动开发服务器
pnpm dev

# 手动触发抓取任务
curl -X POST http://localhost:3000/api/cron
```

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接字符串 |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API Key |
| `GITHUB_TOKEN` | 否 | GitHub Token（提高 API 限额） |
| `HTTP_PROXY` | 否 | HTTP 代理地址 |
| `HTTPS_PROXY` | 否 | HTTPS 代理地址 |
