import {generate as legacyGenerate,rng,add,sub,mul,dot,norm,vec,fmt,parseNumber,same} from './engine.js';
import {generateModulus} from './modulus.js';
import {checkRootAnswer} from './exact-number.js';
export const PREP=[
 {id:'sum',name:'Сумма и разность',rule:'(aₓ; aᵧ) ± (bₓ; bᵧ) = (aₓ ± bₓ; aᵧ ± bᵧ)',idea:'Сумма — последовательные перемещения. Для разности меняются оба знака второго вектора.',example:'a⃗ = (2; −3), b⃗ = (−4; 1). a⃗ + b⃗ = (−2; −2); a⃗ − b⃗ = (6; −4).'},
 {id:'scale',name:'Умножение на число',rule:'ka⃗ = (kaₓ; kaᵧ)',idea:'Модуль коэффициента меняет длину, отрицательный знак меняет направление.',example:'a⃗ = (3; −2). −0,5a⃗ = (−1,5; 1).'},
 {id:'length',name:'Модуль вектора',rule:'|a⃗| = √(aₓ² + aᵧ²)',idea:'Длина вектора находится по теореме Пифагора.',example:'a⃗ = (−3; 4). |a⃗| = √(9 + 16) = 5.'},
 {id:'dot',name:'Скалярное произведение',rule:'a⃗ · b⃗ = aₓbₓ + aᵧbᵧ',idea:'Перемножьте соответствующие координаты и сложите результаты.',example:'(−2; 3) · (4; −1) = −8 − 3 = −11.'},
 {id:'cosine',name:'Косинус угла',rule:'cos φ = (a⃗ · b⃗) / (|a⃗| · |b⃗|)',idea:'Угол между ненулевыми векторами измеряют после переноса к общему началу.',example:'a⃗ = (3; 4), b⃗ = (4; 3). a⃗ · b⃗ = 24; длины равны 5; cos φ = 24/25 = 0,96.'},
 {id:'basis',name:'Разложение по базису',rule:'c⃗ = αa⃗ + βb⃗',idea:'Найдите два коэффициента по координатам. Векторы базиса должны быть неколлинеарны.',example:'a⃗ = (2; 1), b⃗ = (1; 2), c⃗ = (5; 4). 2α + β = 5, α + 2β = 4; c⃗ = 2a⃗ + b⃗.'},
 {id:'geometry',name:'Векторы в фигурах',rule:'AB⃗ + BC⃗ = AC⃗',idea:'Выражайте положения точек через базис. Для искомого вектора вычтите положение его начала из положения конца.',example:'AB⃗ = a⃗, AC⃗ = b⃗; M — середина BC. AM⃗ = (a⃗ + b⃗)/2, BC⃗ = b⃗ − a⃗.'}
];
export const EGE=[
 {id:'ege-dot-coordinates',name:'Произведение по координатам',variants:[1,2,17,18,21,22]},
 {id:'ege-dot-drawing',name:'Произведение по рисунку',variants:[7,8,13,14,31,32]},
 {id:'ege-length-coordinates',name:'Длина комбинации: координаты',variants:[9,10,11,12]},
 {id:'ege-length-drawing',name:'Длина комбинации: рисунок',variants:[3,4,19,20,23,24]},
 {id:'ege-orthogonal',name:'Неизвестная координата: перпендикулярность',variants:[5,6,25,26]},
 {id:'ege-cosine-coordinates',name:'Косинус по координатам',variants:[15,29,30]},
 {id:'ege-cosine-drawing',name:'Косинус по рисунку',variants:[16]},
 {id:'ege-three-dot',name:'Произведение с тремя векторами',variants:[27,28]},
 {id:'ege-length-parameter',name:'Неизвестная координата: длины',variants:[33,34]},
 {id:'ege-three-length',name:'Длина суммы трёх векторов',variants:[35,36]}
];
const CORAL='#E06357',INK='#2B3038',GRAY='#97979e';
const V=(id,a,start=[0,0],color=id==='a'?CORAL:id==='b'?INK:GRAY)=>({id,label:id,start,end:add(start,a),color,editable:'translate',kind:'vector'});
const pts=[[3,4],[4,3],[-3,4],[3,-4],[-3,-4],[-4,3],[0,5],[5,0]];
const seeded=s=>{const R=rng(s);const ri=(a,b)=>a+Math.floor(R()*(b-a+1));return{ri,pick:xs=>xs[ri(0,xs.length-1)],v:()=>[ri(-5,5),ri(-5,5)]};};
const numberFactor=k=>{if(!Number.isInteger(k))for(const d of [2,3,4,6,8,12])if(Math.abs(k*d-Math.round(k*d))<1e-9)return '('+Math.round(k*d)+'/'+d+')';return fmt(k);};
const coefficient=(k,name)=>k===1?name+'⃗':k===-1?'−'+name+'⃗':numberFactor(k)+name+'⃗';
const combination=(m,n)=>coefficient(m,'a')+(n<0?' − ':' + ')+coefficient(Math.abs(n),'b');
function base(section,type,seed){return{id:`${section}-${type}-${seed}`,section,type,seed,prompt:'',solution:'',expected:[],answerKind:'scalar',given:[],build:false,anchor:[0,0],endpoint:[1,1],snap:.5};}
function randomNonzero(g){let v;do{v=g.v();}while(norm(v)<2);return v;}
export function generatePrep(type,seed,options={}){
 if(type==='length')return generateModulus(seed,options);
 const g=seeded(seed),t=base('prepare',type,seed);let a=randomNonzero(g),b=randomNonzero(g);
 if(['sum','dot','cosine'].includes(type)){
  const q=legacyGenerate(type,seed,'practice');Object.assign(t,{a:q.a,b:q.b,expected:q.expected,prompt:q.prompt,solution:q.solution});a=q.a;b=q.b;
  t.given=[V('a',a,[-2,-1])];if(['sum','dot','cosine'].includes(type))t.given.push(V('b',b,[2,3]));
  if(type==='sum'){t.op=q.op;t.build=true;t.answerKind='construction';t.prompt=`Постройте вектор c⃗ = a⃗ ${q.op===1?'+':'−'} b⃗.`;}
 }else if(type==='scale'){
  t.k=g.pick([-3,-2,-1.5,-1,-.75,-.5,.5,.75,1.5,2,3]);t.a=a;t.expected=mul(t.k,a);t.build=true;t.answerKind='construction';t.snap=.25;t.given=[V('a',a,[-2,-1])];t.prompt=`Постройте вектор c⃗ = ${coefficient(t.k,'a')}.`;t.solution=`${fmt(t.k)} · ${vec(a)} = ${vec(t.expected)}.`;
 }else if(type==='basis'){
  do{a=randomNonzero(g);b=randomNonzero(g);}while(Math.abs(a[0]*b[1]-a[1]*b[0])<2||Math.abs(dot(a,b))<1);
  t.coefficients=[g.pick([-2,-1,-.5,.5,1,1.5,2]),g.pick([-2,-1,-.5,.5,1,1.5,2])];t.a=a;t.b=b;t.c=add(mul(t.coefficients[0],a),mul(t.coefficients[1],b));t.expected=t.coefficients;t.answerKind='linear';t.given=[V('a',a),V('b',b),V('c',t.c)];t.prompt='Разложите вектор c⃗ по базису a⃗, b⃗. Запишите c⃗ как линейную комбинацию a⃗ и b⃗.';t.solution=`c⃗ = ${linearText(t.expected)}.`;
 }else if(type==='geometry')return geometryTask(seed);
 else throw new Error('Unknown preparatory type');
 return t;
}
export function linearText([a,b]){const first=a===0?'':coefficient(a,'a');const second=b===0?'':coefficient(Math.abs(b),'b');if(!first)return b<0?'−'+second:second||'0';return first+(second?(b<0?' − ':' + ')+second:'');}
function geometryTask(seed){
 const g=seeded(seed),t=base('prepare','geometry',seed),kind=g.pick(['triangle','parallelogram','hexagon']);let coords,order,A,a,b,description,targets;
 if(kind==='triangle'){
  A=[-4,-3];a=[8,1];b=[3,8];coords={A:[0,0],B:[1,0],C:[0,1],M:[.5,.5],N:[.5,0],P:[0,.5],G:[1/3,1/3]};order=['A','B','C'];
  description='В треугольнике ABC: AB⃗ = a⃗, AC⃗ = b⃗. M, N, P — середины BC, AB, AC; G — точка пересечения медиан.';targets=['BC','AM','MN','CP','BG','GM'];
 }else if(kind==='parallelogram'){
  A=[-4,-3];a=[6,1];b=[2,5];coords={A:[0,0],B:[1,0],D:[0,1],C:[1,1],O:[.5,.5],M:[.5,0],N:[1,.5]};order=['A','B','C','D'];description='В параллелограмме ABCD: AB⃗ = a⃗, AD⃗ = b⃗. O — точка пересечения диагоналей; M и N — середины AB и BC.';targets=['AC','BD','CO','BN','DM','OM'];
 }else{
  A=[4,0];a=[-2,2*Math.sqrt(3)];b=[-2,-2*Math.sqrt(3)];coords={A:[0,0],B:[1,0],C:[2,1],D:[2,2],E:[1,2],F:[0,1],O:[1,1]};order=['A','B','C','D','E','F'];description='В правильном шестиугольнике ABCDEF: AB⃗ = a⃗, AF⃗ = b⃗. O — центр шестиугольника.';targets=['AD','BC','BE','FC','DO','AE'];
 }
 const xy=c=>add(A,add(mul(c[0],a),mul(c[1],b))),positions=Object.fromEntries(Object.entries(coords).map(([name,c])=>[name,xy(c)]));
 const target=g.pick(targets);t.expected=sub(coords[target[1]],coords[target[0]]);t.answerKind='linear';t.geometry={kind,target,coordinates:coords,positions};t.a=a;t.b=b;
 t.given=order.map((name,i)=>({id:'edge'+i,label:'',kind:'segment',start:positions[name],end:positions[order[(i+1)%order.length]],color:INK,editable:false}));
 t.given.push(...Object.entries(positions).map(([name,p])=>({id:'point'+name,label:name,kind:'point',start:p,end:p,color:INK,editable:false})));
 t.given.push(V('a',a,A),V('b',b,A));for(const v of t.given)v.editable=false;
 t.prompt=description+` Выразите ${target}⃗ через a⃗ и b⃗.`;t.solution=`${target}⃗ = ${linearText(t.expected)}.`;return t;
}
export function generateEge(type,seed){
 const g=seeded(seed),meta=EGE.find(x=>x.id===type);if(!meta)throw Error('Unknown EGE prototype');
 const t=base('ege',type,seed);t.source={fileId:'15mxmUZLbKUjXKXgp74UZWpas0xYNLOuw',task:2,variants:meta.variants,pages:meta.variants.map(v=>11+(v-1)*4)};
 let a=randomNonzero(g),b=randomNonzero(g),c=randomNonzero(g);
 if(type.startsWith('ege-dot-')){
  if(type==='ege-dot-coordinates'&&g.ri(0,2)===0){a=mul(.5,a);b=mul(.5,b);}
  t.m=g.pick([-2,-1,.5,1,1,1.5,2,3]);t.n=g.pick([.5,1,1,2,3]);t.expected=[dot(a,b)*t.m*t.n];
  t.prompt=(type.endsWith('drawing')?'На рисунке изображены векторы a⃗ и b⃗.':`Даны a⃗ = ${vec(a)} и b⃗ = ${vec(b)}.`)+` Найдите скалярное произведение ${coefficient(t.m,'a')} и ${coefficient(t.n,'b')}.`;
  if(type.endsWith('drawing'))t.given=[V('a',a,[-3,2]),V('b',b,[3,-2])];
  t.solution=`(${coefficient(t.m,'a')}) · (${coefficient(t.n,'b')}) = (${fmt(t.m)}) · (${fmt(t.n)}) · ((${fmt(a[0])}) · (${fmt(b[0])}) + (${fmt(a[1])}) · (${fmt(b[1])})) = ${fmt(t.expected[0])}.`;
 }else if(type.startsWith('ege-length-')&&type!=='ege-length-parameter'){
  const target=mul(g.pick([1,2,3]),g.pick(pts));let found=false;
  for(let i=0;i<200;i++){t.m=g.pick([-3,-2,-1,-.5,.5,1,1.5,2,3]);t.n=g.pick([-3,-2,-1,-.5,.5,1,1.5,2,3]);a=randomNonzero(g);b=mul(1/t.n,sub(target,mul(t.m,a)));if(b.every(x=>Number.isInteger(x)&&Math.abs(x)<=12)&&norm(b)>0){found=true;break;}}
  if(!found){t.m=1;t.n=1;b=sub(target,a);}
  t.expected=[norm(target)];t.result=target;
  t.prompt=(type.endsWith('drawing')?'На рисунке изображены векторы a⃗ и b⃗.':`Даны a⃗ = ${vec(a)} и b⃗ = ${vec(b)}.`)+` Найдите длину вектора ${combination(t.m,t.n)}.`;
  if(type.endsWith('drawing'))t.given=[V('a',a,[-3,2]),V('b',b,[2,-3])];
  t.solution=`${combination(t.m,t.n)} = ${vec(target)}. Длина: √(${target[0]**2} + ${target[1]**2}) = ${fmt(t.expected[0])}.`;
 }else if(type==='ege-orthogonal'){
  do{a=randomNonzero(g);}while(a.some(x=>x===0));b=mul(g.pick([.5,1,2]),[-a[1],a[0]]);t.unknownVector=g.pick(['a','b']);t.axis=g.ri(0,1);const av=a.map((x,i)=>t.unknownVector==='a'&&t.axis===i?'t':fmt(x)),bv=b.map((x,i)=>t.unknownVector==='b'&&t.axis===i?'t':fmt(x));
  t.expected=[(t.unknownVector==='a'?a:b)[t.axis]];t.prompt=`Векторы a⃗ = (${av.join('; ')}) и b⃗ = (${bv.join('; ')}) перпендикулярны. Найдите t.`;t.solution=`a⃗ · b⃗ = 0. Подставляем координаты и решаем линейное уравнение: t = ${fmt(t.expected[0])}.`;
 }else if(type.startsWith('ege-cosine-')){
  a=mul(g.pick([1,2]),g.pick(pts));b=mul(g.pick([1,2]),g.pick(type.endsWith('drawing')?pts:[...pts,[7,24],[-7,24],[7,-24],[-7,-24]]));
  t.expected=[dot(a,b)/norm(a)/norm(b)];t.prompt=type.endsWith('drawing')?'На рисунке изображены векторы a⃗ и b⃗. Найдите косинус угла между ними.':`Даны a⃗ = ${vec(a)} и b⃗ = ${vec(b)}. Найдите косинус угла между ними.`;
  if(type.endsWith('drawing'))t.given=[V('a',a,[-3,-2]),V('b',b,[1,3])];
  t.solution=`a⃗ · b⃗ = ${fmt(dot(a,b))}; |a⃗| · |b⃗| = ${fmt(norm(a)*norm(b))}. cos φ = ${fmt(t.expected[0])}.`;
 }else if(type==='ege-three-dot'){
  t.op=g.pick(['a-dot-sum','sum-dot-c']);t.expected=[t.op==='a-dot-sum'?dot(a,add(b,c)):dot(add(a,b),c)];t.prompt=`На рисунке изображены a⃗, b⃗ и c⃗. Найдите ${t.op==='a-dot-sum'?'a⃗ · (b⃗ + c⃗)':'(a⃗ + b⃗) · c⃗'}.`;t.given=[V('a',a,[-4,2]),V('b',b,[3,-3]),V('c',c,[-2,-2])];t.solution=`a⃗ = ${vec(a)}, b⃗ = ${vec(b)}, c⃗ = ${vec(c)}. После сложения координат и вычисления скалярного произведения получаем ${fmt(t.expected[0])}.`;
 }else if(type==='ege-length-parameter'){
  t.ratio=g.pick([.5,1.5,2,2.5]);const s=g.pick([1,2]);a=mul(s,g.pick(pts));t.axis=g.ri(0,1);t.root=4*s*t.ratio;const known=3*s*t.ratio;b=t.axis===0?[0,known]:[known,0];t.extreme=g.pick(['min','max']);t.expected=[t.extreme==='min'?-t.root:t.root];t.prompt=`Даны a⃗ = ${vec(a)} и b⃗ = (${t.axis===0?'t':fmt(known)}; ${t.axis===1?'t':fmt(known)}). Найдите t, если |b⃗| = ${fmt(t.ratio)}|a⃗|. Из двух значений укажите ${t.extreme==='min'?'меньшее':'большее'}.`;t.solution=`|b⃗| = ${fmt(5*s*t.ratio)}. t² + (${fmt(known)})² = (${fmt(5*s*t.ratio)})²; t = ±${fmt(t.root)}. Ответ: ${fmt(t.expected[0])}.`;
 }else if(type==='ege-three-length'){
  const target=mul(g.pick([1,2]),g.pick(pts));c=sub(sub(target,a),b);t.expected=[norm(target)];t.result=target;t.prompt='На рисунке изображены векторы a⃗, b⃗ и c⃗. Найдите длину вектора a⃗ + b⃗ + c⃗.';t.given=[V('a',a,[-3,2]),V('b',b,[3,2]),V('c',c,[-2,-3])];t.solution=`a⃗ + b⃗ + c⃗ = ${vec(target)}. Длина: √(${target[0]**2} + ${target[1]**2}) = ${fmt(t.expected[0])}.`;
 }
 t.a=a;t.b=b;t.c=c;return t;
}
// A small expression parser for exact linear combinations; no eval or code execution.
export function parseLinear(input){
 const s=String(input).toLowerCase().replace(/[−–—]/g,'-').replace(/,/g,'.').replace(/а/g,'a').replace(/б/g,'b').replace(/\s/g,'').replace(/[·×]/g,'*');
 const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|[ab()+*/-]/g);if(!tokens||tokens.join('')!==s||tokens.length>100)return null;let i=0;
 const scalar=n=>({n,v:null}),vector=v=>({n:null,v});
 const product=(x,y,divide=false)=>{if(divide){if(y.v||!y.n)throw Error();return x.v?vector(x.v.map(z=>z/y.n)):scalar(x.n/y.n);}if(x.v&&y.v)throw Error();return x.v?vector(x.v.map(z=>z*y.n)):y.v?vector(y.v.map(z=>z*x.n)):scalar(x.n*y.n);};
 function atom(){let token=tokens[i++];if(token==='+'||token==='-'){const x=atom();return product(scalar(token==='-'?-1:1),x);}if(token==='a'||token==='b')return vector(token==='a'?[1,0]:[0,1]);if(token==='('){const x=sum();if(tokens[i++]!==')')throw Error();return x;}if(token===undefined||!/^\d|^\./.test(token))throw Error();return scalar(Number(token));}
 function term(){let x=atom();while(i<tokens.length){const op=tokens[i];if(op==='*'||op==='/'){i++;x=product(x,atom(),op==='/');}else if(op==='a'||op==='b'||op==='('||/^\d|^\./.test(op)){x=product(x,atom());}else break;}return x;}
 function sum(){let x=term();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],y=term(),sign=op==='-'?-1:1;if(x.v&&y.v)x=vector(add(x.v,mul(sign,y.v)));else if(!x.v&&!y.v)x=scalar(x.n+sign*y.n);else if(x.v&&y.n===0){}else if(x.n===0&&y.v)x=vector(mul(sign,y.v));else throw Error();}return x;}
 try{const x=sum();if(i!==tokens.length)return null;const result=x.v||(x.n===0?[0,0]:null);return result?.every(Number.isFinite)?result:null;}catch{return null;}
}
export function checkTask(task,raw,endpoint,work=[]){
 if(task.answerKind==='radical')return checkRootAnswer(raw[0],task.radicand);
 let values;if(task.answerKind==='construction'){
  const possible=[{start:task.anchor,end:endpoint||task.endpoint},...work.filter(x=>x.kind==='vector')];const found=possible.some(x=>same(sub(x.end,x.start),task.expected));
  return {valid:true,correct:found,error:found?null:'construction',values:null,message:found?'Верно!':'Проверьте направление и перемещение по обеим осям.'};
 }
 if(task.answerKind==='linear'){values=parseLinear(raw[0]);if(!values)return{valid:false,correct:false,error:'format',message:'Запишите выражение через a и b. Например: (a+b)/2 или b−a.'};}
 else{values=raw.map(parseNumber);if(values.length!==task.expected.length||values.some(x=>x===null))return{valid:false,correct:false,error:'format',message:'Введите число или дробь через /.'};}
 const correct=same(values,task.expected);return{valid:true,correct,error:correct?null:'calculation',values,message:correct?'Верно!':'Ответ пока не совпадает. Проверьте знаки и вычисления.'};
}
