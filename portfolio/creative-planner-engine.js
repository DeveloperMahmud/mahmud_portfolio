(()=>{
  'use strict';
  const clean=(value,max=120)=>String(value||'').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const lines=(value,maxItems=8,maxLength=100)=>String(value||'').split(/\r?\n/).map(item=>clean(item,maxLength)).filter(Boolean).slice(0,maxItems);
  const clamp=(value,min,max,fallback)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):fallback));
  const unique=items=>[...new Set(items.map(item=>item.toLowerCase()))];
  const buildPlan=input=>{
    const product=clean(input.product,80)||'Untitled product',category=clean(input.category,60)||'General',marketplace=clean(input.marketplace,40)||'Marketplace to confirm',audience=clean(input.audience,80)||'Audience to confirm',tone=clean(input.tone,60)||'Clear and useful',usps=lines(input.usps,8,100),assets=lines(input.assets,10,100),listingCount=clamp(input.listingCount,4,9,7),moduleCount=clamp(input.moduleCount,3,7,5),evidence=lines(input.evidence,8,120);
    const listingRoles=['Product-first lead','Primary value proposition','Benefit hierarchy','Feature close-up','Scale and portability','Lifestyle use context','What is included','Comparison or choice aid','Closing reassurance'];
    const moduleRoles=['Brand and product opening','Audience problem and solution','Benefit story','Feature or material detail','Use-case sequence','Comparison or FAQ','Closing brand story'];
    const message=(index,fallback)=>usps.length?usps[index%usps.length]:fallback;
    const listing=listingRoles.slice(0,listingCount).map((role,index)=>({order:index+1,role,message:message(index,`Define ${role.toLowerCase()} using verified product evidence.`),asset:assets[index%Math.max(assets.length,1)]||'Asset required'}));
    const modules=moduleRoles.slice(0,moduleCount).map((role,index)=>({order:index+1,role,message:message(index+2,`Develop ${role.toLowerCase()} without repeating the listing sequence.`),asset:assets[(index+2)%Math.max(assets.length,1)]||'Asset required'}));
    const listingMessages=unique(listing.map(item=>item.message)),moduleMessages=unique(modules.map(item=>item.message)),overlaps=moduleMessages.filter(item=>listingMessages.includes(item));
    return Object.freeze({version:1,product,category,marketplace,audience,tone,listingCount,moduleCount,listing,modules,assets,evidence,overlaps,reviewRequired:['Confirm current marketplace/program specifications for the selected region.','Verify every product claim against supplied evidence.','Review repeated messages across listing and A+ before production.','Confirm image rights, dimensions, source quality and required variants.']});
  };
  const createBrief=plan=>['LISTING + A+ CREATIVE PLAN',`Product: ${plan.product}`,`Category: ${plan.category}`,`Marketplace: ${plan.marketplace}`,`Audience: ${plan.audience}`,`Tone: ${plan.tone}`,'','LISTING IMAGE SEQUENCE',...plan.listing.map(item=>`${item.order}. ${item.role} — ${item.message} — Asset: ${item.asset}`),'','A+ MODULE MAP',...plan.modules.map(item=>`${item.order}. ${item.role} — ${item.message} — Asset: ${item.asset}`),'','AVAILABLE EVIDENCE',...(plan.evidence.length?plan.evidence.map(item=>`- ${item}`):['- No evidence entered']),'',`REPEATED MESSAGE FLAGS: ${plan.overlaps.length}`,...(plan.overlaps.length?plan.overlaps.map(item=>`- ${item}`):['- No exact repeated messages detected']),'','HUMAN REVIEW GATES',...plan.reviewRequired.map(item=>`- ${item}`),'','Limit: this deterministic plan is not generated marketplace advice and does not certify compliance, claims, dimensions or program eligibility.'].join('\n');
  globalThis.CreativePlannerEngine=Object.freeze({clean,lines,buildPlan,createBrief});
})();
