(()=>{[['/theme-runtime.js?v=20261016-1','themeRuntime'],['/anchor-runtime.js?v=20261016-1','anchorRuntime']].forEach(([src,key])=>{if(document.querySelector(`script[data-${key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}]`))return;const script=document.createElement('script');script.src=src;script.defer=true;script.dataset[key]='true';document.head.appendChild(script)})})();
(() => {
  const isBuilder = location.pathname.endsWith('/admin.html') || location.pathname.includes('page-studio');
  if (!isBuilder) {
    const runtime = document.createElement('script');
    runtime.src = '/production-navigation.js';
    runtime.defer = true;
    document.head.appendChild(runtime);
  }
  if (!document.querySelector('script[data-brand-assets-runtime]')) {
    const brandAssets = document.createElement('script');
    brandAssets.src = '/brand-assets.js?v=20261022-1';
    brandAssets.defer = true;
    brandAssets.dataset.brandAssetsRuntime = 'true';
    document.head.appendChild(brandAssets);
  }

  const main = document.querySelector('main') || document.querySelector('#cms');
  if (main && !main.id) main.id = 'main-content';
  if (main && !document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = `#${main.id}`;
    skip.textContent = 'Skip to main content';
    document.body.prepend(skip);
  }

  const button = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const header = document.querySelector('.header');
  let returnFocus = null;

  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const focusables = () => menu
    ? [...menu.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')]
    : [];

  function setMenu(open, options = {}) {
    if (!menu || !button) return;
    const restoreFocus = options.restoreFocus !== false;
    if (open) {
      returnFocus = document.activeElement;
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('menu-open');
      main?.setAttribute('inert', '');
      requestAnimationFrame(() => focusables()[0]?.focus({ preventScroll: true }));
      return;
    }

    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
    main?.removeAttribute('inert');
    if (restoreFocus && returnFocus && returnFocus !== document.body) {
      returnFocus.focus?.({ preventScroll: true });
    }
    returnFocus = null;
  }

  function samePageTarget(link) {
    if (!link?.hash || link.hash === '#') return null;
    let url;
    try { url = new URL(link.href, location.href); } catch { return null; }
    const currentPath = location.pathname.replace(/\/$/, '') || '/';
    const linkPath = url.pathname.replace(/\/$/, '') || '/';
    if (url.origin !== location.origin || linkPath !== currentPath) return null;
    const id = decodeURIComponent(url.hash.slice(1));
    return document.getElementById(id) || (id === 'top' ? document.body : null);
  }

  function scrollToTarget(target, hash, updateHistory = true) {
    if (!target) return;
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const demoOffset = document.body.classList.contains('demo-preview-active')
      ? (document.querySelector('.demo-preview-banner')?.getBoundingClientRect().height || 0)
      : 0;
    const top = target === document.body
      ? 0
      : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - demoOffset - 12);
    const behavior = reduceMotion() || matchMedia('(max-width: 800px)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top, behavior });
    if (updateHistory && hash && location.hash !== hash) history.pushState(null, '', hash);
  }

  button?.addEventListener('click', () => setMenu(!menu?.classList.contains('open')));

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const target = samePageTarget(link);
    if (!target) {
      if (menu?.classList.contains('open') && menu.contains(link)) setMenu(false, { restoreFocus: false });
      return;
    }
    event.preventDefault();
    const hash = new URL(link.href, location.href).hash;
    if (menu?.classList.contains('open')) setMenu(false, { restoreFocus: false });
    requestAnimationFrame(() => scrollToTarget(target, hash));
  });

  document.addEventListener('keydown', event => {
    if (!menu?.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  });

  addEventListener('resize', () => {
    if (innerWidth > 800 && menu?.classList.contains('open')) setMenu(false, { restoreFocus: false });
  }, { passive: true });

  addEventListener('load', () => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) requestAnimationFrame(() => scrollToTarget(target, location.hash, false));
  }, { once: true });
})();

window.addEventListener('error', event => {
  if (location.pathname.endsWith('/admin.html')) return;
  fetch('/api/public/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: event.message || 'Public JavaScript error', source: 'PUBLIC_JS', path: location.pathname }),
    keepalive: true
  }).catch(() => {});
});

window.addEventListener('unhandledrejection', event => {
  if (location.pathname.endsWith('/admin.html')) return;
  fetch('/api/public/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: String(event.reason?.message || event.reason || 'Unhandled rejection'), source: 'PUBLIC_JS', path: location.pathname }),
    keepalive: true
  }).catch(() => {});
});

if (!document.body.classList.contains('admin-page') && !document.querySelector('script[data-motion-runtime]')) {
  const motion = document.createElement('script');
  motion.src = '/motion-icons.js';
  motion.defer = true;
  motion.dataset.motionRuntime = 'true';
  document.head.appendChild(motion);
}
