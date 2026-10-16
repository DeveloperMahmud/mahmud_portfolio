(()=>{
  'use strict';

  const xml=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'
  }[char]));

  function placeholder(label){
    const title=xml(String(label||'Media preview').trim().slice(0,72));
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111510"/><stop offset="1" stop-color="#070907"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="1040" cy="120" r="180" fill="#c6ff4c" opacity=".08"/><path d="M0 700L360 390l210 180 170-145 460 375H0z" fill="#c6ff4c" opacity=".08"/><text x="64" y="90" fill="#c6ff4c" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="5">MH / MEDIA</text><text x="64" y="720" fill="#f4f6f1" font-family="Arial,sans-serif" font-size="38" font-weight="700">${title}</text><text x="64" y="765" fill="#8d958a" font-family="Arial,sans-serif" font-size="20">Preview temporarily unavailable</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  document.addEventListener('error',event=>{
    const image=event.target;
    if(!(image instanceof HTMLImageElement))return;

    if(image.matches('img[data-social-fallback]')){
      if(image.dataset.fallbackApplied)return;
      image.dataset.fallbackApplied='true';
      image.src=image.dataset.socialFallback;
      return;
    }

    // Skill icons already have a compact initials fallback managed by app.js.
    if(image.closest('.skill-icon-wrap')||image.dataset.publicFallbackApplied)return;
    image.dataset.publicFallbackApplied='true';
    image.classList.add('public-image-fallback');
    image.closest('picture')?.querySelectorAll('source').forEach(source=>source.remove());
    image.removeAttribute('srcset');
    image.src=placeholder(image.alt);
  },true);
})();
