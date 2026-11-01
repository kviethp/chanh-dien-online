import test from 'node:test';
import assert from 'node:assert/strict';
import {createSeatLayout,findPathPoints,validateSeatLayout} from './stage-geometry.mjs';
test('seat counts and uniqueness with aisle clearance',()=>{
 for(const cap of [24,36,64,100]){
  const seats=createSeatLayout(cap);
  assert.equal(seats.length,cap);
  assert.ok(validateSeatLayout(seats,cap));
  assert.equal(new Set(seats.map(p=>p.x+':'+p.y)).size,cap);
 }
});
test('path starts at main gate, traverses central aisle, then turns into row',()=>{
 for(const seat of createSeatLayout(100)){
  const path=findPathPoints(seat);
  assert.equal(path.length,4);
  assert.deepEqual(path[0],{x:540,y:2015});
  assert.equal(path[1].x,540);
  assert.equal(path[2].y,path[1].y);
  assert.deepEqual(path[3],{x:seat.x,y:seat.y});
 }
});
test('actual browser stage renderer geometry matches node module', async()=>{
 const {readFileSync}=await import('node:fs');
 const {runInNewContext}=await import('node:vm');
 const src=readFileSync(new URL('./stage-scene.js',import.meta.url),'utf8');
 class FakeImage{complete=false;naturalWidth=0;}
 const sandbox={window:{},Image:FakeImage};runInNewContext(src,sandbox);
 for(const n of [24,36,64,100]){
  const expected=createSeatLayout(n),actual=sandbox.window.StageScene.layout(n);
  assert.equal(actual.length,expected.length);
  for(let i=0;i<n;i++){
   assert.ok(Math.abs(actual[i].x-expected[i].x)<.001);
   assert.ok(Math.abs(actual[i].y-expected[i].y)<.001);
  }
 }
});
test('layer assets exist and are not baked seat positions',async()=>{
 const {readFileSync}=await import('node:fs');
 const names=['floor-clean.svg','meditation-cushion.svg','foreground-entrance.svg'];
 for(const name of names){
  const str=readFileSync(new URL('../assets/scenes/'+name,import.meta.url),'utf8');
  assert.match(str,/<svg\s/);
  assert.match(str,/<\/svg>/);
 }
 const overlay=readFileSync(new URL('./overlay.html',import.meta.url),'utf8');
 assert.match(overlay,/stage-scene\.js/);
 assert.match(overlay,/stageScene\.drawBackground\(ctx,A\.hall,seats\)/);
});

test('background cache is bounded across four seat configurations', async()=>{
 const {readFileSync}=await import('node:fs');
 const src=readFileSync(new URL('./stage-scene.js',import.meta.url),'utf8');
 const {runInNewContext}=await import('node:vm');
 class ImageStub{constructor(){this.complete=true;this.naturalWidth=720;}}
 class ContextStub{drawImage(){} save(){} restore(){}}
 const sandbox={window:{},Image:ImageStub,document:{createElement:()=>({width:0,height:0,getContext:()=>new ContextStub()})}};
 runInNewContext(src,sandbox);
 const stage=sandbox.window.StageScene,context=new ContextStub(),hall=new ImageStub();
 for(const cap of [24,36,64,100])stage.drawBackground(context,hall,stage.layout(cap));
 assert.ok(stage.cacheSize()<=2);
});
