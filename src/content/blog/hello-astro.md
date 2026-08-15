---
title: 你好，Astro：从零开始搭建个人博客
description: 用 Astro 的静态生成能力快速搭建一个轻量、快速、易维护的个人博客，这篇先介绍核心概念与项目结构。
pubDate: 2025-01-12
tags: [Astro, 前端, 入门]
categories: [技术]
---

Astro 是一个面向内容站点的静态站点生成器。它默认输出纯 HTML/CSS/JS，页面加载快，又保留了组件化开发体验。

## 为什么选择 Astro

- **默认零 JS**：内容页面直接输出静态 HTML，访问速度快。
- **内容集合**：用 Markdown 写文章，类型安全且便于扩展。
- **岛屿架构**：需要交互的组件按需引入 JavaScript。
- **生态成熟**：RSS、Sitemap、代码高亮等能力开箱即用。

## 目录结构

```text
src/
  content/blog/    # 所有 Markdown 文章
  components/      # 可复用组件
  layouts/         # 页面布局
  pages/           # 路由页面
  lib/             # 数据处理工具
```

## 一段示例代码

```js
export async function getPublishedPosts(collection) {
  const posts = await getCollection(collection);
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
```

## 写作体验

写文章只需要在 `src/content/blog` 下新建一个 Markdown 文件，并在头部声明 `title`、`description`、`pubDate`、`tags` 等字段：

```md
---
title: 你好，Astro
pubDate: 2025-01-12
tags: [Astro]
---

这里是正文。
```

> 小提示：把 `draft: true` 加上后，文章会在本地保留但不会发布到线上。

## 接下来

继续阅读本站关于[设计系统与深浅色模式](/blog/design-system/)的文章，了解配色、字体和动效是如何组织的。
