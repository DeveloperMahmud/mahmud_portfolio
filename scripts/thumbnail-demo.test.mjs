import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

const loadEngine=async()=>{
  const context={};
  context.globalThis=context;
  vm.runInNewContext(await read('portfolio/thumbnail-readability-engine.js'),context);
  return context.ThumbnailReadabilityEngine;
};

test('F01 receives a bounded browser-local thumbnail engine',async()=>{
  const [html,js,engine]=await Promise.all([read('portfolio/creative-tool.html'),read('portfolio/creative-tool.js'),read('portfolio/thumbnail-readability-engine.js')]);
  assert.match(js,/if\(tool\.canonicalId==='F01'\)return thumbnailEngineDemo\(tool\)/);
  assert.match(js,/\[80,120,160\]/);
  assert.match(js,/accept="image\/png,image\/jpeg,image\/webp" data-thumbnail-file/);
  assert.match(html,/thumbnail-readability-engine\.js/);
  assert.match(engine,/MAX_BYTES=12\*1024\*1024/);
  assert.match(engine,/MAX_DIMENSION=12000/);
  assert.match(engine,/MAX_PIXELS=40_000_000/);
  assert.match(js,/URL\.createObjectURL\(file\)/);
});

test('engine exposes explainable components without fake certainty',async()=>{
  const [js,engine]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/thumbnail-readability-engine.js')]);
  assert.match(engine,/luminanceSpread/);
  assert.match(engine,/edgeDensity/);
  assert.match(engine,/requiresUpscaling/);
  assert.match(js,/data-thumbnail-check/);
  assert.match(js,/not OCR, Amazon compliance or a prediction of sales performance/);
  assert.doesNotMatch(js,/Technical preview score|resolutionScore|tonalScore|score\(\)/i);
  assert.doesNotMatch(js,/fetch\([^)]*thumbnail/);
});

test('engine exports a local evidence report',async()=>{
  const [js,engine]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/thumbnail-readability-engine.js')]);
  assert.match(js,/data-thumbnail-export/);
  assert.match(engine,/THUMBNAIL READABILITY REVIEW/);
  assert.match(js,/text\/plain;charset=utf-8/);
  assert.match(js,/thumbnail-readability-review\.txt/);
});

test('pixel observations remain deterministic facts rather than a composite score',async()=>{
  const engine=await loadEngine();
  const imageData={width:2,height:2,data:new Uint8ClampedArray([
    0,0,0,255,255,255,255,255,
    0,0,0,255,255,255,255,255
  ])};
  const result=engine.inspect(imageData,1200,900);
  assert.equal(result.width,1200);
  assert.equal(result.height,900);
  assert.equal(result.tonalLabel,'HIGH');
  assert.equal(result.detailLabel,'HIGH');
  assert.equal(result.previewFacts.length,3);
  assert.equal(result.previewFacts.every(item=>item.requiresUpscaling===false),true);
  assert.equal('score' in result,false);
});

test('file and decoded-pixel limits fail safely before canvas processing',async()=>{
  const engine=await loadEngine();
  assert.match(engine.validateFile({type:'image/gif',size:10}),/PNG, JPEG or WebP/);
  assert.match(engine.validateFile({type:'image/png',size:13*1024*1024}),/12 MB/);
  assert.match(engine.validateDimensions(8000,6000),/40-megapixel/);
  assert.equal(engine.validateDimensions(2400,1600),'');
});

test('thumbnail controls are keyboard-native, announced and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/type="radio" name="thumbnailSize"/);
  assert.match(js,/aria-live="polite"/);
  assert.match(js,/data-thumbnail-background/);
  assert.match(css,/\.thumbnail-demo__choices input:focus-visible\+span/);
  assert.match(css,/\.thumbnail-demo__metrics/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.thumbnail-demo__cell/s);
});
