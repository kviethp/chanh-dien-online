/* Chanh Dien Online - Premium visuals (runtime costume shaders + SVG assets + choreography)
 * All effects are cosmetic only. No spiritual privileges or paywalled rituals.
 * Assets remain vector-based, transparent and resolution-independent for OBS 1080x1920.
 */
(function (global) {
  'use strict';
  const BASE = '/assets/premium/';
  const FILES = [
    'aura_high','aura_vip','aura_elite','aura_legend',
    'prop_beads','prop_lantern','prop_lotus_throne','prop_grand_lotus',
    'prop_incense','petal_pink','costume_high','costume_vip','costume_elite','costume_legend'
  ];
  const assets = {};
  for (const name of FILES) {
    const im = new Image();
    im.src = BASE + name + '.svg';
    assets[name] = im;
  }
  const PALETTES = {
    'gold-trim':  { rgb: [201,184,153], strength: .53, ornament:'high' },
    'lotus-robe': { rgb: [229,213,184], strength: .76, ornament:'vip' },
    'silk-robe':  { rgb: [157,111,127], strength: .76, ornament:'elite' },
    'grand-robe': { rgb: [243,224,184], strength: .86, ornament:'legend' }
  };
  const tinted = new WeakMap();
  // We color only neutral mid-tone fabric pixels. Skin, black hair and brown
  // meditation cushions retain their original painted appearance.
  function costumeSprite(original, outfit) {
    const palette = PALETTES[outfit];
    if (!palette || !original || !original.naturalWidth) return original;
    let cache = tinted.get(original);
    if (!cache) { cache = new Map(); tinted.set(original,cache); }
    if (cache.has(outfit)) return cache.get(outfit);
    const canvas = document.createElement('canvas');
    canvas.width = original.naturalWidth;
    canvas.height = original.naturalHeight;
    const c = canvas.getContext('2d', { willReadFrequently: true });
    c.drawImage(original, 0, 0);
    try {
      const data = c.getImageData(0,0,canvas.width,canvas.height), pix=data.data;
      const [tr,tg,tb] = palette.rgb;
      for (let i=0;i<pix.length;i+=4) {
        const a=pix[i+3]; if(a<22)continue;
        const r=pix[i],g=pix[i+1],b=pix[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b);
        const lum=(r+g+b)/3,spread=hi-lo;
        if(lum<66 || lum>234 || spread>38 || r-g>30 || r-b>30) continue;
        // Preserve shade depth and folds by modulating the base luminance.
        const light=.73+lum/255*.43, amount=palette.strength;
        pix[i]=Math.min(255,Math.round(r*(1-amount)+tr*light*amount));
        pix[i+1]=Math.min(255,Math.round(g*(1-amount)+tg*light*amount));
        pix[i+2]=Math.min(255,Math.round(b*(1-amount)+tb*light*amount));
      }
      c.putImageData(data,0,0);
      // Finish the complete eight-frame sprite strip *once*, on the offscreen
      // cached source. This keeps the embroidered costume attached to walking,
      // kneeling and seated bodies instead of floating over the Canvas stage.
      const frameCount=canvas.width>canvas.height*3 ? 8 : 1;
      const fw=canvas.width/frameCount;
      for(let frame=0;frame<frameCount;frame++){
        const px=fw*(frame+.5);
        const fy=frameCount===1?canvas.height*.57:
          frame<=3 ? canvas.height*.46:
          frame===4 ? canvas.height*.40:
          frame===5 ? canvas.height*.52:
          frame===6 ? canvas.height*.62:canvas.height*.68;
        const sz=fw*(frameCount===1?.12:.105);
        c.save();c.globalCompositeOperation='source-atop';
        c.translate(px,fy);
        const gold=outfit==='grand-robe'?'#ffefba':
          outfit==='silk-robe'?'#ffd277':'#ddb36f';
        const shade=outfit==='grand-robe'?'#fff5d7':'#f7cf82';
        c.strokeStyle=gold;c.fillStyle=shade;c.lineWidth=Math.max(1,sz*.09);
        c.shadowColor='#ffcc73';c.shadowBlur=sz*.12;
        for(let petal=0;petal<7;petal++){
          const a=(petal-3)*Math.PI/9;
          c.save();c.rotate(a);
          c.beginPath();c.moveTo(0,sz*.4);c.quadraticCurveTo(-sz*.48,-sz*.29,0,-sz*.84);
          c.quadraticCurveTo(sz*.48,-sz*.29,0,sz*.4);
          c.stroke();c.restore();
        }
        c.beginPath();c.moveTo(-sz*.8,sz*.65);c.quadraticCurveTo(0,sz*1.05,sz*.8,sz*.65);c.stroke();
        c.restore();
      }
    } catch (error) {
      // If Canvas origin-clean protection fails, use the source image without tint.
      cache.set(outfit,original);
      return original;
    }
    cache.set(outfit,canvas);
    return canvas;
  }
  function usable(name) {
    const im = assets[name];
    return im && im.complete && im.naturalWidth ? im : null;
  }
  function drawImage(ctx,name,x,y,width,height,alpha) {
    const im=usable(name);
    if (!im) return false;
    ctx.save();
    if (alpha!==undefined)ctx.globalAlpha*=alpha;
    ctx.drawImage(im,x-width/2,y-height/2,width,height);
    ctx.restore();
    return true;
  }
  function activeReward(reward, now) {
    return !!(reward && reward.level>=2 && (reward.rewardUntil===0 || reward.rewardUntil>now));
  }
  function auraActive(reward, now) {
    return activeReward(reward,now) && !!reward.auraUntil && now<reward.auraUntil;
  }
  const particles=[], shockwaves=[];
  // Hard caps bound canvas animation memory during gift streaks.
  const MAX_PARTICLES=310,MAX_WAVES=12;
  const rand=(a,b)=>a+Math.random()*(b-a);
  function giftReceived(v,event, now) {
    if (!event) return;
    const ts=now===undefined ? performance.now() : now;
    const incoming={start:ts,duration:Math.max(1200,event.durationMs||2200),action:event.action||'bow',level:event.level||0,prop:event.prop||'none'};
    // Keep the strongest pending cinematic while a current gesture finishes.
    if(!v.pendingCeremony || incoming.level>=v.pendingCeremony.level)v.pendingCeremony=incoming;
    const count=Math.min(12+(event.level||0)*8,56);
    const originX=v.x||540,originY=(v.y||1700)-80*(v.seat?.scale||.4);
    for(let i=0;i<count;i++) {
      const angle=rand(-Math.PI,-.08),speed=rand(35,160);
      particles.push({x:originX+rand(-36,36),y:originY+rand(-14,16),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        spin:rand(-2,2),rotation:rand(0,6.28),scale:rand(.15,.36),t:0,life:rand(1.8,3.7),
        type:event.level>=2 && i%4===0?'star':'petal'});
    }
    while(particles.length>MAX_PARTICLES) particles.shift();
    if(event.level>=2) {
      shockwaves.push({x:originX,y:originY,t:0,life:event.level>=4?2.3:1.5,level:event.level,effect:event.effect});
      while(shockwaves.length>MAX_WAVES) shockwaves.shift();
    }
  }
  // On original eight-frame walk/sit strips, pose 4 = upright on cushion,
  // pose 6 = kneeling, pose 7 = seated. Reuse these authored animation frames
  // so the character does not teleport to a different camera angle.
  function getPose(v,now) {
    // No user must lose a premium animation because their entrance is still
    // running: only start the ceremony after the seated state is reached.
    if(v.state!=='sit')return null;
    if(v.pendingCeremony && !v.ceremony) {
      v.ceremony={...v.pendingCeremony,start:now};
      v.pendingCeremony=null;
    }
    const c=v.ceremony;
    if(!c)return null;
    const elapsed=now-c.start, p=Math.min(1,Math.max(0,elapsed/c.duration));
    if(p>=1){v.ceremony=null;return null;}
    const stand=c.level>=3 && c.action==='stand-bow';
    let frame=7, lift=0, bow=0, offer=0;
    if(stand) {
      if(p<.18)frame=6;
      else if(p<.58){frame=4; lift=-6*Math.sin((p-.18)/.4*Math.PI);}
      else if(p<.78)frame=6;
      bow=p>=.58&&p<.83 ? Math.sin((p-.58)/.25*Math.PI)*.1:0;
    } else {
      bow=Math.sin(Math.PI*Math.min(1,p*1.2))*(c.action==='bow'?.075:.045);
    }
    if((c.action==='offer' || c.action==='incense') && p>.18 && p<.8)offer=Math.sin((p-.18)/.62*Math.PI);
    return {frame,lift,bow,offer,progress:p,level:c.level,action:c.action,prop:c.prop};
  }
  function drawUnder(ctx,v,scale,t,now) {
    const r=v.reward;
    if(!activeReward(r,now))return;
    const level=Math.max(2,Math.min(5,r.level)),ring=['','','aura_high','aura_vip','aura_elite','aura_legend'][level];
    const pulse=.9+.06*Math.sin(t*1.8+v.phase);
    const baseWidth=scale*350*(level>=4?1.24:1);
    if(level>=4) {
      const base=level>=5?'prop_grand_lotus':'prop_lotus_throne';
      const w=scale*(level>=5?405:345);
      const h=scale*(level>=5?189:195);
      drawImage(ctx,base,v.x,v.y+scale*1.5,w,h,.86);
    }
    if (auraActive(r,now)) {
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      ctx.translate(v.x,v.y-scale*185);
      ctx.rotate(Math.sin(t*.35+v.phase)*.055);
      drawImage(ctx,ring,0,0,baseWidth*pulse,baseWidth*pulse,.6+.11*Math.sin(t*1.45+v.phase));
      ctx.restore();
    }
    // Gentle foot-light, visible even after the main timed aura fades.
    ctx.save();
    const gradient=ctx.createRadialGradient(v.x,v.y-8*scale,2,v.x,v.y-8*scale,175*scale);
    gradient.addColorStop(0,'rgba(255,210,117,.38)');
    gradient.addColorStop(1,'rgba(255,180,65,0)');
    ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=gradient;
    ctx.fillRect(v.x-190*scale,v.y-155*scale,380*scale,170*scale);
    ctx.restore();
  }
  // Must be called inside the sprite's translate(x,y) transform and after
  // the base sprite has been painted, with k = original-frame -> stage scale.
  function drawCostume(ctx,v,k,frame,now) {
    const r=v.reward;
    if(!activeReward(r,now))return;
    const palette=PALETTES[r.outfit];
    if(!palette)return;
    const seated=frame>=6, top=(seated?-171:-215)*k;
    const width=frame===4?57*k:67*k;
    drawImage(ctx,'costume_'+palette.ornament,0,top+34*k,width,66*k,.95);
    // Metallic shoulder piping, following the rear robe silhouette.
    ctx.save();
    ctx.globalAlpha=.78;
    ctx.strokeStyle=r.level>=5?'#fff6c7':r.level>=4?'#f6d17a':'#deb36d';
    ctx.lineWidth=Math.max(.7,3.2*k);
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(-42*k,top+28*k);
    ctx.quadraticCurveTo(-27*k,top+4*k,0,top+12*k);
    ctx.quadraticCurveTo(27*k,top+4*k,42*k,top+28*k);
    ctx.stroke();
    ctx.restore();
  }
  function drawOver(ctx,v,scale,t,pose,now) {
    const r=v.reward;
    if(!activeReward(r,now) || v.state!=='sit')return;
    const prop=r.prop;
    const float=Math.sin(t*2.2+v.phase)*3*scale;
    const appearing=pose?.offer||0;
    if(prop==='beads')drawImage(ctx,'prop_beads',v.x+scale*55,v.y-57*scale+float,scale*105,scale*90,.85);
    if(prop==='lantern')drawImage(ctx,'prop_lantern',v.x+scale*70,v.y-100*scale+float,scale*92,scale*118,.86);
    if((prop==='lotus-throne'||prop==='grand-lotus') && pose?.offer)
      drawImage(ctx,'prop_lantern',v.x+scale*72,v.y-(145+appearing*40)*scale,scale*85,scale*110,appearing*.95);
    if(pose?.action==='incense' && appearing)
      drawImage(ctx,'prop_incense',v.x+scale*65,v.y-115*scale,scale*80,scale*108,appearing);
  }
  function drawEffects(ctx,dt) {
    const d=Math.min(dt,.05);
    for(let i=shockwaves.length-1;i>=0;i--) {
      const w=shockwaves[i];w.t+=d;
      if(w.t>=w.life){shockwaves.splice(i,1);continue;}
      const p=w.t/w.life,r=30+p*230,opacity=(1-p)*.58;
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=w.level>=4?'#fff3c2':'#f7cb6e';
      ctx.lineWidth=(w.level>=4?5:3)*(1-p)+.5;ctx.globalAlpha=opacity;
      ctx.shadowColor='#ffd27d';ctx.shadowBlur=16;
      ctx.beginPath();ctx.ellipse(w.x,w.y,r,r*.24,0,0,Math.PI*2);ctx.stroke();
      if(w.level>=4){ctx.beginPath();ctx.arc(w.x,w.y-94,r*.7,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
    }
    for(let i=particles.length-1;i>=0;i--) {
      const p=particles[i];p.t+=d;
      if(p.t>=p.life){particles.splice(i,1);continue;}
      p.x+=p.vx*d;p.y+=p.vy*d;p.vx*=.995;p.vy+=27*d;p.rotation+=p.spin*d;
      ctx.save();ctx.globalAlpha=Math.min(1,(p.life-p.t)*1.2);ctx.translate(p.x,p.y);ctx.rotate(p.rotation);
      if(p.type==='star'){
        ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ffe19f';ctx.shadowColor='#fff5b8';ctx.shadowBlur=15;
        ctx.beginPath();for(let n=0;n<8;n++){const angle=n*Math.PI/4,rad=n%2?2.5:8;const xx=Math.cos(angle)*rad,yy=Math.sin(angle)*rad;if(n===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.closePath();ctx.fill();
      } else {
        const im=usable('petal_pink');
        if(im)ctx.drawImage(im,-19*p.scale,-26*p.scale,38*p.scale,52*p.scale);
        else {ctx.fillStyle='#fca9d3';ctx.ellipse(0,0,5,9,0,0,Math.PI*2);ctx.fill();}
      }
      ctx.restore();
    }
  }
  global.PremiumVisuals=Object.freeze({
    assets,costumeSprite,giftReceived,getPose,drawUnder,drawCostume,drawOver,drawEffects,activeReward,auraActive
  });
})(window);
