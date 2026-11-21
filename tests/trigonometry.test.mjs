import test from 'node:test';
import assert from 'node:assert/strict';
import {angles,exact,radians,deck,choices} from '../trigonometry/tasks.js';

const trig={sin:Math.sin,cos:Math.cos,tg:Math.tan,ctg:x=>1/Math.tan(x)};
function asNumber(label) {
  const [numerator,denominator=1]=label.replace('−','-').split('/');
  const sign=numerator.startsWith('-')?-1:1;
  const n=numerator.replace('-','');
  return sign*(n.startsWith('√')?Math.sqrt(Number(n.slice(1))):Number(n))/denominator;
}
function fromRadians(label) {
  if(label==='0') return 0;
  const [,sign,n,d]=/^(−?)(\d*)π(?:\/(\d+))?$/.exec(label);
  return (sign?-1:1)*Number(n||1)*Math.PI/Number(d||1);
}
test('exact values, signs, poles and radians over signed turns',()=>{
  for(const a of [...angles,...angles.map(x=>x-360),360]){
    const x=a*Math.PI/180;
    assert(Math.abs(fromRadians(radians(a))-x)<1e-12);
    for(const [f,compute] of Object.entries(trig)){
      const answer=exact(f,a);
      if((f==='tg' && Math.abs(Math.cos(x))<1e-10)||(f==='ctg' && Math.abs(Math.sin(x))<1e-10))
        assert.equal(answer,'Не определён');
      else assert(Math.abs(asNumber(answer)-compute(x))<1e-10);
    }
  }
});
test('all 32 reduction identities hold throughout the acute quadrant',()=>{
  const cards=deck('reduction');
  assert.equal(new Set(cards.map(c=>c.prompt)).size,32);
  for(const c of cards){
    const [,f,axis,sign]=/^(sin|cos|tg|ctg)\((.+) ([+−]) α\)$/.exec(c.prompt);
    const [,negative,g]=/^(−?)(sin|cos|tg|ctg) α$/.exec(c.answer);
    for(const alpha of [.11,.43,.85,1.49])
      assert(Math.abs(trig[f](fromRadians(axis)+(sign==='+'?alpha:-alpha))-(negative?-1:1)*trig[g](alpha))<1e-10);
  }
});
test('every question has one selectable correct answer',()=>{
  for(const mode of ['circle','units','values','reduction']) for(const card of deck(mode)){
    if(mode==='circle') { assert(angles.includes(Number(card.answer)));continue; }
    const options=choices(card);
    assert.equal(new Set(options).size,4);
    assert.equal(options.filter(option=>option===card.answer).length,1);
  }
});
