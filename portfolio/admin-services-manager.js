(()=>{
  'use strict';
  let rows=[],syncing=false;
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const field=()=>document.querySelector('#capabilitiesConfig');
  const normalize=(item,index)=>({...item,title:String(item?.title||item?.name||'Untitled service'),description:String(item?.description||item?.text||''),label:String(item?.label||''),url:String(item?.url||''),tags:Array.isArray(item?.tags)?item.tags:[],enabled:item?.enabled!==false,primary:item?.primary===true,sortOrder:index});
  function read(){try{const value=JSON.parse(field()?.value||'[]');rows=Array.isArray(value)?value.map(normalize):[]}catch{rows=[]}}
  function write(){const target=field();if(!target)return;rows.forEach((item,index)=>item.sortOrder=index);syncing=true;target.value=JSON.stringify(rows,null,2);target.dispatchEvent(new Event('input',{bubbles:true}));syncing=false}
  function renderPreview(){const root=document.querySelector('#serviceManagerPreview');if(!root)return;const active=rows.filter(item=>item.enabled!==false);root.innerHTML=active.slice(0,6).map((item,index)=>`<div class="${item.primary?'is-open':''}"><span>${String(index+1).padStart(2,'0')}</span><strong>${esc(item.title||'Untitled service')}</strong><i>↗</i>${item.primary?`<p>${esc(item.description||'Add a short service description.')}</p>`:''}</div>`).join('')||'<p>No visible services yet.</p>'}
  function render(){
    const list=document.querySelector('#serviceManagerList');if(!list)return;
    list.innerHTML=rows.map((item,index)=>`<article class="service-manager-card" data-service-index="${index}"><header><span>${String(index+1).padStart(2,'0')}</span><strong>${esc(item.title||'Untitled service')}</strong><div><button type="button" class="admin-btn" data-service-up="${index}" aria-label="Move service up">↑</button><button type="button" class="admin-btn" data-service-down="${index}" aria-label="Move service down">↓</button><button type="button" class="admin-btn danger" data-service-remove="${index}">REMOVE</button></div></header><div class="service-manager-fields"><label>SERVICE TITLE<input data-service-field="title" data-index="${index}" value="${esc(item.title)}"></label><label>SMALL LABEL<input data-service-field="label" data-index="${index}" value="${esc(item.label)}" placeholder="COMMERCE"></label><label class="wide">DESCRIPTION<textarea data-service-field="description" data-index="${index}">${esc(item.description)}</textarea></label><label class="wide">TAGS / SUB-SERVICES <small>Comma separated</small><input data-service-tags data-index="${index}" value="${esc(item.tags.join(', '))}" placeholder="A+ Content, Storefronts, Listing Images"></label><label>RELATED LINK<input data-service-field="url" data-index="${index}" value="${esc(item.url)}" placeholder="#work"></label><label class="service-manager-check"><input type="checkbox" data-service-enabled="${index}" ${item.enabled?'checked':''}><span>VISIBLE ON HOMEPAGE</span></label><label class="service-manager-check"><input type="radio" name="primaryService" data-service-primary="${index}" ${item.primary?'checked':''}><span>OPEN BY DEFAULT</span></label></div></article>`).join('')||'<div class="service-manager-empty"><strong>No services added.</strong><p>Use Add Service to create the first accordion row.</p></div>';
    list.querySelectorAll('[data-service-field]').forEach(input=>input.addEventListener('input',()=>{rows[Number(input.dataset.index)][input.dataset.serviceField]=input.value;write();renderPreview()}));
    list.querySelectorAll('[data-service-tags]').forEach(input=>input.addEventListener('input',()=>{rows[Number(input.dataset.index)].tags=input.value.split(',').map(value=>value.trim()).filter(Boolean);write();renderPreview()}));
    list.querySelectorAll('[data-service-enabled]').forEach(input=>input.addEventListener('change',()=>{rows[Number(input.dataset.serviceEnabled)].enabled=input.checked;write();renderPreview()}));
    list.querySelectorAll('[data-service-primary]').forEach(input=>input.addEventListener('change',()=>{rows.forEach((item,i)=>item.primary=i===Number(input.dataset.servicePrimary));write();render();renderPreview()}));
    list.querySelectorAll('[data-service-remove]').forEach(button=>button.addEventListener('click',()=>{rows.splice(Number(button.dataset.serviceRemove),1);write();render();renderPreview()}));
    const move=(from,to)=>{if(to<0||to>=rows.length)return;[rows[from],rows[to]]=[rows[to],rows[from]];write();render();renderPreview()};
    list.querySelectorAll('[data-service-up]').forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.serviceUp),Number(button.dataset.serviceUp)-1)));
    list.querySelectorAll('[data-service-down]').forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.serviceDown),Number(button.dataset.serviceDown)+1)));
    renderPreview();
  }
  function install(){
    const target=field();if(!target||document.querySelector('#servicesManager'))return;
    const label=target.closest('label'),manager=document.createElement('section');manager.id='servicesManager';manager.className='services-manager';manager.innerHTML=`<div class="services-manager-head"><div><span class="kicker">HOMEPAGE SERVICES</span><h3>Service accordion manager</h3><p>Add, remove and reorder the services shown on the homepage. Changes go live only after Save Site Modules.</p></div><button class="admin-btn primary" type="button" id="addServiceRow">+ ADD SERVICE</button></div><div class="services-manager-layout"><div id="serviceManagerList" class="service-manager-list"></div><aside><span>LAYOUT PREVIEW</span><strong>Homepage accordion</strong><div id="serviceManagerPreview" class="service-manager-preview"></div></aside></div>`;
    label?.insertAdjacentElement('beforebegin',manager);
    if(label){const details=document.createElement('details');details.className='services-json-advanced';details.innerHTML='<summary>ADVANCED JSON</summary>';label.insertAdjacentElement('beforebegin',details);details.append(label)}
    document.querySelector('#addServiceRow')?.addEventListener('click',()=>{rows.push({title:'New service',description:'',label:'SERVICE',tags:[],url:'#work',enabled:true,primary:rows.length===0,sortOrder:rows.length});write();render();document.querySelector('#serviceManagerList article:last-of-type')?.scrollIntoView({behavior:'smooth',block:'center'})});
    target.addEventListener('input',()=>{if(syncing)return;read();render()});
    read();render();
  }
  document.addEventListener('admin:siteconfigloaded',()=>{install();read();render()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
