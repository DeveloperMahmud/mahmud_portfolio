(()=>{
 const refresh=document.querySelector('#analyticsRefresh');
 if(refresh&&!document.querySelector('#analyticsExport'))refresh.insertAdjacentHTML('beforebegin','<a class="admin-btn" id="analyticsExport" href="/api/admin/analytics/export.xlsx?days=30">EXPORT SHEET</a>');
 const update=()=>{const from=document.querySelector('#analyticsFrom')?.value,to=document.querySelector('#analyticsTo')?.value,days=document.querySelector('[data-days].active')?.dataset.days||30,link=document.querySelector('#analyticsExport');if(link)link.href=`/api/admin/analytics/export.xlsx?${from&&to?`from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`:`days=${days}`}`};
 document.querySelectorAll('[data-days]').forEach(button=>button.addEventListener('click',()=>queueMicrotask(update)));
 document.querySelector('#analyticsApply')?.addEventListener('click',update);
 document.querySelectorAll('#analyticsFrom,#analyticsTo').forEach(input=>input.addEventListener('change',update));
 update();
})();
