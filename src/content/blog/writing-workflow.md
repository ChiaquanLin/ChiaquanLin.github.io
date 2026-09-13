---
title: 个人博客项目结构与使用指南
description: 一篇看懂这个博客：项目目录、页面组成、写作方式、Git 提交与 GitHub Pages 自动部署。
pubDate: 2026-08-15
updatedDate: 2026-09-13
tags: [Astro, Git, GitHub, 部署]
categories: [技术]
draft: false
---

这个博客基于 Astro 静态站点构建，内容全部由 Markdown 驱动。日常只需要新增一篇文章、提交并推送，GitHub Actions 就会自动完成构建和部署。

## 项目结构

```text
personal_blog/
├── public/                    # 静态资源
│   ├── hero.jpg               # 首页整屏背景图（可替换为 PNG/WebP）
│   └── favicon.svg
├── src/
│   ├── components/            # 页面组件
│   │   ├── HeroCanvas.astro   # 首页画幅
│   │   ├── SiteHeader.astro   # 顶部导航与主题切换
│   │   ├── SiteFooter.astro   # 页脚
│   │   ├── PostCard.astro     # 文章卡片
│   │   └── ResumeCard.astro   # 简历卡片
│   ├── content/
│   │   ├── blog/              # Markdown 文章目录
│   │   └── config.ts          # 文章字段定义
│   ├── layouts/
│   │   └── BaseLayout.astro   # 全局布局、主题与页面切换
│   ├── pages/                 # 路由页面
│   │   ├── index.astro        # 首页
│   │   ├── blog.astro         # 文章列表 + 时间线 + 分类筛选
│   │   ├── blog/[slug].astro  # 文章详情
│   │   ├── tags/              # 标签页
│   │   ├── categories/        # 分类页
│   │   ├── about.astro        # 关于/简历
│   │   └── rss.xml.js         # RSS
│   └── styles/
│       └── global.css         # 全部主题变量与样式
├── scripts/
│   ├── new-post.mjs           # 新建文章脚本
│   └── generate-hero.mjs      # 生成默认首页图
├── .github/workflows/
│   └── deploy.yml             # GitHub Pages 自动部署
├── astro.config.mjs           # Astro 配置
├── pnpm-workspace.yaml        # pnpm 构建白名单
└── package.json
```

## 页面与功能

- 首页：整屏画幅 + 最新文章列表 + 主题标签，背景图在 `public/hero.jpg`，路径由 `src/consts.ts` 的 `SITE_HERO_IMAGE` 控制。
- 文章页：左侧按年份展示时间线，右侧文章卡片支持按分类筛选。
- 标签/分类：由文章 frontmatter 自动生成对应列表页。
- 关于/简历：`/about` 合并展示个人简介与简历，内容在 `src/components/ResumeCard.astro`。
- RSS 与 Sitemap：自动从文章集合生成。
- 深浅色主题：按钮切换，选择保存在浏览器 `localStorage`，默认深色。
- 页面切换：使用 Astro View Transitions，导航带平滑过渡动画。

## 新建文章

推荐直接使用脚本，会自动生成唯一文件名：

```bash
pnpm new:post "我的新文章"
pnpm new:post --title "我的新文章" --description "一句话摘要" --tags 前端,设计 --categories 技术
pnpm new:post --title "草稿文章" --draft
```

也可以手动在 `src/content/blog/` 下新建 `.md` 文件：

```md
---
title: 我的新文章
description: 一句话摘要，会显示在列表和 SEO 描述里。
pubDate: 2026-08-15
tags: [随笔]
categories: [随笔]
draft: false
---

正文使用标准 Markdown，代码块会自动高亮。
```

字段说明：

- `title`、`description`、`pubDate`：必填。
- `tags`、`categories`：数组，用于生成标签页和分类页。
- `draft: true`：本地可见，但不会发布到线上。

## 数学公式

正文支持 KaTeX 语法。行内公式用单个 `$` 包裹，块级公式要把 `$$` 单独写成一行：

```md
行内公式：$V(S_t) = E[r_t + \gamma r_{t+1}]$

块级公式：

$$
\delta_t = r_t + \gamma V(S_{t+1}) - V(S_t)
$$
```

需要留意的是，`$$\delta_t = ...$$` 这种把内容写在 `$$` 同一行的写法会被当成行内公式解析，`\sum`、`\underbrace` 等的上下限排版会退化成行内样式，所以块级公式一定让 `$$` 独占一行。渲染依赖 `remark-math` 与 `rehype-katex`（在 `astro.config.mjs` 中配置），样式由 `BaseLayout.astro` 引入的 `katex.min.css` 提供。若某个公式语法写错，页面会把源码标红提示，不会导致整站构建失败。

## Git 提交方式

写完文章后，用一条命令提交并推送即可上线：

```bash
git add .
git commit -m "post: 我的新文章"
git push
```

代码或样式修改建议用清晰的消息前缀：

```bash
git add .
git commit -m "feat: 新增首页画幅效果"
git commit -m "fix: 修复文章页筛选"
git commit -m "style: 调整主题配色"
git commit -m "docs: 更新 README"
git push
```

推送后 GitHub Actions 会自动构建并部署到 Pages，地址为 `https://chiaquanlin.github.io`。常用本地命令：

```bash
pnpm dev          # 本地预览
pnpm build        # 构建检查
pnpm new:post     # 新建文章
pnpm generate:hero  # 重新生成默认首页背景图
```
