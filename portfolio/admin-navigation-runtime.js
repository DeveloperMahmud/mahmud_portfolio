(()=>{
  'use strict';
  const selector='.tab[data-tab]';
  function bind(root=document){
    root.querySelectorAll?.(selector).forEach(button=>{
      if(button.dataset.adminNavBound==='true')return;
      button.dataset.adminNavBound='true';
      button.addEventListener('click',event=>{
        if(button.disabled||button.hidden)return;
        event.preventDefault();
        window.openAdminTab?.(button.dataset.tab);
      });
    });
  }
  function start(){
    bind();
    const shell=document.querySelector('#cms')||document.body;
    new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes){
        if(!(node instanceof Element))continue;
        if(node.matches(selector))bind(node.parentElement||document);
        else if(node.querySelector(selector))bind(node);
      }
    }).observe(shell,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
