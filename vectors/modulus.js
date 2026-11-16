import {rng,add,vec,fmt} from './engine.js';
import {simplifiedRoot} from './exact-number.js';
const shuffle=(xs,R)=>{const out=[...xs];for(let i=out.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
const integers=[[3,4],[6,8],[5,12],[9,12],[8,15],[12,16],[7,24],[10,24]];
const radicals=new Map();
for(let x=1;x<=12;x++)for(let y=x;y<=12;y++){const n=x*x+y*y;if(Number.isInteger(Math.sqrt(n)))continue;if(!radicals.has(n))radicals.set(n,[]);radicals.get(n).push([x,y]);}
export function modulusSlot(sequence,scheduleSeed=37641){
 const index=Math.max(0,Math.floor(sequence)),block=Math.floor(index/10),slot=index%10,R=rng((scheduleSeed^Math.imul(block+1,0x9e3779b1))>>>0);
 const bag=shuffle(['axis','integer','integer','integer','radical','radical','radical','radical','radical','radical'],R);
 const first=bag.indexOf('radical');[bag[0],bag[first]]=[bag[first],bag[0]];
 const kind=bag[slot],ordinal=bag.slice(0,slot).filter(x=>x===kind).length;
 if(kind==='integer')return{kind,pair:shuffle(integers,R)[ordinal],block,slot};
 if(kind==='axis')return{kind,pair:Math.floor(R()*2)?[2+Math.floor(R()*14),0]:[0,2+Math.floor(R()*14)],block,slot};
 const simplify=ordinal%2===1,choices=[...radicals].filter(([n])=>(simplifiedRoot(n).factor>1)===simplify),chosen=shuffle(choices,R)[Math.floor(ordinal/2)];
 return{kind,pair:chosen[1][Math.floor(R()*chosen[1].length)],block,slot};
}
export function generateModulus(seed,options={}){
 const sequence=Number.isInteger(options.sequence)?options.sequence:seed,scheduleSeed=options.scheduleSeed??37641,profile=modulusSlot(sequence,scheduleSeed),R=rng(seed),pick=xs=>xs[Math.floor(R()*xs.length)];
 let a=[...profile.pair];if(R()<.5)a.reverse();a=a.map(x=>(x*(R()<.5?-1:1))||0);
 const start=[pick([-4,-3,-2,1,2]),pick([-3,-2,1,2,3])],end=add(start,a),radicand=a[0]**2+a[1]**2,simple=simplifiedRoot(radicand),presentation=pick(['coordinates','drawing','points']);
 const task={id:`prepare-length-${seed}-${sequence}`,section:'prepare',type:'length',seed,prompt:'',solution:'',expected:[Math.sqrt(radicand)],answerKind:'radical',given:[],build:false,anchor:[0,0],endpoint:[1,1],snap:.5,a,radicand,exactAnswer:simple.text,modulusVersion:1,schedule:{sequence,scheduleSeed,kind:profile.kind,block:profile.block,slot:profile.slot},presentation};
 task.given=[{id:'a',label:presentation==='points'?'AB':'a',kind:'vector',start,end,color:'#E06357',editable:'translate',...(presentation==='points'?{startLabel:'A',endLabel:'B'}:{})}];
 task.prompt=presentation==='coordinates'?`Найдите модуль вектора a⃗ = ${vec(a)}.`:presentation==='drawing'?'Найдите модуль вектора a⃗, изображённого на координатной плоскости.':`Вектор AB⃗ имеет начало A${vec(start)} и конец B${vec(end)}. Найдите его модуль.`;
 task.solution=`${presentation==='points'?`AB⃗ = ${vec(end)} − ${vec(start)} = ${vec(a)}. `:''}|${presentation==='points'?'AB⃗':'a⃗'}| = √((${fmt(a[0])})² + (${fmt(a[1])})²) = √${radicand} = ${simple.text}.`;
 const label=presentation==='points'?'AB':'a',result=simple.radicand===1?`<mn>${simple.factor}</mn>`:`${simple.factor===1?'':`<mn>${simple.factor}</mn>`}<msqrt><mn>${simple.radicand}</mn></msqrt>`;
 task.solutionMath=`<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mo>|</mo><mover><mi>${label}</mi><mo>→</mo></mover><mo>|</mo><mo>=</mo><msqrt><msup><mrow><mo>(</mo><mn>${a[0]}</mn><mo>)</mo></mrow><mn>2</mn></msup><mo>+</mo><msup><mrow><mo>(</mo><mn>${a[1]}</mn><mo>)</mo></mrow><mn>2</mn></msup></msqrt><mo>=</mo><msqrt><mn>${radicand}</mn></msqrt><mo>=</mo>${result}</mrow></math>`;
 return task;
}
