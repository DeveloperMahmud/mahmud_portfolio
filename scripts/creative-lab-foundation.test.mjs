import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const script=fs.readFileSync('portfolio/creative-lab-components.js','utf8');
const context={URL};
context.globalThis=context;
vm.runInNewContext(script,context);
const ui=context.CreativeLabUI;

test('Creative Lab action resolver never emits a dead link',()=>{
  const action=ui.resolvePrimaryAction({slug:'thumbnail-tester',status:'PREVIEW',primaryBehavior:'LIVE',liveUrl:''});
  assert.equal(action.href,'/creative-lab/thumbnail-tester/demo');
  assert.equal(action.label,'View Demo');
  assert.notEqual(action.href,'#');
});

test('live CTA requires verified HTTPS and protects new tabs',()=>{
  const action=ui.resolvePrimaryAction({slug:'tool',status:'LIVE',primaryBehavior:'AUTO',liveUrl:'https://tools.example.com/app',liveUrlVerifiedAt:'2026-10-29',target:'NEW_TAB'});
  assert.equal(action.href,'https://tools.example.com/app');
  assert.equal(action.target,'_blank');
  assert.equal(action.rel,'noopener noreferrer');
  const unsafe=ui.resolvePrimaryAction({slug:'tool',status:'LIVE',primaryBehavior:'AUTO',liveUrl:'javascript:alert(1)',liveUrlVerifiedAt:'2026-10-29'});
  assert.equal(unsafe.href,'/creative-lab/tool/demo');
});

test('published snapshot action descriptors drive catalog CTAs',()=>{
  const action=ui.resolvePrimaryAction({publishedSlug:'sample',actions:{primary:{label:'Open Preview',url:'/creative-lab/sample/demo',target:'SAME_TAB'}}});
  assert.equal(action.href,'/creative-lab/sample/demo');
  assert.equal(action.label,'Open Preview');
  assert.equal(action.target,'_self');
  assert.equal(action.rel,'');
});

test('tool cards escape content and expose meaningful status/action semantics',()=>{
  const card=ui.renderToolCard({slug:'safe-tool',title:'Safe <Tool>',shortDescription:'A clear & honest demo.',status:'PREVIEW',category:'Amazon',tags:['Audit','Preview']});
  assert.match(card,/Safe &lt;Tool&gt;/);
  assert.match(card,/Concept Demo/);
  assert.match(card,/href="\/creative-lab\/safe-tool\/demo"/);
  assert.doesNotMatch(card,/href="#"/);
  assert.match(card,/aria-label="Tags"/);
});

test('foundation CSS covers responsive, focus and reduced-motion states',()=>{
  const css=fs.readFileSync('portfolio/creative-lab.css','utf8');
  assert.match(css,/@media\(max-width:680px\)/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
