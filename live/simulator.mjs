// Simulation contract shared by the LIVE backend and automated tests.
// Simulated participants/gifts MUST be recognisable as demo data on the broadcast
// and MUST NOT be reported as real donors or viewers.
export const DEMO_ID_PREFIX = 'demo:';
export const MAX_DEMO_VIEWERS = 100;
export const DEMO_SKINS = Object.freeze(['man','woman','granny','monk','nun','child','master']);
export const DEMO_PROFILES = Object.freeze([
 'Mô Phỏng An Nhiên','Mô Phỏng Minh Tâm','Mô Phỏng Diệu Hạnh',
 'Mô Phỏng Tịnh An','Mô Phỏng Thanh Liên','Mô Phỏng Tuệ Minh',
 'Mô Phỏng Pháp Hỷ','Mô Phỏng Bảo An','Mô Phỏng Hoa Sen',
 'Mô Phỏng Thảo Vy','Mô Phỏng Đức Thiện','Mô Phỏng Tâm Bình'
]);
export const DEMO_GIFTS = Object.freeze([
 {name:'Hoa hồng',value:1},{name:'TikTok',value:1},{name:'GG',value:1},
 {name:'Heart Me',value:1},{name:'Finger Heart',value:5},{name:'Rosa',value:10},
 {name:'Perfume',value:20},{name:'Doughnut',value:30},{name:'Paper Crane',value:99},
 {name:'Confetti',value:100},{name:'Butterfly for You',value:299},{name:'Corgi',value:299},
 {name:'Money Gun',value:500},{name:'Swan',value:699},{name:'Galaxy',value:1000},
 {name:'Fireworks',value:1088},{name:'Whale Diving',value:2150},
 {name:'Meteor Shower',value:3000},{name:'Interstellar',value:10000},
 {name:'Lion',value:29999},{name:'TikTok Universe',value:44999}
]);
export const SCENARIOS = Object.freeze({
 'welcome': {label:'Đoàn phật tử bước vào', count:6, gift:false, intervalMs:950},
 'flowers': {label:'Dâng hoa sen nhỏ', count:6, gift:true, giftIndex:0, intervalMs:1400},
 'premium': {label:'Bốn cấp hiệu ứng quà cao', count:4, gift:true, values:[500,1000,3000,10000], intervalMs:5200},
 'crowd': {label:'Kiểm thử 36 người vào điện', count:36, gift:false, intervalMs:220},
});
export const clampDemoNumber=(n,min,max)=>Math.max(min,Math.min(max,Math.round(Number(n)||0)));
export function normalizeDemoName(name) {
  const s=String(name||'').replace(/[\u0000-\u001f\u007f]/g,'')
    .replace(/[@<>]/g,'').replace(/\s+/g,' ').trim().slice(0,18);
  return s || 'Phật tử mẫu';
}
export function makeDemoId(n) {return DEMO_ID_PREFIX+String(clampDemoNumber(n,1,999999));}
export function isDemoId(id) {return String(id||'').startsWith(DEMO_ID_PREFIX);}
export function isDemoAllowed(status, onAirEnabled) {
  return status!=='connected' && status!=='connecting' || onAirEnabled===true;
}
export function publicAudienceStats(viewers) {
  let realViewers=0,demoViewers=0,realGiftPoints=0,demoGiftPoints=0;
  for(const p of viewers) {
    if(p.demo){demoViewers++;demoGiftPoints+=Number(p.demoCoins)||0;}
    else {realViewers++;realGiftPoints+=Number(p.coins)||0;}
  }
  return {realViewers,demoViewers,realGiftPoints,demoGiftPoints};
}
export function simulationGift(name, value, count=1) {
  const giftName=String(name||'Hoa hồng').slice(0,40);
  return {giftName, diamonds:clampDemoNumber(value,1,50000),count:clampDemoNumber(count,1,99),demo:true};
}
