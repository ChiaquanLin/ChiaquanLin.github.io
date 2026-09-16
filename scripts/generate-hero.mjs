import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const width = 2560;
const height = 1440;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f9f8f4" />
      <stop offset="0.55" stop-color="#ecf2ee" />
      <stop offset="1" stop-color="#e6ebe3" />
    </linearGradient>
    <linearGradient id="beam" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#0f7d72" stop-opacity="0.16" />
      <stop offset="1" stop-color="#0f7d72" stop-opacity="0.02" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect width="${width}" height="${height}" fill="url(#beam)" />
  <g fill="none" stroke="#0f7d72" stroke-width="2" opacity="0.22">
    <path d="M-120 1120 C 420 880, 840 1320, 1320 1060 S 2200 820, 2720 980" />
    <path d="M-120 1240 C 460 1010, 880 1420, 1380 1180 S 2260 940, 2720 1100" />
    <path d="M-120 1360 C 500 1140, 920 1520, 1440 1300 S 2320 1060, 2720 1220" />
  </g>
  <g fill="none" stroke="#c47a12" stroke-width="2" opacity="0.24">
    <path d="M-120 760 C 520 620, 860 980, 1400 760 S 2280 600, 2720 780" />
    <path d="M-120 640 C 560 500, 900 860, 1440 640 S 2320 480, 2720 660" />
  </g>
  <g stroke="#0f7d72" stroke-width="1" opacity="0.1">
    <line x1="180" y1="0" x2="180" y2="${height}" />
    <line x1="360" y1="0" x2="360" y2="${height}" />
    <line x1="540" y1="0" x2="540" y2="${height}" />
    <line x1="720" y1="0" x2="720" y2="${height}" />
    <line x1="900" y1="0" x2="900" y2="${height}" />
    <line x1="1080" y1="0" x2="1080" y2="${height}" />
    <line x1="1260" y1="0" x2="1260" y2="${height}" />
    <line x1="1440" y1="0" x2="1440" y2="${height}" />
    <line x1="1620" y1="0" x2="1620" y2="${height}" />
    <line x1="1800" y1="0" x2="1800" y2="${height}" />
    <line x1="1980" y1="0" x2="1980" y2="${height}" />
    <line x1="2160" y1="0" x2="2160" y2="${height}" />
    <line x1="2340" y1="0" x2="2340" y2="${height}" />
    <line x1="2520" y1="0" x2="2520" y2="${height}" />
  </g>
</svg>
`;

// 源文件放 src/assets/：它不会被打包部署，只有 optimize-images.mjs 派生的
// public/img/hero.webp 会上线。public/ 里的原图会被原样部署，白白多 6MB+。
const outDir = path.join(process.cwd(), 'src', 'assets');
fs.mkdirSync(outDir, { recursive: true });

await sharp(Buffer.from(svg))
  .jpeg({ quality: 86, chromaSubsampling: '4:4:4' })
  .toFile(path.join(outDir, 'hero.jpg'));

console.log(`已生成首页背景图：src/assets/hero.jpg (${width}x${height})`);
console.log('构建时会自动压缩成 public/img/hero.webp');
