// Deterministic, bounded simulation rules. Never triggers a TikTok purchase or payment.
import { DEMO_GIFTS, clampDemoNumber } from './simulator.mjs';

export const AUTO_MIN_INTERVAL_MS = 1800;
export const AUTO_MAX_EVENTS = 60;
export const AUTO_MODES = Object.freeze(['mixed','small','premium','selected','all']);
export const AUTO_TARGETS = Object.freeze(['random','selected']);
const SMALL_MAX = 99;
const PREMIUM_MIN = 500;
export function normalizeAutoGiftConfig(input = {}) {
  const mode = AUTO_MODES.includes(input.mode) ? input.mode : 'mixed';
  const target = AUTO_TARGETS.includes(input.target) ? input.target : 'random';
  const intervalMs = clampDemoNumber(input.intervalMs, AUTO_MIN_INTERVAL_MS, 15000);
  const maxEvents = clampDemoNumber(input.maxEvents, 1, AUTO_MAX_EVENTS);
  const selected = DEMO_GIFTS.find(g => g.name === input.giftName) || DEMO_GIFTS[0];
  const targetId = String(input.targetId||'').slice(0,45);
  return { mode, target, intervalMs, maxEvents, giftName:selected.name, targetId };
}
export function giftOptions(mode='mixed', giftName='Hoa hồng') {
  if(mode==='selected')return DEMO_GIFTS.filter(g=>g.name===giftName);
  if(mode==='small')return DEMO_GIFTS.filter(g=>g.value<=SMALL_MAX);
  if(mode==='premium')return DEMO_GIFTS.filter(g=>g.value>=PREMIUM_MIN);
  return DEMO_GIFTS;
}
export function selectGift(config, random=Math.random) {
  const list=giftOptions(config.mode, config.giftName);
  if(!list.length)return DEMO_GIFTS[0];
  return list[Math.min(list.length-1,Math.max(0,Math.floor(random()*list.length)))];
}
export function selectDemoTarget(viewers,config,random=Math.random) {
  const mock=[...viewers].filter(v=>v.demo);
  if(!mock.length)return null;
  if(config.target==='selected')return mock.find(v=>v.id===config.targetId)||null;
  return mock[Math.min(mock.length-1,Math.max(0,Math.floor(random()*mock.length)))];
}
export function safeDemoGiftLog({id,name,giftName,value,count,at=Date.now()}) {
  return {id:String(id).slice(0,45),name:String(name).slice(0,32),giftName:String(giftName).slice(0,40),
    value:clampDemoNumber(value,1,50000),count:clampDemoNumber(count,1,99),at:Number(at),demo:true};
}
