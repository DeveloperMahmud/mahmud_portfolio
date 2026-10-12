document.body.classList.add('home-custom-cursor');
// Hero typewriter — CMS controlled, repeats only while the headline is visible.
(function initHeroTypewriter(){
  const el=document.querySelector('[data-typewriter]');
  const caret=document.querySelector('.type-caret');
  if(!el) return;
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let config={enabled:true,phrases:[],typeSpeed:42,typeRandom:35,pause:2400,eraseSpeed:25,nextDelay:650,startDelay:220,loop:true};
  let timer=null,active=false,cycle=0,observer=null;
  const fallback=()=>{
    const raw=el.getAttribute('data-texts') || el.getAttribute('data-text') || el.textContent.trim();
    return raw.split(/\|\||\n/).map(x=>x.trim()).filter(Boolean);
  };
  const clear=()=>{if(timer){clearTimeout(timer);timer=null;}};
  const phrases=()=>Array.isArray(config.phrases)&&config.phrases.length?config.phrases.filter(Boolean):fallback();
  const renderStatic=()=>{const list=phrases();el.textContent=list[0]||'';};
  const restart=()=>{if(!active)return;cycle++;clear();el.textContent='';typeLoop();};
  const typeLoop=()=>{
    if(!active||!config.enabled)return;
    const list=phrases(); if(!list.length)return;
    const myCycle=++cycle;
    let phraseIndex=0;
    const runPhrase=()=>{
      if(!active||myCycle!==cycle)return;
      const text=list[phraseIndex%list.length]; let i=0;
      const type=()=>{
        if(!active||myCycle!==cycle)return;
        el.textContent=text.slice(0,i++);
        if(i<=text.length) timer=setTimeout(type,config.typeSpeed+Math.random()*config.typeRandom);
        else if(config.loop || phraseIndex<list.length-1) timer=setTimeout(erase,config.pause);
      };
      const erase=()=>{
        if(!active||myCycle!==cycle)return;
        let n=text.length;
        const back=()=>{
          if(!active||myCycle!==cycle)return;
          el.textContent=text.slice(0,Math.max(0,--n));
          if(n>0) timer=setTimeout(back,config.eraseSpeed);
          else { phraseIndex++; if(config.loop || phraseIndex<list.length) timer=setTimeout(runPhrase,config.nextDelay); else el.textContent=text; }
        };
        back();
      };
      timer=setTimeout(type,config.startDelay);
    };
    clear(); runPhrase();
  };
  window.setHeroTypewriterConfig=(incoming={})=>{
    config={...config,...incoming,phrases:Array.isArray(incoming.phrases)?incoming.phrases.map(x=>String(x).trim()).filter(Boolean):config.phrases};
    if(reduce||!config.enabled){active=false;cycle++;clear();renderStatic();return;}
    if(observer){restart();}
  };
  if(reduce){renderStatic();return;}
  // Observe the stable hero container, not the changing text node.
  // The phrase itself changes size while typing; observing it can falsely report
  // it as out of view and clear the headline for a moment.
  const visibilityTarget=el.closest('.hero-copy') || el.parentElement || el;
  observer=new IntersectionObserver(entries=>{
    const visible=entries.some(e=>e.isIntersecting);
    if(visible&&!active){active=true;typeLoop();}
    if(!visible&&active){
      active=false;
      cycle++;
      clear();
      // Keep the last rendered phrase visible while the hero is off-screen.
      if(caret)caret.classList.remove('settled');
    }
  },{threshold:.1});
  observer.observe(visibilityTarget);
})();

// Global ambient background motion — subtle, site-wide, scroll + pointer responsive.
(function initAmbientMotion(){
  const bg=document.querySelector('.ambient-bg'); if(!bg) return;
  const grid=bg.querySelector('.ambient-grid'), a=bg.querySelector('.orb-a'), b=bg.querySelector('.orb-b');
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  let mx=0,my=0,scrollY=0,raf=0;
  window.addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5);},{passive:true});
  window.addEventListener('scroll',()=>{scrollY=window.scrollY||0;},{passive:true});
  const tick=()=>{
    const sy=Math.min(scrollY/1600,1);
    if(grid) grid.style.transform=`perspective(900px) rotateX(58deg) translateY(calc(18% + ${sy*7}%)) translateX(${mx*-70 + sy*-45}px)`;
    if(a) a.style.transform=`translate3d(${mx*-2.8}vw,${my*-2.8 + sy*2}vh,0) scale(${1.02+sy*.04})`;
    if(b) b.style.transform=`translate3d(${mx*2.5}vw,${my*2.2 - sy*2}vh,0) scale(${.98+sy*.02})`;
    raf=requestAnimationFrame(tick);
  };
  tick();
})();

const labels={all:'ALL',amazon:'AMAZON',branding:'BRANDING',web:'WEB',motion:'MOTION',engineering:'ENGINEERING','a-plus':'A+ CONTENT','brand-story':'BRAND STORY',storefront:'STOREFRONT',listing:'LISTING IMAGES','product-visuals':'PRODUCT VISUALS'};
let projects=[],brands=[];

// DEMO CONTENT — intentionally local so the portfolio can be previewed before the CMS has real projects.
// Remove this block later when real portfolio content is ready; it does not touch the database.
const demoProjects=[
  {id:'demo-aplus',slug:'demo-premium-a-plus',title:'Premium A+ — Outdoor Hydration',cat:'amazon',service:'a-plus',type:'PREMIUM A+',year:'DEMO',img:'assets/demo-a-plus.svg',desc:'A premium A+ concept showing product storytelling, benefit hierarchy and visual modules.',challenge:'Turn technical product benefits into a fast-scanning visual story.',approach:'Built a bold modular system with hero storytelling, feature callouts and comparison logic.',process:'Content audit → story map → art direction → module system',deliverables:'Premium A+ · Feature Modules · Comparison Chart',tools:'Photoshop · Illustrator · Figma',featured:true,visibility:'public',demo:true,gallery:['assets/demo-a-plus.svg','assets/demo-listing.svg','assets/demo-brand.svg']},
  {id:'demo-listing',slug:'demo-amazon-listing',title:'Amazon Listing — Smart Kitchen Tool',cat:'amazon',service:'listing',type:'LISTING IMAGES',year:'DEMO',img:'assets/demo-listing.svg',desc:'A complete listing-image sequence built around clarity, product benefits and use cases.',challenge:'Communicate purchase reasons within a compact image sequence.',approach:'Combined clean product framing, feature graphics and lifestyle storytelling.',process:'Product audit → image sequence → infographic system → final QA',deliverables:'Main Image · Secondary Images · Infographics · Lifestyle',tools:'Photoshop · Illustrator',featured:true,visibility:'public',demo:true,gallery:['assets/demo-listing.svg','assets/demo-a-plus.svg','assets/demo-pack.svg']},
  {id:'demo-brand',slug:'demo-brand-identity',title:'Brand Identity — Northline',cat:'branding',service:'identity',type:'BRAND IDENTITY',year:'DEMO',img:'assets/demo-brand.svg',desc:'A compact identity system exploring logo, typography, layout and packaging direction.',challenge:'Create a confident identity that can scale across digital and physical touchpoints.',approach:'Established a restrained visual language with strong typography and repeatable layout rules.',process:'Discovery → identity direction → system → applications',deliverables:'Logo · Typography · Brand System · Packaging',tools:'Illustrator · Photoshop · Figma',featured:true,visibility:'public',demo:true,gallery:['assets/demo-brand.svg','assets/demo-pack.svg','assets/demo-web.svg']},
  {id:'demo-store',slug:'demo-amazon-storefront',title:'Amazon Storefront — Home & Living',cat:'amazon',service:'storefront',type:'STOREFRONT',year:'DEMO',img:'assets/demo-store.svg',desc:'A storefront concept organizing a broad catalog into clear shopping journeys.',challenge:'Turn multiple product families into one coherent branded experience.',approach:'Created collection hierarchy, navigation cues and consistent visual modules.',process:'Catalog mapping → UX structure → visual system → page design',deliverables:'Storefront · Category Pages · Product Collections',tools:'Figma · Photoshop',featured:true,visibility:'public',demo:true,gallery:['assets/demo-store.svg','assets/demo-web.svg','assets/demo-a-plus.svg']},
  {id:'demo-motion',slug:'demo-product-motion',title:'Product Motion — Launch Film',cat:'motion',service:'motion',type:'VIDEO / MOTION',year:'DEMO',img:'assets/demo-motion.svg',desc:'A short-form product motion concept combining typography, product moments and rhythmic transitions.',challenge:'Create a concise visual hook for social and product launch communication.',approach:'Used kinetic type, controlled pacing and product-focused compositions.',process:'Storyboard → edit → motion system → final cut',deliverables:'Product Video · Social Cutdowns · Motion Graphics',tools:'Premiere Pro · After Effects',featured:true,visibility:'public',demo:true,gallery:['assets/demo-motion.svg','assets/demo-listing.svg','assets/demo-brand.svg']},
  {id:'demo-web',slug:'demo-landing-page',title:'Landing Page — Product Launch',cat:'web',service:'web',type:'LANDING PAGE',year:'DEMO',img:'assets/demo-web.svg',desc:'A conversion-focused landing page concept with editorial product storytelling.',challenge:'Balance brand expression with a clear conversion path.',approach:'Built a modular page rhythm with strong hierarchy and purposeful interaction.',process:'Wireframe → visual direction → UI → front-end concept',deliverables:'Landing Page · UI System · Front-end Concept',tools:'Figma · HTML · CSS · JavaScript',featured:false,visibility:'public',demo:true,gallery:['assets/demo-web.svg','assets/demo-store.svg','assets/demo-motion.svg']},
  {id:'demo-sld',slug:'demo-electrical-sld',title:'Electrical SLD — Commercial Building',cat:'engineering',service:'engineering',type:'ELECTRICAL SLD',year:'DEMO',img:'assets/demo-sld.svg',desc:'A technical drawing concept demonstrating structured electrical documentation and clear diagram hierarchy.',challenge:'Present a complex electrical system in a readable technical format.',approach:'Applied disciplined notation, hierarchy and documentation structure.',process:'Load study → diagram structure → drafting → documentation QA',deliverables:'Single Line Diagram · Electrical Documentation',tools:'AutoCAD · Electrical Design Tools',featured:false,visibility:'public',demo:true,gallery:['assets/demo-sld.svg','assets/demo-web.svg']},
  {id:'demo-pack',slug:'demo-packaging-system',title:'Packaging System — Everyday Goods',cat:'branding',service:'packaging',type:'PACKAGING',year:'DEMO',img:'assets/demo-pack.svg',desc:'A packaging direction extending a brand system into a physical product family.',challenge:'Keep multiple SKUs visually consistent while preserving hierarchy.',approach:'Developed a repeatable packaging grid, typography and information system.',process:'Brand system → packaging grid → SKU rollout → print QA',deliverables:'Packaging · Label System · Print Layouts',tools:'Illustrator · Photoshop',featured:false,visibility:'public',demo:true,gallery:['assets/demo-pack.svg','assets/demo-brand.svg','assets/demo-listing.svg']}
];
const DEMO_REQUESTED=new URLSearchParams(location.search).get('demo')==='1';let DEMO_PREVIEW=false;
async function authorizeDemoPreview(){if(!DEMO_REQUESTED)return;try{const response=await fetch('/api/auth/me',{credentials:'include',cache:'no-store'});DEMO_PREVIEW=response.ok}catch{DEMO_PREVIEW=false}}
const demoBrands=['NORTHPEAK','KITCHENA','NORTHLINE','HAVEN & HOME','FORMA GOODS'].map((name,i)=>({id:`demo-brand-${i}`,name,active:true,sortOrder:i}));
const demoTestimonials=[{client:'Demo Client',company:'NorthPeak Outdoor',role:'Brand Lead',quote:'The process made complex product information feel clear, premium and ready to sell.'},{client:'Demo Client',company:'Aster Labs',role:'Founder',quote:'A thoughtful visual system with strong hierarchy and a polished final result.'}];
function ensureDemoPreviewBanner(){if(!DEMO_PREVIEW||document.querySelector('.demo-preview-banner'))return;const bar=document.createElement('div');bar.className='demo-preview-banner';bar.innerHTML='<strong>ADMIN DEMO PREVIEW</strong><span>Sample content is visible only in this preview URL and is not written to the database.</span><nav><a href="/?demo=1">HOME PREVIEW</a><a href="/blog.html?demo=1">JOURNAL PREVIEW</a><a href="/">EXIT PREVIEW</a></nav>';document.body.prepend(bar);document.body.classList.add('demo-preview-active')}

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const grid=$('#grid'),filters=$('#filters'),modal=$('#modal'),modalContent=$('#modal-content');
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}
function normalizeProject(p){
  const category=(p.category||'').toLowerCase();
  const cat=category.includes('amazon')?'amazon':category.includes('brand')?'branding':category.includes('web')?'web':category.includes('motion')?'motion':category.includes('engine')?'engineering':p.cat||'all';
  return {...p,sliderEnabled:p.sliderEnabled!==false,sliderTransition:p.sliderTransition||'AUTO',sliderReflection:p.sliderReflection||'INHERIT',cat,title:p.sliderTitle||p.homepageTitle||p.title,img:p.sliderImage||p.homepageImage||p.coverImage||p.img||'assets/amazon-01.svg',mobileImg:p.sliderMobileImage||'',thumbnail:p.sliderThumbnail||p.sliderImage||p.homepageImage||p.coverImage||p.img||'',imageAlt:p.sliderImageAlt||p.sliderTitle||p.title,headline:p.sliderHeadline||p.sliderTitle||p.homepageTitle||p.title,ctaLabel:p.sliderCtaLabel||'VIEW CASE STUDY',ctaUrl:p.sliderCtaUrl||`/work/${encodeURIComponent(p.slug||'')}`,year:p.year||'',type:p.type||'PROJECT',desc:p.sliderDescription||p.homepageSubtitle||p.description||p.desc||'',deliverables:Array.isArray(p.deliverables)?p.deliverables.join(' · '):p.deliverables||'',results:p.results||'',tools:Array.isArray(p.tools)?p.tools.join(' · '):p.tools||''};
}
function renderBrands(){
  const track=$('#brandTrack'); if(!track)return;
  if(!brands.length){track.innerHTML='';return}
  const items=brands.map(b=>`<div class="brand-logo">${b.logoAsset?`<img src="${escapeHtml(b.logoAsset)}" alt="${escapeHtml(b.name)}">`:`<span>${escapeHtml(b.name)}</span>`}</div>`).join('');
  track.innerHTML=items+items;
}
const STARTER_SKILLS=[
{id:'photoshop',name:'Adobe Photoshop',category:'Creative / Design',icon:'https://cdn.simpleicons.org/adobephotoshop',level:'Advanced',description:'A+ Content · Listing creatives · Retouching',sortOrder:1,visible:true,featured:true},
{id:'illustrator',name:'Adobe Illustrator',category:'Creative / Design',icon:'https://cdn.simpleicons.org/adobeillustrator',level:'Advanced',description:'Brand identity · Vector graphics · Packaging',sortOrder:2,visible:true,featured:true},
{id:'figma',name:'Figma',category:'Web / Digital',icon:'https://cdn.simpleicons.org/figma',level:'Advanced',description:'UI systems · Web design · Prototyping',sortOrder:3,visible:true,featured:true},
{id:'after-effects',name:'Adobe After Effects',category:'Motion / Video',icon:'https://cdn.simpleicons.org/adobeaftereffects',level:'Professional',description:'Motion graphics · Product animation · Compositing',sortOrder:4,visible:true,featured:true},
{id:'premiere',name:'Adobe Premiere Pro',category:'Motion / Video',icon:'https://cdn.simpleicons.org/adobepremierepro',level:'Professional',description:'Editing · Product videos · Social content',sortOrder:5,visible:true,featured:true},
{id:'autocad',name:'AutoCAD',category:'Technical / Engineering',icon:'https://cdn.simpleicons.org/autodesk',level:'Professional',description:'Electrical drawings · Plans · Technical documentation',sortOrder:6,visible:true,featured:true},
{id:'html-css-js',name:'HTML · CSS · JavaScript',category:'Web / Digital',icon:'https://cdn.simpleicons.org/html5',level:'Working knowledge',description:'Front-end implementation · Interactive portfolio experiences',sortOrder:7,visible:true,featured:true}
];
function renderSkills(skills){const root=document.querySelector('#skillsGrid');if(!root)return;const source=Array.isArray(skills)&&skills.length?skills:STARTER_SKILLS;const items=source.filter(x=>x&&x.visible!==false&&x.featured!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));root.innerHTML=items.map(x=>`<article class=\"skill-card\"><div class=\"skill-icon-wrap\">${x.icon?`<img src=\"${escapeHtml(x.icon)}\" alt=\"${escapeHtml(x.name)}\" loading=\"lazy\" onerror=\"this.closest('.skill-icon-wrap').classList.add('fallback');this.remove()\">`:''}<span class=\"skill-fallback\">${escapeHtml((x.name||'').split(/\s+/).map(v=>v[0]).join('').slice(0,3).toUpperCase())}</span></div><div class=\"skill-info\"><h3>${escapeHtml(x.name)}</h3><span>${escapeHtml(x.category||'TOOL')}${x.level?' · '+escapeHtml(x.level):''}</span><p>${escapeHtml(x.description||'')}</p></div></article>`).join('');}

async function loadSiteExtras(){try{const [s,t]=await Promise.all([fetch('/api/public/settings',{cache:'no-store'}),fetch('/api/public/testimonials',{cache:'no-store'})]);if(s.ok){const d=await s.json();const x=d.settings||{};sliderConfig={...DEFAULT_SLIDER_SETTINGS,...(x.sliderConfig||{})};if(window.__setHeroCopy){window.__setHeroCopy(x.heroLeadText||'I DESIGN',Array.isArray(x.heroTypewriterPhrases)?x.heroTypewriterPhrases:['BRANDS THAT SELL.']);}renderSkills(DEMO_PREVIEW&&!(x.skillsConfig||[]).length?STARTER_SKILLS:x.skillsConfig||[]);window.setHeroTypewriterConfig?.(x.typewriterConfig||{});const heroImage=document.querySelector('.hero-visual img');if(heroImage&&x.heroImage)heroImage.src=x.heroImage;if(x.email){const a=document.querySelector('.contact-link');if(a&&a.tagName==='A'){a.href='mailto:'+x.email;a.textContent=x.email+' ↗'}}if(x.availabilityLabel)document.querySelector('#availabilityLabel')?.replaceChildren(document.createTextNode(x.availability?x.availabilityLabel:'CURRENTLY BOOKED'));if(x.siteName){document.title=x.metaTitle||x.siteName+' — '+(x.title||'Creative Designer');const md=document.querySelector('meta[name=description]');if(md&&x.metaDescription)md.setAttribute('content',x.metaDescription);const og=document.querySelector('meta[property=og:image]');if(og&&x.ogImage)og.setAttribute('content',x.ogImage)}}if(t.ok){const d=await t.json();const root=document.querySelector('#testimonialPublic'),rows=(d.testimonials||[]).length?d.testimonials:(DEMO_PREVIEW?demoTestimonials:[]);if(root)root.innerHTML=rows.map(x=>`<article class="testimonial-card reveal">${x.photo?`<img src="${escapeHtml(x.photo)}" alt="${escapeHtml(x.client)}" loading="lazy">`:''}<blockquote>“${escapeHtml(x.quote)}”</blockquote><small>${escapeHtml(x.client)}${x.company?' · '+escapeHtml(x.company):''}${x.role?' · '+escapeHtml(x.role):''}</small></article>`).join('')||'<p class="empty">Client notes will appear here.</p>'}}catch(e){console.warn('Site extras unavailable',e)}}
async function loadProductionContent(){
  try{
    const [pr,br]=await Promise.all([fetch('/api/public/projects',{credentials:'same-origin',cache:'no-store'}),fetch('/api/public/brands',{credentials:'same-origin',cache:'no-store'})]);
    if(!pr.ok)throw new Error('Public projects request failed');
    const pd=await pr.json(); const bd=br.ok?await br.json():{brands:[]};
    projects=(Array.isArray(pd.projects)?pd.projects.map(normalizeProject):[]);
    if(!projects.length&&(pd.demoEnabled||DEMO_PREVIEW))projects=demoProjects.map(normalizeProject);
    brands=Array.isArray(bd.brands)&&bd.brands.length?bd.brands:(DEMO_PREVIEW?demoBrands:[]);
    render();renderFeatured();renderBrands();openRouteProject();
  }catch(e){
    console.warn('Production content unavailable.',e);projects=[];brands=[];render();renderFeatured();renderBrands();
  }
}
function render(active='all'){
  if(!filters||!grid)return;
  filters.innerHTML=Object.entries(labels).map(([k,v])=>`<button class="filter ${k===active?'active':''}" data-k="${k}">${v}</button>`).join('');
  $$('.filter').forEach(b=>b.onclick=()=>render(b.dataset.k));
  const list=projects.filter(p=>p.showOnHomepage!==false&&(active==='all'||p.cat===active||p.service===active)).sort((a,b)=>(Number(a.homepageOrder)||0)-(Number(b.homepageOrder)||0));
  grid.innerHTML=list.length?list.map(p=>`<article class="project-card" data-id="${escapeHtml(p.id)}" tabindex="0" role="link" aria-label="View ${escapeHtml(p.title)}"><div class="project-media-wrap">${p.demo?'<span class="demo-image-badge">DEMO PROJECT</span>':''}<img class="project-image" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" loading="lazy" decoding="async"></div><div class="project-info"><div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.type)} · ${escapeHtml(p.year)}</p></div><span class="tag">${p.demo?'DEMO · ':''}${escapeHtml(p.cat.toUpperCase())} ↗</span></div></article>`).join(''):'<p class="empty">No published projects in this category yet.</p>';
  $$('.project-card').forEach(c=>{const go=()=>{const p=projects.find(x=>x.id===c.dataset.id);if(!p)return;location.href=`/work/${encodeURIComponent(p.slug)}${DEMO_PREVIEW?'?demo=1':''}`};c.onclick=go;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
}
function updateProjectMeta(p){
  const desc=(p?.seoDescription||p?.desc||'Amazon A+, e-commerce creative, branding and digital design by Mahmudul Hassan.').slice(0,160);
  document.title=p?.seoTitle||p?.title?`${p.seoTitle||p.title} — Mahmudul Hassan`:'Mahmudul Hassan — Creative Designer';
  const md=document.querySelector('meta[name=description]'); if(md)md.setAttribute('content',desc);
  const ogTitle=document.querySelector('meta[property=og:title]'); if(ogTitle)ogTitle.setAttribute('content',document.title);
  const ogDesc=document.querySelector('meta[property=og:description]'); if(ogDesc)ogDesc.setAttribute('content',desc);
  const ogImage=document.querySelector('meta[property=og:image]'); if(ogImage&&p?.img)ogImage.setAttribute('content',new URL(p.img,location.href).href);
  let canonical=document.querySelector('link[rel=canonical]'); if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}
  canonical.href=p?new URL('/work/'+encodeURIComponent(p.slug),location.origin).href:new URL('/',location.origin).href;
}
function resetHomeMeta(){
  document.title='Mahmudul Hassan — Creative Designer';
  const md=document.querySelector('meta[name=description]'); if(md)md.setAttribute('content','Mahmudul Hassan — Creative Designer specializing in Amazon A+, e-commerce creative, branding, web, motion and technical design.');
  const canonical=document.querySelector('link[rel=canonical]'); if(canonical)canonical.href=new URL('/',location.origin).href;
}
function openProject(id){
  const p=projects.find(x=>x.id===id); if(!p)return;
  updateProjectMeta(p);
  const gallery=Array.isArray(p.gallery)?p.gallery:[];
  const galleryHtml=gallery.length?`<div class="gallery-slider" data-gallery='${escapeHtml(JSON.stringify(gallery.map(g=>({url:g.url||g,alt:g.alt||p.title})) ))}'><div class="gallery-track">${gallery.map((g,i)=>`<div class="gallery-slide ${i===0?'active':''}"><img src="${escapeHtml(g.url||g)}" alt="${escapeHtml(g.alt||p.title)}" loading="${i===0?'eager':'lazy'}"></div>`).join('')}</div><div class="gallery-controls"><span class="gallery-count">01 / ${String(gallery.length).padStart(2,'0')}</span><button type="button" class="gallery-prev" aria-label="Previous image">←</button><button type="button" class="gallery-next" aria-label="Next image">→</button></div></div>`:'';
  modalContent.innerHTML=`<div class="modal-meta">${escapeHtml(p.cat.toUpperCase())} / ${escapeHtml(p.type)} / ${escapeHtml(p.year)}${p.client?` / ${escapeHtml(p.client)}`:''}</div><h2>${escapeHtml(p.title)}</h2><img class="modal-hero" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" decoding="async">${galleryHtml}<div class="modal-body"><div class="modal-block"><h3>OVERVIEW</h3><p>${escapeHtml(p.desc||'Project overview available on request.')}</p></div><div class="modal-block"><h3>CHALLENGE</h3><p>${escapeHtml(p.challenge||'Defined the communication problem, audience and visual priorities.')}</p></div><div class="modal-block"><h3>APPROACH</h3><p>${escapeHtml(p.approach||'Built a focused visual system around hierarchy, clarity and consistency.')}</p></div><div class="modal-block"><h3>PROCESS</h3><p>${escapeHtml(p.process||'Discovery → direction → design → final delivery')}</p></div><div class="modal-block"><h3>RESULT / OUTCOME</h3><p>${escapeHtml(p.results||'Project outcome available on request.')}</p></div><div class="modal-block modal-deliverables"><h3>DELIVERABLES</h3><p>${escapeHtml(p.deliverables||'Visual design · Creative direction · Final assets')}${p.tools?`<br><br><strong>TOOLS</strong> · ${escapeHtml(p.tools)}`:''}</p>${p.liveUrl?`<a class="modal-live" href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noreferrer">OPEN LIVE PROJECT ↗</a>`:''}</div></div>`;
  const gs=modalContent.querySelector('.gallery-slider');
  if(gs){const slides=[...gs.querySelectorAll('.gallery-slide')];let gi=0,gbusy=false;const gc=gs.querySelector('.gallery-count');const update=()=>{if(gc)gc.textContent=`${String(gi+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`};const go=(dir)=>{if(gbusy||slides.length<2)return;gbusy=true;const ni=(gi+dir+slides.length)%slides.length;const motion=galleryMotionNames[Math.floor(Math.random()*galleryMotionNames.length)];const target=slides[ni];target.className=`gallery-slide ${motion}`;requestAnimationFrame(()=>target.classList.add('active'));setTimeout(()=>{slides[gi].className='gallery-slide';target.className='gallery-slide active';gi=ni;update();gbusy=false},780)};gs.querySelector('.gallery-prev').onclick=()=>go(-1);gs.querySelector('.gallery-next').onclick=()=>go(1);let sx=0;gs.onpointerdown=e=>sx=e.clientX;gs.onpointerup=e=>{const dx=e.clientX-sx;if(Math.abs(dx)>45)go(dx<0?1:-1)};update()}
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}
function openRouteProject(){
  const parts=location.pathname.split('/').filter(Boolean);
  if(parts[0]==='work'&&parts[1]){const p=projects.find(x=>x.slug===decodeURIComponent(parts[1]));if(p)openProject(p.id)}
}
addEventListener('popstate',()=>{if(location.pathname.startsWith('/work/'))openRouteProject();else if(modal?.classList.contains('open'))closeModal()});
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';if(!location.pathname.startsWith('/work/'))resetHomeMeta()}
$('#close').onclick=closeModal;modal.onclick=e=>{if(e.target===modal)closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$('#modalFullscreen')?.addEventListener('click',async()=>{const target=modalContent.querySelector('.modal-panel')||modalContent;try{if(document.fullscreenElement)await document.exitFullscreen();else await target.requestFullscreen?.()}catch{}});
$$('[data-filter]').forEach(b=>b.onclick=()=>{render(b.dataset.filter);document.querySelector('#work').scrollIntoView({behavior:'smooth'})});
$('#year').textContent=new Date().getFullYear();
const cursor=$('.cursor');
if(cursor&&matchMedia('(pointer:fine)').matches){
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY},{passive:true});
  (function loop(){x+=(tx-x)*.18;y+=(ty-y)*.18;cursor.style.left=x+'px';cursor.style.top=y+'px';requestAnimationFrame(loop)})();
  document.addEventListener('mouseover',e=>{const el=e.target.closest('a,button,.project-card,.amazon-row,.filter,.magnetic,.image-viewer-image,.image-viewer-close,.image-viewer-nav');if(!el)return;cursor.classList.add('hover');cursor.querySelector('span').textContent=el.classList.contains('project-card')?'VIEW':'↗'});
  document.addEventListener('mouseout',e=>{const from=e.target.closest('a,button,.project-card,.amazon-row,.filter,.magnetic,.image-viewer-image,.image-viewer-close,.image-viewer-nav');if(from&&!from.contains(e.relatedTarget))cursor.classList.remove('hover')});
}
const progress=$('.progress'),header=$('#header');
function scrollUI(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+'%';header.classList.toggle('scrolled',scrollY>15)}
addEventListener('scroll',scrollUI,{passive:true});scrollUI();
let last=scrollY;addEventListener('scroll',()=>{if(!document.body.classList.contains('nav-always-visible')&&innerWidth>800&&scrollY>last&&scrollY>180)header.classList.add('hidden');else header.classList.remove('hidden');last=scrollY},{passive:true});
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});$$('.reveal').forEach(e=>obs.observe(e));
if(matchMedia('(pointer:fine)').matches){
  $$('.magnetic').forEach(el=>{el.onpointermove=e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.1}px,${(e.clientY-r.top-r.height/2)*.1}px)`};el.onpointerleave=()=>el.style.transform=''});
  const frame=$('[data-parallax]'),img=frame?.querySelector('img');frame?.addEventListener('pointermove',e=>{const r=frame.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;if(img)img.style.transform=`scale(1.045) translate(${px*9}px,${py*7}px)`});frame?.addEventListener('pointerleave',()=>{if(img)img.style.transform='scale(1.025)'});
}
const menuBtn=$('.menu-toggle'),mobileMenu=$('.mobile-menu');menuBtn?.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open);mobileMenu.setAttribute('aria-hidden',!open)});$$('.mobile-menu a').forEach(a=>a.onclick=()=>{mobileMenu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');mobileMenu.setAttribute('aria-hidden','true')});

const motionNames=['t-mask','t-diagonal','t-split','t-curtain','t-zoom','t-slide'];
const galleryMotionNames=['g-mask','g-diagonal','g-zoom'];
const DEFAULT_SLIDER_SETTINGS={enabled:true,mode:'AUTO_MANUAL',interval:5,pauseHover:true,pauseFocus:true,pauseHidden:true,loop:true,arrows:true,counter:true,progress:true,dots:false,keyboard:true,wheel:false,swipe:true,transitionMode:'RANDOM',fixedTransition:'MASK',duration:900,easing:'SMOOTH',preload:true,randomStart:false,drag:true,clickOpen:true,maxSlides:8,mobileAuto:true,mobileInterval:4,mobileArrows:false,mobileSwipe:true,reducedMotion:true,pauseOffscreen:true,lazy:true,showThumbnails:true,showDetails:true,eyebrow:'FEATURED WORK',headline:'Design that makes products hard to ignore.',description:'Selected brand, commerce and digital work.',panelPreset:'INK',reflectionEnabled:true,reflectionDirection:'LEFT_TO_RIGHT',reflectionIntensity:'SUBTLE',reflectionWidth:22,reflectionAngle:-14,reflectionDuration:1100,reflectionDelay:320,mobileReflection:false};
let sliderConfig={...DEFAULT_SLIDER_SETTINGS};
let featuredItems=[],featuredIndex=0,featuredBusy=false,lastMotion=-1,featuredTimer=null,featuredHover=false,featuredFocus=false,featuredVisible=true,featuredRequest=0,featuredAnnounced=false;
function isMobileSlider(){return innerWidth<=800}
function sliderCanAuto(){if(!sliderConfig.enabled||sliderConfig.mode==='MANUAL'||matchMedia('(prefers-reduced-motion: reduce)').matches)return false;if(isMobileSlider()&&!sliderConfig.mobileAuto)return false;if(sliderConfig.pauseHover&&featuredHover)return false;if(sliderConfig.pauseFocus&&featuredFocus)return false;if(sliderConfig.pauseHidden&&document.hidden)return false;if(sliderConfig.pauseOffscreen&&!featuredVisible)return false;if(document.querySelector('.mobile-menu.open,.modal.open'))return false;return true}
function restartFeaturedTimer(){if(featuredTimer){clearInterval(featuredTimer);featuredTimer=null}if(!sliderCanAuto()||featuredItems.length<2)return;const ms=(isMobileSlider()?sliderConfig.mobileInterval:sliderConfig.interval)*1000;featuredTimer=setInterval(()=>{if(sliderCanAuto())goFeatured(1)},Math.max(1500,ms))}

function nextMotion(list){let i=Math.floor(Math.random()*list.length);if(list.length>1&&i===lastMotion)i=(i+1)%list.length;lastMotion=i;return list[i]}
function featuredPool(){return projects.filter(p=>p.sliderEnabled!==false&&(p.featured||p.sliderTitle||p.sliderImage)).sort((a,b)=>(Number(a.sortOrder)||0)-(Number(b.sortOrder)||0)).slice(0,Math.max(1,Math.min(12,Number(sliderConfig.maxSlides)||8)))}
function transitionClass(project){const motionMap={MASK:'t-mask',DIAGONAL:'t-diagonal',SPLIT:'t-split',CURTAIN:'t-curtain',ZOOM:'t-zoom',SLIDE:'t-slide'};if(sliderConfig.transitionMode==='FIXED')return motionMap[sliderConfig.fixedTransition]||'t-mask';if(sliderConfig.transitionMode==='PROJECT'){const v=project?.sliderTransition||'AUTO';return v==='AUTO'?nextMotion(motionNames):(motionMap[v]||nextMotion(motionNames))}return nextMotion(motionNames)}
function renderFeatured(){
  const root=$('#featuredSlider'); if(!root)return;
  featuredItems=featuredPool();
  const section=root.closest('.featured-slider-section');
  if(section)section.classList.toggle('slider-disabled',!sliderConfig.enabled);
  const count=$('#featuredCount');
  const prev=$('#featuredPrev'),next=$('#featuredNext');
  [prev,next].forEach(b=>b?.classList.toggle('slider-control-hidden',!sliderConfig.arrows||(isMobileSlider()&&!sliderConfig.mobileArrows)));
  if(count)count.classList.toggle('slider-control-hidden',!sliderConfig.counter);
  if(!featuredItems.length||!sliderConfig.enabled){root.innerHTML=sliderConfig.enabled?'<div class="featured-empty">Publish a featured project from the CMS to populate this slider.</div>':'';if(count)count.textContent='00 / 00';restartFeaturedTimer();return}
  if(sliderConfig.randomStart&&featuredIndex===0)featuredIndex=Math.floor(Math.random()*featuredItems.length);if(featuredIndex>=featuredItems.length)featuredIndex=0;
  const nav=featuredItems.map((p,i)=>`<button type="button" class="featured-nav-item ${i===featuredIndex?'active':''}" data-slide-index="${i}" aria-label="Show ${escapeHtml(p.title)}, slide ${i+1} of ${featuredItems.length}" aria-pressed="${i===featuredIndex}">${sliderConfig.showThumbnails&&p.thumbnail?`<img src="${escapeHtml(p.thumbnail)}" alt="" loading="lazy">`:''}<span>${String(i+1).padStart(2,'0')}</span><strong>${escapeHtml(p.title)}</strong><b aria-hidden="true">↗</b></button>`).join('');
  root.className=`featured-slider editorial-slider panel-${String(sliderConfig.panelPreset||'INK').toLowerCase()}`;
  root.setAttribute('role','region');root.setAttribute('aria-roledescription','carousel');root.setAttribute('aria-label','Featured projects');
  root.style.setProperty('--reflection-width',`${Math.max(8,Math.min(40,Number(sliderConfig.reflectionWidth)||22))}%`);root.style.setProperty('--reflection-angle',`${Math.max(-30,Math.min(30,Number(sliderConfig.reflectionAngle)||-14))}deg`);root.style.setProperty('--reflection-duration',`${Math.max(500,Math.min(2000,Number(sliderConfig.reflectionDuration)||1100))}ms`);root.style.setProperty('--reflection-delay',`${Math.max(0,Math.min(1500,Number(sliderConfig.reflectionDelay)||320))}ms`);root.dataset.reflectionDirection=sliderConfig.reflectionDirection||'LEFT_TO_RIGHT';root.dataset.reflectionIntensity=sliderConfig.reflectionIntensity||'SUBTLE';
  root.innerHTML=`<div class="featured-editorial-intro"><span class="featured-eyebrow">${escapeHtml(sliderConfig.eyebrow||'FEATURED WORK')}</span><h3>${escapeHtml(sliderConfig.headline||'Selected work.')}</h3><p>${escapeHtml(sliderConfig.description||'')}</p><a class="featured-primary-cta" href="${escapeHtml(featuredItems[featuredIndex].ctaUrl)}">${escapeHtml(featuredItems[featuredIndex].ctaLabel)} ↗</a><div class="featured-editorial-progress"><span class="featured-editorial-count"></span><div class="featured-progress-track"><i></i></div></div></div><div class="featured-stage">${featuredItems.map((p,i)=>`<article class="featured-slide ${i===featuredIndex?'active':''}" data-index="${i}" aria-hidden="${i!==featuredIndex}"><div class="featured-slide-media" style="--slider-overlay:${Math.max(0,Math.min(90,Number(p.sliderOverlay)||35))/100};--focal:${escapeHtml(p.sliderFocalPoint||'50% 50%')}"><picture>${p.mobileImg?`<source media="(max-width:800px)" srcset="${escapeHtml(p.mobileImg)}">`:''}<img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.imageAlt)}" loading="${i===featuredIndex||!sliderConfig.lazy?'eager':'lazy'}" decoding="async" ${i===0?'fetchpriority="high"':''}></picture></div></article>`).join('')}</div><aside class="featured-editorial-side"><div class="featured-project-nav" role="group" aria-label="Choose featured project">${nav}</div><div class="featured-active-detail" ${sliderConfig.showDetails?'':'hidden'}><span class="featured-detail-meta"></span><h3></h3><p></p><a class="featured-secondary-cta"></a></div></aside><p class="sr-only featured-status" aria-live="polite" aria-atomic="true"></p>`;
  root.querySelectorAll('.featured-nav-item').forEach(button=>button.addEventListener('click',e=>{e.stopPropagation();goFeatured(Number(button.dataset.slideIndex)-featuredIndex,'click')}));
  syncFeaturedEditorial(false);
  window.setTimeout(()=>runFeaturedReflection(root.querySelector('.featured-slide.active'),featuredItems[featuredIndex]),80);
  // Featured slider is navigation-only: clicking its image/body opens the project.
  // The image viewer must never intercept a featured-slide click.
  let featuredPointerDown=null,featuredPointerMoved=false,featuredSuppressClick=false;
  root.addEventListener('pointerdown',e=>{featuredPointerDown={x:e.clientX,y:e.clientY};featuredPointerMoved=false;featuredSuppressClick=false},{passive:true});
  root.addEventListener('pointermove',e=>{if(!featuredPointerDown)return;const dx=e.clientX-featuredPointerDown.x,dy=e.clientY-featuredPointerDown.y;if(Math.hypot(dx,dy)>10)featuredPointerMoved=true},{passive:true});
  root.addEventListener('pointerup',()=>{if(!featuredPointerDown)return;featuredSuppressClick=featuredPointerMoved;featuredPointerDown=null;featuredPointerMoved=false},{passive:true});
  root.addEventListener('click',e=>{
    if(!sliderConfig.clickOpen||featuredSuppressClick){featuredSuppressClick=false;return;}
    const control=e.target.closest('.slider-dot,.slider-btn');
    if(control)return;
    const link=e.target.closest('.featured-slide-link');
    const slide=e.target.closest('.featured-slide.active');
    if(!slide)return;
    const item=featuredItems[Number(slide.dataset.index)];
    if(!item?.slug)return;
    e.preventDefault();
    e.stopPropagation();
    location.href=link?.getAttribute('href')||`/work/${encodeURIComponent(item.slug)}`;
  });
  let dots=root.querySelector('.slider-dots'); if(sliderConfig.dots){dots=document.createElement('div');dots.className='slider-dots';dots.innerHTML=featuredItems.map((_,i)=>`<button type="button" class="slider-dot ${i===featuredIndex?'active':''}" data-index="${i}" aria-label="Go to slide ${i+1}"></button>`).join('');root.appendChild(dots);dots.querySelectorAll('button').forEach(b=>b.onclick=()=>goFeatured(Number(b.dataset.index)-featuredIndex,'click'))}
  if(sliderConfig.progress){const bar=document.createElement('div');bar.className='slider-progress';bar.innerHTML='<span></span>';root.appendChild(bar)}
  updateFeaturedCount();restartFeaturedTimer();
}
function reflectionAllowed(item){return sliderConfig.reflectionEnabled&&item.sliderReflection!=='OFF'&&(item.sliderReflection==='ON'||sliderConfig.reflectionEnabled)&&(!isMobileSlider()||sliderConfig.mobileReflection)&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&featuredVisible&&!document.hidden}
function runFeaturedReflection(slide,item){if(!reflectionAllowed(item))return;const media=slide?.querySelector('.featured-slide-media');if(!media)return;media.dataset.intensity=item.sliderReflectionIntensity||sliderConfig.reflectionIntensity||'SUBTLE';media.classList.remove('is-reflecting');void media.offsetWidth;media.classList.add('is-reflecting');media.addEventListener('animationend',()=>media.classList.remove('is-reflecting'),{once:true})}
function syncFeaturedEditorial(announce=true){const root=$('#featuredSlider'),item=featuredItems[featuredIndex];if(!root||!item)return;const pad=String(featuredItems.length).length;const label=`${String(featuredIndex+1).padStart(Math.max(2,pad),'0')} / ${String(featuredItems.length).padStart(Math.max(2,pad),'0')}`;$('#featuredCount')&&($('#featuredCount').textContent=label);root.querySelector('.featured-editorial-count').textContent=label;root.querySelector('.featured-progress-track i').style.width=`${(featuredIndex+1)/featuredItems.length*100}%`;const primary=root.querySelector('.featured-primary-cta');primary.href=item.ctaUrl;primary.innerHTML=`${escapeHtml(item.ctaLabel)} ↗`;const detail=root.querySelector('.featured-active-detail');detail.querySelector('.featured-detail-meta').textContent=[item.type,item.year,(item.cat||'PROJECT').toUpperCase()].filter(Boolean).join(' · ');detail.querySelector('h3').textContent=item.title;detail.querySelector('p').textContent=item.headline||item.desc||'';const secondary=detail.querySelector('a');secondary.href=item.ctaUrl;secondary.textContent=`${item.ctaLabel} ↗`;root.querySelectorAll('.featured-nav-item').forEach((b,i)=>{b.classList.toggle('active',i===featuredIndex);b.setAttribute('aria-pressed',String(i===featuredIndex));if(i===featuredIndex)b.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'})});document.querySelectorAll('.slider-dot').forEach((d,i)=>d.classList.toggle('active',i===featuredIndex));const bar=document.querySelector('.slider-progress span');if(bar)bar.style.width=((featuredIndex+1)/featuredItems.length*100)+'%';if(announce&&featuredAnnounced)root.querySelector('.featured-status').textContent=`Slide ${featuredIndex+1} of ${featuredItems.length}: ${item.title}`;featuredAnnounced=true}
function updateFeaturedCount(){syncFeaturedEditorial(false)}
function goFeatured(dir,method='autoplay'){
  if(featuredBusy||featuredItems.length<2||!sliderConfig.enabled)return;let next=featuredIndex+dir;
  if(next<0||next>=featuredItems.length){if(!sliderConfig.loop){featuredBusy=false;restartFeaturedTimer();return}next=(next+featuredItems.length)%featuredItems.length}
  if(next===featuredIndex)return;featuredBusy=true;const request=++featuredRequest;
  const slides=[...document.querySelectorAll('.featured-slide')];const current=slides[featuredIndex];const target=slides[next];const motion=transitionClass(featuredItems[next]);const duration=Math.max(300,Number(sliderConfig.duration)||900);const easeMap={SMOOTH:'cubic-bezier(.77,0,.18,1)',FAST:'cubic-bezier(.22,1,.36,1)',LINEAR:'linear'};target.style.animationDuration=duration+'ms';target.style.animationTimingFunction=easeMap[sliderConfig.easing]||easeMap.SMOOTH;target.className=`featured-slide ${motion}`;target.style.zIndex='3';current.style.zIndex='2';requestAnimationFrame(()=>target.classList.add('active'));
  target.setAttribute('aria-hidden','false');window.setTimeout(()=>{if(request!==featuredRequest)return;current.className='featured-slide';current.setAttribute('aria-hidden','true');target.className='featured-slide active';featuredIndex=next;syncFeaturedEditorial(true);featuredBusy=false;runFeaturedReflection(target,featuredItems[next]);window.portfolioAnalytics?.track('featured_slider_change',{projectId:featuredItems[next].id,slideIndex:next,navigationMethod:method,transitionType:motion.replace('t-','').toUpperCase(),sourceContext:'slider'});restartFeaturedTimer()},duration);
}
$('#featuredPrev')?.addEventListener('click',()=>goFeatured(-1,'click'));$('#featuredNext')?.addEventListener('click',()=>goFeatured(1,'click'));
$('#featuredSlider')?.addEventListener('keydown',e=>{if(!sliderConfig.keyboard)return;if(e.key==='ArrowLeft'){e.preventDefault();goFeatured(-1,'keyboard')}if(e.key==='ArrowRight'){e.preventDefault();goFeatured(1,'keyboard')}});
(function bindFeaturedInteractions(){const root=$('#featuredSlider');if(!root)return;let sx=0,sy=0,dragging=false;root.addEventListener('pointerenter',()=>{featuredHover=true;restartFeaturedTimer()});root.addEventListener('pointerleave',()=>{featuredHover=false;restartFeaturedTimer()});root.addEventListener('focusin',()=>{featuredFocus=true;restartFeaturedTimer()});root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){featuredFocus=false;restartFeaturedTimer()}});root.addEventListener('pointerdown',e=>{if(e.target.closest('a,button')||(!sliderConfig.drag&&!sliderConfig.swipe))return;sx=e.clientX;sy=e.clientY;dragging=true});root.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)&&(sliderConfig.swipe||(isMobileSlider()&&sliderConfig.mobileSwipe)))goFeatured(dx<0?1:-1,'swipe')});root.addEventListener('wheel',e=>{if(!sliderConfig.wheel)return;if(Math.abs(e.deltaY)<8)return;e.preventDefault();goFeatured(e.deltaY>0?1:-1,'wheel')},{passive:false});const io=new IntersectionObserver(es=>{const was=featuredVisible;featuredVisible=es.some(e=>e.isIntersecting);if(featuredVisible&&!was&&!featuredAnnounced)runFeaturedReflection(root.querySelector('.featured-slide.active'),featuredItems[featuredIndex]);restartFeaturedTimer()},{threshold:.25});io.observe(root)})();
document.addEventListener('visibilitychange',restartFeaturedTimer);addEventListener('resize',()=>{renderFeatured()});
function socialItems(settings){const configured=Array.isArray(settings.socialLinks)?settings.socialLinks.filter(x=>x&&x.visible!==false&&x.url):[],fallback=[['LinkedIn',settings.linkedin,'linkedin'],['Instagram',settings.instagram,'instagram'],['GitHub',settings.github,'github'],['Behance',settings.behance,'behance'],['Dribbble',settings.dribbble,'dribbble']].filter(([,url])=>url).map(([label,url,icon])=>({label,url,icon}));const seen=new Set;return [...configured,...fallback].filter(item=>{const key=String(item.url||'').toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true})}
function applyPublicExperience(settings){const footer=settings.footerConfig&&typeof settings.footerConfig==='object'?settings.footerConfig:{},about=settings.aboutConfig&&typeof settings.aboutConfig==='object'?settings.aboutConfig:{};document.body.classList.toggle('nav-always-visible',footer.stickyNavigation!==false);if(footer.stickyNavigation!==false)document.querySelector('.header')?.classList.remove('hidden');document.querySelectorAll('[data-public-cv]').forEach(x=>x.remove());if(about.cvUrl){const label=escapeHtml(about.cvLabel||'DOWNLOAD CV'),nav=`<a data-public-cv class="nav-cv" href="/api/public/cv" aria-label="${label}" title="${label}">CV ↓</a>`;document.querySelector('.desktop-nav')?.insertAdjacentHTML('beforeend',nav);document.querySelector('.mobile-menu nav')?.insertAdjacentHTML('beforeend',nav);document.querySelector('#about .about-copy')?.insertAdjacentHTML('beforeend',`<a data-public-cv class="button button-fill about-cv" href="/api/public/cv">${label} ↓</a>`)}const items=socialItems(settings);document.querySelectorAll('.public-socials,.footer-socials').forEach(x=>x.remove());if(items.length){const markup=`<div class="public-socials" aria-label="Social profiles">${items.map(item=>{const label=escapeHtml(item.label||'Profile'),slug=escapeHtml(item.icon||String(item.label||'link').toLowerCase().replace(/[^a-z0-9]/g,''));return `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer" aria-label="${label}"><img src="https://cdn.simpleicons.org/${slug}/c6ff4c" alt="" loading="lazy"><span>${label}</span></a>`}).join('')}</div>`;document.querySelector('#contact footer')?.insertAdjacentHTML('beforebegin',markup)}ensureDemoPreviewBanner()}
async function loadPublicExperience(){try{const response=await fetch('/api/public/settings',{cache:'no-store'});if(!response.ok)return;const data=await response.json();applyPublicExperience(data.settings||{})}catch(error){console.warn('Public experience controls unavailable.',error);ensureDemoPreviewBanner()}}
async function loadStructuredModules(){try{const response=await fetch('/api/public/settings',{cache:'no-store'});if(!response.ok)return;const {settings={}}=await response.json();const hero=settings.heroConfig||{};if(hero.eyebrow)document.querySelector('.hero .eyebrow').textContent=hero.eyebrow;if(hero.supportingCopy)document.querySelector('.hero-bottom p').textContent=hero.supportingCopy;const heroImage=document.querySelector('.hero-visual img');if(heroImage&&hero.desktopImage){heroImage.src=hero.desktopImage;heroImage.alt=hero.alt||'';heroImage.style.objectPosition=hero.focalPoint||'50% 50%'}const actions=document.querySelectorAll('.hero .actions a');if(actions[0]&&hero.primaryCta){actions[0].textContent=hero.primaryCta.label||actions[0].textContent;actions[0].href=hero.primaryCta.url||'#work'}if(actions[1]&&hero.secondaryCta){actions[1].textContent=hero.secondaryCta.label||actions[1].textContent;actions[1].href=hero.secondaryCta.url||'#contact'}if(Array.isArray(settings.navigationConfig)&&settings.navigationConfig.length){const items=settings.navigationConfig.filter(x=>x&&x.visible!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));const links=items.map(x=>`<a ${x.highlighted?'class="nav-cta"':''} href="${escapeHtml(x.url||'#')}" ${x.newTab?'target="_blank" rel="noreferrer"':''}>${escapeHtml(x.label)}</a>`).join('');document.querySelector('.desktop-nav').innerHTML=links;document.querySelector('.mobile-menu nav').innerHTML=links}if(Array.isArray(settings.capabilitiesConfig)&&settings.capabilitiesConfig.length){const rows=settings.capabilitiesConfig.filter(x=>x.enabled!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));document.querySelector('.services-list').innerHTML=rows.map((x,i)=>`<article class="service-row reveal"><span>${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.description||'')}</p></div><b>${escapeHtml(x.primary?'PRIMARY':x.label||'CAPABILITY')}</b></article>`).join('')}const about=settings.aboutConfig||{};if(about.heading)document.querySelector('#about h2').textContent=about.heading;if(about.shortIntro)document.querySelector('.about-lead').textContent=about.shortIntro;if(about.longBio)document.querySelector('.about-copy p').textContent=about.longBio;const amazon=settings.amazonConfig||{};if(amazon.copy)document.querySelector('.amazon-intro p').textContent=amazon.copy;const footer=settings.footerConfig||{};if(footer.availability)document.querySelector('#availabilityLabel').textContent=footer.availability;if(Array.isArray(settings.socialLinks)&&settings.socialLinks.length){const target=document.querySelector('#contact footer');const social=document.createElement('span');social.className='footer-socials';social.innerHTML=settings.socialLinks.filter(x=>x.visible!==false).map(x=>`<a href="${escapeHtml(x.url)}" target="_blank" rel="noreferrer">${escapeHtml(x.label)}</a>`).join(' · ');target?.prepend(social)}}catch(error){console.warn('Structured site content unavailable.',error)}}
async function loadHomepageLayout(){try{const response=await fetch('/api/public/homepage',{cache:'no-store'});if(!response.ok)return;const {sections=[]}=await response.json();if(!sections.length)return;const main=document.querySelector('main');if(!main)return;const map={hero:'.hero',brands:'.brand-strip',featured_slider:'#special',selected_work:'#work',amazon:'#amazon',statement:'.statement',capabilities:'#services',tools:'#skills',why_me:'#why-work',clients:'#testimonials',testimonials:'#testimonials',about:'#about',contact:'#contact'};const ordered=[];for(const section of sections){const el=main.querySelector(map[section.key]);if(!el)continue;el.hidden=section.enabled===false;if(section.label){const kicker=el.querySelector('.kicker');if(kicker){const number=(kicker.textContent.match(/^\s*\d+\s*\//)||[''])[0];kicker.textContent=number+section.label.toUpperCase()}}ordered.push(el)}for(const el of [...main.querySelectorAll(':scope > section')])if(!ordered.includes(el))ordered.push(el);const fragment=document.createDocumentFragment();ordered.forEach(el=>fragment.appendChild(el));main.appendChild(fragment)}catch(error){console.warn('Homepage configuration unavailable.',error)}}
async function loadShare(token){try{const r=await fetch('/api/public/share/'+encodeURIComponent(token),{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json();if(d.project){projects=[normalizeProject(d.project)];render();renderFeatured();openProject(d.project.id)}}catch{modalContent.innerHTML='<div class="modal-meta">CLIENT LINK</div><h2>Link unavailable.</h2><div class="modal-body"><div class="modal-block"><p>This private or unlisted project link is invalid or expired.</p></div></div>';modal.classList.add('open');modal.setAttribute('aria-hidden','false')}}
const clientToken=new URLSearchParams(location.search).get('client');const sharePath=location.pathname.startsWith('/share/');const shareToken=sharePath?location.pathname.split('/').filter(Boolean).pop():null;if(clientToken||shareToken){loadShare(clientToken||shareToken)}else{(async()=>{await authorizeDemoPreview();await Promise.allSettled([loadSiteExtras(),loadHomepageLayout(),loadStructuredModules()]);await loadPublicExperience();loadProductionContent()})();document.querySelector('#inquiryForm')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const msg=document.querySelector('#inquiryMsg');const data=Object.fromEntries(new FormData(form).entries());try{const r=await fetch('/api/public/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not send inquiry');msg.textContent=d.emailSent?'Thanks — your inquiry has been received. I’ll get back to you soon.':'Thanks — your inquiry has been saved. Email delivery is currently pending.';msg.classList.add('success');window.portfolioAnalytics?.track('inquiry_submit_success',{sourceContext:'contact'});form.reset()}catch(err){msg.textContent=err.message}})}
