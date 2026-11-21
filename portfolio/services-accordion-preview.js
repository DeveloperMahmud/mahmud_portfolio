(()=>{
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeHref=value=>{const href=String(value||'').trim();return /^(?:https:\/\/|\/|#)/i.test(href)?href:''};
  const tagsFor=item=>{
    const source=Array.isArray(item.tags)?item.tags:Array.isArray(item.items)?item.items:Array.isArray(item.services)?item.services:[];
    return source.map(value=>typeof value==='string'?value:value?.label||value?.title).filter(Boolean).slice(0,8);
  };
  const normalize=(item,index)=>({...item,title:String(item?.title||item?.name||`Service ${index+1}`).trim(),description:String(item?.description||item?.text||'').trim(),sortOrder:Number(item?.sortOrder??index)});
  function markup(items){
    const rows=(Array.isArray(items)?items:[]).map(normalize).filter(item=>item.enabled!==false).sort((a,b)=>a.sortOrder-b.sortOrder);
    const preferred=rows.findIndex(item=>item.primary===true),openIndex=preferred>=0?preferred:0;
    return rows.map((item,index)=>{
      const open=index===openIndex,tags=tagsFor(item),href=safeHref(item.url),panelId=`service-panel-${index+1}`;
      return `<article class="service-accordion-item reveal${open?' is-open':''}" data-service-item><button class="service-accordion-trigger" type="button" aria-expanded="${open}" aria-controls="${panelId}"><span class="service-index">${String(index+1).padStart(2,'0')}</span><span class="service-title">${esc(item.title)}</span><span class="service-toggle" aria-hidden="true">↗</span></button><div class="service-accordion-panel" id="${panelId}" role="region" aria-label="${esc(item.title)}" ${open?'':'hidden'}><div class="service-accordion-content">${tags.length?`<div class="service-tags">${tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div>`:''}${item.description?`<p>${esc(item.description)}</p>`:''}${href?`<a href="${esc(href)}">${esc(item.ctaLabel||'VIEW RELATED WORK')} <span aria-hidden="true">↗</span></a>`:''}</div></div></article>`;
    }).join('');
  }
  function bind(root){
    root.querySelectorAll('[data-service-item]').forEach(item=>{
      const trigger=item.querySelector('.service-accordion-trigger'),panel=item.querySelector('.service-accordion-panel');
      if(!trigger||!panel)return;
      trigger.addEventListener('click',()=>{
        const shouldOpen=!item.classList.contains('is-open');
        root.querySelectorAll('[data-service-item]').forEach(other=>{
          const isTarget=other===item&&shouldOpen;
          other.classList.toggle('is-open',isTarget);
          other.querySelector('.service-accordion-trigger')?.setAttribute('aria-expanded',String(isTarget));
          const otherPanel=other.querySelector('.service-accordion-panel');if(otherPanel)otherPanel.hidden=!isTarget;
        });
      });
    });
  }
  function render(items){const root=document.querySelector('.services-list');if(!root)return;root.classList.add('services-accordion');root.innerHTML=markup(items);bind(root)}
  function upgradeFallback(){
    const root=document.querySelector('.services-list');if(!root||root.dataset.accordionRendering==='true'||root.querySelector('[data-service-item]'))return;
    const source=[...root.querySelectorAll('.service-row')];if(!source.length)return;
    const items=source.map((row,index)=>({title:row.querySelector('h3')?.textContent,description:row.querySelector('p')?.textContent,label:row.querySelector('b')?.textContent,primary:index===0,sortOrder:index}));
    root.dataset.accordionRendering='true';render(items);delete root.dataset.accordionRendering;
  }
  window.renderServiceAccordion=render;
  const start=()=>{upgradeFallback();const root=document.querySelector('.services-list');if(root)new MutationObserver(upgradeFallback).observe(root,{childList:true})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
