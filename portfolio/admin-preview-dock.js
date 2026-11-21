(()=>{
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const previews={
    hero:{source:'#heroThemePreview',manager:'.hero-theme-manager',label:'HERO LIVE'},
    process:{source:'#processManagerPreview',manager:'.process-manager',label:'PROCESS'},
    services:{source:'#serviceManagerPreview',manager:'.services-manager',label:'SERVICES'}
  };
  let active='',setupTimer=0,setupAttempts=0;
  const canvas=()=>$('#siteModulePreviewCanvas');

  function restore(type=active){
    const definition=previews[type],source=definition&&$(definition.source),home=definition&&$(`[data-preview-home="${type}"]`);
    if(source&&home?.parentNode)home.parentNode.insertBefore(source,home.nextSibling);
    if(type===active)active='';
  }
  function prepare(type){
    const definition=previews[type],source=$(definition.source);if(!source)return null;
    if(!$(`[data-preview-home="${type}"]`)){
      const marker=document.createElement('span');marker.hidden=true;marker.dataset.previewHome=type;source.parentNode.insertBefore(marker,source);
    }
    return source;
  }
  function setHeading(type){
    const head=$('.site-module-preview-head strong');
    if(head)head.textContent=type?`${previews[type].label} preview`:'See structured content before saving.';
  }
  function activate(type){
    const targetCanvas=canvas(),source=previews[type]&&prepare(type);if(!targetCanvas||!source)return;
    if(active&&active!==type)restore(active);
    if(source.parentNode!==targetCanvas){restore(type);targetCanvas.replaceChildren(source)}
    active=type;
    $$('[data-site-module-preview]').forEach(button=>button.classList.remove('active'));
    $$('[data-preview-dock]').forEach(button=>button.classList.toggle('active',button.dataset.previewDock===type));
    targetCanvas.dataset.previewMode=type;setHeading(type);
  }
  function releaseStructuredPreview(){
    if(active)restore(active);
    const targetCanvas=canvas();if(targetCanvas)delete targetCanvas.dataset.previewMode;
    $$('[data-preview-dock]').forEach(button=>button.classList.remove('active'));
    setHeading('');
  }
  function addTabs(){
    const tabs=$('.site-module-preview-tabs');if(!tabs)return false;
    $$('[data-site-module-preview]',tabs).forEach(button=>{
      if(button.dataset.previewDockGuard)return;
      button.dataset.previewDockGuard='true';button.addEventListener('mouseenter',releaseStructuredPreview,true);
    });
    Object.entries(previews).forEach(([type,definition])=>{
      if(tabs.querySelector(`[data-preview-dock="${type}"]`))return;
      const button=document.createElement('button');button.type='button';button.dataset.previewDock=type;button.textContent=definition.label;
      button.addEventListener('click',()=>activate(type));tabs.appendChild(button);
    });
    return true;
  }
  function managerType(node){return Object.entries(previews).find(([,definition])=>node?.closest?.(definition.manager))?.[0]||''}
  function setup(){if(!canvas()||!addTabs())return false;Object.keys(previews).forEach(prepare);return true}
  function schedule(delay=80){clearTimeout(setupTimer);setupTimer=setTimeout(()=>{if(setup()){setupAttempts=0;return}if(++setupAttempts<40)schedule(240)},delay)}

  document.addEventListener('pointerdown',event=>{
    if(event.target.closest?.('[data-site-module-preview]'))releaseStructuredPreview();
    const type=managerType(event.target);if(type)activate(type);
  },true);
  document.addEventListener('focusin',event=>{const type=managerType(event.target);if(type)activate(type)});
  document.addEventListener('input',event=>{const type=managerType(event.target);if(type&&active!==type)activate(type)});
  document.addEventListener('admin:contexttarget',event=>{const type=managerType(event.detail?.target);if(type)activate(type)});
  document.addEventListener('admin:siteconfigloaded',()=>schedule(180));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(220),{once:true});else schedule(220);
})();
