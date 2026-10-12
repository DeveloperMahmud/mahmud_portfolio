(()=>{
  if(!document.body.classList.contains('home-custom-cursor'))return;
  const cursor=document.querySelector('.cursor');
  if(!cursor)return;
  const span=cursor.querySelector('span');
  const desktop=()=>window.innerWidth>800 && matchMedia('(pointer:fine)').matches;
  const setVisibility=()=>{const on=desktop();cursor.style.display=on?'block':'none';cursor.style.opacity=on?'1':'0';if(!on)cursor.classList.remove('hover');};
  const move=e=>{if(!desktop())return;cursor.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;cursor.style.opacity='1';};
  const target=e=>e.target?.closest?.('a,button,.project-detail-gallery figure,.project-detail-hero,.article-back,.project-detail-grid .button,.image-viewer-image,.image-viewer-close,.image-viewer-nav,.image-viewer-backdrop');
  addEventListener('pointermove',move,{passive:true});
  document.addEventListener('mouseover',e=>{if(!desktop())return;const el=target(e);if(!el)return;cursor.classList.add('hover');if(span)span.textContent=el.matches('.image-viewer-image,.project-detail-gallery figure,.project-detail-hero')?'VIEW':'↗';});
  document.addEventListener('mouseout',e=>{const el=target(e);if(el&&!el.contains(e.relatedTarget))cursor.classList.remove('hover');});
  addEventListener('resize',setVisibility,{passive:true});
  setVisibility();
})();
