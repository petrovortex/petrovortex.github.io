// Original vector artwork for Alexander Petrov's site. No external artwork or fonts.
// This file draws a fixed set of SVG illustrations; it does not read article content.
// New content can use uploaded images without extending this script.
// Authoring workflow and reusable prompts: docs/banner-design.md and docs/artwork-prompts.md.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const palettes = {
  blog: {
    light: { bg:'#f2e9df', ink:'#856457', accent:'#bb513a', fill:'#dfb395', page:'#faf5ec', grid:'#b3a08e' },
    dark: { bg:'#302824', ink:'#b69a86', accent:'#e49574', fill:'#755443', page:'#3b312b', grid:'#8e7361' },
  },
  library: {
    light: { bg:'#e9ece2', ink:'#65715d', accent:'#60754f', fill:'#b4bfa2', page:'#f7f7ee', grid:'#9ba58b' },
    dark: { bg:'#272e26', ink:'#a0ac92', accent:'#b2c18e', fill:'#53624a', page:'#323b2f', grid:'#78856b' },
  },
};
const line = (d, color='ink', extra='') => `<path d="${d}" fill="none" stroke="${color}" ${extra.includes('stroke-width=') ? '' : 'stroke-width="1.6"'} stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const dot = (x,y,r=4,color='accent') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
function page(x,y,w=108,h=138,angle=0) {
  return `<g transform="translate(${x} ${y}) rotate(${angle} ${w/2} ${h/2})">
    <path d="M0 0H${w-20}L${w} 20V${h}H0Z" fill="page" stroke="ink" stroke-width="1.4"/>
    ${line(`M${w-20} 0V20H${w}`)}
    ${line(`M18 36H${w-34}M18 48H${w-22}M18 60H${w-42}`, 'ink', 'opacity=".45"')}
    ${line(`M18 ${h-25}H${w-40}`, 'accent', 'stroke-width="3"')}
  </g>`;
}
function star(x,y) { return `<g transform="translate(${x} ${y})">${line('M-11 0H11M0-11V11M-8-8 8 8M-8 8 8-8','accent')}</g>`; }
function book(x,y,w,h,tilt=0,filled=false) {
  return `<g transform="translate(${x} ${y}) rotate(${tilt})"><rect width="${w}" height="${h}" rx="3" fill="${filled?'fill':'page'}" stroke="ink" stroke-width="1.5"/>
  ${line(`M7 14H${w-7}M7 ${h-15}H${w-7}`)}${dot(w/2,h-28,2,'ink')}</g>`;
}
function openBook(x,y) {
  return `<g transform="translate(${x} ${y})">${line('M-124 65Q-55 46 0 70Q55 46 124 65V-49Q55-67 0-43Q-55-67-124-49Z','ink')}
    <path d="M-118 58Q-50 41 0 62Q50 41 118 58V-57Q53-73 0-50Q-53-73-118-57Z" fill="page" stroke="ink" stroke-width="1.6"/>
    ${line('M0-49V62')}${line('M-96-30Q-52-39-22-25M-96-14Q-52-23-22-9M-96 2Q-52-7-36 1M22-25Q58-39 96-30M22-9Q58-23 96-14M22 7Q58-7 81-1','ink','opacity=".45"')}
    <path d="M61-65V26L72 16L83 26V-65" fill="accent" opacity=".85"/>
  </g>`;
}
function grid(x,y,size,gap,active) {
  return `<g transform="translate(${x} ${y})">` + Array.from({length:size*size},(_,i)=>{
    const col=i%size,row=Math.floor(i/size),on=active(col,row);
    return `<rect x="${col*gap}" y="${row*gap}" width="${gap-5}" height="${gap-5}" rx="2" fill="${on?'accent':'fill'}" opacity="${on?'.8':'.28'}"/>`;
  }).join('')+'</g>';
}
const art = {
  blog: { family:'blog', body:()=>`
    ${line('M66 177C160 177 167 80 260 80S322 178 411 178S492 87 574 87S686 177 759 177S834 116 893 116','ink','opacity=".45" stroke-dasharray="3 7"')}
    ${page(132,62,105,139,-10)}${page(151,54,105,139,5)}
    ${line('M177 150Q196 130 213 149T244 144','accent','stroke-width="2.5"')}
    ${dot(325,123)}${line('M355 109H406M355 120H390','ink','opacity=".45"')}
    ${page(450,48,125,158,-3)}${line('M476 154H544M476 161H518','accent')}
    ${star(618,67)}${dot(689,126,5)}
    <g transform="translate(741 71) rotate(8 46 49)"><rect width="94" height="102" rx="3" fill="fill" opacity=".65"/>${line('M20 31H74M20 45H63M20 59H52')}</g>
    ${line('M870 61V79M861 70H879','ink','opacity=".45"')}` },
  library: { family:'library', body:()=>`
    ${line('M70 201H890','ink','opacity=".35"')}
    ${book(120,70,33,128)}${book(159,53,44,145,0,true)}${book(208,82,30,116)}${book(250,65,34,140,-9,true)}
    ${line('M333 96H385M333 109H369','ink','opacity=".4"')}${dot(407,153,3)}
    ${openBook(571,127)}${star(715,58)}
    ${page(779,91,71,97,9)}${line('M733 194Q778 225 860 201','ink','opacity=".45" stroke-dasharray="3 7"')}` },
  // A night-time coffee search, map locations, and an agent checking relevance.
  'agentic-ai': { family:'blog', body:()=>`
    <defs><clipPath id="map"><rect x="156" y="68" width="363" height="151" rx="7"/></clipPath></defs>
    <rect x="156" y="68" width="363" height="151" rx="7" fill="page" stroke="ink" stroke-width="1.2"/>
    <g clip-path="url(#map)">
      <path d="M148 161 312 68 362 68 184 223H148Z" fill="fill" opacity=".4"/>
      ${line('M199 68V222M284 68V222M415 68V222M157 112H519M157 178H519M338 68 376 219','ink','opacity=".25" stroke-width="7"')}
      ${line('M189 199H284V112H398','accent','stroke-dasharray="3 6" stroke-width="2"')}
    </g>
    <rect x="85" y="29" width="273" height="50" rx="25" fill="page" stroke="ink" stroke-width="1.5"/>
    <circle cx="115" cy="52" r="8" fill="none" stroke="ink" stroke-width="1.5"/>${line('M121 58 128 65')}
    ${line('M148 49H226M148 60H202','ink','opacity=".55"')}
    <g transform="translate(247 40)">${line('M0 6H18V17Q18 24 9 24Q0 24 0 17ZM18 9H22Q28 15 18 18M-3 28H22M5 0V2M12-2V1')}</g>
    <path d="M321 41A14 14 0 1 0 332 61A14 14 0 0 1 321 41" fill="accent" opacity=".8"/>
    <g transform="translate(398 110)"><path d="M0 26C-13 10-20 2-20-8A20 20 0 1 1 20-8C20 2 13 10 0 26Z" fill="accent"/><circle cy="-8" r="7" fill="page"/></g>
    <g opacity=".55" transform="translate(239 161)"><path d="M0 18C-9 7-14 1-14-6A14 14 0 1 1 14-6C14 1 9 7 0 18Z" fill="ink"/><circle cy="-6" r="4" fill="page"/></g>
    ${line('M519 135H571M563 128 571 135 563 142','accent')}
    <rect x="594" y="76" width="110" height="114" rx="12" fill="page" stroke="ink" stroke-width="1.5"/>
    ${line('M617 103 681 163M617 163 681 103M617 103H681V163H617Z','ink','opacity=".4"')}
    ${dot(617,103,6)}${dot(681,103,6)}${dot(617,163,6)}${dot(681,163,6)}${dot(649,133,9)}
    ${line('M704 135H754M746 128 754 135 746 142','accent')}
    <rect x="775" y="97" width="100" height="76" rx="7" fill="fill" opacity=".55"/>
    ${line('M808 131 820 143 844 118','accent','stroke-width="3"')}
    ${line('M801 158H849','ink','opacity=".4"')}
    ${star(741,49)}${line('M612 211H687M632 223H668','ink','opacity=".35"')}` },
  'efficient-ml': { family:'library', body:()=>`
    ${line('M106 64 185 92 265 64M106 64 185 168 265 64M106 130 185 92 265 130M106 130 185 168 265 130M106 196 185 92 265 196M106 196 185 168 265 196','ink','opacity=".24"')}
    ${line('M106 64 185 92 265 130M106 196 185 168 265 196M106 130 185 168 265 64','accent','stroke-width="2.3"')}
    ${[64,130,196].map(y=>dot(106,y,7)).join('')}${[92,168].map(y=>dot(185,y,9)).join('')}${[64,130,196].map(y=>dot(265,y,7)).join('')}
    ${line('M309 130H366M357 122 366 130 357 138','accent')}
    ${grid(411,69,5,26,(x,y)=>x===y || x+y===4)}
    ${line('M574 130H637M628 122 637 130 628 138','accent')}
    <rect x="698" y="68" width="126" height="126" rx="8" fill="page" stroke="ink" stroke-width="1.6"/>
    <rect x="722" y="92" width="78" height="78" rx="4" fill="fill" opacity=".6"/>
    ${line('M717 56V68M739 56V68M761 56V68M783 56V68M805 56V68M717 194V206M739 194V206M761 194V206M783 194V206M805 194V206M686 88H698M686 110H698M686 132H698M686 154H698M686 176H698M824 88H836M824 110H836M824 132H836M824 154H836M824 176H836','ink')}
    <path d="M767 105 745 135H761L754 156 779 125H763Z" fill="accent"/>
    ${star(878,54)}${line('M409 215H537M411 209V221M535 209V221','ink','opacity=".4"')}` },
  // The lecture's accuracy/resource trade-off, compressed weights, and a real chip.
  'efficient-ml-01': { family:'library', body:()=>`
    ${line('M108 207V54M108 207H341','ink')}
    ${line('M102 63 108 54 114 63M331 201 341 207 331 213','ink')}
    ${line('M125 179C158 110 211 82 320 66','accent','stroke-width="2.5"')}
    ${line('M148 195C196 142 243 119 325 106','ink','opacity=".35" stroke-dasharray="4 6"')}
    ${dot(157,134,5)}${dot(205,93,5)}${dot(291,71,5)}
    ${dot(185,170,4,'ink')}${dot(246,131,4,'ink')}${dot(295,114,4,'ink')}
    ${line('M245 128 212 98M213 109 212 98 223 100','accent')}
    ${grid(396,76,4,24,(x,y)=>(x+y)%2===0)}
    ${line('M516 124H572M563 117 572 124 563 131','accent')}
    ${grid(596,99,2,28,()=>true)}
    ${line('M673 124H722M713 117 722 124 713 131','accent')}
    <rect x="758" y="79" width="92" height="92" rx="6" fill="page" stroke="ink" stroke-width="1.6"/>
    <rect x="778" y="99" width="52" height="52" rx="3" fill="fill" opacity=".65"/>
    ${line('M777 69V79M795 69V79M813 69V79M831 69V79M777 171V181M795 171V181M813 171V181M831 171V181M748 98H758M748 116H758M748 134H758M748 152H758M850 98H860M850 116H860M850 134H860M850 152H860','ink')}
    ${line('M790 127 800 138 819 115','accent','stroke-width="2"')}
    ${line('M394 207H490M396 201V213M486 201V213M592 207H652M596 201V213M647 201V213','ink','opacity=".4"')}
    ${star(713,57)}` },
  // Small compositions are drawn independently; no cropping of panoramic banners.
  'agentic-ai-preview': { family:'blog', width:360, height:240, body:()=>`
    <rect x="32" y="54" width="247" height="157" rx="8" fill="page" stroke="ink" stroke-width="1.5"/>
    ${line('M84 55V210M166 55V210M237 55V210M33 109H278M33 164H278','ink','opacity=".2" stroke-width="5"')}
    ${line('M58 184H166V109H209','accent','stroke-dasharray="3 5" stroke-width="2"')}
    <rect x="47" y="26" width="173" height="44" rx="22" fill="page" stroke="ink" stroke-width="1.6"/>
    <circle cx="72" cy="47" r="7" fill="none" stroke="ink" stroke-width="1.6"/>${line('M77 52 83 58M98 43H144M98 53H128')}
    <g transform="translate(165 34)">${line('M0 6H18V16Q18 23 9 23Q0 23 0 16ZM18 9H22Q28 15 18 18M-3 27H22','accent','stroke-width="2"')}</g>
    <path d="M209 134C195 117 187 109 187 98A22 22 0 1 1 231 98C231 109 223 117 209 134Z" fill="accent"/><circle cx="209" cy="98" r="7" fill="page"/>
    <circle cx="282" cy="161" r="35" fill="page" stroke="ink" stroke-width="1.5"/>
    ${line('M267 161 279 173 299 149','accent','stroke-width="3"')}${star(306,48)}` },
  'efficient-ml-preview': { family:'library', width:360, height:240, body:()=>`
    ${grid(35,78,4,22,(x,y)=>x===y || x+y===3)}
    ${line('M139 121H177M169 114 177 121 169 128','accent','stroke-width="2"')}
    <rect x="207" y="65" width="110" height="110" rx="8" fill="page" stroke="ink" stroke-width="1.8"/>
    <rect x="227" y="85" width="70" height="70" rx="4" fill="fill" opacity=".65"/>
    ${line('M225 55V65M249 55V65M273 55V65M297 55V65M225 175V185M249 175V185M273 175V185M297 175V185M197 83H207M197 107H207M197 131H207M197 155H207M317 83H327M317 107H327M317 131H327M317 155H327','ink')}
    <path d="M267 95 245 125H261L254 146 279 115H263Z" fill="accent"/>
    ${star(156,53)}${line('M34 191H118','ink','opacity=".35"')}` },
  'efficient-ml-01-preview': { family:'library', width:360, height:240, body:()=>`
    ${line('M48 190V48M48 190H304','ink','stroke-width="1.8"')}
    ${line('M42 57 48 48 54 57M295 184 304 190 295 196','ink')}
    ${line('M65 170C98 100 146 73 277 49','accent','stroke-width="3"')}
    ${line('M88 179C139 131 198 107 285 91','ink','opacity=".4" stroke-dasharray="4 6"')}
    ${dot(95,124,6)}${dot(151,79,6)}${dot(250,54,6)}${dot(180,117,5,'ink')}
    ${line('M177 113 155 84M155 94V84H165','accent','stroke-width="2"')}
    ${grid(244,132,2,18,()=>true)}${star(313,42)}` },
};
const directory=path.join(root,'assets/images/banners');
await fs.mkdir(directory,{recursive:true});
for(const [name,design] of Object.entries(art)) {
  for(const theme of ['light','dark']) {
    const p=palettes[design.family][theme];
    const width=design.width || 960, height=design.height || 260;
    const body=design.body().replace(/(fill|stroke)="(ink|accent|fill|page)"/g,(_,attr,color)=>`${attr}="${p[color]}"`);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="${p.grid}" opacity=".23"/></pattern></defs>
<rect width="${width}" height="${height}" rx="8" fill="${p.bg}"/><rect width="${width}" height="${height}" rx="8" fill="url(#dots)"/>
${body}
<circle cx="${width-24}" cy="${height-24}" r="3" fill="${p.accent}"/>
</svg>\n`;
    await fs.writeFile(path.join(directory,name+(theme==='dark'?'-dark':'')+'.svg'),svg);
  }
}
console.log('Generated 5 banners and 3 dedicated previews, each in light and dark editions.');
