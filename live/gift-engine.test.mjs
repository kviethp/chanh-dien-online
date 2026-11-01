import test from 'node:test';
import assert from 'node:assert/strict';
import { findGift, giftEvent, getGiftTier, getSeatCapacity, HIGH_GIFT_MIN } from './gift-engine.mjs';

test('premium tiers activate at the exact donation thresholds', () => {
  assert.equal(HIGH_GIFT_MIN, 500);
  for (const [amount, name] of [[1,'basic'], [98,'basic'],[99,'regular'],[499,'regular'],[500,'high'],[999,'high'],[1000,'vip'],[2999,'vip'],[3000,'elite'],[9999,'elite'],[10000,'legend']]) {
    assert.equal(getGiftTier(amount).key, name, 'amount '+amount);
  }
});
test('gift catalog maps Vietnamese and English names', () => {
  assert.equal(findGift('Hoa hồng')?.key,'rose');
  assert.equal(findGift('Súng tiền')?.key,'moneygun');
  assert.equal(findGift('TikTok Universe')?.key,'universe');
  assert.equal(findGift('Unknown Gift'),null);
});
test('high gifts unlock aura and session props, and basic gifts do not', () => {
  const now=1_000_000;
  const basic=giftEvent('Hoa hồng',1,now), high=giftEvent('Money Gun',500,now);
  assert.equal(basic.auraUntil,0);
  assert.equal(basic.rewardUntil,null);
  assert.equal(high.auraUntil,now+30000);
  assert.equal(high.outfit,'gold-trim');
  assert.equal(high.prop,'beads');
});
test('higher tiers provide persistent or time-limited props',()=>{
  const now=1_000_000;
  assert.equal(giftEvent('Galaxy',1000,now).rewardUntil,now+900000);
  assert.equal(giftEvent('Meteor Shower',3000,now).rewardUntil,0);
  assert.equal(giftEvent('Interstellar',10000,now).rewardUntil,0);
});
test('seat capacity respects fixed limits and auto expands',()=>{
  assert.equal(getSeatCapacity('24',30),24);
  assert.equal(getSeatCapacity('auto',25),36);
  assert.equal(getSeatCapacity('auto',65),100);
});
