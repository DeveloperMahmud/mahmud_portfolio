(function creativeLabComponents(global){
  'use strict';

  const STATUS_LABELS={
    PLANNED:'Coming Soon',
    PREVIEW:'Concept Demo',
    BETA:'Beta',
    LIVE:'Live',
    ARCHIVED:'Archived'
  };

  const text=value=>String(value??'');
  const escapeHtml=value=>text(value).replace(/[&<>'"]/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[char]);

  function safeInternalPath(value){
    const candidate=text(value).trim();
    return /^\/(?!\/)[a-z0-9][a-z0-9\-_/]*(?:[?#][^\s]*)?$/i.test(candidate)?candidate:'';
  }

  function safeHttpsUrl(value){
    try{
      const url=new URL(text(value).trim());
      return url.protocol==='https:'?url.href:'';
    }catch{return ''}
  }

  function demoFallback(tool){
    const slug=encodeURIComponent(text(tool?.publishedSlug||tool?.slug).trim());
    return slug?`/creative-lab/${slug}/demo`:'/creative-lab';
  }

  function detailsFallback(tool){
    const slug=encodeURIComponent(text(tool?.publishedSlug||tool?.slug).trim());
    return slug?`/creative-lab/${slug}`:'/creative-lab';
  }

  function normalizedDestination(value){
    return safeInternalPath(value)||safeHttpsUrl(value);
  }

  function resolvePrimaryAction(tool={}){
    const published=tool.actions&&tool.actions.primary;
    if(published){
      const href=normalizedDestination(published.url)||demoFallback(tool);
      const external=/^https:\/\//i.test(href);
      return{
        href,
        label:text(published.label).trim()||'View Demo',
        target:text(published.target).toUpperCase()==='NEW_TAB'?'_blank':'_self',
        rel:external?'noopener noreferrer':''
      };
    }
    const behavior=text(tool.primaryBehavior||'AUTO').toUpperCase();
    const status=text(tool.productStatus||tool.status||'PREVIEW').toUpperCase();
    const demo=normalizedDestination(tool.demoUrl)||demoFallback(tool);
    const details=detailsFallback(tool);
    const live=safeHttpsUrl(tool.liveUrl);
    const verified=Boolean(tool.liveUrlVerifiedAt&&live);
    let href=demo;
    if(behavior==='DETAILS')href=details;
    else if(behavior==='LIVE')href=verified?live:demo;
    else if(behavior==='AUTO')href=(verified&&(status==='LIVE'||status==='BETA'))?live:demo;
    const external=/^https:\/\//i.test(href);
    const defaultLabel=(href===live&&verified)?(status==='BETA'?'Open Beta':'Open Tool'):(behavior==='DETAILS'?'View Details':'View Demo');
    return{
      href,
      label:text(tool.primaryLabel).trim()||defaultLabel,
      target:external&&text(tool.target).toUpperCase()==='NEW_TAB'?'_blank':'_self',
      rel:external?'noopener noreferrer':''
    };
  }

  function statusBadge(status){
    const key=text(status||'PREVIEW').toUpperCase();
    const label=STATUS_LABELS[key]||STATUS_LABELS.PREVIEW;
    return `<span class="lab-status lab-status--${escapeHtml(key.toLowerCase())}">${escapeHtml(label)}</span>`;
  }

  function renderToolCard(tool={}){
    const action=resolvePrimaryAction(tool);
    const tags=Array.isArray(tool.tags)?tool.tags.slice(0,3):[];
    const image=normalizedDestination(tool.coverImage);
    const title=escapeHtml(tool.title||'Untitled tool');
    const description=escapeHtml(tool.shortDescription||tool.subtitle||'Explore this Creative Lab concept.');
    const media=image
      ?`<img src="${escapeHtml(image)}" alt="${escapeHtml(tool.coverImageAlt||'')}" loading="lazy" decoding="async">`
      :`<span class="lab-card__monogram" aria-hidden="true">${escapeHtml(text(tool.title||'T').slice(0,1).toUpperCase())}</span>`;
    return `<article class="lab-card" data-kind="${escapeHtml(text(tool.kind).toLowerCase())}" data-status="${escapeHtml(text(tool.productStatus||tool.status).toLowerCase())}" data-tool-card="${escapeHtml(text(tool.canonicalId||tool.publishedSlug))}">
      <div class="lab-card__media">${media}</div>
      <div class="lab-card__body">
        <div class="lab-card__meta">${statusBadge(tool.productStatus||tool.status)}<span>${escapeHtml(tool.category||tool.kind||'Creative tool')}</span></div>
        <h3>${title}</h3>
        <p>${description}</p>
        ${tags.length?`<ul class="lab-tags" aria-label="Tags">${tags.map(tag=>`<li>${escapeHtml(tag)}</li>`).join('')}</ul>`:''}
        <a class="lab-action" data-tool-action="${/^https:\/\//i.test(action.href)?'live':action.href.endsWith('/demo')?'demo':'detail'}" href="${escapeHtml(action.href)}"${action.target==='_blank'?' target="_blank"':''}${action.rel?` rel="${action.rel}"`:''}><span>${escapeHtml(action.label)}</span><span aria-hidden="true">↗</span></a>
      </div>
    </article>`;
  }

  function renderEmptyState(message='No tools match these filters.'){
    return `<div class="lab-empty" role="status"><span class="lab-empty__mark" aria-hidden="true">MH</span><h2>Nothing here yet.</h2><p>${escapeHtml(message)}</p><button type="button" data-lab-reset>Reset filters</button></div>`;
  }

  global.CreativeLabUI=Object.freeze({
    STATUS_LABELS,
    escapeHtml,
    resolvePrimaryAction,
    renderToolCard,
    renderEmptyState
  });
})(typeof window!=='undefined'?window:globalThis);
