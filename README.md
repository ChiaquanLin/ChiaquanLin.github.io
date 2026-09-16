# Chiaquan's Blog

基于 Astro 5 的静态个人博客，本地用 Git 管理，自动部署到 GitHub Pages。支持时间轴文章页、详情页、右侧文章目录、分类、标签、关于/简历合并页、RSS、Sitemap 与基础 SEO，并内置响应式布局、深浅色模式、代码高亮、KaTeX 数学公式、文章图片点击放大查看和轻量微动效。

## 技术栈

- [Astro 5](https://astro.build/)：静态站点生成器，构建快、默认零 JS
- Markdown 内容集合：`src/content/blog/`
- @astrojs/rss、@astrojs/sitemap：RSS 与站点地图
- Shiki：代码高亮（跟随深浅色主题）
- remark-math + rehype-katex：Markdown 数学公式渲染（KaTeX，跟随深浅色主题）
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
export const SITE_TITLE = "Chiaquan's Blog";
export const SITE_DESCRIPTION = 'Chiaquan 的技术、设计与生活记录';
export const SITE_AUTHOR = 'Chiaquan';
export const SITE_URL = 'https://chiaquanlin.github.io';
```

编辑 `astro.config.mjs`，把 `site` 改成你的真实 Pages 地址：

```js
site: 'https://chiaquanlin.github.io',
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

### 文章目录

文章详情页会自动根据正文里的 `h2` / `h3` 生成右侧目录，不需要手动维护：

- 宽屏（≥1180px）：目录固定在正文右侧，随页面粘性滚动，当前所在章节自动高亮
- 窄屏：目录变成正文上方的可折叠块（`<details>`），点击标题行展开
- 点击目录项平滑跳转，标题不会被粘性头部挡住（靠 `scroll-margin-top`）
- 正文里没有 `h2`/`h3` 时（例如刚建好还没写内容的文章）不渲染目录，文章保持原来的单栏居中宽度

实现见 `src/components/PostToc.astro`，在 `src/pages/blog/[slug].astro` 中接收 `render(post)` 返回的 `headings`。栏宽通过 `.post-article` 上的 `--toc-width` / `--toc-gap` 调整，样式在 `src/styles/global.css` 的 `Article` 段落。

### 图片与 SVG 查看

文章正文里的图片和 SVG 默认可以点击放大，无需额外标记：

- 点击图片（或聚焦后按 `Enter`）打开全屏查看器
- 缩放：滚轮 / 双指捏合 / 工具栏 `+` `-` / 键盘 `+` `-`；`0` 或「重置」回到适应视图
- 平移：按住拖动，方向键微调，双击复位
- 关闭：`Esc`、遮罩或关闭按钮，关闭后焦点回到原图

实现见 `src/components/ImageLightbox.astro`，在 `src/layouts/BaseLayout.astro` 中全局挂载，因此所有页面可用，且经 View Transitions 跳转后会自动重置。鼠标悬停的可点击提示样式在 `src/styles/global.css` 的 `Zoomable article images` 段落。

两种图片不参与放大：包在 `<a>` 里的图片（保留原跳转行为），以及手动加上 `data-no-zoom` 的图片。

```md
[![截图](./shot.png)](./shot.png)    <!-- 链接内的图片：仍然走链接 -->
![不放大](./plain.png)               <!-- 需要时给这个 img 加 data-no-zoom -->
```

### 图片压缩与原图

正文里显示的是**压缩版**，点击放大时才加载**原图**——页面加载只下载小图，想看细节再取原图，两边都不吃亏。

图片统一放在 `src/images/`，Markdown 照常写相对路径即可，构建时会自动替换：

```md
![示意图](../../images/gym.svg)
```

实际产出：

```html
<img src="/img/gym.svg"           <!-- 压缩显示版 -->
     data-full-src="/img-full/gym.svg"   <!-- 原图，灯箱点击时才下载 -->
     loading="lazy" width="4172" height="3728">
```

处理规则见 `scripts/optimize-images.mjs`：

- **SVG**：只把它内嵌的 base64 位图重压成 WebP，矢量和内嵌字体原样保留。
  这样做是因为 librsvg（sharp 依赖）不支持 SVG 里的 `@font-face`，如果整体栅格化，
  Excalidraw 的手写体会被换成回退字体、渲染结果明显走样（实测平均差 11~15）。
  只重压位图的方案实测渲染差异几乎为零（平均差 0.02）。
- **栅格图**（png / jpg / webp / avif）：转 WebP，最长边限制 1720px（正文列 860px 的 2 倍屏）。

生成的 `public/img/`、`public/img-full/`、`src/lib/image-variants.json` 都是构建产物，已在 `.gitignore` 中忽略：

- `pnpm build` / `pnpm dev` 会自动先跑 `prebuild` / `predev`
- 也可以手动执行 `pnpm optimize:images`
- 新增图片后如果 `pnpm dev` 正在运行，需要重启一次（清单在配置加载时读取）

首页整屏背景图（`public/hero.jpg`）也走同一条流水线：脚本会额外生成 `public/img/hero.webp`，
`SITE_HERO_IMAGE` 指向它。原图 6.64MB → 约 207KB（3840×2160，像素差异 < 2/255）。
换了 `hero.jpg` 之后重新构建即可，不要把这个常量改回 `/hero.jpg`。

### 数学公式

正文支持 KaTeX 语法，行内公式用单个 `$` 包裹，块级公式必须把 `$$` 单独写成一行：

```md
行内公式：$V(S_t) = E[r_t + \gamma r_{t+1}]$

块级公式：

$$
\delta_t = r_t + \gamma V(S_{t+1}) - V(S_t)
$$
```

注意：`$$\delta_t = ...$$` 这种把内容写在 `$$` 同一行的写法会被当成行内公式，`\sum`、`\underbrace` 等的上下限排版会退化成行内样式，请务必让 `$$` 独占一行。样式来自 `src/layouts/BaseLayout.astro` 引入的 `katex/dist/katex.min.css`，在 `src/styles/global.css` 的 `Math formulas (KaTeX)` 段落中调整。

公式渲染失败时 KaTeX 会把原始源码标红输出，不会中断构建。

## Git 初始化与关联 GitHub

如果你尚未创建仓库，先创建 GitHub 仓库。推荐命名为 `<你的用户名>.github.io`；也可以使用任意名称的独立仓库并通过 Actions 部署。

```bash
# 1. 初始化仓库（在项目根目录）
git init -b main

# 2. 添加并提交
git add .
git commit -m "init: Astro personal blog"

# 3. 关联远程仓库（用户站点仓库名必须与账号一致：ChiaquanLin.github.io）
#    用户主页仓库：https://github.com/ChiaquanLin/ChiaquanLin.github.io.git
#    独立仓库：    https://github.com/ChiaquanLin/my-blog.git
git remote add origin https://github.com/ChiaquanLin/ChiaquanLin.github.io.git

# 4. 确认主分支名并推送
git branch -M main
git push -u origin main
```

也可以使用 GitHub CLI：

```bash
gh auth login
gh repo create ChiaquanLin.github.io --public --source=. --remote=origin --push
```

## GitHub Pages 部署

项目已包含 [.github/workflows/deploy.yml](./.github/workflows/deploy.yml)。完成一次推送后：

1. 打开 GitHub 仓库页面
2. `Settings` → `Pages`
3. `Build and deployment` 的 `Source` 选择 `GitHub Actions`
4. 推送 `main` 后 Actions 会自动构建并发布，地址为 `https://chiaquanlin.github.io`

注意：如果使用独立仓库（非 `<用户名>.github.io`），站点地址为 `https://chiaquanlin.github.io/<仓库名>/`，需要同步修改 `astro.config.mjs` 的 `site` 和 `src/consts.ts` 的 `SITE_URL`。

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
- 公式显示成 `$...$` 原文：说明构建时没有启用 KaTeX，确认 `astro.config.mjs` 的 `markdown.remarkPlugins` / `rehypePlugins` 中已包含 `remark-math` 与 `rehype-katex`，且 `katex` 依赖已安装。
- 块级公式没有居中、上下限被压缩：把 `$$` 写成独占一行的围栏形式（见「数学公式」一节）。
- 不想发布某篇文章：在 frontmatter 中设置 `draft: true`。
