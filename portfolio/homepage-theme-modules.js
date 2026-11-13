(()=>{
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safe=value=>{const url=String(value||'').trim();return /^(?:https:\/\/|\/|#)/i.test(url)?url:'#'};
  const defaults=[{title:'Discover',description:'Understand the problem, audience and opportunity.',icon:'⌕'},{title:'Define',description:'Shape the brief, structure and creative direction.',icon:'✎'},{title:'Design',description:'Build the visual system and key experiences.',icon:'◇'},{title:'Refine',description:'Test, review and improve every important detail.',icon:'↗'},{title:'Deliver',description:'Prepare clear files, guidance and a useful handoff.',icon:'✓'}];
  function applyHero(config={}){
    const hero=document.querySelector('.hero');if(!hero)return;
    const theme=String(config.theme||'CINEMATIC').toUpperCase()==='PROFILE'?'profile':'cinematic';
    hero.classList.toggle('hero-profile-preview',theme==='profile');hero.classList.toggle('hero-cinematic-preview',theme!=='profile');hero.hidden=config.enabled===false;
    const lead=config.leadText||config.namePrefix,phrase=config.phrases?.[0]||config.name;
    if(lead)hero.querySelector('.hero-title>span')?.replaceChildren(document.createTextNode(lead));
    if(phrase){const type=hero.querySelector('[data-typewriter]');if(type){type.textContent=phrase;type.dataset.texts=(config.phrases?.length?config.phrases:[phrase]).join(' || ')}}
    const image=hero.querySelector('.hero-visual img');if(image&&config.desktopImage){image.src=config.desktopImage;image.alt=config.alt||'';image.style.objectPosition=config.focalPoint||'50% 50%'}
    hero.querySelector('.profile-hero-extras')?.remove();
    if(theme!=='profile')return;
    const extras=document.createElement('div');extras.className='profile-hero-extras';
    const tags=Array.isArray(config.tags)?config.tags:[],ticker=Array.isArray(config.ticker)?config.ticker:tags;
    extras.innerHTML=`<div class="profile-award">${esc(config.badge||'MULTIDISCIPLINARY CREATIVE DESIGNER')}</div><p class="profile-role">${esc(config.role||'Creative designer based in Bangladesh')}</p><div class="profile-social"><span>${esc(config.socialLabel||'FOLLOW MY WORK')}</span><b>BE · IN · DR</b></div><blockquote><span>“</span>${esc(config.quote||'Creative thinking with technical precision and commercial clarity.')}</blockquote><div class="profile-proof"><strong>${esc(config.reviewCount||'50+')} PROJECTS</strong><span>${esc(config.rating||'FOCUSED CREATIVE PARTNERSHIPS')}</span></div>${tags.length?`<div class="profile-tags">${tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`:''}${ticker.length?`<div class="profile-ticker">${[...ticker,...ticker].map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`:''}`;
    hero.append(extras);
    const actions=hero.querySelectorAll('.actions a');if(actions[0]&&config.primaryCta){actions[0].textContent=config.primaryCta.label||'VIEW PORTFOLIO';actions[0].href=safe(config.primaryCta.url)}if(actions[1]&&config.secondaryCta){actions[1].textContent=config.secondaryCta.label||'HIRE ME';actions[1].href=safe(config.secondaryCta.url)}
  }
  function applyProcess(statement={}){
    const config=statement.process&&typeof statement.process==='object'?statement.process:statement,section=document.querySelector('#process');if(!section)return;
    section.hidden=config.enabled===false;document.querySelector('#processEyebrow').textContent=config.eyebrow||'04 / MY PROCESS';document.querySelector('#processTitle').innerHTML=esc(config.heading||'From first question to final delivery.');document.querySelector('#processIntro').textContent=config.intro||'A clear, collaborative process that keeps every stage focused and easy to follow.';
    const items=(Array.isArray(config.items)&&config.items.length?config.items:defaults).filter(item=>item.enabled!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
    document.querySelector('#processTrack').innerHTML=items.map((item,index)=>`<article class="process-step reveal"><div class="process-icon">${esc(item.icon||String(index+1).padStart(2,'0'))}</div><span>${String(index+1).padStart(2,'0')}</span><h3>${esc(item.title||'Process step')}</h3><p>${esc(item.description||'')}</p></article>`).join('');
  }
  async function load(){try{const response=await fetch('/api/public/settings',{cache:'no-store'});if(!response.ok){applyProcess({});return}const {settings={}}=await response.json();applyHero(settings.heroConfig||{});applyProcess(settings.statementConfig||{})}catch{applyProcess({})}}
  const start=()=>{load();window.setTimeout(load,500)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
