import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const content=readFileSync(new URL('./art-pack-loader.js',import.meta.url),'utf8');
function setup(){
  class BrokenImage{constructor(){this.complete=false;this.naturalWidth=0;}}
  const g={window:{},Image:BrokenImage,performance:{now:()=>100},Date,Math,document:{createElement:()=>({width:0,height:0,getContext:()=>({drawImage(){}})})}};
  runInNewContext(content,g);
  return g.window.V3Art;
}
test('optional art pack does not break old overlay when generated assets are absent',()=>{
  const art=setup();let fallback=0;
  const ctx={drawImage(){}};
  assert.equal(art.ready(),false);
  assert.equal(art.drawBackground(ctx,36,[],()=>fallback++),false);
  assert.equal(fallback,1);
  assert.equal(art.drawActor(ctx,{skin:'woman',state:'sit',fade:1},.3,null),false);
});
test('three scenes are whitelisted and invalid scene is ignored',()=>{
  const art=setup();
  assert.deepEqual(Array.from(art.scenes),['hall','garden','lantern_lake']);
  art.choose('garden');assert.equal(art.scene(),'garden');
  art.choose('javascript:alert(1)');assert.equal(art.scene(),'garden');
  art.choose('lantern_lake');assert.equal(art.scene(),'lantern_lake');
});
test('gift event with unloaded image is safe',()=>{
  const art=setup();
  art.onGift({x:540,y:1200},{key:'rose',level:2,durationMs:2500});
  assert.doesNotThrow(()=>art.drawGift({},1200,true));
});
