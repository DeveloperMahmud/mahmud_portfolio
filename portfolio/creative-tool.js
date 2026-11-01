(()=>{
  'use strict';

  const root=document.querySelector('#toolRoot');
  const ui=window.CreativeLabUI;
  const mini=window.CreativeToolMiniDemos;
  if(!root||!ui)return;

  const parts=location.pathname.split('/').filter(Boolean);
  const slug=parts[1]||'';
  const demo=parts[2]==='demo';
  const esc=ui.escapeHtml;
  const list=(items,empty='Planned details will be added here.')=>Array.isArray(items)&&items.length
    ?`<ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`
    :`<p>${esc(empty)}</p>`;

  const actionLink=(action,className='lab-action')=>{
    if(!action)return'';
    const href=/^\/(?!\/)/.test(action.href)||/^https:\/\//.test(action.href)?action.href:'/creative-lab';
    return`<a class="${className}" href="${esc(href)}"${action.target==='_blank'?' target="_blank"':''}${action.rel?` rel="${esc(action.rel)}"`:''}>${esc(action.label)} <span aria-hidden="true">&nearr;</span></a>`;
  };

  function detail(tool){
    const action=ui.resolvePrimaryAction(tool);
    return`<section class="tool-hero"><div><div class="tool-meta"><span>${esc(tool.category)}</span>${ui.statusBadge(tool.productStatus)}</div><h1>${esc(tool.title)}</h1><p>${esc(tool.shortDescription||tool.subtitle||tool.problemStatement)}</p><div class="tool-actions">${actionLink(action,'tool-button tool-button--primary')}<a class="tool-button" href="/creative-lab">EXPLORE ALL TOOLS</a></div></div><aside class="tool-concept-note"><strong>${esc(tool.demoMode.replaceAll('_',' '))}</strong><p>${esc(tool.demoNotice||'This experience is a concept preview.')}</p></aside></section><section class="tool-section tool-section--split"><div><span class="kicker">THE PROBLEM</span><h2>${esc(tool.problemStatement||'A focused creative workflow problem.')}</h2></div><div><p>${esc(tool.overview||'Explore the proposed workflow, intended inputs and useful outputs.')}</p></div></section><section class="tool-section"><div class="tool-section__head"><span class="kicker">PLANNED EXPERIENCE</span><h2>What this tool is designed to support.</h2></div><div class="tool-columns"><article><span>01 / FEATURES</span>${list(tool.featureBullets)}</article><article><span>02 / INPUTS</span>${list(tool.proposedInputs)}</article><article><span>03 / OUTPUTS</span>${list(tool.proposedOutputs)}</article></div></section><section class="tool-section tool-limitations"><div><span class="kicker">HONEST LIMITS</span><h2>What this preview does not claim.</h2></div>${list(tool.limitations)}</section>`;
  }

  function demoHead(tool){
    return`<section class="tool-demo-head"><a href="/creative-lab/${encodeURIComponent(tool.publishedSlug)}">&larr; TOOL DETAILS</a><div class="tool-meta"><span>${esc(tool.category)}</span>${ui.statusBadge(tool.productStatus)}</div><h1>${esc(tool.title)}<br><em>Concept demo.</em></h1><p>${esc(tool.demoNotice||'This page demonstrates the proposed experience only.')}</p></section>`;
  }

  function thumbnailDemo(tool){
    const sizes=[80,120,160];
    const cards=sizes.map(size=>`<figure class="thumbnail-demo__cell${size===120?' is-selected':''}" data-thumbnail-size="${size}"><div class="thumbnail-demo__image" style="--sample-size:${size}px"><img src="/assets/demo-listing.svg" alt="Bundled sample listing artwork shown at ${size} pixels" width="1600" height="1000"></div><figcaption><strong>${size} PX</strong><span>${size===80?'Compact search result':size===120?'Standard comparison':'Expanded inspection'}</span></figcaption></figure>`).join('');
    const choices=sizes.map(size=>`<label><input type="radio" name="thumbnailSize" value="${size}"${size===120?' checked':''}><span>${size} PX</span></label>`).join('');
    return`${demoHead(tool)}<section class="thumbnail-demo" data-thumbnail-demo data-background="search" aria-labelledby="thumbnailDemoTitle"><div class="thumbnail-demo__controls"><span class="kicker">SAMPLE-ONLY PREVIEW</span><h2 id="thumbnailDemoTitle">See how one sample behaves at search-result sizes.</h2><p>This visual simulator uses a bundled demonstration image. It does not accept uploads, run OCR, score readability or certify Amazon compliance.</p><fieldset><legend>Focus preview size</legend><div class="thumbnail-demo__choices">${choices}</div></fieldset><label class="thumbnail-demo__select"><span>Sample background</span><select data-thumbnail-background><option value="search">Search result</option><option value="light">Light</option><option value="dark">Dark</option></select></label><p class="thumbnail-demo__status" data-thumbnail-status aria-live="polite">120 pixel preview selected.</p></div><div class="thumbnail-demo__preview"><div class="thumbnail-demo__grid" aria-label="Side-by-side sample thumbnail comparison">${cards}</div><aside class="thumbnail-demo__boundary"><strong>DEMONSTRATION BOUNDARY</strong><p>Use this preview to compare scale only. A production assessment would need a real image-processing workflow, explainable criteria and human review.</p></aside></div></section><section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
  }

  function contrastDemo(tool){
    const scenes=[
      ['strong','Strong contrast','Clear light-on-dark sample'],
      ['weak','Low contrast','Muted text for comparison'],
      ['image','Busy image','Flattened artwork needs human review']
    ];
    const choices=scenes.map(([value,label,description],index)=>`<label><input type="radio" name="contrastScene" value="${value}"${index===0?' checked':''}><span><strong>${label}</strong><small>${description}</small></span></label>`).join('');
    return`${demoHead(tool)}<section class="contrast-demo" data-contrast-demo data-scene="strong" data-scale="100" aria-labelledby="contrastDemoTitle"><div class="contrast-demo__controls"><span class="kicker">SAMPLE VISUAL COMPARISON</span><h2 id="contrastDemoTitle">Compare predefined text states at smaller scales.</h2><p>This concept uses fixed demonstration styles. It does not accept uploads, run OCR, calculate a complete image-accessibility score or certify WCAG conformance.</p><fieldset><legend>Sample state</legend><div class="contrast-demo__choices">${choices}</div></fieldset><label class="contrast-demo__select"><span>Preview scale</span><select data-contrast-scale><option value="100">100%</option><option value="75">75%</option><option value="50">50%</option></select></label><p class="contrast-demo__status" data-contrast-status aria-live="polite">Strong contrast sample selected at 100%.</p></div><div class="contrast-demo__preview"><div class="contrast-demo__canvas"><div class="contrast-demo__art"><span>NEW FORMULA</span><strong>VISIBLE VALUE.</strong><p>Sample packaging copy should remain easy to recognize when the creative is reduced.</p><b>SHOP THE COLLECTION</b></div></div><div class="contrast-demo__notes"><article><span>WHAT TO INSPECT</span><p>Hierarchy, letter size, background complexity and the distance between text and nearby visual detail.</p></article><article><span>NOT A CERTIFICATION</span><p>Flattened-image text needs contextual review. Color math alone cannot prove that the complete creative is readable.</p></article></div></div></section><section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
  }

  function plannerDemo(tool){
    const listing=['Hero + product promise','Three useful benefits','How it fits the routine','Feature close-up','Scale and portability','Lifestyle context','What is included'];
    const modules=['Brand opening','Benefit comparison','Use-case sequence','Material and care','Closing brand story'];
    const listingCards=listing.map((label,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span><strong>${label}</strong><small>${index===0?'Keep the lead image policy-safe and product-led.':'Editable sample direction for the fictional product.'}</small></li>`).join('');
    const moduleCards=modules.map((label,index)=>`<li data-plan-module="${index+1}"><span>A+ ${String(index+1).padStart(2,'0')}</span><strong>${label}</strong><small>Sample module role — verify current marketplace requirements before production.</small></li>`).join('');
    return`${demoHead(tool)}<section class="planner-demo" data-planner-demo data-module-count="4" aria-labelledby="plannerDemoTitle"><div class="planner-demo__controls"><span class="kicker">FICTIONAL PRODUCT PLAN</span><h2 id="plannerDemoTitle">Map a distinct listing and A+ story.</h2><p>This static editorial sample uses a fictional portable blender. It does not generate copy or assets, save a brief, or represent universal Amazon program requirements.</p><label><span>Audience lens</span><select data-plan-audience><option>Busy commuters</option><option>Home cooks</option><option>Gift buyers</option></select></label><label><span>A+ module count</span><select data-plan-count><option value="3">3 modules</option><option value="4" selected>4 modules</option><option value="5">5 modules</option></select></label><p class="planner-demo__status" data-plan-status aria-live="polite">Showing a four-module sample for busy commuters.</p></div><div class="planner-demo__board"><header><div><span>SAMPLE PRODUCT / NOT A REAL LISTING</span><strong>MOVE MIX / PORTABLE BLENDER</strong></div><b>EDITABLE PLANNING CONCEPT</b></header><div class="planner-demo__lanes"><section><h3>Listing image sequence</h3><ol class="planner-demo__listing">${listingCards}</ol></section><section><h3>Premium A+ module map</h3><ol class="planner-demo__modules">${moduleCards}</ol></section></div><aside><strong>HUMAN REVIEW CHECKPOINT</strong><p>Remove repetition between listing and A+, confirm available product evidence, then verify current marketplace specifications before design production.</p></aside></div></section><section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
  }

  function briefDemo(tool){
    return`${demoHead(tool)}<section class="brief-demo" data-brief-demo aria-labelledby="briefDemoTitle"><div class="brief-demo__editor"><span class="kicker">LOCAL SAMPLE FORM</span><h2 id="briefDemoTitle">Shape a clearer starting brief.</h2><p>Values update the preview in this browser only. Nothing is submitted, saved, emailed or AI-generated; refreshing the page resets the sample.</p><form data-brief-form><label><span>Fictional product</span><input name="product" value="Move Mix portable blender" maxlength="80" required></label><label><span>Primary goal</span><input name="goal" value="Explain portability and everyday convenience" maxlength="120" required></label><label><span>Audience</span><select name="audience"><option>Busy commuters</option><option>Home cooks</option><option>Gift buyers</option></select></label><label><span>Deliverable</span><select name="deliverable"><option>Listing image sequence</option><option>Brand campaign concept</option><option>Landing page direction</option></select></label><label class="brief-demo__wide"><span>Available evidence and constraints</span><textarea name="constraints" maxlength="240" rows="4">Product dimensions, included accessories and approved lifestyle photography are available. Avoid unsupported performance claims.</textarea></label><div class="brief-demo__actions"><button type="submit">UPDATE LOCAL PREVIEW</button><button type="reset">RESET SAMPLE</button></div><p data-brief-status aria-live="polite">Ready. This sample has not been sent anywhere.</p></form></div><article class="brief-demo__preview" aria-label="Local creative brief preview"><header><span>DEMONSTRATION BRIEF</span><b>LOCAL / UNSAVED</b></header><h3 data-brief-product>Move Mix portable blender</h3><dl><div><dt>Goal</dt><dd data-brief-goal>Explain portability and everyday convenience</dd></div><div><dt>Audience</dt><dd data-brief-audience>Busy commuters</dd></div><div><dt>Deliverable</dt><dd data-brief-deliverable>Listing image sequence</dd></div><div><dt>Evidence / constraints</dt><dd data-brief-constraints>Product dimensions, included accessories and approved lifestyle photography are available. Avoid unsupported performance claims.</dd></div></dl><aside><strong>HUMAN CHECK</strong><p>Confirm missing assets, dates, decision-makers and claim evidence before turning this sample into a real production brief.</p></aside></article></section><section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
  }

  function auditDemo(tool){
    const criteria=[
      ['pass','Lead image clarity','Sample product remains the visual focus.'],
      ['review','Benefit hierarchy','Two messages compete at reduced size.'],
      ['pass','Lifestyle coverage','Use context is represented in the sample sequence.'],
      ['review','Feature legibility','Small annotation text needs human inspection.'],
      ['pass','Brand consistency','Color and type treatment remain coherent.'],
      ['review','Claim evidence','Supporting evidence must be confirmed before publication.']
    ];
    const cards=criteria.map(([state,title,reason],index)=>`<li data-audit-state="${state}"><span>${String(index+1).padStart(2,'0')}</span><div><strong>${title}</strong><p>${reason}</p></div><b>${state==='pass'?'SAMPLE PASS':'HUMAN REVIEW'}</b></li>`).join('');
    return`${demoHead(tool)}<section class="audit-demo" data-audit-demo aria-labelledby="auditDemoTitle"><header><div><span class="kicker">FICTIONAL LISTING / SAMPLE CRITERIA</span><h2 id="auditDemoTitle">Review the rationale, not a magic score.</h2><p>This demonstration uses predetermined findings for a fictional listing. It does not accept uploads, run computer vision, make Amazon compliance decisions or perform a real client audit.</p></div><div class="audit-demo__filters" role="group" aria-label="Filter sample findings"><button type="button" data-audit-filter="all" aria-pressed="true">ALL 6</button><button type="button" data-audit-filter="review" aria-pressed="false">REVIEW 3</button><button type="button" data-audit-filter="pass" aria-pressed="false">PASS 3</button></div></header><div class="audit-demo__body"><aside><span>SAMPLE ARTWORK</span><img src="/assets/demo-listing.svg" alt="Bundled fictional listing artwork used for the sample audit" width="1600" height="1000"><p>Visual reference only. The statuses are authored examples, not machine-detected results.</p></aside><div><ol class="audit-demo__list">${cards}</ol><p class="audit-demo__status" data-audit-status aria-live="polite">Showing all six sample criteria.</p></div></div><footer><strong>EXPLAINABLE REVIEW MODEL</strong><p>A real audit should connect every finding to visible evidence, current marketplace requirements and a human decision—not an unexplained aggregate score.</p></footer></section><section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
  }

  function reviewDemo(tool){
    const versions=['Initial layout','Hierarchy revision','Current sample'];
    const versionButtons=versions.map((label,index)=>`<button type="button" role="tab" data-review-version="${index+1}" aria-selected="${index===2?'true':'false'}"><span>V${index+1}</span>${label}</button>`).join('');
    return`${demoHead(tool)}<section class="review-demo" data-review-demo data-version="3" data-decision="pending" aria-labelledby="reviewDemoTitle"><header><div><span class="kicker">LOCAL PROTOTYPE / FICTIONAL REVIEW</span><h2 id="reviewDemoTitle">See how version context could stay organized.</h2><p>This demonstration contains authored sample versions and comments. It does not upload or share files, issue secure access tokens, save real comments or approvals, notify anyone, or persist after refresh.</p></div><b>NOT A LIVE CLIENT PORTAL</b></header><div class="review-demo__workspace"><nav role="tablist" aria-label="Sample creative versions">${versionButtons}</nav><div class="review-demo__asset"><div><span>FICTIONAL CREATIVE / V<span data-review-version-label>3</span></span><img src="/assets/demo-listing.svg" alt="Bundled fictional creative used in the review prototype" width="1600" height="1000"></div><aside><article><span>ART DIRECTOR / SAMPLE</span><p>Increase the visual separation between the product promise and the supporting detail.</p></article><article><span>CLIENT / SAMPLE</span><p>The updated hierarchy is clearer. Confirm the evidence behind the performance statement.</p></article><div class="review-demo__decision"><strong data-review-decision-label>LOCAL STATUS: PENDING REVIEW</strong><div><button type="button" data-review-decision="approved">MARK SAMPLE APPROVED</button><button type="button" data-review-decision="changes">REQUEST SAMPLE CHANGES</button></div><p data-review-status aria-live="polite">Version 3 selected. No real decision has been recorded.</p></div></aside></div></div><footer><strong>PRODUCTION REQUIREMENTS</strong><p>A real portal would require authenticated or expiring access, authorization, durable version storage, audit logs, privacy controls, rate limits and reliable notifications.</p></footer></section><section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
  }

  function genericDemo(tool){
    return`${demoHead(tool)}<section class="tool-demo-stage" aria-label="Concept workflow"><div class="tool-demo-stage__label"><span>01</span><strong>PROPOSED INPUTS</strong></div>${list(tool.proposedInputs)}<div class="tool-demo-arrow" aria-hidden="true">&darr;</div><div class="tool-demo-stage__label"><span>02</span><strong>SAMPLE WORKFLOW</strong></div>${list(tool.featureBullets)}<div class="tool-demo-arrow" aria-hidden="true">&darr;</div><div class="tool-demo-stage__label"><span>03</span><strong>INTENDED OUTPUTS</strong></div>${list(tool.proposedOutputs)}</section><section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
  }

  function demoView(tool){
    if(tool.canonicalId==='F01')return thumbnailDemo(tool);
    if(tool.canonicalId==='F02')return contrastDemo(tool);
    if(tool.canonicalId==='F03')return plannerDemo(tool);
    if(tool.canonicalId==='F04')return briefDemo(tool);
    if(tool.canonicalId==='F05')return auditDemo(tool);
    if(tool.canonicalId==='F06')return reviewDemo(tool);
    if(mini?.has(tool))return`${demoHead(tool)}${mini.render(tool)}<section class="tool-section tool-limitations"><div><span class="kicker">DEMO BOUNDARY</span><h2>Review the limitations before using this concept.</h2></div>${list(tool.limitations)}</section>`;
    return genericDemo(tool);
  }

  function wireDemo(tool){
    if(mini?.has(tool)){
      mini.wire(root,tool);
      return;
    }
    if(tool.canonicalId==='F06'){
      const stage=root.querySelector('[data-review-demo]');
      const versionLabel=root.querySelector('[data-review-version-label]');
      const decisionLabel=root.querySelector('[data-review-decision-label]');
      const status=root.querySelector('[data-review-status]');
      if(!stage)return;
      root.querySelectorAll('[data-review-version]').forEach(button=>button.addEventListener('click',()=>{
        const version=button.dataset.reviewVersion||'3';
        stage.dataset.version=version;
        root.querySelectorAll('[data-review-version]').forEach(item=>item.setAttribute('aria-selected',String(item===button)));
        if(versionLabel)versionLabel.textContent=version;
        if(status)status.textContent=`Version ${version} selected. No real decision has been recorded.`;
      }));
      root.querySelectorAll('[data-review-decision]').forEach(button=>button.addEventListener('click',()=>{
        const decision=button.dataset.reviewDecision||'pending';
        stage.dataset.decision=decision;
        if(decisionLabel)decisionLabel.textContent=decision==='approved'?'LOCAL SAMPLE STATUS: APPROVED':'LOCAL SAMPLE STATUS: CHANGES REQUESTED';
        if(status)status.textContent='Local demonstration state changed. Nothing was saved, sent or approved.';
      }));
      return;
    }
    if(tool.canonicalId==='F05'){
      const stage=root.querySelector('[data-audit-demo]');
      const status=root.querySelector('[data-audit-status]');
      if(!stage)return;
      root.querySelectorAll('[data-audit-filter]').forEach(button=>button.addEventListener('click',()=>{
        const filter=button.dataset.auditFilter||'all';
        root.querySelectorAll('[data-audit-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
        root.querySelectorAll('[data-audit-state]').forEach(item=>{item.hidden=filter!=='all'&&item.dataset.auditState!==filter;});
        if(status)status.textContent=filter==='all'?'Showing all six sample criteria.':`Showing three ${filter} sample criteria.`;
      }));
      return;
    }
    if(tool.canonicalId==='F04'){
      const form=root.querySelector('[data-brief-form]');
      const status=root.querySelector('[data-brief-status]');
      if(!form)return;
      const sync=()=>{
        const fields=['product','goal','audience','deliverable','constraints'];
        fields.forEach(name=>{const output=root.querySelector(`[data-brief-${name}]`);if(output)output.textContent=form.elements[name]?.value?.trim()||'Not provided';});
      };
      form.addEventListener('submit',event=>{event.preventDefault();sync();if(status)status.textContent='Local preview updated. Nothing was submitted or saved.';});
      form.addEventListener('reset',()=>setTimeout(()=>{sync();if(status)status.textContent='Sample values restored. Nothing was submitted or saved.';},0));
      return;
    }
    if(tool.canonicalId==='F03'){
      const stage=root.querySelector('[data-planner-demo]');
      const audience=root.querySelector('[data-plan-audience]');
      const count=root.querySelector('[data-plan-count]');
      const status=root.querySelector('[data-plan-status]');
      if(!stage)return;
      const update=()=>{
        stage.dataset.moduleCount=count?.value||'4';
        if(status)status.textContent=`Showing a ${count?.options[count.selectedIndex].text.toLowerCase()} sample for ${(audience?.value||'Busy commuters').toLowerCase()}.`;
      };
      audience?.addEventListener('change',update);
      count?.addEventListener('change',update);
      return;
    }
    if(tool.canonicalId==='F02'){
      const stage=root.querySelector('[data-contrast-demo]');
      const status=root.querySelector('[data-contrast-status]');
      const scale=root.querySelector('[data-contrast-scale]');
      if(!stage)return;
      root.querySelectorAll('input[name="contrastScene"]').forEach(input=>input.addEventListener('change',()=>{
        stage.dataset.scene=input.value;
        const label=input.parentElement?.querySelector('strong')?.textContent||'Sample';
        if(status)status.textContent=`${label} sample selected at ${stage.dataset.scale}%.`;
      }));
      if(scale)scale.addEventListener('change',()=>{
        stage.dataset.scale=scale.value;
        if(status)status.textContent=`Preview scale changed to ${scale.value}%.`;
      });
      return;
    }
    if(tool.canonicalId!=='F01')return;
    const stage=root.querySelector('[data-thumbnail-demo]');
    const status=root.querySelector('[data-thumbnail-status]');
    const background=root.querySelector('[data-thumbnail-background]');
    if(!stage)return;

    root.querySelectorAll('input[name="thumbnailSize"]').forEach(input=>input.addEventListener('change',()=>{
      const size=Number(input.value);
      root.querySelectorAll('[data-thumbnail-size]').forEach(card=>card.classList.toggle('is-selected',Number(card.dataset.thumbnailSize)===size));
      if(status)status.textContent=`${size} pixel preview selected.`;
    }));

    if(background)background.addEventListener('change',()=>{
      stage.dataset.background=background.value;
      if(status)status.textContent=`${background.options[background.selectedIndex].text} background selected.`;
    });
  }

  fetch(`/api/public/creative-lab/${encodeURIComponent(slug)}`,{headers:{accept:'application/json'}})
    .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error||'Tool unavailable');return data.tool;})
    .then(tool=>{
      document.title=`${tool.title}${demo?' Concept Demo':''} — Creative Lab`;
      root.innerHTML=demo?demoView(tool):detail(tool);
      if(demo)wireDemo(tool);
      root.setAttribute('aria-busy','false');
    })
    .catch(error=>{
      root.innerHTML=`<div class="lab-empty"><span class="lab-empty__mark">MH</span><h1>Tool unavailable.</h1><p>${esc(error.message)}</p><a class="tool-button" href="/creative-lab">RETURN TO CREATIVE LAB</a></div>`;
      root.setAttribute('aria-busy','false');
    });
})();
