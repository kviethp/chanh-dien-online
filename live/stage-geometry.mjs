// 2.5D stage geometry — deterministic seat layout, central aisle, no hardcoded cushions.
export const STAGE_WIDTH=1080,STAGE_HEIGHT=1920;
export const SEAT_GRIDS=Object.freeze({24:[6,4],36:[6,6],64:[8,8],100:[10,10]});
export function createSeatLayout(capacity=36){
 const [columns,rows]=SEAT_GRIDS[capacity]||SEAT_GRIDS[36];
 const seats=[];
 for(let row=0;row<rows;row++){
  const depth=rows===1?0:row/(rows-1);
  const y=1210+(1810-1210)*depth;
  const halfWidth=270+depth*175;
  const spacing=2*halfWidth/columns;
  for(let col=0;col<columns;col++){
   const left=col<columns/2;
   const offset=left ? col-columns/2+.5 : col-columns/2+.5;
   const side=offset<0?-1:1;
   const x=540+side*(58+Math.abs(offset)*spacing);
   const scale=(.24+.24*depth)*(6/columns)**.76;
   seats.push({x,y,scale,r:row,k:col,rows,gap:Math.max(42,spacing*.9)});
  }
 }
 seats.sort((a,z)=>z.r-a.r||Math.abs(a.x-540)-Math.abs(z.x-540));
 return seats;
}
export function findPathPoints(seat) {
 if(!seat)return [];
 const laneY=Math.max(1170,seat.y+35);
 return [{x:540,y:2015},{x:540,y:laneY},{x:seat.x,y:laneY},{x:seat.x,y:seat.y}];
}
export function validateSeatLayout(seats,capacity){
 if(seats.length!==capacity)return false;
 const ids=new Set(seats.map(p=>p.x.toFixed(2)+':'+p.y.toFixed(2)));
 return ids.size===capacity&&seats.every(p=>p.x>=35&&p.x<=1045&&p.y>=1150&&p.y<=1850&&Math.abs(p.x-540)>=45);
}
