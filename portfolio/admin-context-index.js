(()=>{
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const visible=node=>Boolean(node&&node.offsetParent!==null&&!node.closest('.hidden'));
  const slug=value=>String(value||'section').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,56)||'section';
  const clean=value=>String(value||'').replace(/\s+/g,' ').replace(/[.]+$/,'').trim();
  let activeRoot=null,targets=[],scrollFrame=0,refreshTimer=0;

  function ensureRail(){
    const shell=$('.admin-shell');if(!shell)return null;
    let rail=$('#adminContextRail');
    if(!rail){
      rail=document.createElement('aside');
      rail.id='adminContextRail';rail.className='admin-context-rail';rail.setAttribute('aria-label','Page contents');
      rail.innerHTML='<div class="admin-context-card"><header><span>ON THIS PAGE</span><strong id="adminContextTitle">QUICK NAVIGATION</strong><small>Jump directly to a settings group.</small></header><nav id="adminContextNav"></nav><button type="button" class="admin-context-top" id="adminContextTop">BACK TO TOP ↑</button></div>';
      shell.appendChild(rail);shell.classList.add('has-context-rail');
      $('#adminContextTop',rail).addEventListener('click',()=>$('.admin-main')?.scrollTo({top:0,behavior:'smooth'}));
    }
    return rail;
  }

  function currentRoot(){
    const main=$('.admin-main');if(!main)return null;
    const page=[...main.children].find(node=>/Tab$/.test(node.id||'')&&!node.classList.contains('hidden')&&visible(node));
    if(!page)return null;
    if(page.id==='maintenanceTab')return $('.maintenance-panel:not(.hidden)',page)||page;
    return page;
  }

  function candidateHeadings(root){
    const selector=':scope > .panel h2, :scope > .admin-grid > .panel h2, .hero-theme-manager h3, .services-manager h3, .process-manager h3, .editorial-admin-panel h2, .settings-card h3, fieldset > legend, .panel-heading-row h2';
    const seen=new Set();
    return [...root.querySelectorAll(selector)].filter(node=>{
      if(!visible(node))return false;
      const label=clean(node.textContent);if(!label||seen.has(label))return false;
      seen.add(label);return true;
    }).slice(0,18);
  }

  function pageTitle(root){
    return clean(root.querySelector(':scope > .panel .panel-heading-row h2, :scope > .panel h2, :scope h1, :scope h2')?.textContent||root.id.replace(/Tab$/,''))||'CURRENT PAGE';
  }

  function setActive(id){
    document.querySelectorAll('#adminContextNav button').forEach(button=>button.classList.toggle('active',button.dataset.target===id));
  }

  function updateActive(){
    scrollFrame=0;if(!targets.length)return;
    const main=$('.admin-main'),mainTop=main?.getBoundingClientRect().top||0;
    let current=targets[0];
    for(const item of targets){if(item.node.getBoundingClientRect().top-mainTop<=115)current=item;else break}
    setActive(current.id);
  }

  function build(){
    const rail=ensureRail(),root=currentRoot(),nav=$('#adminContextNav');if(!rail||!root||!nav)return;
    activeRoot=root;
    const headings=candidateHeadings(root);
    targets=headings.map((node,index)=>{
      if(!node.id)node.id=`admin-section-${slug(node.textContent)}-${index+1}`;
      node.classList.add('admin-context-anchor');
      return {node,id:node.id,label:clean(node.textContent),index};
    });
    $('#adminContextTitle').textContent=pageTitle(root).toUpperCase();
    nav.innerHTML=targets.map(item=>`<button type="button" data-target="${item.id}"><span>${String(item.index+1).padStart(2,'0')}</span><strong>${item.label}</strong></button>`).join('');
    nav.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      const target=document.getElementById(button.dataset.target);if(!target)return;
      target.scrollIntoView({behavior:'smooth',block:'start'});setActive(button.dataset.target);
    }));
    rail.classList.toggle('is-empty',targets.length<2);updateActive();
  }

  function schedule(delay=60){clearTimeout(refreshTimer);refreshTimer=setTimeout(build,delay)}
  document.addEventListener('click',event=>{if(event.target.closest('.side-btn,.maintenance-subtab,[data-home-editor],[data-quick]'))schedule(140)});
  document.addEventListener('admin:siteconfigloaded',()=>schedule(180));
  function init(){
    ensureRail();schedule(250);
    const main=$('.admin-main');main?.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateActive)},{passive:true});
    const observer=new MutationObserver(records=>{if(records.some(record=>!record.target.closest?.('#adminContextRail')&&(record.type==='childList'||record.attributeName==='class')))schedule(120)});
    observer.observe($('#cms')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
