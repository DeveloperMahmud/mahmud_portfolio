(()=>{
  const imageSelector=[
    '.project-image',
    '.modal-hero',
    '.gallery-slide img',
    '.project-detail-hero',
    '.project-detail-gallery img',
    '.blog-media img',
    '.article-cover',
    '.article-inline-image img'
  ].join(',');
  let overlay=null, image=null, titleEl=null, countEl=null, current=0, items=[];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensure(){
    if(overlay)return;
    overlay=document.createElement('div');
    overlay.className='image-viewer';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`<div class="image-viewer-backdrop" data-viewer-close></div><div class="image-viewer-panel" role="dialog" aria-modal="true" aria-label="Image viewer"><div class="image-viewer-top"><span class="image-viewer-title"></span><span class="image-viewer-count"></span><button type="button" class="image-viewer-close" aria-label="Close image viewer">×</button></div><button type="button" class="image-viewer-nav image-viewer-prev" aria-label="Previous image">←</button><figure class="image-viewer-figure"><img class="image-viewer-image" alt=""><figcaption></figcaption></figure><button type="button" class="image-viewer-nav image-viewer-next" aria-label="Next image">→</button></div>`;
    document.body.appendChild(overlay);
    image=overlay.querySelector('.image-viewer-image');
    titleEl=overlay.querySelector('.image-viewer-title');
    countEl=overlay.querySelector('.image-viewer-count');
    overlay.querySelector('.image-viewer-close').addEventListener('click',close);
    overlay.querySelector('[data-viewer-close]').addEventListener('click',close);
    overlay.querySelector('.image-viewer-prev').addEventListener('click',()=>move(-1));
    overlay.querySelector('.image-viewer-next').addEventListener('click',()=>move(1));
    image.addEventListener('click',e=>e.stopPropagation());
  }
  function sourceItems(img){
    const group=img.closest('.gallery-slider,.project-detail-gallery,.article-body');
    const imgs=group?[...group.querySelectorAll('img')].filter(x=>x.src):[img];
    return imgs.map(x=>({src:x.currentSrc||x.src,alt:x.alt||'',title:x.closest('figure')?.querySelector('figcaption')?.textContent||x.alt||''}));
  }
  function render(){
    const item=items[current]; if(!item)return;
    image.src=item.src; image.alt=item.alt;
    const caption=overlay.querySelector('figcaption'); caption.textContent=item.title||''; caption.hidden=!item.title;
    titleEl.textContent=item.alt||'IMAGE';
    countEl.textContent=items.length>1?`${String(current+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`:'';
    overlay.querySelector('.image-viewer-prev').hidden=items.length<2;
    overlay.querySelector('.image-viewer-next').hidden=items.length<2;
  }
  function open(img){
    if(!img?.src)return;
    ensure();
    items=sourceItems(img);
    const src=img.currentSrc||img.src;
    current=Math.max(0,items.findIndex(x=>x.src===src));
    render();
    overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.body.classList.add('image-viewer-open');
  }
  function close(){
    if(!overlay)return;
    overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.body.classList.remove('image-viewer-open');
  }
  function move(dir){if(items.length<2)return;current=(current+dir+items.length)%items.length;render()}
  document.addEventListener('click',e=>{
    // Homepage project cards and featured slides navigate to case studies.
    // Image zoom remains available inside the destination project's gallery.
    if(e.target.closest?.('.project-card,.featured-slide'))return;
    const img=e.target.closest?.(imageSelector);
    if(!img)return;
    e.preventDefault(); e.stopPropagation();
    open(img);
  },true);
  document.addEventListener('keydown',e=>{
    if(!overlay?.classList.contains('open'))return;
    if(e.key==='Escape'){e.preventDefault();close()}
    else if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();move(1)}
  });
  let sx=0;
  document.addEventListener('pointerdown',e=>{if(overlay?.classList.contains('open'))sx=e.clientX},{passive:true});
  document.addEventListener('pointerup',e=>{if(!overlay?.classList.contains('open'))return;const dx=e.clientX-sx;if(Math.abs(dx)>50)move(dx<0?1:-1)},{passive:true});
})();
