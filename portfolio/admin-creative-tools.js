(()=>{
  'use strict';
  if(document.querySelector('#creative-toolsTab'))return;

  const state={page:1,pageSize:25,total:0,pages:1,request:null,timer:null,mediaTimer:null,loaded:false,permissions:{canInspect:false,canEdit:false,canPublish:false,canRestore:false,readOnly:true},editing:null,revisionsOpen:false,mediaTarget:null,mediaRequest:null};
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const formatDate=value=>{const date=new Date(value||0);return Number.isNaN(date.getTime())?'—':date.toLocaleString()};
  const role=()=>String(document.body.dataset.cmsRole||'VIEWER').toUpperCase();

  const sidebar=document.querySelector('.admin-sidebar');
  const brandsButton=sidebar?.querySelector('.tab[data-tab="brands"]');
  const nav=document.createElement('button');
  nav.type='button';
  nav.className='side-btn tab';
  nav.dataset.tab='creative-tools';
  nav.textContent='CREATIVE LAB';
  brandsButton?.insertAdjacentElement('afterend',nav);

  const panel=document.createElement('div');
  panel.id='creative-toolsTab';
  panel.className='hidden creative-tool-manager';
  panel.innerHTML=`
    <section class="panel creative-manager-hero">
      <div>
        <span class="kicker">CREATIVE LAB REGISTRY</span>
        <h1>Tool manager.</h1>
        <p class="notice">Inspect the canonical catalog and edit guarded draft fields. Publishing remains a separate explicit workflow.</p>
      </div>
      <div class="admin-actions">
        <span id="creativeManagerAccess" class="creative-manager-access">READ ONLY</span>
        <a class="admin-btn" href="/creative-lab" target="_blank" rel="noopener">OPEN PUBLIC LAB ↗</a>
        <button class="admin-btn primary" id="creativeManagerCreate" type="button">+ ADD CUSTOM APP</button>
        <button class="admin-btn" id="creativeManagerRefresh" type="button">REFRESH</button>
      </div>
    </section>
    <section class="creative-manager-stats" id="creativeManagerStats" aria-label="Creative Lab totals"></section>
    <section class="panel creative-manager-controls" aria-labelledby="creativeManagerFiltersTitle">
      <div class="creative-manager-controls-head">
        <div><span class="kicker">SEARCH & FILTER</span><h2 id="creativeManagerFiltersTitle">Find a tool.</h2></div>
        <strong id="creativeManagerCount" aria-live="polite">—</strong>
      </div>
      <div class="creative-manager-filter-grid">
        <label class="creative-manager-search"><span>SEARCH</span><input id="creativeManagerSearch" type="search" maxlength="120" placeholder="Title, ID, slug, category…" autocomplete="off"></label>
        <label><span>KIND</span><select id="creativeManagerKind"><option value="ALL">All kinds</option><option value="FLAGSHIP">Flagship</option><option value="MINI">Mini</option></select></label>
        <label><span>TOOL STATUS</span><select id="creativeManagerProductStatus"><option value="ALL">All tool states</option><option value="PLANNED">Planned</option><option value="PREVIEW">Preview</option><option value="BETA">Beta</option><option value="LIVE">Live</option><option value="ARCHIVED">Archived</option></select></label>
        <label><span>CONTENT STATUS</span><select id="creativeManagerStatus"><option value="ALL">Draft + published</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label>
        <label><span>VISIBILITY</span><select id="creativeManagerVisibility"><option value="ALL">All visibility</option><option value="PUBLIC">Public</option><option value="UNLISTED">Unlisted</option><option value="PRIVATE">Private</option></select></label>
        <label><span>DISPLAY</span><select id="creativeManagerDisplay"><option value="ALL">Visible + hidden</option><option value="VISIBLE">Visible</option><option value="HIDDEN">Hidden</option></select></label>
        <label><span>CATEGORY</span><select id="creativeManagerCategory"><option value="">All categories</option></select></label>
        <label><span>ORDER</span><select id="creativeManagerSort"><option value="ORDER">Featured + manual order</option><option value="UPDATED_DESC">Recently updated</option><option value="UPDATED_ASC">Oldest updated</option><option value="TITLE_ASC">Title A–Z</option><option value="TITLE_DESC">Title Z–A</option></select></label>
      </div>
    </section>
    <section class="creative-manager-results" aria-labelledby="creativeManagerResultsTitle">
      <div class="creative-manager-results-head"><div><span class="kicker">CATALOG</span><h2 id="creativeManagerResultsTitle">Flagship and mini tools.</h2></div><span class="notice">Draft fields stay inside the authenticated CMS.</span></div>
      <div id="creativeManagerNotice" class="creative-manager-notice" role="status">Open Creative Lab to load the registry.</div>
      <div id="creativeManagerList" class="creative-manager-list"></div>
      <div class="creative-manager-pagination">
        <button class="admin-btn" id="creativeManagerPrev" type="button">← PREVIOUS</button>
        <span id="creativeManagerPage">PAGE —</span>
        <button class="admin-btn" id="creativeManagerNext" type="button">NEXT →</button>
      </div>
    </section>
    <dialog id="creativeToolEditor" class="creative-tool-editor" aria-labelledby="creativeToolEditorTitle">
      <form id="creativeToolEditorForm" method="dialog">
        <header class="creative-tool-editor-head">
          <div><span class="kicker">DRAFT WORKSPACE</span><h2 id="creativeToolEditorTitle">Edit Creative Tool.</h2><p id="creativeToolEditorMeta" class="notice"></p></div>
          <button class="admin-btn" id="creativeToolEditorClose" type="button">CLOSE</button>
        </header>
        <div id="creativeToolEditorNotice" class="creative-manager-notice hidden" role="status"></div>
        <section id="creativeToolPublishingSummary" class="creative-tool-publishing-summary" aria-label="Publishing state"></section>
        <div id="creativeToolEditorFields" class="creative-tool-editor-fields"></div>
        <section id="creativeToolRevisionPanel" class="creative-tool-revision-panel hidden" aria-labelledby="creativeToolRevisionTitle">
          <div class="creative-tool-revision-head"><div><span class="kicker">HISTORY</span><h3 id="creativeToolRevisionTitle">Draft revisions.</h3></div><button class="admin-btn" id="creativeToolRevisionRefresh" type="button">REFRESH</button></div>
          <div id="creativeToolRevisionList" class="creative-tool-revision-list"></div>
        </section>
        <footer class="creative-tool-editor-footer">
          <p class="notice">Save Draft never changes the live snapshot. Publish is a separate validated action; revision restore also returns content to the working draft first.</p>
          <div class="admin-actions"><button class="admin-btn" id="creativeToolRevisions" type="button">REVISIONS</button><button class="admin-btn" id="creativeToolUnpublish" type="button">UNPUBLISH</button><button class="admin-btn" id="creativeToolEditorCancel" type="button">CLOSE</button><button class="admin-btn" id="creativeToolPublish" type="button">PUBLISH</button><button class="admin-btn primary" id="creativeToolEditorSave" type="submit">SAVE DRAFT</button></div>
        </footer>
      </form>
    </dialog>
    <dialog id="creativeToolCreate" class="creative-tool-create" aria-labelledby="creativeToolCreateTitle">
      <form id="creativeToolCreateForm" method="dialog">
        <header><div><span class="kicker">CUSTOM APP REGISTRATION</span><h2 id="creativeToolCreateTitle">Add a private draft.</h2><p class="notice">Register metadata and destinations here. Executable code stays deployment-owned and cannot be uploaded through the CMS.</p></div><button class="admin-btn" id="creativeToolCreateClose" type="button">CLOSE</button></header>
        <div id="creativeToolCreateNotice" class="creative-manager-notice hidden" role="status"></div>
        <div class="creative-tool-create-grid"><label><span>TITLE</span><input name="title" maxlength="180" required></label><label><span>SLUG</span><input name="slug" maxlength="160" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required></label><label><span>KIND</span><select name="kind"><option value="FLAGSHIP">FLAGSHIP</option><option value="MINI">MINI</option></select></label><label><span>CATEGORY</span><input name="category" maxlength="120" value="CUSTOM APP" required></label></div>
        <footer><p class="notice">The new record starts hidden, private, noindex and unpublished.</p><button class="admin-btn primary" id="creativeToolCreateSubmit" type="submit">CREATE DRAFT</button></footer>
      </form>
    </dialog>
    <dialog id="creativeToolMediaPicker" class="creative-tool-media-picker" aria-labelledby="creativeToolMediaPickerTitle">
      <section>
        <header class="creative-tool-media-picker-head">
          <div><span class="kicker">EXISTING ASSETS</span><h2 id="creativeToolMediaPickerTitle">Choose from Media Library.</h2><p class="notice">Selecting an existing asset does not create another upload or Blob object.</p></div>
          <button class="admin-btn" id="creativeToolMediaPickerClose" type="button">CLOSE</button>
        </header>
        <label class="creative-tool-media-search"><span>SEARCH MEDIA</span><input id="creativeToolMediaSearch" type="search" maxlength="120" placeholder="Filename, title, alt text…" autocomplete="off"></label>
        <div id="creativeToolMediaNotice" class="creative-manager-notice" role="status">Search the existing Media Library.</div>
        <div id="creativeToolMediaGrid" class="creative-tool-media-grid"></div>
      </section>
    </dialog>`;
  document.querySelector('.admin-main')?.appendChild(panel);

  const el=id=>document.getElementById(id);
  const controls={
    q:el('creativeManagerSearch'),kind:el('creativeManagerKind'),productStatus:el('creativeManagerProductStatus'),
    status:el('creativeManagerStatus'),visibility:el('creativeManagerVisibility'),display:el('creativeManagerDisplay'),
    category:el('creativeManagerCategory'),sort:el('creativeManagerSort')
  };

  function query(){
    const params=new URLSearchParams({page:String(state.page),pageSize:String(state.pageSize)});
    Object.entries(controls).forEach(([key,control])=>{const value=String(control?.value||'').trim();if(value&&value!=='ALL')params.set(key,value)});
    return params;
  }
  function badge(value,type=''){
    const text=String(value||'—').replaceAll('_',' ');
    return `<span class="creative-manager-badge ${esc(type||String(value||'').toLowerCase())}">${esc(text)}</span>`;
  }
  function renderStats(facets={}){
    const stats=[['ALL TOOLS',facets.total],['FLAGSHIP',facets.flagship],['MINI',facets.mini],['PUBLISHED',facets.published],['DRAFT',facets.draft],['LIVE',facets.live],['HIDDEN',facets.hidden]];
    el('creativeManagerStats').innerHTML=stats.map(([label,value])=>`<article><strong>${esc(value??0)}</strong><span>${esc(label)}</span></article>`).join('');
  }
  function syncCategories(categories=[]){
    const select=controls.category,current=select.value;
    select.innerHTML='<option value="">All categories</option>'+categories.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
    if(categories.includes(current))select.value=current;
  }
  const editorGroups=[
    {title:'Identity & summary',fields:[
      ['title','TITLE','text',180],['slug','WORKING SLUG','text',160],['category','CATEGORY','text',120],['iconKey','ICON KEY','text',80],
      ['subtitle','SUBTITLE','textarea',300],['shortDescription','SHORT DESCRIPTION','textarea',600],['overview','OVERVIEW','textarea',4000],['problemStatement','PROBLEM STATEMENT','textarea',1500]
    ]},
    {title:'Structured content',hint:'One item per line.',fields:[
      ['tags','TAGS','lines'],['audience','AUDIENCE','lines'],['featureBullets','FEATURE BULLETS','lines'],['proposedInputs','PROPOSED INPUTS','lines'],['proposedOutputs','PROPOSED OUTPUTS','lines'],['limitations','LIMITATIONS','lines']
    ]},
    {title:'Media & destinations',hint:'Use an internal /path for the demo. Paste the deployed standalone app HTTPS URL below, then save, verify and publish.',fields:[
      ['coverImage','COVER IMAGE','text',1000],['galleryImages','GALLERY (URL | ALT, ONE PER LINE)','gallery'],['demoUrl','INTERNAL DEMO URL','text',1000],['liveUrl','EXTERNAL APP URL (HTTPS)','url',1000],['documentationUrl','DOCUMENTATION URL','text',1000]
    ]},
    {title:'Presentation & status',fields:[
      ['productStatus','TOOL STATUS','select',['PLANNED','PREVIEW','BETA','LIVE','ARCHIVED']],['demoMode','DEMO MODE','select',['CONCEPT','SAMPLE_INTERACTIVE','ACTUAL']],['visibility','VISIBILITY','select',['PUBLIC','UNLISTED','PRIVATE']],['sortOrder','DISPLAY ORDER','number'],
      ['demoNotice','DEMO NOTICE','textarea',600],['visible','SHOW IN CATALOG','checkbox'],['featured','FEATURED TOOL','checkbox']
    ]},
    {title:'Buttons',fields:[
      ['primaryLabel','PRIMARY LABEL','text',100],['primaryBehavior','PRIMARY ACTION','select',['AUTO','DEMO','LIVE','DETAILS']],['primaryTarget','PRIMARY TARGET','select',['SAME_TAB','NEW_TAB']],['primaryStyle','PRIMARY STYLE','text',40],
      ['secondaryLabel','SECONDARY LABEL','text',100],['secondaryBehavior','SECONDARY ACTION','select',['','AUTO','DEMO','LIVE','DETAILS']],['secondaryUrl','SECONDARY URL','text',1000],['secondaryTarget','SECONDARY TARGET','select',['SAME_TAB','NEW_TAB']],['secondaryStyle','SECONDARY STYLE','text',40]
    ]},
    {title:'Search visibility',fields:[
      ['seoTitle','SEO TITLE','text',180],['seoDescription','SEO DESCRIPTION','textarea',500],['ogImage','SOCIAL IMAGE','text',1000],['canonicalUrl','CANONICAL URL','url',1000],['noIndex','NOINDEX','checkbox'],['noFollow','NOFOLLOW','checkbox'],['includeSitemap','INCLUDE IN SITEMAP','checkbox']
    ]}
  ];
  const arrayFields=new Set(['tags','audience','featureBullets','proposedInputs','proposedOutputs','limitations']);
  const nullableFields=new Set(['subtitle','shortDescription','overview','problemStatement','iconKey','coverImage','demoNotice','demoUrl','liveUrl','documentationUrl','primaryLabel','primaryStyle','secondaryLabel','secondaryBehavior','secondaryUrl','secondaryStyle','seoTitle','seoDescription','ogImage','canonicalUrl']);
  function fieldMarkup([name,label,type,config]){
    if(type==='checkbox')return `<label class="creative-tool-editor-check"><input name="${name}" type="checkbox"><span><b>${label}</b><small>${name==='visible'?'Hide without deleting the tool.':name==='featured'?'Prioritize in curated Creative Lab surfaces.':'Search-engine delivery preference.'}</small></span></label>`;
    if(type==='select')return `<label><span>${label}</span><select name="${name}">${config.map(value=>`<option value="${value}">${value?value.replaceAll('_',' '):'NONE'}</option>`).join('')}</select></label>`;
    const max=config?` maxlength="${config}"`:'';
    if(type==='textarea'||type==='lines'||type==='gallery')return `<label class="creative-tool-editor-wide"><span>${label}</span><textarea name="${name}"${max} rows="${type==='textarea'?4:6}"></textarea></label>`;
    return `<label><span>${label}</span><input name="${name}" type="${type}"${max}></label>`;
  }
  function renderEditorFields(){
    el('creativeToolEditorFields').innerHTML=editorGroups.map(group=>`<fieldset><legend>${group.title}</legend>${group.hint?`<p>${group.hint}</p>`:''}<div class="creative-tool-editor-grid">${group.fields.map(fieldMarkup).join('')}</div></fieldset>`).join('');
    [['coverImage','CHOOSE COVER'],['ogImage','CHOOSE SOCIAL IMAGE'],['galleryImages','ADD GALLERY ASSET']].forEach(([name,label])=>{
      const input=el('creativeToolEditorForm').elements.namedItem(name);if(!input)return;
      const button=document.createElement('button');button.type='button';button.className='admin-btn creative-tool-media-open';button.dataset.mediaTarget=name;button.textContent=label;
      input.insertAdjacentElement('afterend',button);
    });
    const liveUrl=el('creativeToolEditorForm').elements.namedItem('liveUrl');
    if(liveUrl){
      const actions=document.createElement('span');actions.className='creative-tool-url-actions';
      const primary=document.createElement('button');primary.type='button';primary.id='creativeToolUseExternalApp';primary.className='admin-btn';primary.textContent='USE AS PRIMARY APP';
      const verify=document.createElement('button');verify.type='button';verify.id='creativeToolVerifyLiveUrl';verify.className='admin-btn creative-tool-url-verify';verify.textContent='VERIFY SAVED APP URL';
      const guide=document.createElement('small');guide.className='creative-tool-url-guide';guide.textContent='Workflow: paste URL → Use as Primary App → Save Draft → Verify → Publish. Until publishing succeeds, visitors keep the safe internal demo.';
      actions.append(primary,verify);liveUrl.insertAdjacentElement('afterend',actions);actions.insertAdjacentElement('afterend',guide)
    }
  }
  function galleryToText(value=[]){return value.map(item=>`${item.url}${item.alt?` | ${item.alt}`:''}`).join('\n')}
  function populateEditor(tool){
    const form=el('creativeToolEditorForm');
    Object.entries(tool).forEach(([name,value])=>{
      const input=form.elements.namedItem(name);if(!input)return;
      if(input.type==='checkbox')input.checked=Boolean(value);
      else if(name==='galleryImages')input.value=galleryToText(value);
      else if(arrayFields.has(name))input.value=Array.isArray(value)?value.join('\n'):'';
      else input.value=value??'';
    });
  }
  function editorPayload(){
    const form=el('creativeToolEditorForm'),payload={expectedUpdatedAt:state.editing.updatedAt};
    editorGroups.flatMap(group=>group.fields).forEach(([name,,type])=>{
      const input=form.elements.namedItem(name);if(!input)return;
      if(type==='checkbox'){payload[name]=input.checked;return}
      if(type==='number'){payload[name]=Number(input.value||0);return}
      const value=String(input.value||'').trim();
      if(arrayFields.has(name)){payload[name]=value?value.split(/\r?\n/).map(item=>item.trim()).filter(Boolean):[];return}
      if(name==='galleryImages'){
        payload[name]=value?value.split(/\r?\n/).map(line=>{const [url,...alt]=line.split('|');return {url:url.trim(),alt:alt.join('|').trim()}}).filter(item=>item.url):[];return;
      }
      payload[name]=nullableFields.has(name)?(value||null):value;
    });
    return payload;
  }
  function editorNotice(message,type=''){
    const notice=el('creativeToolEditorNotice');notice.textContent=message;notice.className=`creative-manager-notice${type?` ${type}`:''}`;
  }
  function mediaLabel(item){return item.title||item.alt||item.originalName||item.filename||'Media asset'}
  function renderMediaPicker(items=[]){
    const grid=el('creativeToolMediaGrid');
    if(!items.length){grid.innerHTML='<div class="creative-manager-empty"><strong>No matching images.</strong><span>Upload assets in Media Library first, then return here to reuse them.</span></div>';return}
    grid.innerHTML=items.map(item=>`<button type="button" class="creative-tool-media-item" data-media-url="${esc(item.url)}" data-media-alt="${esc(item.alt||item.title||'')}"><span class="creative-tool-media-thumb"><img src="${esc(item.url)}" alt=""></span><span><b>${esc(mediaLabel(item))}</b><small>${esc(item.mimeType||'IMAGE')} · ${esc(item.usage?.length||0)} USE${item.usage?.length===1?'':'S'}</small></span></button>`).join('');
  }
  async function loadMediaPicker(){
    state.mediaRequest?.abort();state.mediaRequest=new AbortController();
    const q=String(el('creativeToolMediaSearch').value||'').trim(),params=new URLSearchParams({type:'image/',pageSize:'100'});if(q)params.set('q',q);
    el('creativeToolMediaNotice').textContent='Loading existing Media Library assets…';el('creativeToolMediaNotice').classList.remove('error','hidden');
    try{
      const response=await fetch(`/api/admin/media?${params}`,{credentials:'include',cache:'no-store',signal:state.mediaRequest.signal});const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Media Library could not be loaded.');renderMediaPicker(data.media||[]);
      el('creativeToolMediaNotice').textContent=`${Number(data.total||0)} existing image${Number(data.total||0)===1?'':'s'} available. No new storage is used.`;
    }catch(error){if(error?.name==='AbortError')return;el('creativeToolMediaNotice').textContent=error?.message||'Media Library could not be loaded.';el('creativeToolMediaNotice').classList.add('error');renderMediaPicker([])}
  }
  function openMediaPicker(target){
    if(!state.permissions.canEdit)return;state.mediaTarget=target;el('creativeToolMediaSearch').value='';el('creativeToolMediaPicker').showModal();loadMediaPicker();
  }
  function chooseMedia(url,alt=''){
    const input=el('creativeToolEditorForm').elements.namedItem(state.mediaTarget);if(!input)return;
    if(state.mediaTarget==='galleryImages')input.value=[String(input.value||'').trim(),`${url}${alt?` | ${alt}`:''}`].filter(Boolean).join('\n');else input.value=url;
    input.dispatchEvent(new Event('input',{bubbles:true}));el('creativeToolMediaPicker').close();state.mediaTarget=null;editorNotice('Existing Media Library asset selected. Save Draft to keep this change.','success');
  }
  function renderPublishing(tool,issues=[]){
    const publishing=tool?.publishing||{},published=tool?.status==='PUBLISHED'&&publishing.hasPublishedSnapshot;
    const issueMarkup=issues.length?`<ul>${issues.map(issue=>`<li class="${esc(String(issue.severity||'ERROR').toLowerCase())}"><b>${esc(issue.code||issue.field||'CHECK')}</b> ${esc(issue.message||'Resolve this item before publishing.')}</li>`).join('')}</ul>`:'';
    el('creativeToolPublishingSummary').innerHTML=`<div><span class="kicker">PUBLICATION</span><strong>${published?'PUBLISHED':'WORKING DRAFT'}</strong><small>${publishing.publishedAt?`Last published ${esc(formatDate(publishing.publishedAt))}`:'No published version yet.'}${tool?.hasUnpublishedChanges?' · Draft changes pending.':''}</small></div>${issueMarkup}`;
    el('creativeToolPublish').hidden=!state.permissions.canPublish;
    el('creativeToolPublish').disabled=!state.permissions.canPublish;
    el('creativeToolUnpublish').hidden=!state.permissions.canPublish||tool?.status!=='PUBLISHED';
    el('creativeToolRevisions').hidden=!state.permissions.canInspect;
    const primary=el('creativeToolUseExternalApp');if(primary){primary.hidden=!state.permissions.canEdit;primary.disabled=!state.permissions.canEdit;primary.textContent=tool?.primaryBehavior==='LIVE'?'EXTERNAL APP IS PRIMARY':'USE AS PRIMARY APP'}
    const verify=el('creativeToolVerifyLiveUrl');if(verify){verify.hidden=!state.permissions.canEdit;verify.disabled=!state.permissions.canEdit||!tool?.liveUrl;verify.textContent=tool?.liveUrlVerifiedAt?'REVERIFY SAVED APP URL':'VERIFY SAVED APP URL'}
  }
  function prepareExternalApp(){
    const form=el('creativeToolEditorForm'),url=String(form.elements.namedItem('liveUrl')?.value||'').trim();
    if(!/^https:\/\//i.test(url)){editorNotice('Paste the deployed app HTTPS URL first. Only public HTTPS destinations can become the primary app.','error');form.elements.namedItem('liveUrl')?.focus();return}
    form.elements.namedItem('primaryBehavior').value='LIVE';form.elements.namedItem('primaryTarget').value='NEW_TAB';
    const label=form.elements.namedItem('primaryLabel');if(label&&!String(label.value||'').trim())label.value='OPEN APP';
    el('creativeToolUseExternalApp').textContent='EXTERNAL APP IS PRIMARY';editorNotice('External app selected as the primary action. Save Draft, verify the saved URL, then publish to activate it.','success')
  }
  async function verifyLiveUrl(){
    if(!state.editing||!state.permissions.canEdit||!state.editing.liveUrl)return;
    const button=el('creativeToolVerifyLiveUrl');button.disabled=true;editorNotice('Verifying the saved public HTTPS destination safely…');
    try{
      const response=await fetch(`/api/admin/creative-tools/${encodeURIComponent(state.editing.id)}/verify-live-url`,{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedUpdatedAt:state.editing.updatedAt,liveUrl:state.editing.liveUrl})});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'The saved live URL could not be verified.');
      state.editing=data.tool;populateEditor(data.tool);renderPublishing(data.tool);editorNotice(`External app URL verified (HTTP ${data.verification?.status||'OK'}). Publish this draft to activate the public Open App button.`, 'success');await load();
    }catch(error){editorNotice(error?.message||'The saved live URL could not be verified.','error');button.disabled=false}
  }
  async function refreshEditor(id=state.editing?.id){
    const response=await fetch(`/api/admin/creative-tools/${encodeURIComponent(id)}`,{credentials:'include',cache:'no-store'});const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'This Creative Tool could not be loaded.');
    state.permissions={...state.permissions,...(data.permissions||{})};state.editing=data.tool;populateEditor(data.tool);renderPublishing(data.tool,data.readiness?.issues||[]);
    el('creativeToolEditorFields').querySelectorAll('input,select,textarea').forEach(control=>{control.disabled=!state.permissions.canEdit});
    el('creativeToolEditorTitle').textContent=data.tool.title||'Edit Creative Tool';
    el('creativeToolEditorMeta').textContent=`${data.tool.canonicalId||'CUSTOM'} · ${data.tool.kind} · ${data.tool.hasPublishedSnapshot?'published snapshot protected':'not published'}${data.tool.hasUnpublishedChanges?' · draft changes pending':''}`;
    el('creativeToolEditorSave').disabled=!state.permissions.canEdit;
    return data;
  }
  async function openEditor(id){
    if(!state.permissions.canInspect)return;
    const dialog=el('creativeToolEditor');dialog.showModal();editorNotice('Loading draft fields…');el('creativeToolEditorSave').disabled=true;
    try{
      await refreshEditor(id);editorNotice('Draft loaded. Saving here never publishes automatically.','success');
    }catch(error){editorNotice(error?.message||'This Creative Tool could not be loaded.','error')}
  }
  async function createCustomTool(event){
    event.preventDefault();if(!state.permissions.canEdit)return;
    const form=el('creativeToolCreateForm'),submit=el('creativeToolCreateSubmit'),notice=el('creativeToolCreateNotice'),data=Object.fromEntries(new FormData(form).entries());
    submit.disabled=true;notice.className='creative-manager-notice';notice.textContent='Creating private custom app draftâ€¦';
    try{
      const response=await fetch('/api/admin/creative-tools',{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||'Custom app draft could not be created.');
      el('creativeToolCreate').close();form.reset();form.elements.namedItem('category').value='CUSTOM APP';await load({resetPage:true});await openEditor(payload.tool.id);
    }catch(error){notice.className='creative-manager-notice error';notice.textContent=error?.message||'Custom app draft could not be created.'}
    finally{submit.disabled=false}
  }
  async function saveEditor(event){
    event.preventDefault();if(!state.editing||!state.permissions.canEdit)return;
    const save=el('creativeToolEditorSave');save.disabled=true;editorNotice('Saving draft…');
    try{
      const response=await fetch(`/api/admin/creative-tools/${encodeURIComponent(state.editing.id)}`,{method:'PATCH',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(editorPayload())});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){const details=data.issues?.fieldErrors?Object.entries(data.issues.fieldErrors).flatMap(([field,messages])=>(messages||[]).map(message=>`${field}: ${message}`)).join(' '):'';throw new Error([data.error,details].filter(Boolean).join(' ')||'Draft could not be saved.')}
      state.editing=data.tool;populateEditor(data.tool);renderPublishing(data.tool);editorNotice('Draft saved. Public content is unchanged.','success');await load();
    }catch(error){editorNotice(error?.message||'Draft could not be saved.','error')}
    finally{save.disabled=false}
  }
  async function publicationAction(action){
    if(!state.editing||!state.permissions.canPublish)return;
    const verb=action==='publish'?'Publish this validated draft?':'Unpublish this tool? The last snapshot is retained, but public access stops immediately.';
    if(!window.confirm(verb))return;
    const button=action==='publish'?el('creativeToolPublish'):el('creativeToolUnpublish');button.disabled=true;editorNotice(action==='publish'?'Running publish checks…':'Removing public eligibility…');
    try{
      const response=await fetch(`/api/admin/creative-tools/${encodeURIComponent(state.editing.id)}/${action}`,{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedUpdatedAt:state.editing.updatedAt})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){renderPublishing(state.editing,data.issues||[]);throw new Error(data.error||`${action==='publish'?'Publish':'Unpublish'} failed.`)}
      state.editing=data.tool;populateEditor(data.tool);renderPublishing(data.tool,data.issues||[]);editorNotice(data.notice||`${action==='publish'?'Published successfully.':'Tool unpublished; the last snapshot was retained.'}`,'success');await load();
    }catch(error){editorNotice(error?.message||'Publication action failed.','error')}
    finally{button.disabled=false}
  }
  async function loadRevisions(){
    if(!state.editing)return;
    const panel=el('creativeToolRevisionPanel');state.revisionsOpen=true;panel.classList.remove('hidden');el('creativeToolRevisionList').innerHTML='<div class="creative-manager-notice">Loading revisions…</div>';
    try{
      const response=await fetch(`/api/admin/creative-tools/${encodeURIComponent(state.editing.id)}/revisions`,{credentials:'include',cache:'no-store'});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Revision history could not be loaded.');
      const rows=data.revisions||[];el('creativeToolRevisionList').innerHTML=rows.length?rows.map(item=>`<article><div><strong>REVISION ${esc(item.revision)}</strong><span>${esc(item.summary||item.sourceAction||'Draft checkpoint')}</span><small>${esc(formatDate(item.createdAt))}</small></div>${state.permissions.canRestore?`<button class="admin-btn creative-tool-restore" type="button" data-revision-id="${esc(item.id)}">RESTORE TO DRAFT</button>`:''}</article>`).join(''):'<div class="creative-manager-empty"><strong>No revisions yet.</strong><span>Publishing or restoring creates protected checkpoints.</span></div>';
    }catch(error){el('creativeToolRevisionList').innerHTML=`<div class="creative-manager-notice error">${esc(error?.message||'Revision history could not be loaded.')}</div>`}
  }
  async function restoreRevision(revisionId){
    if(!state.editing||!state.permissions.canRestore||!window.confirm('Restore this revision into the working draft? The live version will remain unchanged until Publish.'))return;
    editorNotice('Restoring revision to working draft…');
    try{
      const response=await fetch(`/api/admin/creative-tools/${encodeURIComponent(state.editing.id)}/revisions/${encodeURIComponent(revisionId)}/restore`,{method:'POST',credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({expectedUpdatedAt:state.editing.updatedAt})});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Revision could not be restored.');
      state.editing=data.tool;populateEditor(data.tool);renderPublishing(data.tool);editorNotice(data.notice||'Revision restored to working draft. Live content is unchanged.','success');await loadRevisions();await load();
    }catch(error){editorNotice(error?.message||'Revision could not be restored.','error')}
  }
  function renderRows(tools=[]){
    const list=el('creativeManagerList');
    if(!tools.length){list.innerHTML='<div class="creative-manager-empty"><strong>No tools match these filters.</strong><span>Clear a filter or search with a broader term.</span></div>';return}
    list.innerHTML=tools.map(tool=>{
      const publicSlug=tool.publishedSlug||tool.slug;
      const media=tool.coverImage?`<img src="${esc(tool.coverImage)}" alt="">`:`<span>${esc(tool.canonicalId||tool.iconKey||'LAB')}</span>`;
      return `<article class="creative-manager-row">
        <div class="creative-manager-media">${media}</div>
        <div class="creative-manager-copy">
          <div class="creative-manager-title"><span>${esc(tool.canonicalId||'CUSTOM')} · ${esc(tool.kind)}</span><h3>${esc(tool.title)}</h3><code>/${esc(tool.slug)}</code></div>
          <p>${esc(tool.shortDescription||tool.subtitle||'No short description yet.')}</p>
          <div class="creative-manager-meta">${badge(tool.productStatus)}${badge(tool.status)}${badge(tool.visibility)}${tool.visible?badge('VISIBLE','visible'):badge('HIDDEN','hidden')}${tool.featured?badge('FEATURED','featured'):''}</div>
        </div>
        <div class="creative-manager-state">
          <span><b>${esc(tool.category)}</b> CATEGORY</span>
          <span><b>${esc(tool.sortOrder)}</b> ORDER</span>
          <span><b>${tool.hasDemoUrl?'READY':'MISSING'}</b> DEMO</span>
          <span><b>${tool.hasLiveUrl?(tool.liveUrlVerified?'VERIFIED':'UNVERIFIED'):'NOT SET'}</b> LIVE URL</span>
          <small>Updated ${esc(formatDate(tool.updatedAt))}</small>
        </div>
        <div class="creative-manager-links">
          ${state.permissions.canInspect?`<button class="admin-btn creative-manager-edit" type="button" data-tool-id="${esc(tool.id)}">${state.permissions.canEdit?'EDIT DRAFT':'VIEW DETAILS'}</button>`:''}
          ${tool.status==='PUBLISHED'&&tool.publishedSlug?`<a class="admin-btn" href="/creative-lab/${encodeURIComponent(publicSlug)}" target="_blank" rel="noopener">DETAIL ↗</a><a class="admin-btn" href="/creative-lab/${encodeURIComponent(publicSlug)}/demo" target="_blank" rel="noopener">DEMO ↗</a>`:'<span class="creative-manager-unpublished">NO PUBLIC LINK</span>'}
        </div>
      </article>`;
    }).join('');
  }
  async function load({resetPage=false}={}){
    if(resetPage)state.page=1;
    state.request?.abort();
    state.request=new AbortController();
    el('creativeManagerNotice').textContent='Loading Creative Lab registry…';
    el('creativeManagerNotice').classList.remove('error','hidden');
    el('creativeManagerList').setAttribute('aria-busy','true');
    try{
      const response=await fetch(`/api/admin/creative-tools?${query()}`,{credentials:'include',cache:'no-store',signal:state.request.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Creative Lab registry could not be loaded.');
      state.total=Number(data.total||0);state.pages=Number(data.pages||1);state.page=Number(data.page||1);state.loaded=true;state.permissions=data.permissions||state.permissions;
      renderStats(data.facets);syncCategories(data.facets?.categories||[]);renderRows(data.tools||[]);
      const access=el('creativeManagerAccess');access.textContent=data.permissions?.readOnly?'VIEWER · READ ONLY':`${data.permissions?.role||role()} · DRAFT ACCESS`;
      access.classList.toggle('read-only',Boolean(data.permissions?.readOnly));
      el('creativeManagerCreate').hidden=!state.permissions.canEdit;
      el('creativeManagerCount').textContent=`${state.total} RESULT${state.total===1?'':'S'}`;
      el('creativeManagerPage').textContent=`PAGE ${state.page} / ${state.pages}`;
      el('creativeManagerPrev').disabled=state.page<=1;el('creativeManagerNext').disabled=state.page>=state.pages;
      el('creativeManagerNotice').classList.add('hidden');
    }catch(error){
      if(error?.name==='AbortError')return;
      el('creativeManagerNotice').textContent=error?.message||'Creative Lab registry could not be loaded.';
      el('creativeManagerNotice').classList.add('error');
      el('creativeManagerList').innerHTML='';
    }finally{el('creativeManagerList').removeAttribute('aria-busy')}
  }
  function schedule(){clearTimeout(state.timer);state.timer=setTimeout(()=>load({resetPage:true}),260)}
  Object.values(controls).forEach(control=>control?.addEventListener(control.type==='search'?'input':'change',schedule));
  el('creativeManagerRefresh').addEventListener('click',()=>load());
  el('creativeManagerCreate').addEventListener('click',()=>{if(!state.permissions.canEdit)return;const dialog=el('creativeToolCreate'),notice=el('creativeToolCreateNotice');notice.className='creative-manager-notice hidden';notice.textContent='';dialog.showModal();dialog.querySelector('[name="title"]')?.focus()});
  el('creativeToolCreateClose').addEventListener('click',()=>el('creativeToolCreate').close());
  el('creativeToolCreateForm').addEventListener('submit',createCustomTool);
  el('creativeManagerPrev').addEventListener('click',()=>{if(state.page>1){state.page--;load()}});
  el('creativeManagerNext').addEventListener('click',()=>{if(state.page<state.pages){state.page++;load()}});
  el('creativeManagerList').addEventListener('click',event=>{const button=event.target.closest('.creative-manager-edit');if(button)openEditor(button.dataset.toolId)});
  el('creativeToolEditorForm').addEventListener('submit',saveEditor);
  el('creativeToolPublish').addEventListener('click',()=>publicationAction('publish'));
  el('creativeToolUnpublish').addEventListener('click',()=>publicationAction('unpublish'));
  el('creativeToolRevisions').addEventListener('click',()=>state.revisionsOpen?(el('creativeToolRevisionPanel').classList.add('hidden'),state.revisionsOpen=false):loadRevisions());
  el('creativeToolRevisionRefresh').addEventListener('click',loadRevisions);
  el('creativeToolRevisionList').addEventListener('click',event=>{const button=event.target.closest('.creative-tool-restore');if(button)restoreRevision(button.dataset.revisionId)});
  el('creativeToolEditorFields').addEventListener('click',event=>{const button=event.target.closest('.creative-tool-media-open');if(button)openMediaPicker(button.dataset.mediaTarget)});
  el('creativeToolEditorFields').addEventListener('click',event=>{if(event.target.closest('#creativeToolUseExternalApp'))prepareExternalApp();if(event.target.closest('#creativeToolVerifyLiveUrl'))verifyLiveUrl()});
  el('creativeToolMediaPickerClose').addEventListener('click',()=>{el('creativeToolMediaPicker').close();state.mediaTarget=null});
  el('creativeToolMediaGrid').addEventListener('click',event=>{const button=event.target.closest('.creative-tool-media-item');if(button)chooseMedia(button.dataset.mediaUrl,button.dataset.mediaAlt)});
  el('creativeToolMediaSearch').addEventListener('input',()=>{clearTimeout(state.mediaTimer);state.mediaTimer=setTimeout(loadMediaPicker,240)});
  const closeEditor=()=>{el('creativeToolEditor').close();el('creativeToolRevisionPanel').classList.add('hidden');state.editing=null;state.revisionsOpen=false};
  el('creativeToolEditorClose').addEventListener('click',closeEditor);
  el('creativeToolEditorCancel').addEventListener('click',closeEditor);
  renderEditorFields();
  window.loadCreativeToolManager=()=>load();
  window.applyAdminRoleAccess?.();
  if(location.hash==='#admin-creative-tools')window.openAdminTab?.('creative-tools',{syncUrl:false});
})();
