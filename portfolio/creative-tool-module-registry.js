(()=>{
  'use strict';
  const modules=Object.freeze({
    F01:{scripts:['/thumbnail-readability-engine.js']},F02:{scripts:['/contrast-analyzer-engine.js']},F03:{scripts:['/creative-planner-engine.js']},
    F04:{scripts:['/creative-brief-engine.js']},F05:{scripts:['/listing-audit-engine.js']},F06:{scripts:[]},
    M01:{scripts:['/creative-tool-mini-demos.js']},M02:{scripts:['/creative-tool-mini-demos.js']},M03:{scripts:['/creative-tool-mini-demos.js']},
    M04:{scripts:['/creative-tool-mini-demos.js']},M05:{scripts:['/creative-tool-mini-demos.js']},M06:{scripts:['/creative-tool-mini-demos.js']}
  });
  const pending=new Map();
  function loadScript(src){
    if(pending.has(src))return pending.get(src);
    const current=[...document.scripts].find(script=>new URL(script.src,location.href).pathname===src);
    if(current?.dataset.creativeModuleReady==='true')return Promise.resolve();
    const promise=new Promise((resolve,reject)=>{
      const script=current||document.createElement('script');
      script.addEventListener('load',()=>{script.dataset.creativeModuleReady='true';resolve()},{once:true});
      script.addEventListener('error',()=>reject(new Error(`The ${src.split('/').pop()} module could not be loaded.`)),{once:true});
      if(!current){script.src=src;script.defer=true;script.dataset.creativeToolModule='';document.head.appendChild(script)}
    });
    pending.set(src,promise);return promise;
  }
  async function load(tool){
    const key=String(tool?.canonicalId||'').toUpperCase(),descriptor=modules[key];
    if(!descriptor)return {key:key||'CUSTOM',custom:true,scripts:[]};
    await Promise.all(descriptor.scripts.map(loadScript));return {key,custom:false,scripts:[...descriptor.scripts]};
  }
  window.CreativeToolModules=Object.freeze({load,has:key=>Boolean(modules[String(key||'').toUpperCase()]),keys:Object.freeze(Object.keys(modules))});
})();
