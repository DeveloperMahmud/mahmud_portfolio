from pathlib import Path
import re
root=Path('/mnt/data/portfolio_upgrade')

# 1) Prisma schema + migrations
p=root/'prisma/schema.prisma'; s=p.read_text()
s=s.replace('  heroImage          String?\n  homepageOrder', '  heroImage          String?\n  typewriterConfig   Json     @default("{}")\n  homepageOrder')
if 'model ProjectReview' not in s:
    s += '''\n\nmodel ProjectReview {\n  id          String   @id @default(cuid())\n  projectId   String\n  clientName  String\n  clientEmail String?\n  decision    String   @default("CHANGES_REQUESTED")\n  comment     String?\n  createdAt   DateTime @default(now())\n\n  @@index([projectId, createdAt])\n}\n'''
p.write_text(s)

m10=root/'prisma/migrations/0010_hero_image/migration.sql'; m10.parent.mkdir(parents=True,exist_ok=True)
if not m10.exists(): m10.write_text('ALTER TABLE "SiteSettings" ADD COLUMN "heroImage" TEXT;\n')
m12=root/'prisma/migrations/0012_client_reviews/migration.sql'; m12.parent.mkdir(parents=True,exist_ok=True)
if not m12.exists(): m12.write_text('''CREATE TABLE "ProjectReview" (\n  "id" TEXT NOT NULL,\n  "projectId" TEXT NOT NULL,\n  "clientName" TEXT NOT NULL,\n  "clientEmail" TEXT,\n  "decision" TEXT NOT NULL DEFAULT 'CHANGES_REQUESTED',\n  "comment" TEXT,\n  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n  CONSTRAINT "ProjectReview_pkey" PRIMARY KEY ("id")\n);\nCREATE INDEX "ProjectReview_projectId_createdAt_idx" ON "ProjectReview"("projectId", "createdAt");\n''')

# 2) Public review route
p=root/'src/routes/public.ts'; s=p.read_text()
insert='''\nrouter.post('/share/:token/review', async (req, res) => {\n  const tokenHash = hashShareToken(req.params.token);\n  const project = await db.project.findFirst({ where: { accessTokenHash: tokenHash, status: 'PUBLISHED', visibility: { in: ['UNLISTED', 'PRIVATE'] } } });\n  if (!project || (project.clientExpiresAt && project.clientExpiresAt < new Date())) return res.status(404).json({ error: 'Share link is invalid or expired' });\n  const parsed = z.object({ clientName: z.string().min(1).max(120), clientEmail: z.string().email().optional().nullable(), decision: z.enum(['APPROVED','CHANGES_REQUESTED']), comment: z.string().max(3000).optional().nullable() }).safeParse(req.body);\n  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });\n  const review = await db.projectReview.create({ data: { projectId: project.id, ...parsed.data } });\n  await db.activityLog.create({ data: { action: parsed.data.decision === 'APPROVED' ? 'CLIENT_APPROVED' : 'CLIENT_REQUESTED_CHANGES', entity: 'PROJECT_REVIEW', entityId: review.id, label: `${project.title} · ${parsed.data.clientName}` } });\n  res.status(201).json({ ok: true, review });\n});\n'''
if "share/:token/review" not in s:
    s=s.replace("router.get('/share/:token', async (req, res) => {", insert+"\nrouter.get('/share/:token', async (req, res) => {")
p.write_text(s)

# 3) Admin review endpoint
p=root/'src/routes/maintenance.ts'; s=p.read_text()
needle="router.get('/inquiries',async(_req,res)=>res.json({inquiries:await db.inquiry.findMany({orderBy:{createdAt:'desc'},take:100})}));"
if "'/reviews'" not in s:
    s=s.replace(needle, needle+"\nrouter.get('/reviews',async(_req,res)=>res.json({reviews:await db.projectReview.findMany({orderBy:{createdAt:'desc'},take:200})}));")
p.write_text(s)

# 4) App route for share page
p=root/'src/app.ts'; s=p.read_text()
if "app.get('/share/:token'" not in s:
    s=s.replace("app.use(express.static(frontend));", "app.get('/share/:token', (_req, res) => res.sendFile(path.join(frontend, 'share.html')));\napp.use(express.static(frontend));")
p.write_text(s)

# 5) Homepage HTML: preload, SEO, why work, fullscreen modal button, hero image attributes
p=root/'portfolio/index.html'; s=p.read_text()
s=s.replace('<link rel="stylesheet" href="styles.css">', '<link rel="preload" as="image" href="assets/home-hero-default.png" fetchpriority="high">\n<link rel="stylesheet" href="styles.css">\n<meta property="og:title" content="Mahmudul Hassan — Amazon A+ & E-commerce Creative Designer">\n<meta property="og:description" content="Premium Amazon A+, e-commerce creative, branding, web and motion design by Mahmudul Hassan.">\n<meta property="og:type" content="website">\n<meta property="og:image" content="assets/home-hero-default.png">\n<link rel="canonical" href="/">\n<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Mahmudul Hassan","jobTitle":"Creative Designer","description":"Amazon A+ and e-commerce creative designer specializing in visual communication, branding and digital design."}</script>')
s=s.replace('<img src="assets/home-hero-default.png" alt="Creative design studio workspace">','<img src="assets/home-hero-default.png" alt="Creative design studio workspace" fetchpriority="high" decoding="async">')
# Insert why-work section
marker='</section>\n\n<section class="testimonials-section section" id="testimonials">'
if 'id="why-work"' not in s:
    block='''</section>\n\n<section class="section why-work-section" id="why-work">\n  <div class="section-head reveal"><div><span class="kicker">05 / WHY WORK WITH ME</span><h2>Creative thinking.<br><em>Commercial clarity.</em></h2></div><p>Design that looks considered, communicates quickly and stays structured from first draft to final delivery.</p></div>\n  <div class="why-work-grid">\n    <article class="why-work-card reveal"><span>01</span><h3>CREATIVE THINKING</h3><p>Visual storytelling built around hierarchy, clarity and a strong point of view.</p></article>\n    <article class="why-work-card reveal"><span>02</span><h3>TECHNICAL PRECISION</h3><p>A structured, detail-driven workflow that keeps complex work accurate and consistent.</p></article>\n    <article class="why-work-card reveal"><span>03</span><h3>E-COMMERCE FOCUS</h3><p>Product visuals designed to communicate benefits fast and support better buying decisions.</p></article>\n  </div>\n</section>\n\n<section class="testimonials-section section" id="testimonials">'''
    s=s.replace(marker,block)
# nav add why? keep concise
s=s.replace('<a href="#about">ABOUT</a><a href="#testimonials">CLIENTS</a>', '<a href="#about">ABOUT</a><a href="#why-work">WHY ME</a><a href="#testimonials">CLIENTS</a>')
# modal fullscreen button
s=s.replace('<button class="modal-close" id="close" aria-label="Close">×</button>', '<div class="modal-actions"><button class="modal-fullscreen" id="modalFullscreen" type="button">FULLSCREEN ↗</button><button class="modal-close" id="close" aria-label="Close">×</button></div>')
# contact CTA stronger
s=s.replace('SEND PROJECT INQUIRY ↗','START A PROJECT ↗')
p.write_text(s)

# 6) App.js: add fullscreen, richer testimonial, better case study markup, dynamic SEO
p=root/'portfolio/app.js'; s=p.read_text()
old="modalContent.innerHTML=`<div class=\"modal-meta\">${escapeHtml(p.cat.toUpperCase())} / ${escapeHtml(p.type)} / ${escapeHtml(p.year)}</div><h2>${escapeHtml(p.title)}</h2><img class=\"modal-hero\" src=\"${escapeHtml(p.img)}\" alt=\"${escapeHtml(p.title)}\">${galleryHtml}<div class=\"modal-body\"><div class=\"modal-block\"><h3>OVERVIEW</h3><p>${escapeHtml(p.desc)}</p></div><div class=\"modal-block\"><h3>CHALLENGE</h3><p>${escapeHtml(p.challenge)}</p></div><div class=\"modal-block\"><h3>APPROACH</h3><p>${escapeHtml(p.approach)}</p></div><div class=\"modal-block\"><h3>PROCESS</h3><p>${escapeHtml(p.process||'Discovery → direction → design → final delivery')}</p></div><div class=\"modal-block modal-deliverables\"><h3>DELIVERABLES</h3><p>${escapeHtml(p.deliverables)}${p.tools?`<br><br><strong>TOOLS</strong> · ${escapeHtml(p.tools)}`:''}</p>${p.liveUrl?`<a class=\"modal-live\" href=\"${escapeHtml(p.liveUrl)}\" target=\"_blank\" rel=\"noreferrer\">OPEN LIVE PROJECT ↗</a>`:''}</div></div>`;"
new="modalContent.innerHTML=`<div class=\"modal-meta\">${escapeHtml(p.cat.toUpperCase())} / ${escapeHtml(p.type)} / ${escapeHtml(p.year)}${p.client?` / ${escapeHtml(p.client)}`:''}</div><h2>${escapeHtml(p.title)}</h2><img class=\"modal-hero\" src=\"${escapeHtml(p.img)}\" alt=\"${escapeHtml(p.title)}\" decoding=\"async\">${galleryHtml}<div class=\"modal-body\"><div class=\"modal-block\"><h3>OVERVIEW</h3><p>${escapeHtml(p.desc||'Project overview available on request.')}</p></div><div class=\"modal-block\"><h3>CHALLENGE</h3><p>${escapeHtml(p.challenge||'Defined the communication problem, audience and visual priorities.')}</p></div><div class=\"modal-block\"><h3>APPROACH</h3><p>${escapeHtml(p.approach||'Built a focused visual system around hierarchy, clarity and consistency.')}</p></div><div class=\"modal-block\"><h3>PROCESS</h3><p>${escapeHtml(p.process||'Discovery → direction → design → final delivery')}</p></div><div class=\"modal-block modal-deliverables\"><h3>DELIVERABLES</h3><p>${escapeHtml(p.deliverables||'Visual design · Creative direction · Final assets')}${p.tools?`<br><br><strong>TOOLS</strong> · ${escapeHtml(p.tools)}`:''}</p>${p.liveUrl?`<a class=\"modal-live\" href=\"${escapeHtml(p.liveUrl)}\" target=\"_blank\" rel=\"noreferrer\">OPEN LIVE PROJECT ↗</a>`:''}</div></div>`;"
if old not in s:
    raise SystemExit('openProject markup not found')
s=s.replace(old,new)
# fullscreen handler after close handler
needle="$('#close').onclick=closeModal;modal.onclick=e=>{if(e.target===modal)closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});"
replacement="$('#close').onclick=closeModal;modal.onclick=e=>{if(e.target===modal)closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});\n$('#modalFullscreen')?.addEventListener('click',async()=>{const target=modalContent.querySelector('.modal-panel')||modalContent;try{if(document.fullscreenElement)await document.exitFullscreen();else await target.requestFullscreen?.()}catch{}});"
s=s.replace(needle,replacement)
# richer testimonials
old="root.innerHTML=(d.testimonials||[]).map(x=>`<article class=\"testimonial-card reveal\"><blockquote>“${escapeHtml(x.quote)}”</blockquote><small>${escapeHtml(x.client)}${x.company?' · '+escapeHtml(x.company):''}${x.role?' · '+escapeHtml(x.role):''}</small></article>`).join('')"
new="root.innerHTML=(d.testimonials||[]).map(x=>`<article class=\"testimonial-card reveal\">${x.photo?`<img src=\"${escapeHtml(x.photo)}\" alt=\"${escapeHtml(x.client)}\" loading=\"lazy\">`:''}<blockquote>“${escapeHtml(x.quote)}”</blockquote><small>${escapeHtml(x.client)}${x.company?' · '+escapeHtml(x.company):''}${x.role?' · '+escapeHtml(x.role):''}</small></article>`).join('')"
s=s.replace(old,new)
# dynamic seo from settings
old="if(x.siteName)document.title=x.siteName+' — '+(x.title||'Creative Designer')"
new="if(x.siteName){document.title=x.metaTitle||x.siteName+' — '+(x.title||'Creative Designer');const md=document.querySelector('meta[name=description]');if(md&&x.metaDescription)md.setAttribute('content',x.metaDescription);const og=document.querySelector('meta[property=og:image]');if(og&&x.ogImage)og.setAttribute('content',x.ogImage)}"
s=s.replace(old,new)
p.write_text(s)

# 7) CSS polish
p=root/'portfolio/styles.css'; s=p.read_text()
s=s.replace('.project-image{width:100%;aspect-ratio:1.45;object-fit:cover;display:block;transition:', '.project-image{width:100%;aspect-ratio:1.45;object-fit:cover;display:block;transition:')
# Append clean additions
s += '''\n\n/* V9 premium conversion + mobile polish */\n.modal-actions{position:sticky;top:10px;z-index:8;display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px}.modal-actions button{border:1px solid var(--line);background:rgba(9,10,9,.78);color:var(--text);padding:10px 12px;font-size:8px;letter-spacing:.12em;cursor:pointer}.modal-actions .modal-fullscreen:hover,.modal-actions .modal-close:hover{background:var(--lime);border-color:var(--lime);color:#090a09}.modal-close{position:static;float:none!important;font-size:20px!important;line-height:1}.why-work-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.why-work-card{border:1px solid var(--line);padding:28px;min-height:240px;background:rgba(13,15,14,.72);display:flex;flex-direction:column;justify-content:space-between}.why-work-card>span{font-size:8px;color:var(--lime);letter-spacing:.15em}.why-work-card h3{font:700 24px/1 'Space Grotesk';letter-spacing:-.03em;margin:35px 0 10px}.why-work-card p{font-size:12px;line-height:1.65;color:var(--muted);max-width:360px}.testimonial-card{position:relative}.testimonial-card img{width:44px;height:44px;border-radius:50%;object-fit:cover;margin-bottom:16px;display:block}.modal-panel:fullscreen{background:#090a09;padding:3vh 5vw;overflow:auto}.modal-panel:fullscreen .modal-hero{max-height:72vh}.project-image,.featured-slide-media img,.gallery-slide img,.blog-media img,.article-cover{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important}.hero-visual img{filter:none!important;-webkit-filter:none!important;mix-blend-mode:normal!important}.portrait-shade{background:transparent!important}.portrait-frame:after{display:none!important}\n@media(max-width:800px){.why-work-grid{grid-template-columns:1fr}.why-work-card{min-height:190px;padding:22px}.why-work-card h3{font-size:21px;margin:25px 0 8px}.modal-actions{top:4px}.modal-panel:fullscreen{padding:2vh 4vw}.project-card{border-color:rgba(255,255,255,.06)}.hero-visual img{transform:none!important}.contact-link{font-size:15px}}\n'''
p.write_text(s)

# 8) Share page
share_html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private Project Review — Mahmudul Hassan</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="styles.css"></head><body><div class="grain"></div><main class="share-page"><div class="share-top"><a class="brand" href="/"><span class="brand-mark">MH</span><span class="brand-copy"><strong>MAHMUDUL HASSAN</strong><small>PRIVATE PROJECT REVIEW</small></span></a><span class="share-badge">CLIENT ACCESS</span></div><div id="shareRoot" class="share-root"><p class="notice">Loading private project…</p></div></main><script src="share.js"></script></body></html>'''
(root/'portfolio/share.html').write_text(share_html)
share_js='''const root=document.querySelector('#shareRoot');const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));const token=location.pathname.split('/').filter(Boolean).pop();\nasync function load(){try{const r=await fetch('/api/public/share/'+encodeURIComponent(token),{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error||'This private link is invalid or expired.');const p=d.project;const g=Array.isArray(p.gallery)?p.gallery:[];root.innerHTML=`<div class="share-meta">${esc(p.category)} / ${esc(p.type||'PROJECT')} / ${esc(p.year||'')}</div><h1>${esc(p.title)}</h1>${p.client?`<p class="share-client">Prepared for ${esc(p.client)}</p>`:''}<img class="share-hero" src="${esc(p.coverImage||'')}" alt="${esc(p.title)}" decoding="async">${g.length?`<div class="share-gallery">${g.map(x=>`<img src="${esc(x.url||x)}" alt="${esc(x.alt||p.title)}" loading="lazy">`).join('')}</div>`:''}<div class="share-copy"><div><h2>PROJECT OVERVIEW</h2><p>${esc(p.description||'')}</p></div><div><h2>APPROACH</h2><p>${esc(p.approach||'')}</p></div></div><section class="review-box"><span class="kicker">CLIENT REVIEW</span><h2>Ready to review?</h2><p>Approve the current direction or send a change request with your notes.</p><form id="reviewForm"><label>NAME<input name="clientName" required></label><label>EMAIL<input name="clientEmail" type="email"></label><label>DECISION<select name="decision"><option value="APPROVED">APPROVE PROJECT</option><option value="CHANGES_REQUESTED">REQUEST CHANGES</option></select></label><label>COMMENTS<textarea name="comment" placeholder="Optional feedback or change notes"></textarea></label><button class="button button-fill" type="submit">SUBMIT REVIEW ↗</button><span id="reviewMsg" class="notice"></span></form></section>`;document.querySelector('#reviewForm').onsubmit=submit}catch(e){root.innerHTML=`<div class="share-error"><h1>Private link unavailable.</h1><p>${esc(e.message)}</p></div>`}}\nasync function submit(e){e.preventDefault();const f=e.currentTarget,msg=document.querySelector('#reviewMsg');const body=Object.fromEntries(new FormData(f).entries());try{const r=await fetch('/api/public/share/'+encodeURIComponent(token)+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not submit review');msg.textContent='Review received. Thank you.';f.reset()}catch(err){msg.textContent=err.message}}\nload();'''
(root/'portfolio/share.js').write_text(share_js)
# share CSS
p=root/'portfolio/styles.css'; s=p.read_text(); s += '''\n.share-page{min-height:100vh;padding:36px 6vw 80px;max-width:1250px;margin:auto}.share-top{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:22px}.share-badge{font-size:8px;letter-spacing:.14em;color:var(--lime)}.share-root{padding:70px 0}.share-meta{font-size:8px;color:var(--lime);letter-spacing:.14em}.share-root h1{font:700 clamp(48px,8vw,110px)/.86 'Space Grotesk';letter-spacing:-.07em;margin:22px 0}.share-client{color:var(--muted)}.share-hero{width:100%;max-height:70vh;object-fit:contain;background:#111;margin:35px 0}.share-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.share-gallery img{width:100%;display:block;background:#111}.share-copy{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin:65px 0}.share-copy h2,.review-box h2{font:700 30px/1 'Space Grotesk';margin:0 0 12px}.share-copy p,.review-box>p{color:var(--muted);line-height:1.7}.review-box{border-top:1px solid var(--line);padding-top:35px;max-width:800px}.review-box form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:25px}.review-box label{font-size:8px;letter-spacing:.12em}.review-box input,.review-box select,.review-box textarea{display:block;width:100%;margin-top:7px;background:#0d0f0e;color:var(--text);border:1px solid var(--line);padding:13px;font:inherit}.review-box textarea{min-height:130px;resize:vertical;grid-column:1/-1}.review-box button{border:0;cursor:pointer}.review-box .notice{grid-column:1/-1}.share-error{border:1px solid var(--line);padding:40px}.share-error p{color:var(--muted)}@media(max-width:800px){.share-page{padding:25px 6vw 60px}.share-top{align-items:flex-start}.share-gallery,.share-copy,.review-box form{grid-template-columns:1fr}.review-box textarea{grid-column:auto}.share-root{padding:45px 0}}\n'''; p.write_text(s)

# 9) Admin maintenance show review list and small UX; add tab
p=root/'portfolio/admin.html'; s=p.read_text()
if 'data-maintenance-tab="reviews"' not in s:
    s=s.replace('<button type="button" class="maintenance-subtab" data-maintenance-tab="inquiries">INQUIRIES</button>', '<button type="button" class="maintenance-subtab" data-maintenance-tab="inquiries">INQUIRIES</button><button type="button" class="maintenance-subtab" data-maintenance-tab="reviews">REVIEWS</button>')
    s=s.replace('<div id="maintenanceOverview"', '<div id="maintenanceReviews" class="maintenance-panel hidden"><section class="panel"><div class="panel-heading-row"><div><span class="kicker">CLIENT REVIEW</span><h2>Project approvals.</h2><p class="notice">Review decisions submitted from secure client share links.</p></div></div><div id="reviewList" class="project-admin"></div></section></div>\n<div id="maintenanceOverview"')
p.write_text(s)

# 10) Admin JS: load reviews, switch panel supports reviews
p=root/'portfolio/admin.js'; s=p.read_text()
s=s.replace("api('/admin/maintenance/activity'),api('/admin/maintenance/inquiries')", "api('/admin/maintenance/activity'),api('/admin/maintenance/inquiries'),api('/admin/maintenance/reviews')")
s=s.replace("const x=settings.settings||{};", "const x=settings.settings||{};const reviewsData=arguments[0];") if False else s
# replace destructuring manually
old="const [st,settings,t,a,iq]=await Promise.all([api('/admin/maintenance/status'),api('/admin/maintenance/settings'),api('/admin/maintenance/testimonials'),api('/admin/maintenance/activity'),api('/admin/maintenance/inquiries')]);"
new="const [st,settings,t,a,iq,rv]=await Promise.all([api('/admin/maintenance/status'),api('/admin/maintenance/settings'),api('/admin/maintenance/testimonials'),api('/admin/maintenance/activity'),api('/admin/maintenance/inquiries'),api('/admin/maintenance/reviews')]);"
s=s.replace(old,new)
needle="$('#activityList').innerHTML=(a.activity||[]).map(x=>`<div class=\"project-item\"><div><strong>${esc(x.action)}</strong><small>${esc(x.entity)} · ${esc(x.label||'')} · ${new Date(x.createdAt).toLocaleString()}</small></div></div>`).join('')||'<p class=\"notice\">No activity yet.</p>'"
replacement=needle+";$('#reviewList').innerHTML=(rv.reviews||[]).map(x=>`<div class=\"project-item\"><div><strong>${esc(x.decision)}</strong><small>${esc(x.clientName)}${x.clientEmail?' · '+esc(x.clientEmail):''} · ${new Date(x.createdAt).toLocaleString()}<br>${esc(x.comment||'No comment')}</small></div></div>`).join('')||'<p class=\"notice\">No client reviews yet.</p>'"
s=s.replace(needle,replacement)
# tab list include reviews
s=s.replace("['projects','brands','content','imports','maintenance']", "['projects','brands','content','imports','maintenance']")
# switch function likely has hardcoded panels; inspect and replace if needed
if "maintenanceReviews" in s and "case 'reviews'" not in s:
    # generic toggle function from source
    s=s.replace("['overview','slider','skills','site','testimonials','activity','inquiries']", "['overview','slider','skills','site','testimonials','activity','inquiries','reviews']")
p.write_text(s)

# 11) README marker
(root/'V9-UPGRADE.md').write_text('''# V9 upgrade\n\nIncludes: premium case-study modal + fullscreen viewer, natural image protection, dynamic SEO metadata, why-work conversion section, mobile polish, private client review/approval page, review logging in admin, and repaired SiteSettings hero/typewriter schema alignment.\n''')

print('upgrade complete')
