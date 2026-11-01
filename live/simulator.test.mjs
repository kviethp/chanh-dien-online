import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemoId,isDemoId,normalizeDemoName,publicAudienceStats,simulationGift,isDemoAllowed,SCENARIOS,DEMO_GIFTS} from './simulator.mjs';
test('IDs and names are always recognisably simulated',()=>{
 assert.equal(makeDemoId(15),'demo:15');assert.equal(isDemoId('demo:15'),true);
 assert.equal(isDemoId('tiktok-user'),false);
 assert.equal(normalizeDemoName('@nickname<>'),'nickname');
});
test('public audience metrics exclude mock profiles and points',()=>{
 const stats=publicAudienceStats([{demo:true,demoCoins:5000,coins:0},{demo:false,coins:99}]);
 assert.deepEqual(stats,{realViewers:1,demoViewers:1,realGiftPoints:99,demoGiftPoints:5000});
});
test('demo defaults offline and must be explicitly opted in on-air',()=>{
 assert.equal(isDemoAllowed('idle',false),true);
 assert.equal(isDemoAllowed('connected',false),false);
 assert.equal(isDemoAllowed('connecting',false),false);
 assert.equal(isDemoAllowed('connected',true),true);
});
test('admin mock gift bounded and scenario presets valid',()=>{
 assert.equal(DEMO_GIFTS.length,21);
 assert.deepEqual(simulationGift('Galaxy',1000,1),{giftName:'Galaxy',diamonds:1000,count:1,demo:true});
 assert.equal(simulationGift('Rose',999999,0).diamonds,50000);
 for(const s of Object.values(SCENARIOS))assert.ok(s.count>0 && s.intervalMs>=200);
});