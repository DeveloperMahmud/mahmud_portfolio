(()=>{
  'use strict';
  const clean=(value,max=240)=>String(value||'').replace(/[\r\n\t]+/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const lines=(value,maxItems=12,max=120)=>String(value||'').split(/\r?\n/).map(item=>clean(item,max)).filter(Boolean).slice(0,maxItems);
  const build=input=>{
    const brief={version:1,brand:clean(input.brand,80),product:clean(input.product,80),goal:clean(input.goal,160),audience:clean(input.audience,120),deliverables:lines(input.deliverables,10),deadline:clean(input.deadline,40),budget:clean(input.budget,60),availableFiles:lines(input.availableFiles,12),references:lines(input.references,8),constraints:clean(input.constraints,500)};
    const questions=[];
    if(!brief.brand)questions.push('What brand or organization owns this project?');
    if(!brief.product)questions.push('What product, service or campaign is being designed?');
    if(!brief.goal)questions.push('What decision or outcome should the creative support?');
    if(!brief.audience)questions.push('Who is the primary audience?');
    if(!brief.deliverables.length)questions.push('Which deliverables and formats are required?');
    if(!brief.deadline)questions.push('What is the target delivery date and review schedule?');
    if(!brief.availableFiles.length)questions.push('Which approved assets, copy and product evidence are available?');
    return Object.freeze({...brief,questions,readiness:questions.length===0?'READY FOR HUMAN REVIEW':'NEEDS CLARIFICATION'});
  };
  const toText=brief=>['CREATIVE BRIEF',`Status: ${brief.readiness}`,`Brand: ${brief.brand||'Not provided'}`,`Product / project: ${brief.product||'Not provided'}`,`Goal: ${brief.goal||'Not provided'}`,`Audience: ${brief.audience||'Not provided'}`,`Deadline: ${brief.deadline||'Not provided'}`,`Budget context: ${brief.budget||'Not provided'}`,'','DELIVERABLES',...(brief.deliverables.length?brief.deliverables.map(item=>`- ${item}`):['- Not provided']),'','AVAILABLE FILES / EVIDENCE',...(brief.availableFiles.length?brief.availableFiles.map(item=>`- ${item}`):['- Not provided']),'','REFERENCES',...(brief.references.length?brief.references.map(item=>`- ${item}`):['- Not provided']),'',`Constraints: ${brief.constraints||'Not provided'}`,'','QUESTIONS TO CLARIFY',...(brief.questions.length?brief.questions.map(item=>`- ${item}`):['- No required gaps detected; human review is still required.']),'','Limit: this local brief is not submitted, saved, emailed, approved or converted into a contract. Validate consent, claims, dates, budget and decision-makers before use.'].join('\n');
  globalThis.CreativeBriefEngine=Object.freeze({clean,lines,build,toText});
})();
