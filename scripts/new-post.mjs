import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const title = args.join(' ').trim() || '未命名文章';

const slugBase = title
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  .replace(/^-+|-+$/g, '');
const slug = slugBase || `post-${Date.now()}`;
const date = new Date().toISOString().slice(0, 10);

const file = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`文件已存在：${file}`);
  process.exit(1);
}

const content = `---
title: ${title}
description: 一句话摘要，会显示在列表和 SEO 描述里。
pubDate: ${date}
tags: [随笔]
categories: [随笔]
draft: false
---

在这里开始写作。
`;

fs.writeFileSync(file, content, 'utf8');
console.log(`已创建文章：${file}`);
console.log('本地预览：pnpm dev');
console.log('提交推送：git add . && git commit -m "post: ' + title + '" && git push');
