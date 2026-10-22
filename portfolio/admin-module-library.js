(()=>{
  'use strict';
  const STORAGE_KEY='mahmudul-portfolio.module-presets.v1';
  const targets={heroConfig:'Hero',capabilitiesConfig:'Capabilities',navigationConfig:'Navigation',footerConfig:'Footer',aboutConfig:'About',amazonConfig:'Amazon specialization',socialLinks:'Social links'};
  const starters=[
    {id:'hero-conversion',target:'heroConfig',title:'Conversion hero',description:'Clear offer, two CTAs and rotating proof points.',data:{eyebrow:'DESIGN THAT MOVES BUSINESS',leadText:'I DESIGN',phrases:['BRANDS THAT SELL.','E-COMMERCE EXPERIENCES.','VISUALS THAT CONVERT.'],description:'Creative systems for brands, products and digital experiences.',primaryCta:{label:'START A PROJECT',url:'#contact'},secondaryCta:{label:'VIEW SELECTED WORK',url:'#work'}}},
    {id:'hero-editorial',target:'heroConfig',title:'Editorial hero',description:'A quieter, portfolio-led opening statement.',data:{eyebrow:'INDEPENDENT CREATIVE',leadText:'I BUILD',phrases:['DISTINCTIVE VISUAL SYSTEMS.','CLEARER DIGITAL EXPERIENCES.','WORK WITH LASTING DETAIL.'],description:'A focused practice across brand, e-commerce and digital design.',primaryCta:{label:'EXPLORE THE WORK',url:'#work'}}},
    {id:'capabilities-studio',target:'capabilitiesConfig',title:'Studio capabilities',description:'Four concise service cards for an independent creative practice.',data:[{title:'Amazon / E-commerce',description:'A+ content, listing systems and storefront direction.',url:'#amazon'},{title:'Brand systems',description:'Identity, packaging and cohesive visual language.',url:'#work'},{title:'Digital experiences',description:'Landing pages and conversion-focused interfaces.',url:'#work'},{title:'Motion content',description:'Product stories, social edits and launch assets.',url:'#work'}]},
    {id:'navigation-portfolio',target:'navigationConfig',title:'Portfolio navigation',description:'A compact primary menu with a contact CTA.',data:[{label:'WORK',url:'/#work',style:'LINK',enabled:true,desktop:true,mobile:true},{label:'AMAZON',url:'/#amazon',style:'LINK',enabled:true,desktop:true,mobile:true},{label:'JOURNAL',url:'/blog.html',style:'LINK',enabled:true,desktop:true,mobile:true},{label:'CONTACT',url:'/#contact',style:'CTA',enabled:true,desktop:true,mobile:true}]},
    {id:'about-short',target:'aboutConfig',title:'About / CV',description:'An approachable About profile with a CMS-managed CV action.',data:{eyebrow:'ABOUT',heading:'Creative thinking. Technical precision.',description:'I build clear, thoughtful visual systems for brands, products and digital experiences.',cvLabel:'DOWNLOAD CV'}},
    {id:'social-starter',target:'socialLinks',title:'Social profile starter',description:'A visible, editable set of social profile placeholders.',data:[{id:'linkedin',label:'LinkedIn',url:'https://linkedin.com/in/your-profile',icon:'linkedin',color:'#c6ff4c',size:18,visible:true,sortOrder:0},{id:'instagram',label:'Instagram',url:'https://instagram.com/your-profile',icon:'instagram',color:'#c6ff4c',size:18,visible:true,sortOrder:1},{id:'behance',label:'Behance',url:'https://behance.net/your-profile',icon:'behance',color:'#c6ff4c',size:18,visible:true,sortOrder:2}]}
  ];
  const readMine=()=>{try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(saved)?saved:[]}catch{return[]}};
  const writeMine=items=>localStorage.setItem(STORAGE_KEY,JSON.stringify(items));
  const field=id=>document.querySelector('#'+id);
  function apply(entry,status){const destination=field(entry.target);if(!destination){status.textContent='That module field is not available.';return}destination.value=JSON.stringify(entry.data,null,2);destination.dispatchEvent(new Event('input',{bubbles:true}));destination.focus();status.textContent=`${entry.title} inserted into ${targets[entry.target]}. Review it, then click SAVE SITE MODULES.`}
  function boot(){
    const form=document.querySelector('#siteConfigForm');
    if(!form||document.querySelector('#siteModuleLibrary'))return;
    const root=document.createElement('section');
    root.id='siteModuleLibrary';root.className='module-library';
    root.innerHTML='<div class="module-library-head"><div><span class="kicker">MODULE PRESET LIBRARY</span><h3>Start structured, then make it yours.</h3><p>Insert a safe JSON starter into one module field. Nothing reaches the live site until you save Site Modules.</p></div><span class="settings-badge">DRAFT HELP</span></div><div class="module-library-tools"><label>TARGET MODULE<select id="moduleSnippetTarget"></select></label><label>MY PRESET NAME<input id="moduleSnippetName" maxlength="60" placeholder="e.g. My launch hero"></label><button class="admin-btn" type="button" id="moduleSnippetSave">SAVE CURRENT AS MY PRESET</button></div><div id="moduleLibraryCards" class="module-library-cards"></div><p id="moduleLibraryStatus" class="module-library-status">Starter presets are reusable. My presets are stored in this browser only.</p>';
    form.insertAdjacentElement('beforebegin',root);
    const select=root.querySelector('#moduleSnippetTarget');Object.entries(targets).forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option)});
    const status=root.querySelector('#moduleLibraryStatus'),cards=root.querySelector('#moduleLibraryCards');
    const render=()=>{
      cards.replaceChildren();
      const all=[...starters,...readMine().map(item=>({...item,mine:true}))];
      all.forEach(entry=>{
        const card=document.createElement('article');card.className='module-snippet-card';
        const meta=document.createElement('small');meta.textContent=`${entry.mine?'MY PRESET':'STARTER'} · ${targets[entry.target]||'Module'}`;
        const title=document.createElement('strong');title.textContent=entry.title;
        const description=document.createElement('p');description.textContent=entry.description||'Reusable structured module preset.';
        const actions=document.createElement('div');actions.className='module-snippet-actions';
        const use=document.createElement('button');use.type='button';use.className='admin-btn';use.textContent='USE PRESET';use.addEventListener('click',()=>apply(entry,status));actions.append(use);
        if(entry.mine){const remove=document.createElement('button');remove.type='button';remove.className='admin-btn danger';remove.textContent='REMOVE';remove.addEventListener('click',()=>{writeMine(readMine().filter(item=>item.id!==entry.id));render();status.textContent='My preset removed from this browser.'});actions.append(remove)}
        card.append(meta,title,description,actions);cards.append(card);
      });
    };
    root.querySelector('#moduleSnippetSave').addEventListener('click',()=>{
      const target=select.value,name=root.querySelector('#moduleSnippetName').value.trim(),source=field(target);
      if(!name){status.textContent='Give your preset a short name first.';return}
      try{const data=JSON.parse(source.value||(['capabilitiesConfig','navigationConfig','socialLinks'].includes(target)?'[]':'{}'));const mine=readMine();mine.push({id:`mine-${Date.now()}`,target,title:name,description:'Saved from your current module draft.',data});writeMine(mine);root.querySelector('#moduleSnippetName').value='';render();status.textContent=`${name} saved as a browser-local preset.`}catch{status.textContent=`${targets[target]} must contain valid JSON before it can be saved as a preset.`}
    });
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
