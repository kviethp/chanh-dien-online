/* Chanh Dien Online V3 - high-resolution generated-art scene compositor.
 * Scenes are optional: when assets are absent, existing painterly renderer remains live.
 * Mock viewers and gifts remain visibly labelled by the original overlay.
 */
(function(global){
'use strict';
const ROOT='/assets/art_v3/';
const SCENE_KEYS=['hall','garden','lantern_lake'];
const SKIN_KEYS=['man','woman','child','elder','novice','monk','master','seated'];
const PROP_KEYS=['cushion','lotus','pagoda_lantern','festival_lantern','beads','bell','incense','aura','scroll','gold_trail'];
const FX_KEYS=['legend_aura','floral_halo','legend_robe','lotus_throne','thank_you_banner','golden_beam','petal_swirl','golden_trail'];
const IMAGES={scene:{},char:{},atlas:{},prop:{},fx:{}};
const easing=x=>x*x*(3-2*x);
function load(key){const image=new Image();image.decoding='async';image.src=ROOT+key+'.webp';return image;}
for(const key of SCENE_KEYS)IMAGES.scene[key]=load(key);
for(const key of SKIN_KEYS){IMAGES.char[key]=load('characters/'+key);if(key!=='seated')IMAGES.atlas[key]=load('characters/'+key+'_atlas');}
for(const key of PROP_KEYS)IMAGES.prop[key]=load('props/'+key);
for(const key of FX_KEYS)IMAGES.fx[key]=load('effects/'+key);
const usable=x=>!!x&&x.complete&&x.naturalWidth>0;
let current='hall',oldScene='hall',transitionStart=0;
let lastSceneDraw=null;
const LRU=new Map();
function setScene(k){if(!SCENE_KEYS.includes(k))return current;if(k!==current){oldScene=current;current=k;transitionStart=performance.now();}return current;}
function getScene(){return current;}
function image(ctx,img,x,y,w,h,alpha=1){if(!usable(img))return false;ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(img,x,y,w,h);ctx.restore();return true;}
function fit(ctx,img){return image(ctx,img,0,0,1080,1920,1);}
function drawSeats(ctx,seats){const im=IMAGES.prop.cushion;
 if(!usable(im))return;
 for(const p of [...seats].sort((a,b)=>a.y-b.y)){
  const w=270*p.scale,h=Math.max(37,110*p.scale);ctx.save();ctx.globalAlpha=.86;
  ctx.drawImage(im,p.x-w/2,p.y-h*.48,w,h);ctx.restore();
 }
}
function builtScene(key,cap,seats){const src=IMAGES.scene[key];if(!usable(src))return null;
 const cacheKey=key+':'+cap+':'+src.naturalWidth;
 if(LRU.has(cacheKey)){const val=LRU.get(cacheKey);LRU.delete(cacheKey);LRU.set(cacheKey,val);return val;}
 const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;
 const ctx=cv.getContext('2d',{alpha:false});ctx.drawImage(src,0,0,1080,1920);
 // Cushions only in ceremonial hall. Side scenes are quiet establishing shots.
 if(key==='hall')drawSeats(ctx,seats);
 LRU.set(cacheKey,cv);while(LRU.size>4)LRU.delete(LRU.keys().next().value);
 return cv;
}
function drawBackground(ctx,cap,seats,fallback,time=performance.now()){
 const im=IMAGES.scene[current];
 if(!usable(im)){fallback();return false;}
 const main=builtScene(current,cap,seats);if(!main){fallback();return false;}
 if(transitionStart&&time-transitionStart<1300&&current!==oldScene){
  const prior=builtScene(oldScene,cap,seats);
  if(prior)ctx.drawImage(prior,0,0);
  else fallback();
  ctx.save();ctx.globalAlpha=easing(Math.min(1,(time-transitionStart)/1300));ctx.drawImage(main,0,0);ctx.restore();
 }else{transitionStart=0;ctx.drawImage(main,0,0);}
 lastSceneDraw=time;return true;
}
function activeReward(v){let r=v?.reward;return r&&r.level>=2&&(r.rewardUntil===0||r.rewardUntil>Date.now());}
function drawActor(ctx,v,scale,pose,now){
 const name=({granny:'elder',nun:'novice',master:'master'})[v.skin]||v.skin||'woman';
 const full=IMAGES.char[name];if(!usable(full))return false;
 const isSitting=v.state==='sit';const seated=IMAGES.char.seated;
 // Same painterly look across seven roles; seated atlas presently shares a common
 // reference pose until each role receives its own frame-by-frame render.
 const atlas=IMAGES.atlas[name];
 const src=isSitting&&usable(seated)?seated:full;
 const height=(isSitting?272:322)*scale;
 const width=height*(src.naturalWidth/src.naturalHeight);
 const bob=v.state==='walk'?Math.sin(now*.013+v.phase)*3*scale:0;
 ctx.save();ctx.globalAlpha*=v.fade===undefined?1:v.fade;
 if(v.flip)ctx.scale(-1,1);
 if(isSitting&&activeReward(v)&&v.reward.auraUntil>Date.now()){
  const fx=v.reward.level>=4?IMAGES.fx.legend_aura:IMAGES.prop.aura;
  const size=(.9+.05*Math.sin(now*.003))*height*1.85;
  image(ctx,fx,-size/2,-height*.96-size*.52,size,size,.53);
 }
 ctx.translate(0,bob);
 if(pose?.bow)ctx.transform(1,0,0,1-pose.bow,0,0);
 if(usable(atlas)){
  const f=v.state==='walk'?[1,2,3][Math.floor(now/240)%3]:pose?.bow?4:isSitting?7:0;
  const ww=height*(240/340);
  ctx.drawImage(atlas,240*f,0,240,340,-ww/2,-height,ww,height);
 }else image(ctx,src,-width/2,-height,width,height);
 if(activeReward(v)&&v.reward.level>=4){
  const robe=IMAGES.fx.legend_robe;const rw=height*.49,rh=height*.5;
  if(isSitting)image(ctx,robe,-rw/2,-height*.58,rw,rh,.75);
 }
 if(isSitting&&activeReward(v)){
  const p=v.reward.prop;
  const prop=p==='beads'?IMAGES.prop.beads:p==='lantern'?IMAGES.prop.pagoda_lantern:IMAGES.fx.lotus_throne;
  if(usable(prop)){
   const sz=height*(v.reward.level>=4?.38:.28);
   image(ctx,prop,width*.18,-height*.42,sz,sz*.83,.9);
  }
 }
 ctx.restore();return true;
}
const queue=[],MAX_QUEUE=8;
let running=null;
const MAP={rose:'lotus',tiktok:'golden_trail',gg:'aura',heart:'petal_swirl',fingerheart:'lotus',rosa:'lotus',perfume:'incense',donut:'aura',crane:'golden_trail',confetti:'petal_swirl',butterfly:'petal_swirl',corgi:'pagoda_lantern',moneygun:'golden_trail',swan:'lotus',galaxy:'legend_aura',fireworks:'golden_beam',whale:'golden_trail',meteor:'golden_beam',interstellar:'floral_halo',lion:'legend_aura',universe:'lotus_throne',generic:'lotus'};
function queueGift(v,event){if(!v||!event||!SCENE_KEYS.includes(current))return;
 const value={visitor:v,event,requested:performance.now(),duration:Math.max(2000,Math.min(9000,event.durationMs||3600))};
 if(queue.length>=MAX_QUEUE)queue.shift();queue.push(value);
}
function drawGift(ctx,time=performance.now(),reduced=false){
 if(!running){running=queue.shift()||null;if(running)running.start=time;}
 if(!running)return;
 const {visitor:v,event,start,duration}=running;
 let t=(time-start)/duration;if(t>=1){running=null;return;}
 t=Math.max(0,Math.min(1,t));const appear=Math.min(1,t*5,(1-t)*5);
 const id=MAP[event.key]||'lotus';const sprite=IMAGES.fx[id]||IMAGES.prop[id]||IMAGES.prop.lotus;
 if(!usable(sprite))return;
 const personX=v.x||540,personY=v.y||1500;
 const level=Math.max(0,Number(event.level)||0);
 const size=(reduced?125:175+level*37)*(1+Math.sin(t*Math.PI)*.3);
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,appear)*.75;
 const y=personY-100*Math.min(1,(v.seat?.scale||.4)*2.5)-Math.sin(t*Math.PI)*40;
 ctx.translate(personX,y);ctx.rotate(reduced?0:(t-.5)*.08);
 ctx.drawImage(sprite,-size/2,-size/2,size,size);
 ctx.restore();
 // Premium gift is reflected in a soft beam above the selected row.
 if(level>=3&&!reduced){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=appear*.20;
 const g=ctx.createRadialGradient(personX,y,5,personX,y,230);
 g.addColorStop(0,'rgba(255,242,170,.65)');g.addColorStop(1,'rgba(255,195,100,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(personX,y,230,0,6.284);ctx.fill();ctx.restore();}
}
function health(){return {scene:Object.entries(IMAGES.scene).filter(([k,v])=>usable(v)).map(([k])=>k),actors:Object.entries(IMAGES.char).filter(([k,v])=>usable(v)).map(([k])=>k),props:Object.entries(IMAGES.prop).filter(([k,v])=>usable(v)).map(([k])=>k),effects:Object.entries(IMAGES.fx).filter(([k,v])=>usable(v)).map(([k])=>k),atlases:Object.entries(IMAGES.atlas).filter(([k,v])=>usable(v)).map(([k])=>k)};}
global.CinematicArt=Object.freeze({setScene,getScene,drawBackground,drawActor,queueGift,drawGift,health,hasAssets:()=>usable(IMAGES.scene.hall),images:IMAGES});
})(window);