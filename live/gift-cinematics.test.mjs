import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {GIFT_CATALOG,giftEvent} from './gift-engine.mjs';
test('every catalogued gift has a distinct keyed VFX with bounded active events',()=>{
 const source=readFileSync(new URL('./gift-cinematics.js',import.meta.url),'utf8');
 const stub={window:{},performance:{now:()=>1000}};
 runInNewContext(source,stub);
 const fx=stub.window.GiftCinematics;
 assert.equal(GIFT_CATALOG.length,21);
 for(const gift of GIFT_CATALOG){
  const evt=giftEvent(gift.names[0],1000);
  assert.ok(fx.keys.includes(evt.key),'missing '+evt.key);
  fx.trigger({x:550,y:1500,seat:{scale:.4}},evt,1000);
 }
 assert.ok(fx.activeCount()<=fx.MAX_RUNNING);
 assert.ok(fx.queuedCount()<=fx.MAX_PENDING);
 assert.equal(fx.MAX_RUNNING,1,'cinematics must be serialized to avoid stacking full-screen FX');
});
test('gift renderer supports canvas draw calls and reduced motion fallback',()=>{
 const source=readFileSync(new URL('./gift-cinematics.js',import.meta.url),'utf8');
 const sandbox={window:{},performance:{now:()=>1000}};runInNewContext(source,sandbox);
 const fx=sandbox.window.GiftCinematics;
 const evt=giftEvent('Galaxy',1000);
 fx.trigger({x:550,y:1500,seat:{scale:.4}},evt,1000);
 const fake=new Proxy({}, {get:(target,k)=> {
  if(k==='globalAlpha')return 1;
  if(k==='createRadialGradient')return()=>({addColorStop(){}});
  if(k==='canvas')return {width:1080,height:1920};
  return (...args)=>{};
 },set:()=>true});
 assert.doesNotThrow(()=>fx.render(fake,2200,true));
 assert.doesNotThrow(()=>fx.render(fake,2300,false));
});
