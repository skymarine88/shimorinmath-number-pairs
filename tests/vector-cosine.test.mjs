import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {generatePrep,generateEge,checkTask} from '../vectors/catalog.js';
import {isCollinear,scheduledCosine} from '../vectors/cosine.js';

const types=['cosine','ege-cosine-coordinates','ege-cosine-drawing'];
const generate=(type,seed,options)=>type==='cosine'?generatePrep(type,seed,options):generateEge(type,seed,options);
const frequency=tasks=>{
 const flags=tasks.map(t=>Number(isCollinear(t.a,t.b)));
 assert.equal(flags.slice(0,9).reduce((a,b)=>a+b,0),0);
 for(let i=0;i<=flags.length-10;i++)assert.equal(flags.slice(i,i+10).reduce((a,b)=>a+b,0),1,`window ${i}`);
};

test('all cosine generators limit every rolling ten tasks to one collinear pair',()=>{
 for(const type of types)for(const offset of [0,91,92033]){
  const tasks=Array.from({length:200},(_,sequence)=>generate(type,offset+sequence,{sequence}));
  frequency(tasks);
  for(const t of tasks){
   const [a,b]=[t.a,t.b],denominator=Math.hypot(...a)*Math.hypot(...b);
   assert.ok(denominator>0);
   const expected=(a[0]*b[0]+a[1]*b[1])/denominator;
   assert.ok(Math.abs(t.expected[0]-expected)<1e-12);
   assert.equal(checkTask(t,[String(expected)]).correct,true);
   for(const v of t.given){assert.deepEqual(v.end.map((x,i)=>x-v.start[i]),v.id==='a'?a:b);}
  }
 }
});

test('switching prototypes, skipping tasks and restoring state keep one shared cadence',()=>{
 let state={attempts:[],counterBaselines:{practice:{correct:0,incorrect:0}}};
 const tasks=[];
 for(let i=0;i<180;i++){
  const type=types[i%types.length];
  tasks.push(scheduledCosine(state,options=>generate(type,25000+i,options)));
  // No submitted answers: clicking Next must still advance the schedule.
  state=JSON.parse(JSON.stringify(state));
  if(i%7===0)state.counterBaselines={practice:{correct:0,incorrect:0},ege:{correct:0,incorrect:0}};
 }
 frequency(tasks);
 assert.equal(state.cosineSequence,180);
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 assert.deepEqual(state.attempts,[]);
});

test('saved EGE bank also has sparse collinear examples and keeps source references',async()=>{
 const bank=JSON.parse(await readFile(new URL('../vectors/ege-bank.json',import.meta.url),'utf8'));
 for(const type of types.slice(1)){
  const tasks=bank.tasks.filter(t=>t.type===type);
  assert.equal(tasks.length,24);
  frequency(tasks);
  for(const t of tasks){assert.equal(t.source.task,2);assert.ok(t.source.variants.length);}
 }
});

test('collinear examples include both codirectional and opposite directions',()=>{
 const signs=new Set();
 for(const type of types)for(let i=9;i<500;i+=10)signs.add(Math.sign(generate(type,i,{sequence:i}).expected[0]));
 assert.deepEqual([...signs].sort(),[-1,1]);
});
