# 个人博客

基于 Astro 5 的静态个人博客，本地用 Git 管理，自动部署到 GitHub Pages。支持时间轴文章页、详情页、分类、标签、关于/简历合并页、RSS、Sitemap 与基础 SEO，并内置响应式布局、深浅色模式、代码高亮和轻量微动效。

## 技术栈

- [Astro 5](https://astro.build/)：静态站点生成器，构建快、默认零 JS
- Markdown 内容集合：`src/content/blog/`
- @astrojs/rss、@astrojs/sitemap：RSS 与站点地图
- Shiki：代码高亮（跟随深浅色主题）
- GitHub Actions：推送 `main` 后自动构建并发布 Pages

## 本地环境准备

需要以下工具：

| 工具 | 最低版本 | 安装方式 |
| --- | --- | --- |
| Git | 2.x | <https://git-scm.com/downloads> |
| Node.js | 18.17.1 | <https://nodejs.org>（推荐 LTS 20/22） |
| pnpm | 9+ | `npm install -g pnpm`，或启用 corepack：`corepack enable` |

检查版本：

```bash
git --version
node --version
pnpm --version
```

## 初始化与本地预览

```bash
# 安装依赖
pnpm install

# 启动本地开发服务器（默认 http://localhost:4321）
pnpm dev

# 生成生产构建到 dist/
pnpm build

# 预览生产构建
pnpm preview
```

## 项目结构

```text
.
├── .github/workflows/deploy.yml  # GitHub Pages 自动部署
├── public/                       # 静态资源
├── src/
│   ├── components/               # 导航、页脚、文章卡片等组件
│   ├── content/
│   │   └── blog/                 # 所有 Markdown 文章
│   ├── layouts/                  # 页面布局与 SEO 元信息
│   ├── lib/                      # 文章数据工具
│   ├── pages/                    # 路由页面
│   ├── styles/global.css         # 全局主题与样式
│   └── consts.ts                 # 站点标题、描述、作者、域名
├── astro.config.mjs              # Astro 配置
└── package.json
```

## 自定义站点

### 站点信息

编辑 `src/consts.ts`：

```ts
export const SITE_TITLE = '个人博客';
export const SITE_DESCRIPTION = '记录技术、设计与生活的个人博客';
export const SITE_AUTHOR = '你的名字';
export const SITE_URL = 'https://Chiaquan.github.io';
```

编辑 `astro.config.mjs`，把 `site` 改成你的真实 Pages 地址：

```js
site: 'https://Chiaquan.github.io',
```

### 颜色、字体与布局

所有主题变量集中在 `src/styles/global.css`：

- `:root` 是浅色主题，`html[data-theme='dark']` 是深色主题
- 修改 `--accent`、`--accent-2`、`--bg`、`--surface`、`--text` 即可换色
- 英文与代码默认使用 Consolas；中文字体默认从 Google Fonts 加载 Noto Sans SC，可在 `src/layouts/BaseLayout.astro` 中移除或替换
- 导航、卡片栅格、间距在 `.site-header`、`.post-grid`、`.post-card` 等规则中调整
- 首页整屏背景图由 `src/consts.ts` 的 `SITE_HERO_IMAGE` 指定，替换 `public/hero.jpg` 或修改该路径即可；默认占位图可运行 `pnpm generate:hero` 重新生成
- 个人简历与关于页已合并为 `/about`，简历内容在 `src/components/ResumeCard.astro`
- 文章页左侧时间线、右侧分类筛选，位于 `src/pages/blog.astro`
- 新建文章：`pnpm new:post "文章标题"`，会在 `src/content/blog/` 生成带 frontmatter 的 Markdown
- 主题切换按钮会读取系统偏好，并把用户选择保存到 `localStorage`

### 写新文章

在 `src/content/blog/` 新建 Markdown 文件，例如 `my-post.md`；也可以直接用可复用脚本生成模板：

```bash
# 最简单的用法
pnpm new:post "我的新文章"

# 指定摘要、标签、分类
pnpm new:post --title "我的新文章" --description "一句话摘要" --tags 前端,设计 --categories 技术

# 创建草稿（draft: true）
pnpm new:post --title "尚未完成的文章" --draft
```

脚本会自动生成唯一的文件名，不会覆盖已有文章。也可以手动往 `src/content/blog/` 添加任意 `.md` 文件，首页、文章页、时间轴、分类、标签和 RSS 会自动包含它。

```md
---
title: 我的新文章
description: 用于列表和 SEO 的一句话摘要。
pubDate: 2025-02-01
updatedDate: 2025-02-02
tags: [笔记, 前端]
categories: [技术]
draft: false
---

正文使用标准 Markdown，代码块会自动高亮。
```

字段说明：

- `title`、`description`、`pubDate`：必填
- `tags`、`categories`：数组，生成对应标签页/分类页
- `draft: true`：本地可见但不会发布到线上

## Git 初始化与关联 GitHub

如果你尚未创建仓库，先创建 GitHub 仓库。推荐命名为 `<你的用户名>.github.io`；也可以使用任意名称的独立仓库并通过 Actions 部署。

```bash
# 1. 初始化仓库（在项目根目录）
git init -b main

# 2. 添加并提交
git add .
git commit -m "init: Astro personal blog"

# 3. 关联远程仓库（已使用你的 GitHub 用户名 Chiaquan）
#    用户主页仓库：https://github.com/Chiaquan/Chiaquan.github.io.git
#    独立仓库：    https://github.com/Chiaquan/my-blog.git
git remote add origin https://github.com/Chiaquan/Chiaquan.github.io.git

# 4. 确认主分支名并推送
git branch -M main
git push -u origin main
```

也可以使用 GitHub CLI：

```bash
gh auth login
gh repo create Chiaquan.github.io --public --source=. --remote=origin --push
```

## GitHub Pages 部署

项目已包含 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)。完成一次推送后：

1. 打开 GitHub 仓库页面
2. `Settings` → `Pages`
3. `Build and deployment` 的 `Source` 选择 `GitHub Actions`
4. 推送 `main` 后 Actions 会自动构建并发布，地址为 `https://Chiaquan.github.io`

注意：如果使用独立仓库（非 `<用户名>.github.io`），站点地址为 `https://Chiaquan.github.io/<仓库名>/`，需要同步修改 `astro.config.mjs` 的 `site` 和 `src/consts.ts` 的 `SITE_URL`。

## 日常写作流程

```bash
# 1. 新建/编辑文章
#    src/content/blog/新文章.md

# 2. 本地预览
pnpm dev

# 3. 提交
git add .
git commit -m "post: 新增一篇文章"

# 4. 推送上线，Actions 自动部署
git push
```

## 常见问题

- `pnpm install` 提示忽略构建脚本：本项目已在 `pnpm-workspace.yaml` 的 `allowBuilds` 中批准 `esbuild` 与 `sharp`，正常安装不会出现该提示。
- 部署后样式或链接不对：确认 `astro.config.mjs` 的 `site` 与仓库实际地址一致。
- 不想发布某篇文章：在 frontmatter 中设置 `draft: true`。
