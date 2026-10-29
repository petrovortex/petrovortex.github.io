export function initExternalLinks(doc = document) {
  const origins=new Set([doc.location.origin]);
  try {origins.add(new URL(doc.querySelector('link[rel="canonical"]')?.href).origin);} catch {}
  const classify = link => {
    if(!link.matches('a[href]')) return;
    let url; try {url=new URL(link.getAttribute('href'),doc.location.href);} catch {return;}
    if ((['http:','https:'].includes(url.protocol) && !origins.has(url.origin)) || ['mailto:','tel:','tg:','discord:'].includes(url.protocol)) {
      link.target='_blank';
      link.relList.add('noopener','noreferrer');
    }
  };
  doc.querySelectorAll('a[href]').forEach(classify);
  // References and contact links can be inserted after initial page setup.
  const observer=new doc.defaultView.MutationObserver(records=>{
    for(const record of records) {
      if(record.type==='attributes') classify(record.target);
      for(const node of record.addedNodes) if(node.nodeType===1) {if(node.matches('a[href]'))classify(node);node.querySelectorAll('a[href]').forEach(classify);}
    }
  });
  observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
  return observer;
}
