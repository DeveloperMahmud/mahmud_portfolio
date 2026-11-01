(()=>{'use strict';
const form=document.querySelector('#inquiryForm');if(!form)return;
const query=new URLSearchParams(location.search),sameOriginReferrer=(()=>{try{const url=new URL(document.referrer);return url.origin===location.origin?url.pathname:''}catch{return''}})();
const requestedIntent=String(query.get('intent')||'').toUpperCase(),sourcePath=String(query.get('sourcePath')||sameOriginReferrer||'/');
const inferredIntent=sourcePath==='/hire'?'RECRUITER':sourcePath==='/studio'||sourcePath.startsWith('/services/')?'CLIENT':'GENERAL',intent=['GENERAL','CLIENT','RECRUITER'].includes(requestedIntent)?requestedIntent:inferredIntent;
const boundedPath=/^\/[a-zA-Z0-9/_-]{0,299}$/.test(sourcePath)?sourcePath:'/';
for(const [name,value] of [['intent',intent],['sourcePath',boundedPath]]){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input)}
const serviceMap={'amazon-ecommerce':'Amazon / E-commerce','brand-systems':'Branding / Graphic','digital-experiences':'Web / Digital'},requestedService=serviceMap[query.get('service')]||'';
if(requestedService){const select=form.elements.service;if(select)select.value=requestedService}
if(intent==='RECRUITER'){const field=form.elements.projectType;if(field&&!field.value)field.value='Recruiter / career conversation'}
})();
