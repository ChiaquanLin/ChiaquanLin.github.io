---
title: 本地写作、Git 同步与 GitHub Pages 上线
description: 一套完整的工作流：本地新建文章、预览效果、提交到 Git、推送到 GitHub，再由 GitHub Actions 自动部署。
pubDate: 2025-01-20
tags: [Git, GitHub, 部署]
categories: [工作流]
---

日常写博客只需要四步：写 Markdown、本地预览、提交、推送。部署交给 GitHub Actions 自动完成。

## 新建文章

```bash
# 在 src/content/blog 下新建文件，例如：
# src/content/blog/my-new-post.md
```

文件头部写入元信息，正文使用标准 Markdown：

```md
---
title: 我的新文章
description: 一句话摘要，会显示在列表和 SEO 描述里。
pubDate: 2025-02-01
tags: [笔记]
categories: [随笔]
draft: false
---

这里是正文。
```

## 本地预览

```bash
pnpm dev
```

打开终端提示的地址即可实时预览；保存 Markdown 后页面会自动更新。

## 提交并推送

```bash
git add .
git commit -m "post: 添加新文章"
git push
```

推送成功后，GitHub Actions 会构建静态站点并发布到 GitHub Pages。

## 回滚与协作

Git 的完整历史保留在本地和远程。如果线上出问题，可以回退到之前的提交：

```bash
git log --oneline
git revert HEAD
git push
```

> 建议每次提交只做一件事：新增一篇文章、改一个页面、或升级一次依赖，方便日后定位问题。
