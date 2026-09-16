import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkImageVariants from './src/lib/remark-image-variants.mjs';

// site 部署后请改成你的 Pages 地址，例如 https://username.github.io
export default defineConfig({
  site: 'https://chiaquanlin.github.io',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [
      // 正文图片换成压缩显示版，原图地址写进 data-full-src（灯箱放大时才加载）
      remarkImageVariants,
      // 支持 $...$ 行内公式与 $$...$$ 块级公式
      remarkMath,
    ],
    // 用 KaTeX 把公式渲染成 HTML（样式见 BaseLayout 中引入的 katex.min.css）
    rehypePlugins: [
      [
        rehypeKatex,
        {
          // 单个公式写错时只标红报错，不让整站构建失败
          throwOnError: false,
          // 关闭严格模式告警（公式里出现中文等情况很常见）
          strict: false,
        },
      ],
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
