(()=>{
  'use strict';
  const grid=document.querySelector('#labGrid'),summary=document.querySelector('#labSummary'),counts=document.querySelector('#labCounts'),search=document.querySelector('#labSearch'),status=document.querySelector('#labStatus'),buttons=[...document.querySelectorAll('[data-kind]')];
  if(!grid||!window.CreativeLabUI)return;
  let kind='',timer=0,request=0;

  const setBusy=value=>{grid.setAttribute('aria-busy',String(value));};
  function params(){const query=new URLSearchParams();if(kind)query.set('kind',kind);if(search?.value.trim())query.set('q',search.value.trim());if(status?.value)query.set('status',status.value);return query.toString();}
  function updateUrl(){const query=params();history.replaceState(null,'',query?`/creative-lab?${query}`:'/creative-lab');}
  function render(data){
    const tools=Array.isArray(data.tools)?data.tools:[];
    counts.innerHTML=`<span>${Number(data.counts?.total||0)} TOOLS</span><span>${Number(data.counts?.flagship||0)} FLAGSHIP</span><span>${Number(data.counts?.mini||0)} MINI</span>`;
    summary.textContent=`Showing ${tools.length} ${tools.length===1?'tool':'tools'}${kind?` · ${kind.toLowerCase()}`:''}${status?.value?` · ${status.value.toLowerCase()}`:''}`;
    grid.innerHTML=tools.length?tools.map(window.CreativeLabUI.renderToolCard).join(''):window.CreativeLabUI.renderEmptyState('Try a different search, type or status.');
    grid.querySelector('[data-lab-reset]')?.addEventListener('click',reset);
  }
  function fail(){summary.textContent='Creative Lab could not be loaded.';grid.innerHTML=window.CreativeLabUI.renderEmptyState('Please refresh the page or return later.');grid.querySelector('[data-lab-reset]')?.addEventListener('click',load);}
  async function load(){
    const id=++request;setBusy(true);updateUrl();
    try{const response=await fetch(`/api/public/creative-lab${params()?`?${params()}`:''}`,{headers:{accept:'application/json'}}),data=await response.json();if(!response.ok)throw new Error(data.error||'Request failed');if(id===request)render(data)}catch{if(id===request)fail()}finally{if(id===request)setBusy(false)}
  }
  function reset(){kind='';if(search)search.value='';if(status)status.value='';buttons.forEach(button=>button.setAttribute('aria-pressed',String(!button.dataset.kind)));load()}
  buttons.forEach(button=>button.addEventListener('click',()=>{kind=button.dataset.kind||'';buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));load()}));
  search?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(load,220)});status?.addEventListener('change',load);
  const initial=new URLSearchParams(location.search),initialKind=initial.get('kind');if(['FLAGSHIP','MINI'].includes(initialKind||'')){kind=initialKind;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.kind===kind)))}if(search)search.value=initial.get('q')||'';if(status&&['PLANNED','PREVIEW','BETA','LIVE'].includes(initial.get('status')||''))status.value=initial.get('status');
  load();
})();
