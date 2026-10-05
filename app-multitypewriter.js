// Hero typewriter — repeats only while the headline is visible.
(function initHeroTypewriter(){
  const el=document.querySelector('[data-typewriter]');
  const caret=document.querySelector('.type-caret');
  if(!el) return;
  const text=el.getAttribute('data-text') || el.textContent.trim();
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ el.textContent=text; return; }
  let timer=null, active=false, cycle=0;
  const clear=()=>{ if(timer){clearTimeout(timer);timer=null;} };
  const typeLoop=()=>{
    if(!active) return;
    const myCycle=++cycle;
    let i=0;
    const type=()=>{
      if(!active || myCycle!==cycle) return;
      el.textContent=text.slice(0,i++);
      if(i<=text.length){ timer=setTimeout(type,42+Math.random()*35); }
      else { timer=setTimeout(erase,2400); }
    };
    const erase=()=>{
      if(!active || myCycle!==cycle) return;
      let i=text.length;
      const back=()=>{
        if(!active || myCycle!==cycle) return;
        el.textContent=text.slice(0,Math.max(0,--i));
        if(i>0) timer=setTimeout(back,25);
        else timer=setTimeout(typeLoop,650);
      };
      back();
    };
    clear();
    timer=setTimeout(type,220);
  };
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.some(e=>e.isIntersecting);
    if(visible && !active){ active=true; typeLoop(); }
    if(!visible && active){ active=false; cycle++; clear(); el.textContent=''; if(caret) caret.classList.remove('settled'); }
  },{threshold:.35});
  observer.observe(el);
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

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const grid=$('#grid'),filters=$('#filters'),modal=$('#modal'),modalContent=$('#modal-content');
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m))}
function normalizeProject(p){
  const category=(p.category||'').toLowerCase();
  const cat=category.includes('amazon')?'amazon':category.includes('brand')?'branding':category.includes('web')?'web':category.includes('motion')?'motion':category.includes('engine')?'engineering':p.cat||'all';
  return {...p,sliderEnabled:p.sliderEnabled!==false,sliderTransition:p.sliderTransition||'AUTO',cat,img:p.coverImage||p.img||'assets/amazon-01.svg',year:p.year||'',type:p.type||'PROJECT',desc:p.description??p.desc??'',deliverables:Array.isArray(p.deliverables)?p.deliverables.join(' · '):p.deliverables||'',tools:Array.isArray(p.tools)?p.tools.join(' · '):p.tools||''};
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

async function loadSiteExtras(){try{const [s,t]=await Promise.all([fetch('/api/public/settings',{cache:'no-store'}),fetch('/api/public/testimonials',{cache:'no-store'})]);if(s.ok){const d=await s.json();const x=d.settings||{};sliderConfig={...DEFAULT_SLIDER_SETTINGS,...(x.sliderConfig||{})};renderSkills(x.skillsConfig||[]);if(x.email){const a=document.querySelector('.contact-link');if(a&&a.tagName==='A'){a.href='mailto:'+x.email;a.textContent=x.email+' ↗'}}if(x.availabilityLabel)document.querySelector('#availabilityLabel')?.replaceChildren(document.createTextNode(x.availability?x.availabilityLabel:'CURRENTLY BOOKED'));if(x.siteName)document.title=x.siteName+' — '+(x.title||'Creative Designer')}if(t.ok){const d=await t.json();const root=document.querySelector('#testimonialPublic');if(root)root.innerHTML=(d.testimonials||[]).map(x=>`<article class="testimonial-card reveal"><blockquote>“${escapeHtml(x.quote)}”</blockquote><small>${escapeHtml(x.client)}${x.company?' · '+escapeHtml(x.company):''}${x.role?' · '+escapeHtml(x.role):''}</small></article>`).join('')||'<p class="empty">Client notes will appear here.</p>'}}catch(e){console.warn('Site extras unavailable',e)}}
async function loadProductionContent(){
  try{
    const [pr,br]=await Promise.all([fetch('/api/public/projects',{credentials:'same-origin',cache:'no-store'}),fetch('/api/public/brands',{credentials:'same-origin',cache:'no-store'})]);
    if(!pr.ok)throw new Error('Public projects request failed');
    const pd=await pr.json(); const bd=br.ok?await br.json():{brands:[]};
    projects=(Array.isArray(pd.projects)?pd.projects.map(normalizeProject):[]);
    const realIds=new Set(projects.map(p=>p.id));
    projects=[...demoProjects.filter(p=>!realIds.has(p.id)).map(normalizeProject),...projects];
    brands=Array.isArray(bd.brands)?bd.brands:[];
    render();renderFeatured();renderBrands();openRouteProject();
  }catch(e){
    console.warn('Production content unavailable.',e);projects=[];brands=[];render();renderFeatured();renderBrands();
  }
}
function render(active='all'){
  if(!filters||!grid)return;
  filters.innerHTML=Object.entries(labels).map(([k,v])=>`<button class="filter ${k===active?'active':''}" data-k="${k}">${v}</button>`).join('');
  $$('.filter').forEach(b=>b.onclick=()=>render(b.dataset.k));
  const list=projects.filter(p=>active==='all'||p.cat===active||p.service===active);
  grid.innerHTML=list.length?list.map(p=>`<article class="project-card" data-id="${escapeHtml(p.id)}"><div class="project-media-wrap">${p.demo?'<span class="demo-image-badge">DEMO PROJECT</span>':''}<img class="project-image" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" loading="lazy"></div><div class="project-info"><div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.type)} · ${escapeHtml(p.year)}</p></div><span class="tag">${p.demo?'DEMO · ':''}${escapeHtml(p.cat.toUpperCase())} ↗</span></div></article>`).join(''):'<p class="empty">No published projects in this category yet.</p>';
  $$('.project-card').forEach(c=>c.onclick=()=>openProject(c.dataset.id));
}
function openProject(id){
  const p=projects.find(x=>x.id===id); if(!p)return;
  const gallery=Array.isArray(p.gallery)?p.gallery:[];
  const galleryHtml=gallery.length?`<div class="gallery-slider" data-gallery='${escapeHtml(JSON.stringify(gallery.map(g=>({url:g.url||g,alt:g.alt||p.title})) ))}'><div class="gallery-track">${gallery.map((g,i)=>`<div class="gallery-slide ${i===0?'active':''}"><img src="${escapeHtml(g.url||g)}" alt="${escapeHtml(g.alt||p.title)}" loading="${i===0?'eager':'lazy'}"></div>`).join('')}</div><div class="gallery-controls"><span class="gallery-count">01 / ${String(gallery.length).padStart(2,'0')}</span><button type="button" class="gallery-prev" aria-label="Previous image">←</button><button type="button" class="gallery-next" aria-label="Next image">→</button></div></div>`:'';
  modalContent.innerHTML=`<div class="modal-meta">${escapeHtml(p.cat.toUpperCase())} / ${escapeHtml(p.type)} / ${escapeHtml(p.year)}</div><h2>${escapeHtml(p.title)}</h2><img class="modal-hero" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}">${galleryHtml}<div class="modal-body"><div class="modal-block"><h3>OVERVIEW</h3><p>${escapeHtml(p.desc)}</p></div><div class="modal-block"><h3>CHALLENGE</h3><p>${escapeHtml(p.challenge)}</p></div><div class="modal-block"><h3>APPROACH</h3><p>${escapeHtml(p.approach)}</p></div><div class="modal-block"><h3>PROCESS</h3><p>${escapeHtml(p.process||'Discovery → direction → design → final delivery')}</p></div><div class="modal-block modal-deliverables"><h3>DELIVERABLES</h3><p>${escapeHtml(p.deliverables)}${p.tools?`<br><br><strong>TOOLS</strong> · ${escapeHtml(p.tools)}`:''}</p>${p.liveUrl?`<a class="modal-live" href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noreferrer">OPEN LIVE PROJECT ↗</a>`:''}</div></div>`;
  const gs=modalContent.querySelector('.gallery-slider');
  if(gs){const slides=[...gs.querySelectorAll('.gallery-slide')];let gi=0,gbusy=false;const gc=gs.querySelector('.gallery-count');const update=()=>{if(gc)gc.textContent=`${String(gi+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`};const go=(dir)=>{if(gbusy||slides.length<2)return;gbusy=true;const ni=(gi+dir+slides.length)%slides.length;const motion=galleryMotionNames[Math.floor(Math.random()*galleryMotionNames.length)];const target=slides[ni];target.className=`gallery-slide ${motion}`;requestAnimationFrame(()=>target.classList.add('active'));setTimeout(()=>{slides[gi].className='gallery-slide';target.className='gallery-slide active';gi=ni;update();gbusy=false},780)};gs.querySelector('.gallery-prev').onclick=()=>go(-1);gs.querySelector('.gallery-next').onclick=()=>go(1);let sx=0;gs.onpointerdown=e=>sx=e.clientX;gs.onpointerup=e=>{const dx=e.clientX-sx;if(Math.abs(dx)>45)go(dx<0?1:-1)};update()}
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}
function openRouteProject(){
  const parts=location.pathname.split('/').filter(Boolean);
  if(parts[0]==='work'&&parts[1]){const p=projects.find(x=>x.slug===decodeURIComponent(parts[1]));if(p)openProject(p.id)}
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
$('#close').onclick=closeModal;modal.onclick=e=>{if(e.target===modal)closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$$('[data-filter]').forEach(b=>b.onclick=()=>{render(b.dataset.filter);document.querySelector('#work').scrollIntoView({behavior:'smooth'})});
$('#year').textContent=new Date().getFullYear();
const cursor=$('.cursor');
if(cursor&&matchMedia('(pointer:fine)').matches){
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY},{passive:true});
  (function loop(){x+=(tx-x)*.18;y+=(ty-y)*.18;cursor.style.left=x+'px';cursor.style.top=y+'px';requestAnimationFrame(loop)})();
  document.addEventListener('mouseover',e=>{const el=e.target.closest('a,button,.project-card,.amazon-row,.filter,.magnetic');if(!el)return;cursor.classList.add('hover');cursor.querySelector('span').textContent=el.classList.contains('project-card')?'VIEW':'↗'});
  document.addEventListener('mouseout',e=>{const from=e.target.closest('a,button,.project-card,.amazon-row,.filter,.magnetic');if(from&&!from.contains(e.relatedTarget))cursor.classList.remove('hover')});
}
const progress=$('.progress'),header=$('#header');
function scrollUI(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+'%';header.classList.toggle('scrolled',scrollY>15)}
addEventListener('scroll',scrollUI,{passive:true});scrollUI();
let last=scrollY;addEventListener('scroll',()=>{if(innerWidth>800&&scrollY>last&&scrollY>180)header.classList.add('hidden');else header.classList.remove('hidden');last=scrollY},{passive:true});
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});$$('.reveal').forEach(e=>obs.observe(e));
if(matchMedia('(pointer:fine)').matches){
  $$('.magnetic').forEach(el=>{el.onpointermove=e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.1}px,${(e.clientY-r.top-r.height/2)*.1}px)`};el.onpointerleave=()=>el.style.transform=''});
  const frame=$('[data-parallax]'),img=frame?.querySelector('img');frame?.addEventListener('pointermove',e=>{const r=frame.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;if(img)img.style.transform=`scale(1.045) translate(${px*9}px,${py*7}px)`});frame?.addEventListener('pointerleave',()=>{if(img)img.style.transform='scale(1.025)'});
}
const menuBtn=$('.menu-toggle'),mobileMenu=$('.mobile-menu');menuBtn?.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open);mobileMenu.setAttribute('aria-hidden',!open)});$$('.mobile-menu a').forEach(a=>a.onclick=()=>{mobileMenu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');mobileMenu.setAttribute('aria-hidden','true')});

const motionNames=['t-mask','t-diagonal','t-split','t-curtain','t-zoom','t-slide'];
const galleryMotionNames=['g-mask','g-diagonal','g-zoom'];
const DEFAULT_SLIDER_SETTINGS={enabled:true,mode:'AUTO_MANUAL',interval:5,pauseHover:true,pauseHidden:true,loop:true,arrows:true,counter:true,progress:false,dots:false,keyboard:true,wheel:false,swipe:true,transitionMode:'RANDOM',fixedTransition:'MASK',duration:900,easing:'SMOOTH',preload:true,randomStart:false,drag:true,clickOpen:true,maxSlides:8,mobileAuto:true,mobileInterval:4,mobileArrows:false,mobileSwipe:true,reducedMotion:true,pauseOffscreen:true,lazy:true};
let sliderConfig={...DEFAULT_SLIDER_SETTINGS};
let featuredItems=[],featuredIndex=0,featuredBusy=false,lastMotion=-1,featuredTimer=null,featuredHover=false,featuredVisible=true;
function isMobileSlider(){return innerWidth<=800}
function sliderCanAuto(){if(!sliderConfig.enabled||sliderConfig.mode==='MANUAL')return false;if(isMobileSlider()&&!sliderConfig.mobileAuto)return false;if(sliderConfig.pauseHover&&featuredHover)return false;if(sliderConfig.pauseHidden&&document.hidden)return false;if(sliderConfig.pauseOffscreen&&!featuredVisible)return false;return true}
function restartFeaturedTimer(){if(featuredTimer){clearInterval(featuredTimer);featuredTimer=null}if(!sliderCanAuto()||featuredItems.length<2)return;const ms=(isMobileSlider()?sliderConfig.mobileInterval:sliderConfig.interval)*1000;featuredTimer=setInterval(()=>{if(sliderCanAuto())goFeatured(1)},Math.max(1500,ms))}

function nextMotion(list){let i=Math.floor(Math.random()*list.length);if(list.length>1&&i===lastMotion)i=(i+1)%list.length;lastMotion=i;return list[i]}
function featuredPool(){return projects.filter(p=>p.featured&&p.sliderEnabled!==false).sort((a,b)=>(Number(a.sortOrder)||0)-(Number(b.sortOrder)||0)).slice(0,Math.max(1,Math.min(12,Number(sliderConfig.maxSlides)||8)))}
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
  root.innerHTML=featuredItems.map((p,i)=>`<article class="featured-slide ${i===featuredIndex?'active':''}" data-index="${i}"><div class="featured-slide-media"><img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.title)}" loading="${i===featuredIndex||!sliderConfig.lazy?'eager':'lazy'}"></div><div class="featured-slide-copy"><div><span class="num">${String(i+1).padStart(2,'0')} / ${p.demo?'DEMO · ':''}FEATURED</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc||'Selected project from the portfolio.')}</p></div><div><span class="meta">${escapeHtml(p.type)} · ${escapeHtml(p.year)} · ${escapeHtml((p.cat||'PROJECT').toUpperCase())}</span><br><a class="featured-slide-link" href="/work/${encodeURIComponent(p.slug)}" data-project-id="${escapeHtml(p.id)}">VIEW CASE STUDY ↗</a></div></div></article>`).join('');
  root.querySelectorAll('[data-project-id]').forEach(a=>a.onclick=e=>{e.preventDefault();const id=a.dataset.projectId;if(!sliderConfig.clickOpen)return;history.pushState({},'',`/work/${encodeURIComponent(featuredItems.find(x=>x.id===id)?.slug||'')}`);openProject(id)});
  let dots=root.querySelector('.slider-dots'); if(sliderConfig.dots){dots=document.createElement('div');dots.className='slider-dots';dots.innerHTML=featuredItems.map((_,i)=>`<button type="button" class="slider-dot ${i===featuredIndex?'active':''}" data-index="${i}" aria-label="Go to slide ${i+1}"></button>`).join('');root.appendChild(dots);dots.querySelectorAll('button').forEach(b=>b.onclick=()=>goFeatured(Number(b.dataset.index)-featuredIndex))}
  if(sliderConfig.progress){const bar=document.createElement('div');bar.className='slider-progress';bar.innerHTML='<span></span>';root.appendChild(bar)}
  updateFeaturedCount();restartFeaturedTimer();
}
function updateFeaturedCount(){const c=$('#featuredCount');if(c&&featuredItems.length)c.textContent=`${String(featuredIndex+1).padStart(2,'0')} / ${String(featuredItems.length).padStart(2,'0')}`;document.querySelectorAll('.slider-dot').forEach((d,i)=>d.classList.toggle('active',i===featuredIndex));const bar=document.querySelector('.slider-progress span');if(bar&&featuredItems.length)bar.style.width=((featuredIndex+1)/featuredItems.length*100)+'%'}
function goFeatured(dir){
  if(featuredBusy||featuredItems.length<2||!sliderConfig.enabled)return;let next=featuredIndex+dir;
  if(next<0||next>=featuredItems.length){if(!sliderConfig.loop){featuredBusy=false;restartFeaturedTimer();return}next=(next+featuredItems.length)%featuredItems.length}
  if(next===featuredIndex)return;featuredBusy=true;
  const slides=[...document.querySelectorAll('.featured-slide')];const current=slides[featuredIndex];const target=slides[next];const motion=transitionClass(featuredItems[next]);const duration=Math.max(300,Number(sliderConfig.duration)||900);const easeMap={SMOOTH:'cubic-bezier(.77,0,.18,1)',FAST:'cubic-bezier(.22,1,.36,1)',LINEAR:'linear'};target.style.animationDuration=duration+'ms';target.style.animationTimingFunction=easeMap[sliderConfig.easing]||easeMap.SMOOTH;target.className=`featured-slide ${motion}`;target.style.zIndex='3';current.style.zIndex='2';requestAnimationFrame(()=>target.classList.add('active'));
  window.setTimeout(()=>{current.className='featured-slide';target.className='featured-slide active';featuredIndex=next;updateFeaturedCount();featuredBusy=false;restartFeaturedTimer()},duration);
}
$('#featuredPrev')?.addEventListener('click',()=>goFeatured(-1));$('#featuredNext')?.addEventListener('click',()=>goFeatured(1));
$('#featuredSlider')?.addEventListener('keydown',e=>{if(!sliderConfig.keyboard)return;if(e.key==='ArrowLeft')goFeatured(-1);if(e.key==='ArrowRight')goFeatured(1)});
(function bindFeaturedInteractions(){const root=$('#featuredSlider');if(!root)return;let sx=0,sy=0,dragging=false;root.addEventListener('pointerenter',()=>{featuredHover=true;restartFeaturedTimer()});root.addEventListener('pointerleave',()=>{featuredHover=false;restartFeaturedTimer()});root.addEventListener('pointerdown',e=>{if(!sliderConfig.drag&&!sliderConfig.swipe)return;sx=e.clientX;sy=e.clientY;dragging=true});root.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)&&(sliderConfig.swipe||(isMobileSlider()&&sliderConfig.mobileSwipe)))goFeatured(dx<0?1:-1)});root.addEventListener('wheel',e=>{if(!sliderConfig.wheel)return;if(Math.abs(e.deltaY)<8)return;e.preventDefault();goFeatured(e.deltaY>0?1:-1)},{passive:false});const io=new IntersectionObserver(es=>{featuredVisible=es.some(e=>e.isIntersecting);restartFeaturedTimer()},{threshold:.1});io.observe(root)})();
document.addEventListener('visibilitychange',restartFeaturedTimer);addEventListener('resize',()=>{renderFeatured()});
async function loadShare(token){try{const r=await fetch('/api/public/share/'+encodeURIComponent(token),{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json();if(d.project){projects=[normalizeProject(d.project)];render();renderFeatured();openProject(d.project.id)}}catch{modalContent.innerHTML='<div class="modal-meta">CLIENT LINK</div><h2>Link unavailable.</h2><div class="modal-body"><div class="modal-block"><p>This private or unlisted project link is invalid or expired.</p></div></div>';modal.classList.add('open');modal.setAttribute('aria-hidden','false')}}
const clientToken=new URLSearchParams(location.search).get('client');const sharePath=location.pathname.startsWith('/share/');const shareToken=sharePath?location.pathname.split('/').filter(Boolean).pop():null;if(clientToken||shareToken){loadShare(clientToken||shareToken)}else{loadSiteExtras().finally(()=>loadProductionContent());document.querySelector('#inquiryForm')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const msg=document.querySelector('#inquiryMsg');const data=Object.fromEntries(new FormData(form).entries());try{const r=await fetch('/api/public/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not send inquiry');msg.textContent='Thanks — your inquiry has been received.';form.reset()}catch(err){msg.textContent=err.message}})}
