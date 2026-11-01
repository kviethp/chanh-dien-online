// Headless integration test against the real Node server and browser overlay.
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';
const port=31877, root='http://127.0.0.1:'+port;
const out=resolve('qa-artifacts');mkdirSync(out,{recursive:true});
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const p of [child.stdout,child.stderr])p.on('data',buf=>logs+=buf);
async function until(fn,message,ms=14000){
 const start=Date.now();while(Date.now()-start<ms){try{if(await fn())return;}catch{}await sleep(150);}
 throw new Error('Timeout '+message);
}
try{
 await until(async()=>{const r=await fetch(root+'/live/control.html');return r.ok;},'server');
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const ctx=await browser.newContext({viewport:{width:540,height:960}});
 const errs=[];const ui=await ctx.newPage(),live=await ctx.newPage();
 for(const [name,p] of [['admin',ui],['overlay',live]])p.on('pageerror',e=>errs.push(name+': '+e.message));
 await live.goto(root+'/live/overlay.html');await ui.goto(root+'/live/control.html');
 await until(()=>ui.locator('#srv').innerText().then(t=>t.includes('đang chạy')),'control connected');
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
 await ui.locator('#demoReset').click();
 const captures=[];
 for(const [cap,amount] of [[24,15],[36,36],[64,64],[100,100]]){
   await ui.locator('#seatMode').selectOption(String(cap));
   await ui.locator('[data-fill="'+amount+'"]').click();
   await until(()=>ui.locator('#cnt').innerText().then(t=>t.includes(amount+' mẫu')),cap+' seated',20000);
   await live.waitForTimeout(600);
   const path=resolve(out,'overlay_'+cap+'.png');await live.screenshot({path});
   const valid=await live.evaluate(expected=>window.StageScene?.layout(expected).length===expected,cap);
   if(!valid)throw Error('wrong layout '+cap);
   captures.push({cap,amount,path});
   await ui.locator('#demoReset').click();
 }
 await ui.locator('#seatMode').selectOption('36');await ui.locator('[data-fill="36"]').click();
 await until(()=>ui.locator('#cnt').innerText().then(t=>t.includes('36 mẫu')),'final stage');
 await ui.locator('#demoTarget').selectOption({index:0});
 await ui.locator('#demoGift').selectOption('Interstellar');await ui.locator('#demoSendGift').click();
 await live.waitForTimeout(800);await live.screenshot({path:resolve(out,'premium-gift.png')});
 if(errs.length)throw Error('Page errors: '+errs.join('; '));
 const report={passed:true,captures,errors:errs};writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));
 console.log('BROWSER_SMOKE_PASS',JSON.stringify(report));
}catch(e){
 writeFileSync(resolve(out,'error.txt'),String(e.stack||e)+'\n'+logs);
 console.error('BROWSER_SMOKE_FAIL',e.stack||e);process.exitCode=1;
}finally{await browser?.close();child.kill();}
