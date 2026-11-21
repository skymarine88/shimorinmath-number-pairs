import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const unit=read('trigonometry/unit-circle.html');
const exam=read('trigonometry/unit-circle-exam.html');
const reduction=read('trigonometry/reduction.html');
const index=read('trigonometry/index.html');

function fn(source,name){
  const start=source.search(new RegExp('\\bfunction\\s+'+name+'\\s*\\('));
  assert.ok(start>=0,'Missing '+name);
  const open=source.indexOf('{',start);
  let depth=0;
  for(let i=open;i<source.length;i++){
    if(source[i]==='{')depth++;
    if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error('Unbalanced '+name);
}
function mathApi(source,names,prefix,exposed){
  const scope={};
  runInNewContext([prefix,...names.map(name=>fn(source,name)),
    'globalThis.api={'+exposed.join(',')+'};'].join('\n'),scope,{timeout:2000});
  return scope.api;
}
const circle=mathApi(exam,['gcd','normDeg360','tabStrFor','radImproper'],'',
  ['tabStrFor','radImproper']);
const signSource=reduction.match(/const signTable = (\{[\s\S]*?\n  \});/);
assert.ok(signSource);
const red=mathApi(reduction,['toCofunc','baseDegOf','isVerticalKT','quadrantFrom'],
  'const signTable = '+signSource[1]+';',
  ['signTable','toCofunc','isVerticalKT','quadrantFrom']);
const funcs={sin:Math.sin,cos:Math.cos,tg:Math.tan,ctg:x=>1/Math.tan(x)};
function number(label){
  if(label==='не существует'||label==='не определено')return NaN;
  let s=label.replace('−','-');const sign=s.startsWith('-')?-1:1;
  s=s.replace(/^-/,'');
  const [n,d='1']=s.split('/');
  return sign*(n.startsWith('√')?Math.sqrt(Number(n.slice(1))):Number(n))/Number(d);
}

test('catalog links both original trig trainers',()=>{
  assert.match(read('index.html'),/href="trigonometry\/"/);
  assert.match(index,/href="unit-circle\.html"/);
  assert.match(index,/href="reduction\.html"/);
  assert.match(unit,/unit-circle-exam\.html/);
});

test('every relative HTML asset and navigation target resolves',()=>{
  for(const name of ['trigonometry/index.html','trigonometry/unit-circle.html',
                     'trigonometry/unit-circle-exam.html','trigonometry/reduction.html']){
    for(const m of read(name).matchAll(/(?:href|src)="([^"#]+)"/g)){
      const target=m[1].split('?')[0];
      if(/^(https?:|data:|mailto:|about:)/.test(target))continue;
      assert.ok(existsSync(resolve(root,'trigonometry',target)),name+': missing '+target);
    }
  }
  for(const page of [unit,reduction]){
    assert.match(page,/src="\.\.\/brand-logo\.svg"/);
    assert.match(page,/src="\.\.\/brand-motion\.js"/);
    assert.match(page,/href="\.\.\/trainer-scores\.css"/);
  }
});

test('original learning and assessment modes remain intact',()=>{
  for(const id of ['btnModeLearn','btnModeMem','btnModeExam','levelSel','chkRing'])
    assert.ok(unit.includes('id="'+id+'"'),id);
  for(const mode of ['light','hard','time'])assert.ok(exam.includes('value="'+mode+'"'),mode);
  for(const mode of ['learn','lite','hard','exam'])
    assert.ok(reduction.includes('value="'+mode+'"'),mode);
  assert.match(unit,/frame\.src = 'about:blank'/);
  assert.match(unit,/aria-modal="true"/);
});

test('64 original table values agree with numerical trigonometry',()=>{
  for(const d of [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330]){
    const angle=d*Math.PI/180;
    for(const [name,f] of Object.entries(funcs)){
      const answer=circle.tabStrFor(name,d);
      const pole=(name==='tg'&&Math.abs(Math.cos(angle))<1e-10)
        ||(name==='ctg'&&Math.abs(Math.sin(angle))<1e-10);
      if(pole)assert.equal(answer,'не существует',name+' '+d);
      else assert.ok(Math.abs(number(answer)-f(angle))<1e-9,name+' '+d+' '+answer);
    }
  }
});

test('radian notation uses reduced fractions',()=>{
  assert.equal(circle.radImproper(90),'π/2');
  assert.equal(circle.radImproper(-450),'-5π/2');
  assert.equal(circle.radImproper(360),'2π');
});

test('reduction identities match numeric values for signed control angles',()=>{
  for(const kt of [-450,0,90,180,270,360])
    for(const op of [-1,1])
      for(const [name,f] of Object.entries(funcs)){
        const q=red.quadrantFrom(kt,op);
        const target=red.isVerticalKT(kt)?red.toCofunc(name):name;
        for(const a of [0.11,0.47,1.15])
          assert.ok(Math.abs(f(kt*Math.PI/180+op*a)-red.signTable[name][q]*funcs[target](a))<1e-9,
            name+' '+kt+' '+op+' '+a);
      }
});

test('timed assessment has deadline and scoring guards',()=>{
  assert.match(exam,/examDeadline=Date\.now\(\)\+timeLeft\*1000/);
  assert.match(reduction,/examDeadline = Date\.now\(\) \+ EXAM_SECONDS \* 1000/);
  assert.match(exam,/if\(!running \|\| !current\) return/);
  assert.match(reduction,/if \(examEnded \|\| examExpired\(\)\) return/);
  assert.match(reduction,/resetBtn\.disabled = mode === "exam"/);
});

test('inline JavaScript parses',()=>{
  for(const file of ['trigonometry/unit-circle.html','trigonometry/unit-circle-exam.html',
                     'trigonometry/reduction.html']){
    const blocks=[...read(file).matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
    assert.ok(blocks.length,file);
    for(const block of blocks)assert.doesNotThrow(()=>new Function(block[1]),file);
  }
});
