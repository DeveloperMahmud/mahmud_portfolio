(()=>{'use strict';
const presets={
 MIDNIGHT_LIME:{background:'#090a09',panel:'#111311',text:'#f3f3ee',muted:'#92978f',accent:'#c7ff3d'},
 GRAPHITE_BLUE:{background:'#090c12',panel:'#111722',text:'#f2f6ff',muted:'#8e9aae',accent:'#66a3ff'},
 WARM_EDITORIAL:{background:'#120e0d',panel:'#1b1513',text:'#f8f0e8',muted:'#ad9b91',accent:'#ffb86b'}
};
const clean=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(String(value||''))?String(value):fallback;
const mix=(hex,amount=.24)=>{const rgb=hex.slice(1).match(/../g).map(value=>parseInt(value,16)),base=hex==='#f3f3ee'?0:255;return `rgba(${rgb.map(value=>Math.round(value*(1-amount)+base*amount)).join(',')},.28)`};
function normalized(input={}){const preset=String(input.preset||'MIDNIGHT_LIME'),base=presets[preset]||presets.MIDNIGHT_LIME;return {...base,...input,preset,background:clean(input.background,base.background),panel:clean(input.panel,base.panel),text:clean(input.text,base.text),muted:clean(input.muted,base.muted),accent:clean(input.accent,base.accent)}}
function apply(input={}){const theme=normalized(input),root=document.documentElement,rawOpacity=Number(theme.grainOpacity),grainOpacity=Number.isFinite(rawOpacity)?rawOpacity:.045,grainScale=Math.max(.5,Math.min(3,Number(theme.grainScale)||1));root.dataset.siteTheme=theme.preset;root.dataset.grain=theme.grainStyle||'FINE';root.style.setProperty('--bg',theme.background);root.style.setProperty('--panel',theme.panel);root.style.setProperty('--text',theme.text);root.style.setProperty('--muted',theme.muted);root.style.setProperty('--lime',theme.accent);root.style.setProperty('--line',mix(theme.muted));root.style.setProperty('--ps-bg',theme.background);root.style.setProperty('--ps-panel',theme.panel);root.style.setProperty('--ps-text',theme.text);root.style.setProperty('--ps-muted',theme.muted);root.style.setProperty('--ps-accent',theme.accent);root.style.setProperty('--grain-opacity',String(Math.max(0,Math.min(.18,grainOpacity))));root.style.setProperty('--grain-scale',String(grainScale));root.style.setProperty('--grain-size',`${Math.round(180*grainScale)}px`);document.dispatchEvent(new CustomEvent('portfolio:theme-applied',{detail:theme}));return theme}
async function load(){try{const response=await fetch('/api/public/settings',{cache:'no-store'});if(!response.ok)return apply();const data=await response.json();return apply(data.settings?.themeConfig||{})}catch{return apply()}}
window.PortfolioTheme={apply,load,presets,normalized};load();
})();
