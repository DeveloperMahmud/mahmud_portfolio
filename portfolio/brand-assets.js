(() => {
  'use strict';
  const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const safeUrl = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try { const url = new URL(raw, location.origin); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  };
  const setIcon = (rel, href) => {
    if (!href) return;
    let link = document.head.querySelector(`link[rel="${rel}"]`);
    if (!link) { link = document.createElement('link'); link.rel = rel; document.head.append(link); }
    link.href = href;
  };
  const setLogo = (href, alt) => {
    document.querySelectorAll('.brand-mark').forEach(mark => {
      if (!mark.dataset.brandFallback) mark.dataset.brandFallback = mark.textContent.trim() || 'MH';
      if (!href) { mark.classList.remove('has-brand-logo'); return; }
      const image = document.createElement('img');
      image.className = 'brand-logo-image'; image.src = href; image.alt = alt || 'Site logo'; image.decoding = 'async';
      image.addEventListener('error', () => { mark.classList.remove('has-brand-logo'); mark.replaceChildren(document.createTextNode(mark.dataset.brandFallback || 'MH')); }, { once: true });
      mark.classList.add('has-brand-logo'); mark.replaceChildren(image);
    });
  };
  const apply = settings => {
    const assets = asObject(asObject(settings.themeConfig).brandAssets);
    const logo = safeUrl(assets.logoUrl), favicon = safeUrl(assets.faviconUrl), apple = safeUrl(assets.appleTouchIconUrl);
    setLogo(logo, String(assets.logoAlt || settings.siteName || 'Site logo').trim());
    setIcon('icon', favicon || logo); setIcon('apple-touch-icon', apple || favicon || logo);
  };
  fetch('/api/public/settings', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(payload => payload?.settings && apply(payload.settings)).catch(() => {});
})();
