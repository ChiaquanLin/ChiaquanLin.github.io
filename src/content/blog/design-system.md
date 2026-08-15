---
title: 设计系统：颜色、字体与深浅色模式
description: 现代博客的视觉设计不需要复杂，关键是清晰的层级、克制的配色、稳定的间距和可靠的深浅色切换。
pubDate: 2025-01-15
tags: [设计, CSS, 前端]
categories: [设计]
---

一个现代博客的视觉重点不是堆砌装饰，而是让文字可读、让导航可预期、让每个页面都保持一致。

## 设计原则

- **响应式布局**：窄屏单列，宽屏多列，文字始终留足呼吸感。
- **清晰的层级**：标题、正文、辅助信息使用不同字号与字重。
- **半拟物质感**：用极浅的渐变、阴影和边框营造层次，但不做夸张的立体效果。
- **平滑微动效**：卡片悬停、主题切换保持轻量，避免干扰阅读。

## 颜色与主题

本项目用 CSS 变量管理主题，`light` 与 `dark` 两套色板共享同一套结构：

```css
:root {
  --bg: #f7f6f3;
  --surface: #ffffff;
  --text: #1d2526;
  --muted: #6b7475;
  --accent: #0f766e;
  --border: #e3e1da;
}

html[data-theme='dark'] {
  --bg: #15181a;
  --surface: #1e2326;
  --text: #e8ecec;
  --muted: #9aa4a5;
  --accent: #2dd4bf;
  --border: #30383b;
}
```

主题切换按钮会更新 `html[data-theme]`，并把选择写入 `localStorage`，下次访问无需重新选择。

## 字体层级

正文使用系统中文字体栈，标题稍作强调，不引入额外字体以保持加载速度：

```css
body {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  line-height: 1.75;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.2rem; }
```

> 排版的核心不是更大的字号，而是稳定的节奏：行高、段距、列表缩进都要一致。

## 布局卡片

文章列表使用卡片式布局：每张卡片承载标题、摘要、日期和标签，悬停时有轻微上浮与阴影变化，但结构保持稳定，不会因为内容长短而跳动。
