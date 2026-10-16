(()=>{'use strict';
  if(window.__portfolioAnchorRuntime)return;window.__portfolioAnchorRuntime=true;
  const decode=value=>{try{return decodeURIComponent(value)}catch{return value}};
  function target(){const id=decode(location.hash.slice(1));return id?document.getElementById(id):null}
  function align(behavior='auto'){
    const node=target();if(!node||node.hidden)return;
    const header=document.querySelector('.header'),banner=document.querySelector('.demo-preview-banner');
    const offset=(header?.getBoundingClientRect().height||0)+(banner?.getBoundingClientRect().height||0)+16;
    const top=Math.max(0,node.getBoundingClientRect().top+scrollY-offset);
    if(Math.abs(scrollY-top)>3)scrollTo({top,behavior});
  }
  function schedule(behavior='auto'){requestAnimationFrame(()=>align(behavior));setTimeout(()=>align(behavior),120);setTimeout(()=>align('auto'),650)}
  addEventListener('hashchange',()=>schedule('smooth'));
  addEventListener('load',()=>{if(location.hash)schedule()});
  document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link&&link.getAttribute('href').length>1)setTimeout(()=>schedule('smooth'))});
  ['homepage:base-ready','homepage-studio:applied','portfolio:content-ready'].forEach(name=>document.addEventListener(name,()=>location.hash&&schedule()));
  if(location.hash){let changes=0;const observer=new MutationObserver(()=>{if(++changes<12)schedule();else observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),3500)}
})();
