import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
const loadEngine=async()=>{const context={};context.globalThis=context;vm.runInNewContext(await read('portfolio/contrast-analyzer-engine.js'),context);return context.ContrastAnalyzerEngine};

test('F02 receives exact color, type and local sampling controls',async()=>{
  const [html,js,registry]=await Promise.all([read('portfolio/creative-tool.html'),read('portfolio/creative-tool.js'),read('portfolio/creative-tool-module-registry.js')]);
  assert.match(js,/tool\.canonicalId==='F02'/);
  assert.match(html,/creative-tool-module-registry\.js/);
  assert.match(registry,/F02:\{scripts:\['\/contrast-analyzer-engine\.js'\]\}/);
  assert.match(js,/data-contrast-foreground/);
  assert.match(js,/data-contrast-background/);
  assert.match(js,/data-contrast-font-size/);
  assert.match(js,/data-contrast-canvas/);
  assert.match(js,/data-contrast-scale/);
});

test('F02 makes its color-math and compliance boundaries explicit',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/Color math alone cannot prove that flattened-image text or a complete interface is readable/);
  assert.match(js,/does not run OCR or locate text/);
  assert.doesNotMatch(js,/readability score|accessibility score/i);
  assert.doesNotMatch(js,/fetch\([^)]*contrast/);
});

test('contrast engine follows WCAG ratio and large-text thresholds',async()=>{
  const engine=await loadEngine();
  assert.equal(engine.contrastRatio('#000000','#FFFFFF'),21);
  const normal=engine.assess({foreground:'#767676',background:'#FFFFFF',fontSize:16,fontWeight:400});
  assert.equal(normal.large,false);
  assert.equal(normal.passesAA,true);
  assert.equal(normal.passesAAA,false);
  const large=engine.assess({foreground:'#767676',background:'#FFFFFF',fontSize:24,fontWeight:400});
  assert.equal(large.large,true);
  assert.equal(large.passesAAA,true);
});

test('image sampling is bounded and deterministic',async()=>{
  const engine=await loadEngine();
  assert.match(engine.validateImage({type:'image/gif',size:20}),/PNG, JPEG or WebP/);
  assert.match(engine.validateImage({type:'image/png',size:1},8000,6000),/40-megapixel/);
  const image={width:1,height:1,data:new Uint8ClampedArray([10,20,30,255])};
  assert.equal(engine.samplePixel(image,0,0),'#0A141E');
});

test('contrast controls are announced, keyboard native and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/data-contrast-status aria-live="polite"/);
  assert.match(js,/aria-pressed="true"/);
  assert.match(css,/\.contrast-demo__choices input:focus-visible\+span/);
  assert.match(css,/@media\(max-width:620px\).*\.contrast-demo/s);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.contrast-demo__art/s);
});
