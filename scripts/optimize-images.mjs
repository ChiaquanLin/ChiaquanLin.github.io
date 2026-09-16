// 为文章图片生成「压缩显示版」与「原图副本」，供正文展示与点击放大分别使用。
//
// 产出：
//   public/img/<相对路径>        压缩后的显示版（正文里用这个）
//   public/img-full/<相对路径>   原图副本（灯箱放大时用这个）
//   src/lib/image-variants.json  清单，供 remark 插件在构建时替换 src
//
// 为什么 SVG 不栅格化：librsvg（sharp 依赖）不支持 SVG 内嵌的 @font-face，
// Excalidraw 的手写字体被替换成回退字体后渲染结果差异明显（实测平均差 11~15）。
// 所以 SVG 只重压它内嵌的 base64 位图，矢量与字体原样保留，渲染几乎像素级一致。
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** 扫描这些目录里的图片 */
const SOURCE_DIRS = ['src/images'];
const DISPLAY_DIR = join(ROOT, 'public', 'img');
const FULL_DIR = join(ROOT, 'public', 'img-full');
const MANIFEST = join(ROOT, 'src', 'lib', 'image-variants.json');

/** 显示版最长边对应的像素宽度：正文列 860px，2 倍屏足够 */
const MAX_WIDTH = 1720;
const RASTER_QUALITY = 82;
const SVG_EMBED_QUALITY = 88;

const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const EMBED_RE = /data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/g;

/**
 * 额外的大图：首页整屏背景。它不在文章正文里，尺寸和质量单独控制——
 * 3840px 是为了覆盖 4K 全屏，实测原图 6.6MB 转 WebP 后约 200KB 且像素差异 < 2/255。
 *
 * 源文件放在 src/assets/ 而不是 public/：放进 public/ 会被原样部署，
 * 那 6.6MB 就会一直躺在服务器上（哪怕页面不引用它）。这里只导出压缩后的 WebP。
 */
const EXTRA_ASSETS = [{ source: 'src/assets/hero.jpg', output: 'hero.webp', width: 3840, quality: 80 }];

const posix = (p) => p.split(sep).join('/');
const kb = (n) => `${(n / 1024).toFixed(1)}KB`;

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** SVG 的显示尺寸：优先 width/height 属性，取不到就用 viewBox */
function svgSize(source) {
  const w = /<svg[^>]*\swidth="([\d.]+)/.exec(source);
  const h = /<svg[^>]*\sheight="([\d.]+)/.exec(source);
  if (w && h) return { width: Math.round(Number(w[1])), height: Math.round(Number(h[1])) };
  const vb = /viewBox="([\d.\s-]+)"/.exec(source);
  if (vb) {
    const parts = vb[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4) return { width: Math.round(parts[2]), height: Math.round(parts[3]) };
  }
  return null;
}

/** 把 SVG 内嵌的 base64 位图重压成 WebP，矢量与字体不动 */
async function optimizeSvg(source, log) {
  const matches = [...source.matchAll(EMBED_RE)];
  if (matches.length === 0) return { output: source, saved: 0, note: '无内嵌位图' };

  let output = source;
  let saved = 0;
  for (const match of matches) {
    const original = Buffer.from(match[2], 'base64');
    const meta = await sharp(original).metadata();
    const webp = await sharp(original).webp({ quality: SVG_EMBED_QUALITY, effort: 5 }).toBuffer();
    if (webp.length >= original.length) continue;
    output = output.replace(match[0], `data:image/webp;base64,${webp.toString('base64')}`);
    saved += original.length - webp.length;
    log.push(`    内嵌 ${meta.format} ${meta.width}x${meta.height}: ${kb(original.length)} → ${kb(webp.length)}`);
  }
  return { output, saved, note: `${matches.length} 张内嵌位图` };
}

async function main() {
  await mkdir(DISPLAY_DIR, { recursive: true });
  await mkdir(FULL_DIR, { recursive: true });

  const files = [];
  for (const dir of SOURCE_DIRS) files.push(...(await walk(join(ROOT, dir))));

  const manifest = {};
  let totalBefore = 0;
  let totalDisplay = 0;
  let changed = 0;

  for (const source of files.sort()) {
    const ext = extname(source).toLowerCase();
    if (!RASTER_EXT.has(ext) && ext !== '.svg') continue;

    const key = posix(relative(ROOT, source));
    const rel = posix(relative(ROOT, source)).replace(/^src\/images\//, '');
    const sourceSize = (await stat(source)).size;
    const log = [];

    const displayName = ext === '.svg' ? rel : rel.replace(/\.[^.]+$/, '.webp');
    const displayPath = join(DISPLAY_DIR, displayName);
    const fullPath = join(FULL_DIR, rel);

    totalBefore += sourceSize;
    let displaySize = sourceSize;
    let size = null;

    try {
      if (ext === '.svg') {
        const sourceText = await readFile(source, 'utf8');
        const { output, note } = await optimizeSvg(sourceText, log);
        await writeFile(displayPath, output, 'utf8');
        displaySize = Buffer.byteLength(output, 'utf8');
        size = svgSize(sourceText);
        log.unshift(`  ${key}  ${kb(sourceSize)} → ${kb(displaySize)}  (${note})`);
      } else {
        const image = sharp(source);
        const meta = await image.metadata();
        const buffer = await image
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: RASTER_QUALITY, effort: 5 })
          .toBuffer();
        await writeFile(displayPath, buffer);
        displaySize = buffer.length;
        size = { width: meta.width, height: meta.height };
        log.unshift(`  ${key}  ${kb(sourceSize)} → ${kb(displaySize)}`);
      }

      await copyFile(source, fullPath);
      manifest[key] = {
        display: `/${posix(relative(join(ROOT, 'public'), displayPath))}`,
        full: `/${posix(relative(join(ROOT, 'public'), fullPath))}`,
        width: size?.width ?? null,
        height: size?.height ?? null,
      };
      totalDisplay += displaySize;
      changed++;
    } catch (error) {
      log.unshift(`  ${key}  处理失败：${error.message}（保持原样）`);
      totalDisplay += sourceSize;
    }

    for (const line of log) console.log(line);
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  for (const extra of EXTRA_ASSETS) {
    const source = join(ROOT, extra.source);
    try {
      await stat(source);
    } catch {
      continue;
    }
    const buffer = await sharp(source)
      .resize({ width: extra.width, withoutEnlargement: true })
      .webp({ quality: extra.quality, effort: 5 })
      .toBuffer();
    await writeFile(join(DISPLAY_DIR, extra.output), buffer);
    const sourceSize = (await stat(source)).size;
    totalBefore += sourceSize;
    totalDisplay += buffer.length;
    console.log(`  ${extra.source} → img/${extra.output}  ${kb(sourceSize)} → ${kb(buffer.length)}`);
  }

  const savedPct = totalBefore > 0 ? (100 - (totalDisplay / totalBefore) * 100).toFixed(1) : '0';
  console.log(`\n共处理 ${changed} 张：${kb(totalBefore)} → ${kb(totalDisplay)}（省 ${savedPct}%）`);
  console.log(`显示版: ${posix(relative(ROOT, DISPLAY_DIR))}/   原图: ${posix(relative(ROOT, FULL_DIR))}/`);
  console.log(`清单: ${posix(relative(ROOT, MANIFEST))}`);
}

main().catch((error) => {
  console.error('[optimize-images] 失败:', error);
  process.exit(1);
});
