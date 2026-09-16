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
├── public/                           # 直接按原样部署的静态资源
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── hero.jpg                  # 首页整屏背景图源文件（只用于派生，不直接部署）
│   ├── components/                   # 页面组件
│   │   ├── HeroCanvas.astro          # 首页画幅（背景图加载与淡入）
│   │   ├── SiteHeader.astro          # 顶部导航与主题切换
│   │   ├── SiteFooter.astro          # 页脚
│   │   ├── PostCard.astro            # 文章卡片
│   │   ├── PostToc.astro             # 文章右侧目录
│   │   ├── ImageLightbox.astro       # 文章图片点击放大查看器
│   │   └── ResumeCard.astro          # 简历卡片
│   ├── content/
│   │   ├── blog/                     # Markdown 文章目录
│   │   └── config.ts                 # 文章字段定义
│   ├── images/                       # 文章图片源文件
│   ├── layouts/
│   │   └── BaseLayout.astro          # 全局布局、主题与页面切换
│   ├── lib/
│   │   ├── posts.ts                  # 文章数据工具
│   │   └── remark-image-variants.mjs # 构建时把图片换成压缩显示版
│   ├── pages/                        # 路由页面
│   │   ├── index.astro               # 首页
│   │   ├── blog.astro                # 文章列表 + 时间线 + 分类筛选
│   │   ├── blog/[slug].astro         # 文章详情
│   │   ├── tags/                     # 标签页
│   │   ├── categories/               # 分类页
│   │   ├── about.astro               # 关于/简历
│   │   └── rss.xml.js                # RSS
│   └── styles/
│       └── global.css                # 全部主题变量与样式
├── scripts/
│   ├── new-post.mjs                  # 新建文章脚本
│   ├── optimize-images.mjs           # 生成图片压缩显示版与首页背景图
│   └── generate-hero.mjs             # 生成默认首页图
├── .github/workflows/
│   └── deploy.yml                    # GitHub Pages 自动部署
├── astro.config.mjs                  # Astro 配置
├── pnpm-workspace.yaml               # pnpm 构建白名单
└── package.json
```

## 页面与功能

- 首页：整屏画幅 + 最新文章列表 + 主题标签，背景图源文件在 `src/assets/hero.jpg`，构建时压缩成 `/img/hero.webp`，路径由 `src/consts.ts` 的 `SITE_HERO_IMAGE` 控制。
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

## 图片与 SVG

正文里的图片和 SVG 不需要任何额外标记，默认就可以点击放大：

- 点击图片（或聚焦后按 `Enter`）打开全屏查看器
- 缩放：滚轮 / 双指捏合 / 工具栏 `+` `-` / 键盘 `+` `-`，按 `0` 或「重置」回到适应视图
- 平移：按住拖动，方向键微调，双击复位
- 关闭：`Esc`、点遮罩或关闭按钮；关闭后焦点会回到原来那张图片

查看器实现在 `src/components/ImageLightbox.astro`，由 `BaseLayout.astro` 全局挂载，因此每个页面都能用；鼠标悬停时的可点击提示样式在 `global.css` 的 `Zoomable article images` 段落。页面之间用 View Transitions 跳转时，查看器状态会自动重置，不会残留在新页面上。

有两种图片不会参与放大：包在链接里的图片（保留原来的跳转行为），以及手动加上 `data-no-zoom` 的图片。

```md
[![截图](./shot.png)](./shot.png)   <!-- 链接内的图片，点击仍然跳转 -->
![示意图](./plain.png)              <!-- 默认放大；如需关闭，给这个 img 加 data-no-zoom -->
```

## 文章目录

每篇文章的右侧会自动生成目录，内容取自正文里的 `h2` 与 `h3`，不需要手动维护：

- 宽屏（≥1180px）：目录固定在正文右侧，随页面滚动保持可见，当前所在章节会自动高亮
- 窄屏：目录收起成正文上方的可折叠块，点标题行展开
- 点击目录项平滑跳转，落到标题上时不会被顶部粘性导航挡住
- 正文里没有 `h2`/`h3`（例如刚建好、还没写内容的文章）时不会渲染目录，文章也保持原来的单栏居中宽度

实现在 `src/components/PostToc.astro`，标题数据来自 `src/pages/blog/[slug].astro` 里 `render(post)` 返回的 `headings`。想调整侧栏宽度，改 `global.css` 中 `.post-article` 的 `--toc-width` 和 `--toc-gap` 即可。

## 图片压缩与放大原图

正文里显示的是**压缩版**，点击放大时才加载**原图**。这样正常浏览只下载小图，想看细节时再取原图，两边都不吃亏。

图片统一放进 `src/images/`，Markdown 照常写相对路径就行，构建时会自动替换成压缩版并把原图地址写进 `data-full-src`：

```md
![示意图](../../images/gym.svg)
```

处理规则在 `scripts/optimize-images.mjs`：

- **SVG**：只把它内嵌的 base64 位图重压成 WebP，矢量和内嵌字体原样保留。之所以不整体栅格化，是因为 librsvg 不支持 SVG 里的 `@font-face`，Excalidraw 的手写体会被换成回退字体、渲染结果走样；只重压位图则几乎看不出差别。
- **栅格图**（png / jpg / webp / avif）：转 WebP，最长边限制 1720px（正文列 860px 的 2 倍屏）。

生成的 `public/img/`、`public/img-full/` 和 `src/lib/image-variants.json` 都是构建产物，已加入 `.gitignore`。`pnpm build` 与 `pnpm dev` 会自动先跑这个脚本，也可以手动执行 `pnpm optimize:images`；新增图片后如果开发服务器还开着，重启一次即可。

首页那张整屏背景图也走同一条流水线，但源文件放在 `src/assets/hero.jpg`（**不要放回 `public/`**：`public/` 里的文件会被原样部署，6.64MB 的原图会一直躺在服务器上，哪怕页面不引用它）。脚本会导出 `public/img/hero.webp`，`src/consts.ts` 里的 `SITE_HERO_IMAGE` 指向它。

首页背景图的加载体验另外做了三件事，都不改动画质（仍是 3840×2160，与原图像素差异小于 2/255）：`decoding="async"` 让解码离开主线程、`fetchpriority="high"` 让它优先抢带宽、主题色渐变垫底并在解码完成后淡入。首屏因此立刻有内容，而不是先白一片再砸进一张大图；禁用 JS 时图片照常显示。

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
