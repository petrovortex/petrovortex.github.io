import fs from 'node:fs/promises';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
await initWasm(await fs.readFile('node_modules/@resvg/resvg-wasm/index_bg.wasm'));
const svg=await fs.readFile('assets/favicon.svg','utf8');
const renderer=new Resvg(svg,{fitTo:{mode:'width',value:64}});
const png=renderer.render();
await fs.writeFile('assets/favicon-ap.png',png.asPng());
png.free();renderer.free();
console.log('AP favicon generated.');
