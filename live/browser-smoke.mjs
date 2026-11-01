// Headless integration test against the real Node server and browser overlay.
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';
const port=31877, root='http://127.0.0.1:'+port;
const out=resolve('qa-artifacts');mkdirSync(out,{recursive:true});
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let logs='',browser,contextRef=null,overlayVideo=null;
for(const p of [child.stdout,child.stderr])p.on('data',buf=>logs+=buf);
async function until(fn,message,ms=14000){
 const start=Date.now();while(Date.now()-start<ms){try{if(await fn())return;}catch{}await sleep(150);}
 throw new Error('Timeout '+message);
}
try{
 await until(async()=>{const r=await fetch(root+'/live/control.html');return r.ok;},'server');
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const ctx=await browser.newContext({viewport:{width:540,height:960},recordVideo:{dir:out,size:{width:540,height:960}}});contextRef=ctx;
 const errs=[];const ui=await ctx.newPage(),live=await ctx.newPage();overlayVideo=live.video();
 for(const [name,p] of [['admin',ui],['overlay',live]])p.on('pageerror',e=>errs.push(name+': '+e.message));
 await live.goto(root+'/live/overlay.html');await ui.goto(root+'/live/control.html');
 await until(()=>ui.locator('#srv').innerText().then(t=>t.includes('đang chạy')),'control connected');

 // The operator unlocks sound before broadcasting. Do not screenshot the setup button.
 const assetHealth=await live.evaluate(async()=>{
   await Promise.all(Object.values(window.StageScene.images).map(im=>im.decode().catch(()=>{})));
   await Promise.all(Object.values(window.PremiumVisuals.assets).map(im=>im.decode().catch(()=>{})));
   const errors=[...Object.entries(window.StageScene.images),...Object.entries(window.PremiumVisuals.assets)]
     .filter(([name,im])=>!im.complete||im.naturalWidth===0).map(([name])=>name);
   return {errors,stageLayers:Object.keys(window.StageScene.images).length,premiumLayers:Object.keys(window.PremiumVisuals.assets).length};
 });
 if(assetHealth.errors.length)throw Error('Missing visual assets: '+assetHealth.errors.join(', '));
 await live.locator('#unmute').click();
 await until(()=>live.locator('#unmute').count().then(x=>x===0),'audio activated');
 const captures=[];
 let ciApproxFps100=null;
 // Capture a clean hall without an older gift banner or FX obscuring the scene.
 for(const [cap,amount] of [[24,15],[36,36],[64,64],[100,100]]){
   await ui.locator('#seatMode').selectOption(String(cap));
   await ui.locator('[data-fill="'+amount+'"]').click();
   await until(()=>ui.locator('#cnt').innerText().then(t=>t.includes(amount+' mẫu')),cap+' seated',20000);
   await live.waitForTimeout(5000);
   const path=resolve(out,'overlay_'+cap+'.png');await live.screenshot({path});
   const valid=await live.evaluate(expected=>window.StageScene?.layout(expected).length===expected,cap);
   if(!valid)throw Error('wrong layout '+cap);
   if(cap===100){
     await live.bringToFront();
     ciApproxFps100=await live.evaluate(()=>new Promise(resolve=>{
       let count=0,first=null;
       function sample(t){if(first===null)first=t;count++;
         if(t-first>=3500)resolve(Math.round((count-1)*1000/(t-first)*10)/10);
         else requestAnimationFrame(sample);
       }
       requestAnimationFrame(sample);
     }));
   }
   captures.push({cap,amount,path});
   if(cap===36||cap===100) {
     await live.setViewportSize({width:1080,height:1920});
     await live.screenshot({path:resolve(out,'overlay_'+cap+'_full_hd.png')});
     await live.setViewportSize({width:540,height:960});
   }
   await ui.locator('#demoReset').click();
   await until(()=>ui.locator('#cnt').innerText().then(t=>t.includes('0 mẫu')),'reset '+cap);
 }
 // Manual and automated gift simulation after baseline snapshots.
 await ui.locator('#demoName').fill('An Nhiên');
 await ui.locator('#demoCreate').click();
 await until(()=>ui.locator('#demoTarget option').count().then(n=>n>0),'demo user');
 const user=await ui.locator('#demoTarget').inputValue();
 if(!user.startsWith('demo:'))throw Error('Not a demo id: '+user);
 await ui.locator('#demoGift').selectOption('Galaxy');await ui.locator('#demoSendGift').click();
 await until(()=>ui.locator('#autoGiftHistory').innerText().then(t=>t.includes('Galaxy')),'demo gift');
 await until(()=>live.locator('#giftWho').innerText().then(t=>t.includes('MÔ PHỎNG')),'mock gift label');
 await ui.locator('#autoGiftMode').selectOption('selected');await ui.locator('#autoGiftLimit').fill('2');
 await ui.locator('#autoGiftInterval').fill('1.8');await ui.locator('#autoGiftStart').click();
 await until(()=>ui.locator('#autoGiftStatus').innerText().then(t=>t.includes('2 / 2')&&t.includes('Đã dừng')),'auto gifts',16000);
 await live.screenshot({path:resolve(out,'gift_demo.png')});
 // A high tier event must update the mock actor while retaining the public mock label.
 await ui.locator('#demoGift').selectOption('Interstellar');await ui.locator('#demoSendGift').click();
 await until(()=>ui.locator('#autoGiftHistory').innerText().then(t=>t.includes('Interstellar')),'legend mock gift');
 await until(()=>live.locator('#giftWhat').innerText().then(t=>t.includes('Interstellar')),'legend cinematic visible',24000);
 await live.waitForTimeout(500);
 await live.screenshot({path:resolve(out,'premium-gift.png')});

 // Stress case: 100 simulated occupants and five premium gifts in a burst.
 // Browser CI is reference-only; OBS hardware acceptance remains a separate gate.
 await ui.locator('#demoReset').click();
 await until(()=>ui.locator('#cnt').innerText().then(t=>t.includes('0 mẫu')),'reset before stress');
 await ui.locator('#seatMode').selectOption('100');
 await ui.locator('[data-fill="100"]').click();
 await until(()=>ui.locator('#cnt').innerText().then(t=>t.includes('100 mẫu')),'100-player stress setup',22000);
 await live.waitForTimeout(5000);
 await ui.locator('#demoGift').selectOption('Galaxy');
 for(let i=0;i<5;i++) {
   await ui.locator('#demoTarget').selectOption({index:i});
   await ui.locator('#demoSendGift').click();
 }
 await live.bringToFront();
 const ciApproxFps100WithGifts=await live.evaluate(()=>new Promise(resolve=>{
   let start=null,count=0;
   function next(t){if(start===null)start=t;count++;
     if(t-start>=3500)resolve(Math.round((count-1)*1000/(t-start)*10)/10);
     else requestAnimationFrame(next);
   }requestAnimationFrame(next);
 }));
 await live.screenshot({path:resolve(out,'stress_100_5_gifts.png')});

 if(errs.length)throw Error('Page errors: '+errs.join('; '));
 const report={passed:true,captures,errors:errs,assetHealth,ciApproxFps100,ciApproxFps100WithGifts,video:'overlay-demo.webm'};writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));
 console.log('BROWSER_SMOKE_PASS',JSON.stringify(report));
}catch(e){
 writeFileSync(resolve(out,'error.txt'),String(e.stack||e)+'\n'+logs);
 console.error('BROWSER_SMOKE_FAIL',e.stack||e);process.exitCode=1;
}finally{
 try{await contextRef?.close();if(overlayVideo)await overlayVideo.saveAs(resolve(out,'overlay-demo.webm'));}
 catch(e){console.warn('Video export:',e.message);}
 await browser?.close();child.kill();
}
