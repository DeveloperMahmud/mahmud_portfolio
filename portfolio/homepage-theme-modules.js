(()=>{
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safe=value=>{const url=String(value||'').trim();return /^(?:https:\/\/|\/|#)/i.test(url)?url:'#'};
  const defaults=[{title:'Discover',description:'Understand the problem, audience and opportunity.',icon:'search'},{title:'Define',description:'Shape the brief, structure and creative direction.',icon:'pencil'},{title:'Design',description:'Build the visual system and key experiences.',icon:'code'},{title:'Refine',description:'Test, review and improve every important detail.',icon:'rocket'},{title:'Deliver',description:'Prepare clear files, guidance and a useful handoff.',icon:'chart'}];
  const processIcons={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',pencil:'<path d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16Z"/><path d="m14.8 6.4 3 3M4 20l4.2-1-3.2-3Z"/>',code:'<path d="m8.5 6-5 6 5 6M15.5 6l5 6-5 6M13.5 3 10.5 21"/>',rocket:'<path d="M14.5 5.5c2.4-2.4 5.2-2.3 6-2.2.1.8.2 3.6-2.2 6l-5.8 5.8-3.6-3.6Z"/><path d="m9 11-4.2.8-2 2 5.2 1.1M13.1 15l-1 4.2-2 2-1.1-5.2"/><circle cx="16" cy="8" r="1.5"/><path d="M6.5 18.5c-1.6.2-2.8 1.4-3 3 1.6-.2 2.8-1.4 3-3Z"/>',chart:'<path d="M4 20V10M10 20V5M16 20v-8M22 20V3M2 20h21"/><path d="m4 8 6-5 6 6 6-8"/>',check:'<path d="m4 12 5 5L20 6"/>'};
  function processIcon(item,index){const raw=String(item.icon||'').trim(),requested=raw.toLowerCase(),title=String(item.title||'').trim().toLowerCase(),aliases={'⌕':'search','✎':'pencil','◇':'code','↗':'rocket','✓':'chart'},fallback=['search','pencil','code','rocket','chart'][index]||'check',key=processIcons[requested]?requested:aliases[raw]||(!raw?(title.startsWith('discover')?'search':title.startsWith('define')?'pencil':title.startsWith('design')?'code':title.startsWith('refine')?'rocket':title.startsWith('deliver')?'chart':fallback):'');return processIcons[key]?`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${processIcons[key]}</svg>`:`<span>${esc(raw||String(index+1).padStart(2,'0'))}</span>`}
  let processObserver;
  function applyHero(config={}){
    const hero=document.querySelector('.hero');if(!hero)return;
    const requestedTheme=new URLSearchParams(location.search).get('hero-theme');
    const theme=String(requestedTheme||config.theme||'CINEMATIC').toUpperCase()==='PROFILE'?'profile':'cinematic';
    hero.style.setProperty('--profile-accent',/^#[0-9a-f]{6}$/i.test(config.accentColor||'')?config.accentColor:'#c6ff4c');
    hero.classList.toggle('hero-profile-preview',theme==='profile');hero.classList.toggle('hero-cinematic-preview',theme!=='profile');hero.hidden=config.enabled===false;
    const lead=config.leadText||config.namePrefix,phrase=config.phrases?.[0]||config.name;
    if(lead)hero.querySelector('.hero-title>span')?.replaceChildren(document.createTextNode(lead));
    if(phrase){const type=hero.querySelector('[data-typewriter]');if(type){type.textContent=phrase;type.dataset.texts=(config.phrases?.length?config.phrases:[phrase]).join(' || ')}}
    const image=hero.querySelector('.hero-visual img');if(image&&config.desktopImage){image.src=config.desktopImage;image.alt=config.alt||'';image.style.objectPosition=config.focalPoint||'50% 50%'}
    hero.querySelector('.profile-hero-extras')?.remove();
    if(theme!=='profile')return;
    const extras=document.createElement('div');extras.className='profile-hero-extras';
    const tags=Array.isArray(config.tags)?config.tags:['Amazon A+','Brand Design','Web Design','Motion'];
    const ticker=Array.isArray(config.ticker)?config.ticker:['Amazon Design','Brand Systems','Website Design','Creative Direction'];
    const socialItems=Array.isArray(config.socialItems)&&config.socialItems.length?config.socialItems:['BE','IN','DR'];
    extras.innerHTML=`${config.showAward===false?'':`<div class="profile-award">${esc(config.badge||'MULTIDISCIPLINARY CREATIVE DESIGNER')}</div>`}<p class="profile-role">${esc(config.role||'Creative designer based in Bangladesh')}</p>${config.showSpotlight===false?'':`<div class="profile-spotlight"><span>${esc(config.spotlightLabel||'AVAILABLE FOR SELECT PROJECTS')}</span><b>↘</b></div>`}${config.showSocial===false?'':`<div class="profile-social"><span>${esc(config.socialLabel||'FOLLOW MY WORK')}</span><b>${socialItems.map(esc).join(' · ')}</b></div>`}${config.showQuote===false?'':`<blockquote><span>“</span>${esc(config.quote||'Creative thinking with technical precision and commercial clarity.')}</blockquote>`}${config.showProof===false?'':`<div class="profile-proof"><strong>${esc(config.reviewCount||'50+')} ${esc(config.proofSuffix||'PROJECTS')}</strong><span>${esc(config.rating||'FOCUSED CREATIVE PARTNERSHIPS')}</span></div>`}${config.showTags===false||!tags.length?'':`<div class="profile-tags">${tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`}${config.showTicker===false||!ticker.length?'':`<div class="profile-ticker">${[...ticker,...ticker].map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`}`;
    hero.append(extras);
    const actions=hero.querySelectorAll('.actions a');if(actions[0]&&config.primaryCta){actions[0].textContent=config.primaryCta.label||'VIEW PORTFOLIO';actions[0].href=safe(config.primaryCta.url)}if(actions[1]&&config.secondaryCta){actions[1].textContent=config.secondaryCta.label||'HIRE ME';actions[1].href=safe(config.secondaryCta.url)}
  }
  function applyProcess(statement={}){
    const config=statement.process&&typeof statement.process==='object'?statement.process:statement,section=document.querySelector('#process');if(!section)return;
    section.hidden=config.enabled===false;document.querySelector('#processEyebrow').textContent=config.eyebrow||'04 / MY PROCESS';document.querySelector('#processTitle').innerHTML=esc(config.heading||'From first question to final delivery.');document.querySelector('#processIntro').textContent=config.intro||'A clear, collaborative process that keeps every stage focused and easy to follow.';
    const items=(Array.isArray(config.items)&&config.items.length?config.items:defaults).filter(item=>item.enabled!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
    const track=document.querySelector('#processTrack');
    track.innerHTML=`<svg class="process-connector" viewBox="0 0 1000 140" preserveAspectRatio="none" aria-hidden="true"><path class="process-connector-base" d="M90 70 C170 35 230 105 300 70 S430 35 500 70 S630 105 700 70 S830 35 910 70"/><path class="process-connector-trace" d="M90 70 C170 35 230 105 300 70 S430 35 500 70 S630 105 700 70 S830 35 910 70"/></svg>${items.map((item,index)=>`<article class="process-step" style="--step-index:${index};--step-delay:${(0.12+index*0.12).toFixed(2)}s"><div class="process-icon">${processIcon(item,index)}</div><div class="process-copy"><b>${String(index+1).padStart(2,'0')}</b><h3>${esc(item.title||'Process step')}</h3><p>${esc(item.description||'')}</p></div></article>`).join('')}`;
    section.classList.remove('is-process-visible');processObserver?.disconnect();
    if(!('IntersectionObserver' in window)){section.classList.add('is-process-visible');return}
    processObserver=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;section.classList.add('is-process-visible');processObserver.disconnect()},{threshold:.28});processObserver.observe(section);
  }
  async function load(){try{const response=await fetch('/api/public/settings',{cache:'no-store'});if(!response.ok){applyProcess({});return}const {settings={}}=await response.json();applyHero(settings.heroConfig||{});applyProcess(settings.statementConfig||{})}catch{applyProcess({})}}
  const start=()=>{load();window.setTimeout(load,500)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
