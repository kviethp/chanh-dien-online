/* Cinematic Art Pack V3 runtime adaptor.
 * Generated raster assets are installed separately from the downloadable art pack.
 * Missing assets fall back to existing hall/sprite Canvas pipeline.
 * Image sprites are cosmetic; no gift or viewer metrics are modified here.
 */
(function(root){
  'use strict';
  const BASE='/assets/art_v3/';
  const SCENES=['hall','garden','lantern_lake'];
  const SKINS=['man','woman','child','elder','novice','monk','master'];
  const PROPS=['cushion','lotus','pagoda_lantern','beads','aura'];
  const FX=['legend_aura','floral_halo','legend_robe','lotus_throne','golden_beam','petal_swirl','golden_trail'];
  const asset={scene:{},skin:{},prop:{},fx:{}};
  const load=file=>{const im=new Image();im.decoding='async';im.src=BASE+file+'.webp';return im;};
  for(const k of SCENES)asset.scene[k]=load(k);
  for(const k of SKINS)asset.skin[k]=load('characters/'+k+'_atlas');
  for(const k of PROPS)asset.prop[k]=load('props/'+k);
  for(const k of FX)asset.fx[k]=load('effects/'+k);
  const ready=im=>!!im&&im.complete&&im.naturalWidth>0;
  let chosen='hall',previous='hall',changedAt=0;
  const cached=new Map(),MAX_CACHED=3;
  function choose(scene){if(!SCENES.includes(scene))return;if(chosen!==scene){previous=chosen;chosen=scene;changedAt=performance.now();}}
  function drawImage(ctx,im,x,y,w,h,alpha=1){
    if(!ready(im))return false;ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(im,x,y,w,h);ctx.restore();return true;
  }
  function backdrop(cap,seats){
    const key=chosen+':'+cap;if(cached.has(key))return cached.get(key);
    const image=asset.scene[chosen];
    if(!ready(image))return null;
    const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;
    const c=cv.getContext('2d',{alpha:false});c.drawImage(image,0,0,1080,1920);
    if(chosen==='hall'&&ready(asset.prop.cushion)){
      const cushion=asset.prop.cushion;
      for(const seat of [...seats].sort((a,b)=>a.y-b.y)){
        const w=270*seat.scale,h=Math.max(32,120*seat.scale);
        c.drawImage(cushion,seat.x-w/2,seat.y-h*.52,w,h);
      }
    }
    cached.set(key,cv);while(cached.size>MAX_CACHED)cached.delete(cached.keys().next().value);
    return cv;
  }
  function drawBackground(ctx,cap,seats,fallback,now=performance.now()){
    const frame=backdrop(cap,seats);if(!frame){fallback();return false;}
    // Crossfade only when both old and new images are valid.
    const prior=asset.scene[previous];
    if(changedAt && now-changedAt<1250 && ready(prior)){
      ctx.drawImage(prior,0,0,1080,1920);
      ctx.save();const u=Math.min(1,(now-changedAt)/1250);ctx.globalAlpha=u*u*(3-2*u);ctx.drawImage(frame,0,0);ctx.restore();
    }else{changedAt=0;ctx.drawImage(frame,0,0);}
    return true;
  }
  function drawActor(ctx,v,k,pose,now=performance.now()){
    const norm={granny:'elder',nun:'novice'}[v.skin]||v.skin||'woman';
    const sprite=asset.skin[norm];if(!ready(sprite))return false;
    const isSit=v.state==='sit',frame=isSit?(pose?.frame===4?4:7):[1,2,3][Math.floor(now/220)%3];
    const h=315*k,w=h*240/340;
    // Caller has already translated to seat/world location.
    ctx.save();
    ctx.globalAlpha*=v.fade===undefined?1:v.fade;
    if(v.flip)ctx.scale(-1,1);
    if(isSit && v.reward?.level>=2 && v.reward.auraUntil>Date.now()){
      const aura=v.reward.level>=4?asset.fx.legend_aura:asset.prop.aura;
      drawImage(ctx,aura,-h*.8,-h*1.65,h*1.6,h*1.6,.64);
    }
    ctx.drawImage(sprite,240*frame,0,240,340,-w/2,-h,w,h);
    if(isSit && v.reward?.level>=4){
      drawImage(ctx,asset.fx.legend_robe,-w*.30,-h*.73,w*.6,h*.44,.7);
    }
    if(isSit && v.reward?.level>=2){
      const im=v.reward.level>=4?asset.fx.lotus_throne:
        v.reward.level>=3?asset.prop.pagoda_lantern:asset.prop.beads;
      drawImage(ctx,im,w*.1,-h*.38,w*.42,h*.36,.8);
    }
    ctx.restore();
    return true;
  }
  let active=null,waiting=[],MAX_PENDING=5;
  const giftSprite={rose:'lotus',fingerheart:'lotus',rosa:'lotus',moneygun:'golden_trail',
    galaxy:'legend_aura',fireworks:'golden_beam',meteor:'golden_beam',
    interstellar:'floral_halo',lion:'legend_aura',universe:'lotus_throne'};
  function onGift(v,event){
    if(!v||!event)return;
    if(waiting.length>=MAX_PENDING)waiting.shift();
    waiting.push({v,event,at:0});
  }
  function drawGift(ctx,now=performance.now(),reduce=false){
    if(!active){active=waiting.shift();if(active)active.at=now;}
    if(!active)return;
    const {v,event,at}=active,dur=Math.max(1200,Math.min(9000,event.durationMs||3000));
    const p=(now-at)/dur;if(p>=1){active=null;return;}
    const img=asset.fx[giftSprite[event.key]]||asset.prop[giftSprite[event.key]]||
      asset.prop.lotus;if(!ready(img))return;
    const fade=Math.min(1,p*5,(1-p)*5);
    const s=(reduce?110:180+event.level*25)*(1+.12*Math.sin(p*Math.PI));
    ctx.save();ctx.globalCompositeOperation='lighter';
    drawImage(ctx,img,v.x-s/2,v.y-s*1.6,s,s,fade*.8);
    ctx.restore();
  }
  function health(){
    return {scene:SCENES.filter(k=>ready(asset.scene[k])),actors:SKINS.filter(k=>ready(asset.skin[k])),
      props:PROPS.filter(k=>ready(asset.prop[k])),effects:FX.filter(k=>ready(asset.fx[k]))};
  }
  root.V3Art=Object.freeze({choose,drawBackground,drawActor,onGift,drawGift,health,ready:()=>ready(asset.scene.hall),scenes:SCENES});
})(window);
