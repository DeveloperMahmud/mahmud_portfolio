(()=>{'use strict';
const $=selector=>document.querySelector(selector);
const criteria=[
  {key:'role',label:'YOUR ROLE',check:()=>Boolean($('#role')?.value.trim()),hint:'State your direct contribution.'},
  {key:'context',label:'CONTEXT / CHALLENGE',check:()=>Boolean($('#challenge')?.value.trim()||$('#description')?.value.trim()),hint:'Explain the business or communication problem.'},
  {key:'process',label:'APPROACH / PROCESS',check:()=>Boolean($('#approach')?.value.trim()||$('#process')?.value.trim()),hint:'Show how the work moved from brief to delivery.'},
  {key:'deliverables',label:'DELIVERABLES',check:()=>Boolean($('#deliverables')?.value.split('\n').some(item=>item.trim())),hint:'List what was actually delivered.'},
  {key:'evidence',label:'VISUAL EVIDENCE',check:()=>Boolean($('#coverImage')?.value.trim()||$('#galleryPreview img')),hint:'Use a relevant cover or gallery visual with useful alt text.'},
  {key:'outcome',label:'HONEST OUTCOME',check:()=>Boolean($('#results')?.value.trim()),hint:'A qualitative result is valid; unsupported numbers are not.'}
];
function mount(){
  const form=$('#projectForm'),anchor=$('#description')?.closest('label');
  if(!form||!anchor||$('#caseStudyReadiness'))return Boolean($('#caseStudyReadiness'));
  anchor.insertAdjacentHTML('beforebegin',`<section class="case-readiness" id="caseStudyReadiness" aria-labelledby="caseReadinessTitle"><div class="case-readiness__head"><div><span class="kicker">COMMERCIAL CASE STUDY</span><h3 id="caseReadinessTitle">Flagship readiness.</h3><p>Featured projects must contain real evidence before publication. Drafts remain editable at any stage.</p></div><strong id="caseReadinessScore">0 / 6</strong></div><div class="case-readiness__grid" id="caseReadinessGrid"></div><p class="case-readiness__note" id="caseReadinessNote"></p></section>`);
  const refresh=()=>{
    const featured=Boolean($('#featured')?.checked),rows=criteria.map(item=>({...item,ready:item.check()})),ready=rows.filter(item=>item.ready).length;
    $('#caseReadinessScore').textContent=`${ready} / ${rows.length}`;
    $('#caseReadinessGrid').innerHTML=rows.map(item=>`<article class="${item.ready?'is-ready':'is-missing'}"><span aria-hidden="true">${item.ready?'✓':'!'}</span><div><strong>${item.label}</strong><small>${item.ready?'Ready':item.hint}</small></div></article>`).join('');
    $('#caseReadinessNote').textContent=featured?(ready===rows.length?'Ready for the featured case-study publish gate.':'Featured publication will remain blocked until every required item is ready.'):'Turn on FEATURED / SPECIAL WORK only for a complete flagship case study.';
    $('#caseStudyReadiness').classList.toggle('is-complete',ready===rows.length);
  };
  window.refreshCaseStudyReadiness=refresh;
  for(const selector of ['#role','#challenge','#description','#approach','#process','#deliverables','#results','#coverImage','#featured'])$(selector)?.addEventListener('input',refresh);
  form.addEventListener('change',refresh);
  new MutationObserver(refresh).observe($('#galleryPreview'),{childList:true,subtree:true});
  document.addEventListener('click',event=>{if(event.target.closest('[data-dashboard-project], .js-edit'))setTimeout(refresh,0)});
  refresh();
  return true;
}
if(!document.querySelector('link[data-case-study-admin]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/admin-case-study.css?v=20261101-1';link.dataset.caseStudyAdmin='';document.head.append(link)}
if(!mount()){let attempts=0;const timer=setInterval(()=>{attempts++;if(mount()||attempts>40)clearInterval(timer)},100)}
})();
