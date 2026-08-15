import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// site 部署后请改成你的 Pages 地址，例如 https://username.github.io
export default defineConfig({
  site: 'https://chiaquanlin.github.io',
  integrations: [sitemap()],
  markdown: {
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
