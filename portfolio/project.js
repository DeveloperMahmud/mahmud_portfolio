(() => {
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const demoRequested = new URLSearchParams(location.search).get('demo') === '1';let demoPreview=false;
  const slug = new URLSearchParams(location.search).get('slug') || location.pathname.split('/').filter(Boolean).pop();
  const root = $('#projectDetail');
  document.body.classList.add('detail-page-cursor');
async function applyPageExperience(){if(demoRequested){try{demoPreview=(await fetch('/api/auth/me',{credentials:'include',cache:'no-store'})).ok}catch{}}if(demoPreview){const bar=document.createElement('div');bar.className='demo-preview-banner';bar.innerHTML='<strong>ADMIN DEMO PREVIEW</strong><span>Sample content is private to this preview URL.</span><nav><a href="/?demo=1">HOME</a><a href="/work.html?demo=1">WORK</a><a href="/">EXIT</a></nav>';document.body.prepend(bar);document.body.classList.add('demo-preview-active')}try{const r=await fetch('/api/public/settings',{cache:'no-store'}),d=r.ok?await r.json():{},s=d.settings||{},footer=s.footerConfig||{},about=s.aboutConfig||{};document.body.classList.toggle('nav-always-visible',footer.stickyNavigation!==false);if(about.cvUrl)document.querySelector('.desktop-nav')?.insertAdjacentHTML('beforeend',`<a data-public-cv class="nav-cv" href="/api/public/cv" aria-label="${esc(about.cvLabel||'DOWNLOAD CV')}" title="${esc(about.cvLabel||'DOWNLOAD CV')}">CV ↓</a>`)}catch{}}

  const demoAssets = {
    'demo-premium-a-plus': ['Premium A+ — Outdoor Hydration', '/assets/demo-a-plus.svg', 'PREMIUM A+'],
    'demo-amazon-listing': ['Amazon Listing — Smart Kitchen Tool', '/assets/demo-listing.svg', 'LISTING IMAGES'],
    'demo-brand-identity': ['Brand Identity — Northline', '/assets/demo-brand.svg', 'BRAND IDENTITY'],
    'demo-amazon-storefront': ['Amazon Storefront — Home & Living', '/assets/demo-store.svg', 'STOREFRONT'],
    'demo-product-motion': ['Product Motion — Launch Film', '/assets/demo-motion.svg', 'VIDEO / MOTION'],
    'demo-landing-page': ['Landing Page — Product Launch', '/assets/demo-web.svg', 'LANDING PAGE'],
    'demo-electrical-sld': ['Electrical SLD — Commercial Building', '/assets/demo-sld.svg', 'ELECTRICAL SLD'],
    'demo-packaging-system': ['Packaging System — Everyday Goods', '/assets/demo-pack.svg', 'PACKAGING']
  };

  function demoProject(key) {
    const asset = demoAssets[key];
    return asset ? { slug: key, title: asset[0], coverImage: asset[1], type: asset[2], year: 'DEMO', category: 'Concept Work', description: 'A demonstration project available only when demo content is explicitly enabled.', gallery: [{ url: asset[1], alt: asset[0] }] } : null;
  }

  function setMeta(project) {
    const title = project.seoTitle || `${project.title} — Mahmudul Hassan`;
    const description = (project.seoDescription || project.description || 'Project case study by Mahmudul Hassan.').slice(0, 160);
    const image = project.ogImage || project.coverImage;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    if (image) document.querySelector('meta[property="og:image"]')?.setAttribute('content', new URL(image, location.href).href);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = project.canonicalUrl || `${location.origin}/work/${encodeURIComponent(project.slug)}`;
    if (project.noIndex) {
      const robots = document.createElement('meta');
      robots.name = 'robots';
      robots.content = 'noindex,nofollow';
      document.head.append(robots);
    }
  }

  function image(url, alt, className = '') {
    return url ? `<img class="${className}" src="${esc(url)}" alt="${esc(alt || '')}" loading="lazy" decoding="async">` : '';
  }

  function safeEmbed(url) {
    try {
      const parsed = new URL(url);
      const allowed = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];
      return allowed.includes(parsed.hostname) ? parsed.href : '';
    } catch { return ''; }
  }

  function renderBlock(block) {
    const data = block.data || {};
    const title = data.heading || data.title || '';
    switch (block.type) {
      case 'TEXT': return `<section class="case-block case-text">${title ? `<h2>${esc(title)}</h2>` : ''}<p>${esc(data.text || data.body || '')}</p></section>`;
      case 'LARGE_IMAGE': return `<figure class="case-block case-image">${image(data.url, data.alt || title)}${data.caption ? `<figcaption>${esc(data.caption)}</figcaption>` : ''}</figure>`;
      case 'FULL_BLEED_IMAGE': return `<figure class="case-block case-image full-bleed">${image(data.url, data.alt || title)}${data.caption ? `<figcaption>${esc(data.caption)}</figcaption>` : ''}</figure>`;
      case 'IMAGE_PAIR': return `<section class="case-block case-pair">${image(data.left?.url || data.leftUrl, data.left?.alt || data.leftAlt)}${image(data.right?.url || data.rightUrl, data.right?.alt || data.rightAlt)}</section>`;
      case 'IMAGE_GRID':
      case 'GALLERY': return `<section class="case-block case-gallery">${(data.items || data.images || []).map(item => image(item.url || item, item.alt || project?.title)).join('')}</section>`;
      case 'VIDEO': {
        const embed = safeEmbed(data.embedUrl || data.url || '');
        if (embed) return `<section class="case-block case-video"><iframe src="${esc(embed)}" title="${esc(title || 'Project video')}" loading="lazy" allowfullscreen></iframe></section>`;
        return data.url ? `<section class="case-block case-video"><video controls preload="metadata" poster="${esc(data.poster || '')}"><source src="${esc(data.url)}"></video></section>` : '';
      }
      case 'BEFORE_AFTER': return `<section class="case-block case-before-after"><figure>${image(data.beforeUrl || data.before?.url, data.beforeLabel || 'Before')}<figcaption>${esc(data.beforeLabel || 'Before')}</figcaption></figure><figure>${image(data.afterUrl || data.after?.url, data.afterLabel || 'After')}<figcaption>${esc(data.afterLabel || 'After')}</figcaption></figure></section>`;
      case 'DESIGN_DECISIONS': return `<section class="case-block case-decisions">${title ? `<h2>${esc(title)}</h2>` : ''}${(data.items || []).map((item, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div></article>`).join('')}</section>`;
      case 'DESIGN_SYSTEM': return `<section class="case-block case-system">${title ? `<h2>${esc(title)}</h2>` : ''}<div>${(data.items || []).map(item => `<article><small>${esc(item.label || item.title)}</small><strong>${esc(item.value || item.description)}</strong></article>`).join('')}</div></section>`;
      case 'QUOTE': return `<blockquote class="case-block case-quote">“${esc(data.quote || data.text || '')}”${data.attribution ? `<cite>${esc(data.attribution)}</cite>` : ''}</blockquote>`;
      case 'RESULTS':
      case 'METRICS': {const selected=Array.isArray(data.metricIds)&&data.metricIds.length?data.metricIds.map(id=>(project?.resultMetrics||[]).find(item=>item.id===id)).filter(Boolean):(data.items||project?.resultMetrics||[]);return `<section class="case-block case-results">${title ? `<h2>${esc(title)}</h2>` : ''}<div>${selected.slice(0,6).map(item => `<article><strong>${esc(`${item.prefix||''}${item.value||item.afterValue||item.title||''}${item.suffix||''}`)}</strong><span>${esc(item.label || item.description)}</span>${item.beforeValue&&item.afterValue?`<small>${esc(item.beforeValue)} → ${esc(item.afterValue)}</small>`:''}${item.publicNote?`<p>${esc(item.publicNote)}</p>`:''}</article>`).join('')}</div></section>`;}
      case 'DELIVERABLES':
      case 'CREDITS': return `<section class="case-block case-list">${title ? `<h2>${esc(title)}</h2>` : ''}<ul>${(data.items || []).map(item => `<li>${esc(item.label ? `${item.label}: ${item.value}` : item)}</li>`).join('')}</ul></section>`;
      case 'SPACER': return '<div class="case-block case-spacer" aria-hidden="true"></div>';
      case 'DIVIDER': return '<hr class="case-block case-divider">';
      case 'EMBED': {
        const embed = safeEmbed(data.url || '');
        return embed ? `<section class="case-block case-video"><iframe src="${esc(embed)}" title="${esc(title || 'Embedded media')}" loading="lazy" allowfullscreen></iframe></section>` : '';
      }
      default: return '';
    }
  }

  let project = null;
  function renderGallery(items, fallbackAlt) {
    return items?.length ? `<section class="project-detail-gallery">${items.map(item => `<figure>${image(item.url || item, item.alt || fallbackAlt)}${item.alt ? `<figcaption>${esc(item.alt)}</figcaption>` : ''}</figure>`).join('')}</section>` : '';
  }

  function renderLegacy(project) {
    const values = [
      ['OVERVIEW', project.description || 'Project overview available on request.'],
      ['CHALLENGE', project.challenge], ['APPROACH', project.approach], ['PROCESS', project.process],
      ['RESULT / OUTCOME', project.results], ['DELIVERABLES', Array.isArray(project.deliverables) ? project.deliverables.join(' · ') : project.deliverables]
    ].filter(([, value]) => value);
    return `<div class="project-detail-grid">${values.map(([label, value]) => `<section><span class="kicker">${label}</span><p>${esc(value)}</p></section>`).join('')}<section><span class="kicker">TOOLS</span><p>${esc(Array.isArray(project.tools) ? project.tools.join(' · ') : project.tools || 'Available on request')}</p>${project.liveUrl ? `<a class="button button-fill" href="${esc(project.liveUrl)}" target="_blank" rel="noreferrer">OPEN LIVE PROJECT ↗</a>` : ''}</section></div>`;
  }

  function render(project, nextProject) {
    setMeta(project);
    const blocks = Array.isArray(project.projectBlocks) ? project.projectBlocks.filter(block => block.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder) : [];
    root.innerHTML = `<article class="project-detail"><a class="article-back" href="/${demoPreview?'?demo=1#work':'#work'}">← BACK TO WORK</a><div class="project-detail-kicker">${esc(project.category || 'PROJECT')} / ${esc(project.type || 'CASE STUDY')} / ${esc(project.year || '')}</div><h1>${esc(project.title)}</h1>${project.projectSubtitle ? `<p class="project-detail-subtitle">${esc(project.projectSubtitle)}</p>` : ''}${project.client ? `<p class="project-detail-client">${esc(project.client)}${project.role ? ` · ${esc(project.role)}` : ''}</p>` : ''}${image(project.coverImage, project.title, 'project-detail-hero')}${blocks.length ? `<div class="case-blocks">${blocks.map(renderBlock).join('')}</div>` : `${renderGallery(project.gallery, project.title)}${renderLegacy(project)}`}${nextProject ? `<a class="next-project" href="/work/${encodeURIComponent(nextProject.slug)}${demoPreview?'?demo=1':''}"><span>NEXT PROJECT</span><strong>${esc(nextProject.title)} →</strong>${image(nextProject.coverImage, '')}</a>` : ''}</article>`;
  }

  async function load() {
    try {
      const response = await fetch(`/api/public/projects/${encodeURIComponent(slug)}`, { cache: 'no-store' });
      let nextProject = null;
      if (response.ok) {
        const data = await response.json();
        project = data.project;
        nextProject = data.nextProject;
      } else {
        const listing = await fetch('/api/public/projects', { cache: 'no-store' });
        const data = listing.ok ? await listing.json() : {};
        if (data.demoEnabled || demoPreview) project = demoProject(slug);
      }
      if (!project) throw new Error('Project not found');
      render(project, nextProject);
      window.portfolioAnalytics?.setProject(project.id);
      window.portfolioAnalytics?.track('project_view',{projectId:project.id,sourceContext:'project'});
    } catch {
      root.innerHTML = '<div class="project-detail-error"><span class="kicker">PROJECT</span><h1>Project unavailable.</h1><p class="notice">This project may be unpublished, private, or the link may be incorrect.</p><a class="button button-fill" href="/#work">BACK TO WORK</a></div>';
    }
  }

  applyPageExperience().then(load);
})();
