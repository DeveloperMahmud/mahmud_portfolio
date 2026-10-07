/* Shared cinematic particle background. No external dependency. */
(()=>{
  const host=document.querySelector('.ambient-bg');
  if(!host || host.querySelector('.neural-canvas')) return;
  const canvas=document.createElement('canvas');
  canvas.className='neural-canvas';
  canvas.setAttribute('aria-hidden','true');
  host.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx) return;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const coarse=window.matchMedia?.('(pointer:coarse)').matches;
  const DEFAULT={enabled:true,style:'NEURAL',density:46,speed:.22,linkDistance:150,nodeSize:1,lineOpacity:.16,depth:1,mouseStrength:.35,pulse:.35};
  const state={w:0,h:0,dpr:1,nodes:[],mx:.5,my:.5,scroll:0,raf:0,last:0,cfg:{...DEFAULT},loaded:false};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const safeCfg=(raw={})=>({...DEFAULT,...raw,
    density:clamp(Number(raw.density??DEFAULT.density),16,90),speed:clamp(Number(raw.speed??DEFAULT.speed),0,1),
    linkDistance:clamp(Number(raw.linkDistance??DEFAULT.linkDistance),70,240),nodeSize:clamp(Number(raw.nodeSize??DEFAULT.nodeSize),.4,2.5),
    lineOpacity:clamp(Number(raw.lineOpacity??DEFAULT.lineOpacity),.03,.45),depth:clamp(Number(raw.depth??DEFAULT.depth),.3,1.8),
    mouseStrength:clamp(Number(raw.mouseStrength??DEFAULT.mouseStrength),0,1),pulse:clamp(Number(raw.pulse??DEFAULT.pulse),0,1)
  });
  function count(){const target=state.cfg.density*(coarse?.72:1);return Math.round(clamp(target,16,90));}
  function makeNode(){return {x:(Math.random()-.5)*2,y:(Math.random()-.5)*2,z:.18+Math.random()*.95,vx:(Math.random()-.5)*.000075,vy:(Math.random()-.5)*.000075,vz:(Math.random()-.5)*.000025,r:.65+Math.random()*1.15,phase:Math.random()*Math.PI*2,seed:Math.random(),orbit:Math.random()*Math.PI*2,orbitR:.15+Math.random()*.7};}
  function resize(){state.dpr=Math.min(devicePixelRatio||1,2);state.w=innerWidth;state.h=innerHeight;canvas.width=Math.floor(state.w*state.dpr);canvas.height=Math.floor(state.h*state.dpr);canvas.style.width=state.w+'px';canvas.style.height=state.h+'px';ctx.setTransform(state.dpr,0,0,state.dpr,0,0);const needed=count();while(state.nodes.length<needed)state.nodes.push(makeNode());if(state.nodes.length>needed)state.nodes.length=needed;}
  function reset(n){Object.assign(n,makeNode());}
  function project(n){const depth=(1/(n.z+.45))*state.cfg.depth;return {x:state.w*.5+n.x*state.w*.44*depth,y:state.h*.5+n.y*state.h*.44*depth,z:depth,n};}
  function drawConstellation(points,dist,opacity){for(let i=0;i<points.length;i++){const a=points[i];for(let j=i+1;j<points.length;j++){const b=points[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<dist){const alpha=(1-d/dist)*opacity*(.55+a.z*.45);ctx.strokeStyle=`rgba(199,255,61,${alpha.toFixed(3)})`;ctx.lineWidth=.45+(1-d/dist)*.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}}
  function frame(ts){
    const dt=Math.min(34,state.last?ts-state.last:16);state.last=ts;ctx.clearRect(0,0,state.w,state.h);
    const speed=state.cfg.speed*(reduce?0:1), mouseX=(state.mx-.5)*state.cfg.mouseStrength, mouseY=(state.my-.5)*state.cfg.mouseStrength;
    const points=[];
    for(const n of state.nodes){
      if(speed){
        if(state.cfg.style==='ORBITAL'){n.orbit+=.00009*dt*(.3+speed*2);n.x=Math.cos(n.orbit+n.seed)*n.orbitR*.85+mouseX*.04;n.y=Math.sin(n.orbit+n.seed)*n.orbitR*.62+mouseY*.04;n.z=.25+.45*(.5+.5*Math.sin(n.orbit*.7+n.seed*5));}
        else {n.x+=(n.vx*speed)*dt*60;n.y+=(n.vy*speed)*dt*60;n.z+=(n.vz*speed)*dt*60;n.phase+=.0025*dt*speed;n.x+=mouseX*.00003*dt;n.y+=mouseY*.00003*dt;if(n.z<.16||n.z>1.3||Math.abs(n.x)>1.25||Math.abs(n.y)>1.25)reset(n);}
      }
      points.push(project(n));
    }
    const style=String(state.cfg.style||'NEURAL').toUpperCase();
    if(style==='NEURAL'||style==='CONSTELLATION')drawConstellation(points,state.cfg.linkDistance,state.cfg.lineOpacity*(style==='CONSTELLATION'?1.2:1));
    if(style==='ORBITAL'){
      ctx.save();ctx.translate(state.w*.5,state.h*.5);ctx.strokeStyle=`rgba(199,255,61,${state.cfg.lineOpacity*.55})`;ctx.lineWidth=.7;[.26,.42,.58].forEach(r=>{ctx.beginPath();ctx.ellipse(0,0,state.w*r,state.h*r*.42,0,0,Math.PI*2);ctx.stroke()});ctx.restore();drawConstellation(points,state.cfg.linkDistance*.72,state.cfg.lineOpacity*.65);
    }
    for(const p of points){const n=p.n,pulse=1+Math.sin(n.phase+n.seed*8)*state.cfg.pulse*.22,r=n.r*state.cfg.nodeSize*(.78+p.z*.62)*pulse;ctx.fillStyle=`rgba(199,255,61,${style==='MINIMAL'?'.58':'.72'})`;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();if(style==='NEURAL'&&n.seed>.8){ctx.fillStyle='rgba(235,238,230,.48)';ctx.beginPath();ctx.arc(p.x,p.y,r*.3,0,Math.PI*2);ctx.fill();}}
    if(!reduce&&state.cfg.enabled)state.raf=requestAnimationFrame(frame);
  }
  async function loadConfig(){
    try{const r=await fetch('/api/public/settings',{cache:'no-store'});if(r.ok){const d=await r.json();state.cfg=safeCfg(d?.settings?.sliderConfig?.particleConfig||{});}}
    catch{}
    state.loaded=true;resize();if(state.cfg.enabled&&!reduce)state.raf=requestAnimationFrame(frame);else frame(performance.now());
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{state.mx=e.clientX/state.w;state.my=e.clientY/state.h;host.style.setProperty('--neural-mx',((state.mx-.5)*12*state.cfg.mouseStrength).toFixed(2)+'px');host.style.setProperty('--neural-my',((state.my-.5)*9*state.cfg.mouseStrength).toFixed(2)+'px')},{passive:true});
  addEventListener('scroll',()=>{state.scroll=scrollY||0;host.style.setProperty('--neural-scroll',Math.min(state.scroll/1400,1).toFixed(3))},{passive:true});
  if(reduce){resize();frame(performance.now());return;}
  loadConfig();
})();
