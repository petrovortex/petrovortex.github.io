import fs from 'node:fs/promises';
import path from 'node:path';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { JSDOM } from 'jsdom';
let initialized = false, fonts = [];
async function init(root) {
  if (initialized) return;
  await initWasm(await fs.readFile(path.join(root, 'node_modules/@resvg/resvg-wasm/index_bg.wasm')));
  for (const file of ['C:/Windows/Fonts/arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']) {
    try { fonts.push(new Uint8Array(await fs.readFile(file))); break; } catch {}
  }
  initialized = true;
}
export async function preparePdfImages(job) {
  await init(job.root);
  const directory = path.join(job.root, '.preview/exports', job.key);
  await fs.mkdir(directory, { recursive: true });
  const doc = new JSDOM(job.html).window.document;
  let number = 0;
  async function render(svg) {
    const renderer = new Resvg(svg, { fitTo: { mode: 'zoom', value: 3 }, font: { fontBuffers: fonts, defaultFontFamily: 'Arial' } });
    const pixels = renderer.render();
    const name = '/.preview/exports/' + job.key + '/image-' + (++number) + '.png';
    await fs.writeFile(path.join(job.root, name.slice(1)), pixels.asPng());
    pixels.free(); renderer.free();
    return name;
  }
  for (const svg of doc.querySelectorAll('svg')) {
    const width = parseFloat(svg.getAttribute('width')) * 5.25;
    const height = parseFloat(svg.getAttribute('height')) * 5.25;
    svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
    const src = await render(svg.outerHTML.replaceAll('currentColor','#252522'));
    const img = doc.createElement('img'); img.src=src; img.className='math-equation';
    img.setAttribute('width', String(width)); img.setAttribute('height', String(height)); img.alt=svg.getAttribute('aria-label') || '';
    svg.replaceWith(img);
  }
  for (const img of doc.querySelectorAll('img:not(.math-equation)')) {
    let src = img.getAttribute('src');
    if (src.startsWith(job.origin + '/')) src = src.slice(job.origin.length);
    if (src.startsWith('/') && src.endsWith('.svg')) {
      const file = path.resolve(job.root, '.' + decodeURIComponent(src));
      if (!file.startsWith(path.resolve(job.root) + path.sep)) throw new Error('Image escapes site root');
      // Diagram webfonts fall back to the same readable font as the document.
      const svg = (await fs.readFile(file,'utf8')).replace(/font-family="[^"]*"/g, 'font-family="Arial"');
      img.setAttribute('src', await render(svg));
    }
  }
  job.html = doc.body.innerHTML;
}
