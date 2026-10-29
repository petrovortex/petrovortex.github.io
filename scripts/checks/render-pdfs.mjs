import fs from 'node:fs/promises';
import path from 'node:path';
import * as mupdf from 'mupdf';
const root = path.resolve('.');
const files = (await fs.readdir('assets/downloads')).filter(name => name.endsWith('.pdf'));
for (const name of files) {
  const doc = mupdf.Document.openDocument(await fs.readFile(path.join('assets/downloads',name)), 'application/pdf');
  const directory = path.join('.preview/pdf-review',name.slice(0,-4));
  await fs.mkdir(directory,{recursive:true});
  let text = '';
  for (let n=0; n<doc.countPages(); n++) {
    const page = doc.loadPage(n), structured = page.toStructuredText();
    text += structured.asText();
    const pixmap = page.toPixmap([1.2,0,0,1.2,0,0],mupdf.ColorSpace.DeviceRGB,false,true);
    await fs.writeFile(path.join(directory,'page-'+(n+1)+'.png'),pixmap.asPNG());
    const data = JSON.parse(structured.asJSON());
    for (const block of data.blocks || []) {
      if (block.type !== 'text') continue;
      const b = block.bbox;
      if (b && (b.x < 35 || b.x + b.w > 561 || b.y < 20 || b.y + b.h > 822)) throw new Error(name+': text outside margins on page '+(n+1));
    }
    pixmap.destroy(); structured.destroy(); page.destroy();
  }
  if (!text.includes('Alexander Petrov') || !text.includes('https://petrovortex.github.io/')) throw new Error(name+': missing attribution');
  await fs.writeFile(path.join(directory,'text.txt'),text);
  console.log(name+': '+doc.countPages()+' pages rendered and checked');
  doc.destroy();
}
