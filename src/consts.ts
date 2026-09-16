export const SITE_TITLE = "Chiaquan's Blog";
export const SITE_DESCRIPTION = 'Chiaquan 的技术、设计与生活记录';
export const SITE_AUTHOR = 'Chiaquan';
export const SITE_URL = 'https://chiaquanlin.github.io';

// 首页整屏背景图。原图放 src/assets/hero.jpg —— 注意不要放回 public/：
// public/ 里的文件会被原样部署，那张 6.6MB 的原图会一直躺在服务器上（哪怕页面不引用）。
// scripts/optimize-images.mjs 会在构建时把它导出成 public/img/hero.webp（3840x2160，约 200KB，
// 与原图像素差异 < 2/255），这里只引用导出结果。
// 替换图片：覆盖 src/assets/hero.jpg 后重新构建；重新生成默认占位图用 pnpm generate:hero。
export const SITE_HERO_IMAGE = '/img/hero.webp';
