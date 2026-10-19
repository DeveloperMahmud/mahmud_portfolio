(()=>{
  'use strict';
  const clean=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const glyphs={
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7.2v.1M11.5 17v-4.1a2.2 2.2 0 0 1 4.4 0V17M11.5 10v7"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.4 6.6h.01"/>',
    github:'<path d="M8 20c-4 1.2-4-2-5.6-2.4M13.6 22v-3.1a2.7 2.7 0 0 0-.8-2.1c2.7-.3 5.5-1.3 5.5-5.9a4.6 4.6 0 0 0-1.2-3.2 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.3 1.2a11.4 11.4 0 0 0-6 0C5.4 4.3 4.4 4.6 4.4 4.6a4.2 4.2 0 0 0-.1 3.1 4.6 4.6 0 0 0-1.2 3.2c0 4.6 2.8 5.6 5.5 5.9a2.4 2.4 0 0 0-.7 1.9V22"/>',
    behance:'<path d="M5 5h5.4a3.1 3.1 0 0 1 0 6.2H5zm0 6.2h6.1a3.4 3.4 0 0 1 0 6.8H5zM15 8h4M15 14h4.8a2.4 2.4 0 0 1-4.8 0 2.4 2.4 0 0 1 4.8 0z"/>',
    dribbble:'<circle cx="12" cy="12" r="9"/><path d="M3.4 9.3c5 .1 9.2.2 13.2 3.2 1.1.8 2 1.8 2.7 3M8.2 4.2c3.1 3.2 5.6 7 7.3 11.4M5 18c3-3.5 6.8-5.2 12.6-5"/>',
    youtube:'<rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10 9 5 3-5 3z"/>',
    x:'<path d="m5 4 14 16M19 4 5 20"/>'
  };
  function replace(image){
    if(!(image instanceof HTMLImageElement)||!image.src.includes('api.iconify.design'))return;
    const anchor=image.closest('a'),label=anchor?.getAttribute('aria-label')||'';
    const icon=clean(new URL(image.src).pathname.split('/').pop()?.replace('.svg',''))||clean(label);
    const color=new URL(image.src).searchParams.get('color')||'#c6ff4c';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','social-inline-icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('fill','none');svg.setAttribute('stroke',color);svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
    svg.innerHTML=glyphs[icon]||'<path d="M10 14 21 3M15 3h6v6M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>';
    image.replaceWith(svg);
  }
  function apply(root=document){root.querySelectorAll?.('.public-socials img,.footer-socials img').forEach(replace)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(),{once:true});else apply();
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1){replace(node);apply(node)}}))).observe(document.documentElement,{childList:true,subtree:true});
})();
