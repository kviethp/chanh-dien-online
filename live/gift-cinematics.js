/* 21 distinct gift visual signatures. Cosmetic only; no paid spiritual privileges. */
(function(root){
'use strict';
const GIFT_FX=Object.freeze({
 rose:['lotus','#F8A2C4'],tiktok:['star','#FFE9A0'],gg:['twins','#F9D37C'],
 heart:['heart','#FF8BA7'],fingerheart:['heartlotus','#FFACCE'],rosa:['garland','#F9B7C9'],
 perfume:['incense','#D0C8F2'],donut:['mandala','#FFD290'],crane:['crane','#FFF0D9'],
 confetti:['petals','#F6B6D3'],butterfly:['butterfly','#F8D28D'],corgi:['lantern','#F3CA83'],
 moneygun:['goldlotus','#F9E2A8'],swan:['swan','#FFF9E8'],galaxy:['galaxy','#D9CCFF'],
 fireworks:['fireworks','#FFC6A5'],whale:['water','#9EDCF5'],meteor:['meteor','#F9D3A2'],
 interstellar:['portal','#C8C0FF'],lion:['guardian','#EBCF91'],universe:['universe','#FFF2C7'],
 generic:['lotus','#F5CF97']
});
const running=[],MAX_RUNNING=5,TWO=Math.PI*2;
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
function petal(ctx,x,y,r,color,angle){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;
 ctx.beginPath();ctx.moveTo(0,-r);ctx.quadraticCurveTo(r*1.15,0,0,r);ctx.quadraticCurveTo(-r*1.15,0,0,-r);ctx.fill();ctx.restore();
}
function lotus(ctx,x,y,r,color,angle=0,n=10){
 for(let k=0;k<n;k++)petal(ctx,x,y,r,color,angle+TWO*k/n);
 ctx.beginPath();ctx.fillStyle='#FFF8CC';ctx.arc(x,y,r*.23,0,TWO);ctx.fill();
}
function ring(ctx,x,y,r,color,alpha,angle=0){
 ctx.save();ctx.strokeStyle=color;ctx.globalAlpha*=alpha;ctx.lineWidth=3;ctx.translate(x,y);ctx.rotate(angle);
 ctx.beginPath();ctx.ellipse(0,0,r,r*.4,0,0,TWO);ctx.stroke();ctx.restore();
}
function star(ctx,x,y,r,color,angle=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();
 for(let k=0;k<8;k++){let a=k*Math.PI/4,R=k%2?r*.25:r;if(!k)ctx.moveTo(Math.cos(a)*R,Math.sin(a)*R);else ctx.lineTo(Math.cos(a)*R,Math.sin(a)*R);}
 ctx.closePath();ctx.fill();ctx.restore();
}
function heart(ctx,x,y,r,color){
 ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,r);
 ctx.bezierCurveTo(-r*1.8,-r*.25,-r,-r*1.4,0,-r*.6);
 ctx.bezierCurveTo(r,-r*1.4,r*1.8,-r*.25,0,r);ctx.fill();ctx.restore();
}
function draw(ctx,a,progress,seconds,reduce){
 const v=a.visitor,scale=clamp(Number(v?.seat?.scale)||.4,.2,.75);
 const x=Number(v?.x)||540,y=(Number(v?.y)||1570)-110*scale;
 const p=clamp(progress,0,1),radius=85+a.level*29,alpha=clamp(p*6,0,1)*clamp((1-p)*5,0,1);
 ctx.save();ctx.globalAlpha*=alpha*(reduce?.65:1);ctx.globalCompositeOperation='lighter';
 let grad=ctx.createRadialGradient(x,y,2,x,y,radius*1.8);
 grad.addColorStop(0,'rgba(255,212,145,.25)');grad.addColorStop(1,'rgba(255,212,145,0)');
 ctx.fillStyle=grad;ctx.fillRect(x-radius*1.8,y-radius*1.8,radius*3.6,radius*3.6);
 ring(ctx,x,y+30,radius*(.4+.7*p),a.color,1-p);
 if(reduce){lotus(ctx,x,y,24,a.color);ctx.restore();return;}
 const n=Math.min(32,12+a.level*3),theta=seconds*.45;
 const sparks=()=>{
  for(let k=0;k<n;k++){let ang=k*2.39996+theta*.12,r=radius*(.25+p*.8)*(k%3===0?.7:1);
   star(ctx,x+Math.cos(ang)*r,y+Math.sin(ang)*r*.6-p*25,3+(1-p)*5,a.color,ang);}
 };
 switch(a.visual){
  case 'lotus':lotus(ctx,x,y,radius*.38*(.3+.7*p),a.color);break;
  case 'star':sparks();break;
  case 'twins':star(ctx,x-radius*.5,y,23,a.color,theta);star(ctx,x+radius*.5,y,23,a.color,-theta);break;
  case 'heart':heart(ctx,x,y,radius*.34,a.color);break;
  case 'heartlotus':heart(ctx,x,y-radius*.3,25,a.color);lotus(ctx,x,y+radius*.27,radius*.26,a.color);break;
  case 'garland':for(let k=0;k<12;k++)petal(ctx,x+Math.cos(k*TWO/12)*radius*.8,y+Math.sin(k*TWO/12)*radius*.46,10,a.color,theta+k);break;
  case 'incense':for(let k=0;k<5;k++){ctx.beginPath();ctx.lineWidth=4;ctx.strokeStyle=a.color;
    for(let j=0;j<16;j++){const px=x+(k-2)*17+Math.sin(j*.6+theta+k)*14,py=y+80-j*13-p*60;if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();}break;
  case 'mandala':for(let k=0;k<16;k++)petal(ctx,x+Math.cos(k*TWO/16)*radius*.47,y+Math.sin(k*TWO/16)*radius*.47,radius*.25,a.color,k*TWO/16+theta);break;
  case 'crane':for(let k=0;k<8;k++){let ang=k*TWO/8+theta;ctx.save();ctx.translate(x+Math.cos(ang)*radius*.8,y+Math.sin(ang)*radius*.5);ctx.rotate(ang);ctx.fillStyle=a.color;
    ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(0,6);ctx.lineTo(-4,-17);ctx.lineTo(5,-2);ctx.lineTo(16,3);ctx.closePath();ctx.fill();ctx.restore();}break;
  case 'petals':case 'goldlotus':for(let k=0;k<n;k++){let ang=k*2.39996+theta*.16;petal(ctx,x+Math.cos(ang)*radius*p,y+Math.sin(ang)*radius*p*.7,8,a.color,ang+theta*.25);}if(a.visual==='goldlotus')lotus(ctx,x,y,28,a.color);break;
  case 'butterfly':for(let k=0;k<9;k++){let ang=k*TWO/9+theta,cx=x+Math.cos(ang)*radius*.7,cy=y+Math.sin(ang)*radius*.5;heart(ctx,cx-7,cy,9,a.color);heart(ctx,cx+7,cy,9,a.color);}break;
  case 'lantern':ctx.fillStyle=a.color;ctx.fillRect(x-22,y-41,44,76);ctx.fillStyle='#FFF5BC';ctx.fillRect(x-11,y-29,22,49);sparks();break;
  case 'swan':for(let side of [-1,1]){ctx.fillStyle=a.color;ctx.beginPath();ctx.ellipse(x+side*radius*.5,y+30,35,17,0,0,TWO);ctx.fill();
    ctx.beginPath();ctx.arc(x+side*radius*.68,y-5,11,0,TWO);ctx.fill();ring(ctx,x+side*radius*.5,y+47,55,a.color,1-p);}break;
  case 'water':for(let k=0;k<5;k++)ring(ctx,x,y+40,radius*(.2+k*.18+p*.4),a.color,1-p);sparks();break;
  case 'galaxy':case 'portal':for(let k=0;k<3;k++)ring(ctx,x,y-radius*.1,radius*(.55+k*.22+p*.2),a.color,1-p,theta*(k%2?-1:1));sparks();break;
  case 'fireworks':for(let f=0;f<3;f++)for(let k=0;k<15;k++){let ang=k*TWO/15,cx=x+(f-1)*radius*.8,cy=y-radius*.5;star(ctx,cx+Math.cos(ang)*radius*.35*p,cy+Math.sin(ang)*radius*.35*p,4,a.color);}break;
  case 'meteor':for(let k=0;k<12;k++){let xx=x-radius+k*radius*.18,yy=y-radius*.6+(k%3)*25;ctx.strokeStyle=a.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xx+p*60,yy+p*60);ctx.lineTo(xx-40-p*30,yy-45-p*20);ctx.stroke();}break;
  case 'guardian':for(let side of [-1,1]){let cx=x+side*radius*.7;lotus(ctx,cx,y,27,a.color,seconds*.18,7);}sparks();break;
  case 'universe':lotus(ctx,x,y,radius*.63,a.color,theta,16);for(let k=0;k<3;k++)ring(ctx,x,y,radius*(.9+k*.25),a.color,1-p,theta*.2);sparks();break;
 }
 ctx.restore();
}
function trigger(visitor,event,now=performance.now()){
 if(!visitor||!event)return;
 const key=Object.prototype.hasOwnProperty.call(GIFT_FX,event.key)?event.key:'generic';
 const [visual,color]=GIFT_FX[key];
 running.push({visitor,visual,color,level:Number(event.level)||0,start:now,duration:clamp(Number(event.durationMs)||1600,1100,11000),key});
 while(running.length>MAX_RUNNING)running.shift();
}
function render(ctx,now=performance.now(),reduced=false){
 for(let i=running.length-1;i>=0;i--){const item=running[i],p=(now-item.start)/item.duration;if(p>=1||p<0){running.splice(i,1);continue;}draw(ctx,item,p,now/1000,reduced);}
}
root.GiftCinematics=Object.freeze({trigger,render,keys:Object.keys(GIFT_FX),activeCount:()=>running.length,MAX_RUNNING});
})(window);
