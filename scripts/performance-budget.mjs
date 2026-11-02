import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';

const root=path.resolve(process.cwd(),'portfolio');
const budgets={
  'index.html':100_000,
  'styles.css':360_000,
  'app.js':320_000,
  'page-studio-public.css':260_000,
  'page-studio-renderer.js':280_000,
  'creative-lab.css':180_000,
  'creative-tool.js':260_000
};
const results=[];
for(const [file,budget] of Object.entries(budgets)){
  const bytes=(await stat(path.join(root,file))).size;
  results.push({file,bytes,budget,passed:bytes<=budget});
}
const html=await readFile(path.join(root,'index.html'),'utf8');
const app=await readFile(path.join(root,'app.js'),'utf8');
const renderer=await readFile(path.join(root,'page-studio-renderer.js'),'utf8');
const head=html.split('</head>')[0];
const safeguards={
  responsiveImages:/loading="lazy"/.test(app)||/loading=['"]lazy['"]/.test(renderer),
  reducedMotion:/prefers-reduced-motion/.test(app)&&/prefers-reduced-motion/.test(renderer),
  noBlockingVideoAutoplay:!/<video[^>]+autoplay/i.test(html),
  headScriptsDeferred:[...head.matchAll(/<script\b[^>]*\bsrc=[^>]*>/gi)].every(match=>/\b(?:defer|async|type="module")\b/i.test(match[0]))
};
const report={generatedAt:new Date().toISOString(),budgets,results,safeguards,totalMeasuredBytes:results.reduce((sum,row)=>sum+row.bytes,0)};
console.log(JSON.stringify(report,null,2));
if(results.some(row=>!row.passed)||Object.values(safeguards).some(value=>!value))process.exitCode=1;
