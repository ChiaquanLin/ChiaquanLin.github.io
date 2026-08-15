import fs from 'node:fs';
import path from 'node:path';

function printHelp() {
  console.log(`
用法：
  pnpm new:post --title "文章标题" [选项]
  pnpm new:post "文章标题"

选项：
  -t, --title "标题"          文章标题（必填）
  -d, --description "摘要"    一句话摘要，默认自动生成
      --tags 前端,设计        标签列表，逗号分隔，默认 [随笔]
  -c, --categories 技术       分类列表，逗号分隔，默认 [随笔]
      --date 2026-08-15       发布日期，默认今天
      --draft                 创建草稿（draft: true）
  -h, --help                  显示帮助

示例：
  pnpm new:post --title "我的新文章" --tags 前端,设计 --categories 技术
  pnpm new:post "快速上手 Astro" --draft
`);
}

function parseArgs(argv) {
  const options = {
    title: null,
    description: null,
    tags: [],
    categories: [],
    date: null,
    draft: false,
  };
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--title':
      case '-t':
        options.title = argv[++i];
        break;
      case '--description':
      case '-d':
        options.description = argv[++i];
        break;
      case '--tags':
        options.tags = (argv[++i] ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        break;
      case '--categories':
      case '-c':
        options.categories = (argv[++i] ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        break;
      case '--date':
        options.date = argv[++i];
        break;
      case '--draft':
        options.draft = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        positional.push(arg);
    }
  }

  if (!options.title && positional.length > 0) {
    options.title = positional.join(' ');
  }
  return options;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueFileName(dir, slug) {
  let name = slug;
  let index = 2;
  while (fs.existsSync(path.join(dir, `${name}.md`))) {
    name = `${slug}-${index}`;
    index += 1;
  }
  return `${name}.md`;
}

function yamlList(items) {
  return `[${items.map((item) => `"${item.replaceAll('"', '\\"')}"`).join(', ')}]`;
}

const options = parseArgs(process.argv.slice(2));

if (!options.title) {
  console.error('缺少文章标题。');
  printHelp();
  process.exit(1);
}

const title = options.title.trim();
const description =
  options.description?.trim() || `为《${title}》添加的一句话摘要。`;
const date = options.date || new Date().toISOString().slice(0, 10);
const tags = options.tags.length > 0 ? options.tags : ['随笔'];
const categories = options.categories.length > 0 ? options.categories : ['随笔'];

const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
fs.mkdirSync(blogDir, { recursive: true });

const baseSlug = slugify(title) || `post-${Date.now()}`;
const fileName = uniqueFileName(blogDir, baseSlug);
const file = path.join(blogDir, fileName);

const content = `---
title: ${title}
description: ${description}
pubDate: ${date}
tags: ${yamlList(tags)}
categories: ${yamlList(categories)}
draft: ${options.draft}
---

在这里开始写作。
`;

fs.writeFileSync(file, content, 'utf8');
console.log(`已创建文章：${file}`);
console.log('本地预览：pnpm dev');
console.log('提交推送：git add . && git commit -m "post: ' + title + '" && git push');
