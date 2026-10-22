(() => {
  const root = document.body;
  if (!root) return;

  const openExternal = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${label} ↗</a>`;
  const code = value => `<code>${value}</code>`;
  const guides = {
    discovery: {
      eyebrow: 'SEO / AI DISCOVERY',
      title: 'Make the site discoverable.',
      intro: 'Use these steps for technical discovery. They help search engines understand public pages; they cannot guarantee rankings, indexing, AI answers, or citations.',
      sections: [
        { title: '1. Foundation first', body: `<ol><li>Open <strong>SEO & Visibility → Global</strong>. Save an accurate site name, production origin, title template, description, social profiles, and verification token.</li><li>Keep public project and journal pages indexable, with a descriptive title, summary, cover image, and factual body copy.</li><li>Open <strong>Indexing</strong> and confirm that sitemap and robots links open successfully.</li></ol>` },
        { title: '2. Google Search Console', body: `<ol><li>Open ${openExternal('https://search.google.com/search-console', 'Google Search Console')} and add this deployed site as a URL-prefix property.</li><li>Choose HTML-tag verification. Copy only the token value into <strong>SEO & Visibility → Global → Google verification token</strong>, save, then verify in Google.</li><li>Submit the sitemap URL shown in this CMS under <strong>SEO & Visibility → Indexing</strong>.</li><li>For in-CMS search reporting, add the four optional Search Console credentials in Vercel. Do not paste any credential in this CMS.</li></ol><p class="setup-guide-note">Google data is normally delayed. A sitemap helps discovery but does not guarantee indexing.</p>` },
        { title: '3. IndexNow for Bing and partners', body: `<ol><li>Generate a long random secret and add it in Vercel as ${code('INDEXNOW_KEY')} for <strong>Production</strong>.</li><li>Redeploy the site, then open <code>https://your-domain/YOUR_KEY.txt</code>. It must display the exact key.</li><li>After that, publishing or materially updating an indexable project or journal entry automatically queues a notification.</li></ol><p class="setup-guide-note">IndexNow does not submit URLs to Google. Google uses the sitemap and normal crawling.</p>` },
        { title: '4. AI / GEO discovery', body: `<ol><li>Open <strong>Crawlers</strong> and keep Googlebot, Bingbot, and OAI-SearchBot enabled if you want those crawlers to access public content.</li><li>Write clear, factual project details: service, role, process, deliverables, outcome, and a real client/company only when permitted.</li><li>Use the Entity Profile for a consistent professional identity and verified social profiles.</li><li>Optionally enable ${code('LLMS_TXT_ENABLED=true')} in Vercel to expose <code>/llms.txt</code>. Treat it as a content map—not as a ranking tool.</li></ol>` },
        { title: 'Environment names only', body: `<div class="setup-guide-code">${code('INDEXNOW_KEY')}<br>${code('GOOGLE_SEARCH_CONSOLE_CLIENT_ID')}<br>${code('GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET')}<br>${code('GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN')}<br>${code('GOOGLE_SEARCH_CONSOLE_PROPERTY')}<br>${code('LLMS_TXT_ENABLED=true')}</div><p class="setup-guide-note">Add these in Vercel → Project → Settings → Environment Variables. Secrets stay there; they are never entered into the CMS.</p>` }
      ]
    },
    email: {
      eyebrow: 'EMAIL DELIVERY',
      title: 'Deliver inquiry notifications safely.',
      intro: 'The CMS always stores visitor inquiries. Email is an optional notification and reply channel powered by Resend.',
      sections: [
        { title: '1. Prepare a sender identity', body: `<ol><li>Create a free ${openExternal('https://resend.com', 'Resend account')}.</li><li>For reliable production sending, add and verify a domain in Resend. A sender such as <code>hello@yourdomain.com</code> is recommended.</li><li>Until you own a custom domain, keep the CMS inquiry storage active and use your personal address as the recipient. Do not claim that an unverified Gmail address can send as your site.</li></ol>` },
        { title: '2. Add the Vercel secrets', body: `<ol><li>In Resend, create an API key. Keep it private.</li><li>In Vercel → Project → Settings → Environment Variables, add the values below to <strong>Production</strong>. Add Preview too only if you want preview emails.</li><li>Redeploy after saving the variables.</li></ol><div class="setup-guide-code">${code('RESEND_API_KEY=re_...')}<br>${code('RESEND_FROM_EMAIL=hello@yourdomain.com')}<br>${code('RESEND_FROM_NAME=Mahmudul Hassan')}</div>` },
        { title: '3. Choose where enquiries arrive', body: `<ol><li>Return to CMS → Site Settings → Inquiry Email.</li><li>Enter the inbox where you want visitor enquiries delivered.</li><li>Set an optional subject using <code>{name}</code> and <code>{service}</code>, then save all site settings.</li><li>Use Operations → Health to confirm that Email provider changes from “Not configured” to “Healthy”.</li></ol>` },
        { title: '4. Test and reply', body: `<ol><li>Submit a real test enquiry from the public contact form.</li><li>Confirm it appears in CMS → Inquiries. That record remains available even if email delivery fails.</li><li>Use <strong>Reply via email</strong> from the inquiry record. The reply opens through the configured sender workflow; sender-domain verification is still required by the provider.</li></ol><p class="setup-guide-note">Never put Resend keys in the public site, in Page Studio code blocks, or in a Git commit.</p>` }
      ]
    }
  };

  function renderGuide(key) {
    const guide = guides[key];
    if (!guide) return;
    const existing = document.querySelector('#setupGuideDialog');
    existing?.remove();
    const dialog = document.createElement('section');
    dialog.id = 'setupGuideDialog';
    dialog.className = 'setup-guide-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'setupGuideTitle');
    dialog.innerHTML = `<div class="setup-guide-backdrop" data-close-setup-guide></div><div class="setup-guide-panel" role="document"><div class="setup-guide-head"><div><span class="kicker">${guide.eyebrow}</span><h2 id="setupGuideTitle">${guide.title}</h2><p>${guide.intro}</p></div><button class="admin-btn" type="button" data-close-setup-guide aria-label="Close setup guide">CLOSE</button></div><div class="setup-guide-body">${guide.sections.map(section => `<article><h3>${section.title}</h3>${section.body}</article>`).join('')}</div><div class="setup-guide-footer"><span>Secrets belong in Vercel environment variables, not in CMS fields.</span><button class="admin-btn primary" type="button" data-close-setup-guide>GOT IT</button></div></div>`;
    root.append(dialog);
    root.classList.add('setup-guide-open');
    dialog.querySelectorAll('[data-close-setup-guide]').forEach(button => button.addEventListener('click', () => {
      root.classList.remove('setup-guide-open');
      dialog.remove();
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.querySelector('#setupGuideDialog')) {
        root.classList.remove('setup-guide-open');
        document.querySelector('#setupGuideDialog')?.remove();
      }
    }, { once: true });
    dialog.querySelector('[data-close-setup-guide]')?.focus();
  }

  function button(key, label) {
    const result = document.createElement('button');
    result.type = 'button';
    result.className = 'admin-btn setup-guide-btn';
    result.dataset.setupGuide = key;
    result.textContent = label;
    result.addEventListener('click', () => renderGuide(key));
    return result;
  }

  function attach() {
    const seoOverview = document.querySelector('[data-seo-pane="overview"]');
    if (seoOverview && !seoOverview.querySelector('[data-setup-guide="discovery"]')) {
      const action = document.createElement('div');
      action.className = 'setup-guide-actions';
      action.append(button('discovery', 'OPEN DISCOVERY GUIDE'));
      seoOverview.querySelector('.notice')?.after(action);
    }
    const performance = document.querySelector('[data-seo-pane="performance"]');
    if (performance && !performance.querySelector('[data-setup-guide="discovery"]')) {
      const action = document.createElement('div');
      action.className = 'setup-guide-actions';
      action.append(button('discovery', 'SETUP GUIDE'));
      performance.querySelector('#searchConsoleState')?.after(action);
    }
    const indexing = document.querySelector('[data-seo-pane="indexing"]');
    if (indexing && !indexing.querySelector('[data-setup-guide="discovery"]')) {
      const action = document.createElement('div');
      action.className = 'setup-guide-actions';
      action.append(button('discovery', 'INDEXING & AI GUIDE'));
      indexing.querySelector('#indexingStatus')?.after(action);
    }
    const inquiryField = document.querySelector('#settingInquiryRecipientEmail');
    const inquiryCard = inquiryField?.closest('.settings-card');
    if (inquiryCard && !inquiryCard.querySelector('[data-setup-guide="email"]')) {
      const action = document.createElement('div');
      action.className = 'setup-guide-actions';
      action.append(button('email', 'EMAIL SETUP GUIDE'));
      inquiryCard.querySelector('.settings-card-head')?.append(action);
    }
  }

  attach();
  new MutationObserver(attach).observe(root, { childList: true, subtree: true });
})();
