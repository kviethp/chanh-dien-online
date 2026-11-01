import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAutoGiftConfig,selectGift,selectDemoTarget,giftOptions,AUTO_MIN_INTERVAL_MS} from './gift-simulator.mjs';
test('gift presets are bounded and explicitly simulated',()=>{
 const cfg=normalizeAutoGiftConfig({mode:'premium',target:'random',intervalMs:10,maxEvents:1000});
 assert.equal(cfg.intervalMs,AUTO_MIN_INTERVAL_MS);
 assert.equal(cfg.maxEvents,60);
 assert.equal(giftOptions('premium').every(g=>g.value>=500),true);
 assert.equal(giftOptions('small').every(g=>g.value<=99),true);
});
test('manual gift selection is deterministic',()=>{
 const cfg=normalizeAutoGiftConfig({mode:'selected',giftName:'Galaxy'});
 assert.equal(selectGift(cfg,()=>0).name,'Galaxy');
 assert.equal(selectGift({...cfg,mode:'all'},()=>0).name,'Hoa hồng');
});
test('only mock profiles can be automatic recipients',()=>{
 const viewers=[{id:'real',demo:false},{id:'demo:1',demo:true},{id:'demo:2',demo:true}];
 assert.equal(selectDemoTarget(viewers,{target:'random'},()=>0).id,'demo:1');
 assert.equal(selectDemoTarget(viewers,{target:'selected',targetId:'real'}),null);
 assert.equal(selectDemoTarget(viewers,{target:'selected',targetId:'demo:2'}).id,'demo:2');
});