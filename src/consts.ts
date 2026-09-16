export const SITE_TITLE = "Chiaquan's Blog";
export const SITE_DESCRIPTION = 'Chiaquan 的技术、设计与生活记录';
export const SITE_AUTHOR = 'Chiaquan';
export const SITE_URL = 'https://chiaquanlin.github.io';

// 首页整屏背景图：把图片放到 public/ 目录后修改此路径即可，推荐 2560x1440 以上。
// 重新生成默认占位图：pnpm generate:hero
// 这里指向 public/hero.jpg 经 scripts/optimize-images.mjs 压缩后的 WebP
// （构建时自动生成，原图 6.6MB → 约 200KB，像素差异 < 2/255）。
// 换了 hero.jpg 之后重新构建即可，不要直接把这个路径改回 /hero.jpg。
export const SITE_HERO_IMAGE = '/img/hero.webp';
