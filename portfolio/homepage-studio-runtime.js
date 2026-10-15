(()=>{'use strict';
const selectors={hero:['.hero'],brands:['.brand-strip'],featured_slider:['#special'],selected_work:['#work'],editorial_modules:['#editorialModules'],amazon:['#amazon'],capabilities:['#services'],tools:['#skills'],statement:['.statement'],about:['#about'],why_me:['#why-work'],clients:['#testimonials'],contact:['#contact']};
const officialOrigins=['https://www.youtube.com','https://youtube.com','https://www.youtube-nocookie.com','https://player.vimeo.com','https://www.figma.com'];
let applying=false,studioApplied=false,lastSocialTemplate=null,lastPayload=null;

function safeExternalUrl(value){try{let raw=String(value||'').trim();if(!raw)return'';if(!/^https?:\/\//i.test(raw))raw=`https://${raw.replace(/^\/+/, '')}`;const url=new URL(raw);return url.protocol==='https:'?url.href:''}catch{return''}}
function codeDocument(data={}){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'unsafe-inline'; font-src https: data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>html,body{margin:0;background:transparent;color:#f6f7f2;font-family:Arial,sans-serif}*{box-sizing:border-box}${String(data.css||'')}</style></head><body>${String(data.html||'')}</body></html>`}
function sectionNodes(key,main){return (selectors[key]||[]).flatMap(selector=>[...main.querySelectorAll(`:scope > ${selector}`)])}
function blockTitle(block){return String(block.data?.heading||block.data?.label||block.type.replaceAll('_',' '))}
function placeDefaultSocials(){const socials=document.querySelector('.public-socials:not(.homepage-studio-socials)'),about=document.querySelector('#about .about-copy');if(!socials)return;if(studioApplied){lastSocialTemplate=socials.cloneNode(true);document.querySelectorAll('.homepage-studio-socials').forEach(current=>{const replacement=lastSocialTemplate.cloneNode(true);replacement.classList.add('homepage-studio-socials');current.replaceWith(replacement)});socials.remove();return}if(about&&!about.contains(socials))about.appendChild(socials)}

function fallbackSocials(settings={}){
  const items=Array.isArray(settings.socialLinks)?settings.socialLinks:[],root=document.createElement('div');root.className='public-socials homepage-studio-socials';root.setAttribute('aria-label','Social profiles');
  items.filter(item=>item&&item.visible!==false).forEach(item=>{const url=safeExternalUrl(item.url);if(!url)return;const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noreferrer';const badge=document.createElement('span');badge.className='homepage-social-badge';badge.textContent=String(item.label||item.name||'S').trim().slice(0,1).toUpperCase();const label=document.createElement('span');label.textContent=String(item.label||item.name||'Social');link.append(badge,label);root.appendChild(link)});
  return root;
}

function renderDynamic(block,payload,depth=0){
  if(block.enabled===false)return null;const data=block.data||{};
  if(block.type==='SOCIAL_LINKS'){
    const wrap=document.createElement('div');wrap.className='homepage-studio-social-block';
    if(data.heading){const heading=document.createElement('h3');heading.textContent=String(data.heading);wrap.appendChild(heading)}
    const socials=lastSocialTemplate?.cloneNode(true)||fallbackSocials(payload.settings||{});socials.classList.add('homepage-studio-socials');wrap.appendChild(socials);return wrap;
  }
  if(block.type==='CUSTOM_CODE'){
    const wrap=document.createElement('div');wrap.className='homepage-studio-code';const frame=document.createElement('iframe');frame.title=blockTitle(block)||'Custom HTML and CSS';frame.sandbox='';frame.loading='lazy';frame.style.height=`${Math.max(120,Math.min(1200,Number(data.height)||320))}px`;frame.srcdoc=codeDocument(data);wrap.appendChild(frame);return wrap;
  }
  if(block.type==='WEBSITE_EMBED'){
    const wrap=document.createElement('div');wrap.className='homepage-studio-embed';const url=safeExternalUrl(data.url),allowed=new Set([...(payload.trustedOrigins||[]),...officialOrigins]);let origin='';try{origin=new URL(url).origin}catch{}
    if(url&&allowed.has(origin)){const frame=document.createElement('iframe');frame.src=url;frame.title=String(data.title||'Embedded website');frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';frame.sandbox='allow-scripts allow-same-origin allow-forms allow-popups';frame.allow='fullscreen; picture-in-picture';frame.style.height=`${Math.max(240,Math.min(1000,Number(data.height)||640))}px`;wrap.appendChild(frame);const link=document.createElement('a');link.className='homepage-studio-embed-link';link.href=url;link.target='_blank';link.rel='noopener';link.textContent=`${String(data.fallbackLabel||'OPEN WEBSITE')} ↗`;wrap.appendChild(link)}else{wrap.classList.add('is-unavailable');wrap.textContent='This website must be added to Trusted Embed Sources before it can be shown.'}
    return wrap;
  }
  if(block.type==='HOME_GROUP'){
    const group=document.createElement(depth===0?'section':'div');group.className='homepage-studio-group';group.dataset.homeStudioBlock=block.id;if(data.label){const heading=document.createElement('h2');heading.className='homepage-studio-group-title';heading.textContent=String(data.label);group.appendChild(heading)}const inner=document.createElement('div');inner.className=`homepage-studio-group-inner columns-${Math.max(1,Math.min(3,Number(data.columns)||1))}`;(block.children||[]).forEach(child=>{const node=renderDynamic(child,payload,depth+1);if(node)inner.appendChild(node)});group.appendChild(inner);return group;
  }
  return null;
}

function applyLayout(payload){
  if(applying||!payload?.layout?.blocks)return;applying=true;lastPayload=payload;
  try{
    const main=document.querySelector('main');if(!main)return;
    const currentSocial=document.querySelector('.public-socials:not(.homepage-studio-socials)')||document.querySelector('.public-socials');if(currentSocial)lastSocialTemplate=currentSocial.cloneNode(true);
    main.querySelectorAll('.homepage-studio-runtime-group').forEach(node=>node.remove());
    main.querySelectorAll('.homepage-studio-slot').forEach(node=>node.remove());
    document.querySelectorAll('.public-socials').forEach(node=>node.remove());
    const ordered=[],used=new Set();
    for(const block of payload.layout.blocks){
      if(block.type==='HOME_SECTION'){
        const key=String(block.data?.sectionKey||''),nodes=sectionNodes(key,main);if(!nodes.length)continue;
        nodes.forEach(node=>{node.hidden=block.enabled===false;ordered.push(node);used.add(node)});
        if(block.enabled!==false&&(block.children||[]).length){const anchor=nodes[0],target=key==='about'?(anchor.querySelector('.about-copy')||anchor):key==='contact'?(anchor.querySelector('.contact-inner')||anchor):anchor;const slot=document.createElement('div');slot.className=`homepage-studio-slot homepage-studio-slot-${key}`;slot.dataset.homeStudioParent=block.id;(block.children||[]).forEach(child=>{const childNode=renderDynamic(child,payload,1);if(childNode)slot.appendChild(childNode)});if(slot.childNodes.length)target.appendChild(slot)}
      }else{
        const node=renderDynamic(block,payload,0);if(node){node.classList.add('homepage-studio-runtime-group');ordered.push(node);used.add(node)}
      }
    }
    const fallback=[...main.children].filter(node=>node.matches('section')&&!used.has(node)&&!node.classList.contains('homepage-studio-runtime-group'));
    const contactIndex=ordered.findIndex(node=>node.id==='contact');if(contactIndex>=0)ordered.splice(contactIndex,0,...fallback);else ordered.push(...fallback);
    const fragment=document.createDocumentFragment();ordered.forEach(node=>fragment.appendChild(node));main.appendChild(fragment);
    studioApplied=true;document.body.classList.toggle('homepage-studio-live',payload.live!==false);
    document.dispatchEvent(new CustomEvent('homepage-studio:applied',{detail:{preview:Boolean(payload.preview),blocks:payload.layout.blocks.length}}));
  }finally{applying=false}
}

async function loadPublished(){try{const response=await fetch('/api/public/page-studio/homepage-layout',{cache:'no-store'});if(!response.ok)return;const payload=await response.json();if(payload.live&&payload.layout)applyLayout(payload)}catch(error){console.warn('Homepage Studio layout unavailable.',error)}}
function ready(){placeDefaultSocials();if(new URLSearchParams(location.search).get('homepage-studio-preview')==='1'){document.body.classList.add('homepage-studio-preview');parent.postMessage({type:'HOMEPAGE_STUDIO_READY'},location.origin);return}loadPublished()}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='HOMEPAGE_STUDIO_PREVIEW')return;applyLayout({...event.data.payload,preview:true,live:true})});
const socialObserver=new MutationObserver(()=>placeDefaultSocials());socialObserver.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('homepage:base-ready',ready,{once:true});
window.addEventListener('load',()=>setTimeout(()=>{if(!lastPayload)ready()},1200),{once:true});
window.HomepageStudioRuntime={applyLayout};
})();
