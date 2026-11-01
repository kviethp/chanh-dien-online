// Stage composition: uses separate non-baked floor and movable lotus cushions.
(function(g){
 const ASSETS={floor:'/assets/scenes/floor-clean.svg',cushion:'/assets/scenes/meditation-cushion.svg',front:'/assets/scenes/foreground-entrance.svg'};
 const imgs={};for(const [key,url]of Object.entries(ASSETS)){const im=new Image();im.src=url;imgs[key]=im;}
 const grids={24:[6,4],36:[6,6],64:[8,8],100:[10,10]};
 function layout(capacity){
  const [columns,rows]=grids[capacity]||grids[36],out=[];
  for(let r=0;r<rows;r++){
   const depth=rows===1?0:r/(rows-1),y=1210+600*depth,halfWidth=270+175*depth,spacing=2*halfWidth/columns;
   for(let col=0;col<columns;col++){
    const offset=col-columns/2+.5,side=offset<0?-1:1;
    const x=540+side*(58+Math.abs(offset)*spacing),scale=(.24+.24*depth)*Math.pow(6/columns,.76);
    out.push({x,y,scale,r,k:col,rows,gap:Math.max(42,spacing*.9)});
   }
  }
  return out.sort((a,z)=>z.r-a.r||Math.abs(a.x-540)-Math.abs(z.x-540));
 }
 function paint(ctx,im){if(im.complete&&im.naturalWidth)ctx.drawImage(im,0,0,1080,1920);}
 function drawFloor(ctx){paint(ctx,imgs.floor);}
 function drawSeats(ctx,seats){
  if(!imgs.cushion.complete||!imgs.cushion.naturalWidth)return;
  // Seat dimensions remain coupled to the avatar's depth scale.
  for(const seat of [...seats].sort((a,z)=>a.y-z.y)){
   const width=290*seat.scale,height=175*seat.scale;
   ctx.drawImage(imgs.cushion,seat.x-width/2,seat.y-height*.57,width,height);
  }
 }
 // Pre-render immutable hall + floor + empty cushions once per seat mode.
 // This removes 24-100 individual cushions and two full-size backgrounds from
 // every animation frame. Keep a small LRU to bound offscreen memory usage.
 const backdrops=new Map();
 function drawBackground(ctx,hall,seats){
  const cap=seats?.length||24;
  let cached=backdrops.get(cap);
  if(cached){backdrops.delete(cap);backdrops.set(cap,cached);ctx.drawImage(cached,0,0);return;}
  const ready=hall?.complete&&hall.naturalWidth>0&&imgs.floor.complete&&imgs.floor.naturalWidth>0
    &&imgs.cushion.complete&&imgs.cushion.naturalWidth>0;
  if(ready){
   const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
   const p=canvas.getContext('2d',{alpha:false});
   p.drawImage(hall,0,0,1080,1920);
   drawFloor(p);drawSeats(p,seats);
   backdrops.set(cap,canvas);
   while(backdrops.size>2)backdrops.delete(backdrops.keys().next().value);
   ctx.drawImage(canvas,0,0);
  }else{
   if(hall?.naturalWidth)ctx.drawImage(hall,0,0,1080,1920);
   drawFloor(ctx);drawSeats(ctx,seats);
  }
 }
 function drawForeground(ctx){paint(ctx,imgs.front);}
 g.StageScene=Object.freeze({layout,drawBackground,drawFloor,drawSeats,drawForeground,images:imgs,cacheSize:()=>backdrops.size});
})(window);
