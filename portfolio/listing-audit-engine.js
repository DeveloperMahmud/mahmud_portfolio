(function(global){
  'use strict';
  const STATUS=new Set(['clear','review','not_checked']);
  const DEFAULT_CRITERIA=[['lead_image','Lead image clarity'],['benefit_hierarchy','Benefit hierarchy'],['feature_readability','Feature readability'],['lifestyle_coverage','Lifestyle coverage'],['brand_consistency','Brand consistency'],['claim_evidence','Claim evidence'],['asset_completeness','Asset completeness'],['program_region','Program / regional requirements']];
  const clean=(value,max=500)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const normalizeStatus=value=>STATUS.has(value)?value:'not_checked';
  const build=input=>{
    const source=input&&typeof input==='object'?input:{};
    const criteria=DEFAULT_CRITERIA.map(([id,label])=>{const item=source.criteria?.[id]||{};return{id,label,status:normalizeStatus(item.status),evidence:clean(item.evidence,600)}});
    const counts=criteria.reduce((result,item)=>{result[item.status]+=1;return result},{clear:0,review:0,not_checked:0});
    return{schemaVersion:1,generatedAt:new Date().toISOString(),listing:clean(source.listing,100)||'Untitled listing',marketplace:clean(source.marketplace,80),reviewer:clean(source.reviewer,80),criteria,counts,unresolved:criteria.filter(item=>item.status!=='clear'||!item.evidence).map(item=>item.id),boundary:'Human-authored local review. No image analysis, marketplace compliance decision, remote save or aggregate quality score.'};
  };
  const toText=report=>['LISTING VISUAL REVIEW',`Listing: ${report.listing}`,`Marketplace / program: ${report.marketplace||'Not specified'}`,`Reviewer: ${report.reviewer||'Not specified'}`,`Counts: ${report.counts.clear} clear / ${report.counts.review} review / ${report.counts.not_checked} not checked`,'',...report.criteria.flatMap(item=>[`${item.label.toUpperCase()} — ${item.status.replace('_',' ').toUpperCase()}`,item.evidence||'No evidence note recorded.','']),`Boundary: ${report.boundary}`].join('\n');
  const api={DEFAULT_CRITERIA,build,toText};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.ListingAuditEngine=api;
})(typeof window!=='undefined'?window:globalThis);
