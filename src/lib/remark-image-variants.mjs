// 构建时把 Markdown 里引用的图片替换成「压缩显示版」，并把原图地址写进 data-full-src。
//
// 作者照常写相对路径即可：
//   ![示意](../../images/gym.svg)
// 产出：
//   <img src="/img/gym.svg" data-full-src="/img-full/gym.svg" width=.. height=..>
// 灯箱点击时读 data-full-src 加载原图，所以正文只下载压缩版，放大才取原图。
import { readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MANIFEST = resolve(ROOT, 'src/lib/image-variants.json');

/** 读取由 scripts/optimize-images.mjs 生成的清单；缺失时不影响构建 */
function loadManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

const posix = (p) => p.split(sep).join('/');
// 外链 / data URI / 锚点都不处理
const isRemote = (url) => /^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('#');

/** 就地收集所有 image 节点，省掉一个依赖 */
function collectImages(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (node.type === 'image') out.push(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectImages(child, out);
  }
  return out;
}

export default function remarkImageVariants() {
  const manifest = loadManifest();

  return (tree, file) => {
    const sourcePath = file?.path ?? file?.history?.[0];
    if (!sourcePath) return;
    const sourceDir = dirname(String(sourcePath));

    for (const node of collectImages(tree)) {
      const url = typeof node.url === 'string' ? node.url : '';
      if (!url || isRemote(url)) continue;

      const key = posix(relative(ROOT, resolve(sourceDir, url)));
      const variant = manifest[key];
      if (!variant?.display) continue;

      node.url = variant.display;
      node.data = node.data ?? {};
      node.data.hProperties = {
        ...(node.data.hProperties ?? {}),
        'data-full-src': variant.full,
        loading: 'lazy',
        decoding: 'async',
        ...(variant.width ? { width: variant.width } : {}),
        ...(variant.height ? { height: variant.height } : {}),
      };
    }
  };
}
