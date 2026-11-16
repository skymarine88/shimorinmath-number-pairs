// Exact arithmetic for rational numbers and sums of square roots. Never evaluates code.
const abs=x=>x<0n?-x:x;
const gcd=(a,b)=>{a=abs(a);b=abs(b);while(b){[a,b]=[b,a%b];}return a;};
const Q=(n,d=1n)=>{if(n.toString().length>180||d.toString().length>180)throw Error('expression too large');if(!d)throw Error('division by zero');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return{n:n/g,d:d/g};};
const plus=(a,b)=>Q(a.n*b.d+b.n*a.d,a.d*b.d);
const times=(a,b)=>Q(a.n*b.n,a.d*b.d);
const divide=(a,b)=>Q(a.n*b.d,a.d*b.n);
const negate=a=>Q(-a.n,a.d);
const scalar=q=>q.n?new Map([[1n,q]]):new Map();
const addTerm=(m,key,q)=>{const next=plus(m.get(key)||Q(0n),q);if(next.n)m.set(key,next);else m.delete(key);};
const scale=(m,q)=>{const out=new Map();for(const[k,v]of m)addTerm(out,k,times(v,q));return out;};
function squareFactors(n){
 if(n<0n||n>100000000n)throw Error('radicand out of bounds');if(!n)return[0n,1n];
 let outside=1n,inside=n;for(let p=2n;p*p<=inside;p++)while(inside%(p*p)===0n){inside/=p*p;outside*=p;}
 return[outside,inside];
}
function addMaps(a,b,sign=1n){const out=new Map(a);for(const[k,q]of b)addTerm(out,k,times(q,Q(sign)));return out;}
function multiply(a,b){
 const out=new Map();for(const[ka,qa]of a)for(const[kb,qb]of b){const common=gcd(ka,kb),key=(ka/common)*(kb/common);if(key>1000000000000n)throw Error('expression too large');addTerm(out,key,times(times(qa,qb),Q(common)));}
 if(out.size>24)throw Error('expression too large');return out;
}
function reciprocal(m){
 if(!m.size)throw Error('division by zero');const entries=[...m];
 if(entries.length===1){const[k,q]=entries[0];return new Map([[k,divide(Q(1n),times(q,Q(k)))]]);}
 if(entries.length===2){const[[ka,qa],[kb,qb]]=entries,den=plus(times(times(qa,qa),Q(ka)),negate(times(times(qb,qb),Q(kb))));if(!den.n)throw Error('division by zero');return scale(new Map([[ka,qa],[kb,negate(qb)]]),divide(Q(1n),den));}
 throw Error('unsupported denominator');
}
function root(m){
 if(!m.size)return new Map();if(m.size!==1||!m.has(1n))throw Error('nested irrational root');const q=m.get(1n);if(q.n<0n)throw Error('negative root');
 const[outside,inside]=squareFactors(q.n*q.d);return outside?new Map([[inside,Q(outside,q.d)]]):new Map();
}
function decimal(s){const parts=s.split('.'),digits=(parts[0]||'0')+(parts[1]||'');if(digits.length>18)throw Error('number too large');return Q(BigInt(digits),10n**BigInt(parts[1]?.length||0));}
export function parseExactNumber(input){
 const s=String(input).trim().replace(/sqrt/gi,'√').replace(/[−–—]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/,/g,'.').replace(/²/g,'^2').replace(/\s/g,'');
 if(!s||s.length>160)return null;const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|[√()+*/^\-]/g);if(!tokens||tokens.join('')!==s||tokens.length>100)return null;let i=0;
 function primary(){const t=tokens[i++];if(t==='√')return root(unary());if(t==='('){const value=sum();if(tokens[i++]!==')')throw Error('parenthesis');return value;}if(!t||!/^\d|^\./.test(t))throw Error('token');return scalar(decimal(t));}
 function power(){let value=primary();if(tokens[i]==='^'){i++;let sign=1;if(tokens[i]==='-'){sign=-1;i++;}const t=tokens[i++];if(!/^\d$/.test(t||''))throw Error('exponent');const n=Number(t)*sign;if(Math.abs(n)>4)throw Error('exponent');const original=value;value=scalar(Q(1n));for(let j=0;j<Math.abs(n);j++)value=multiply(value,original);if(n<0)value=reciprocal(value);}return value;}
 function unary(){if(tokens[i]==='+'){i++;return unary();}if(tokens[i]==='-'){i++;return scale(unary(),Q(-1n));}return power();}
 function term(){let value=unary();while(i<tokens.length){const op=tokens[i];if(op==='*'||op==='/'){i++;value=multiply(value,op==='/'?reciprocal(unary()):unary());}else if(op==='√'||op==='('){value=multiply(value,unary());}else break;}return value;}
 function sum(){let value=term();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++];value=addMaps(value,term(),op==='-'?-1n:1n);}return value;}
 try{const value=sum();return i===tokens.length?value:null;}catch{return null;}
}
export function sameExact(a,b){return!!a&&!!b&&a.size===b.size&&[...a].every(([k,q])=>{const other=b.get(k);return other&&q.n===other.n&&q.d===other.d;});}
export function numericValue(value){let result=0;for(const[k,q]of value)result+=Number(q.n)/Number(q.d)*Math.sqrt(Number(k));return result;}
export function simplifiedRoot(n){const[factor,radicand]=squareFactors(BigInt(n));return{factor:Number(factor),radicand:Number(radicand),text:radicand===1n?String(factor):(factor===1n?'':String(factor))+'√'+radicand};}
export function checkRootAnswer(input,n){
 const value=parseExactNumber(input);if(!value)return{valid:false,correct:false,error:'format',message:'Запишите точный ответ: например, √13, 2√5 или √(20).'};
 const target=root(scalar(Q(BigInt(n)))),correct=sameExact(value,target);
 return{valid:true,correct,error:correct?null:'calculation',values:[numericValue(value)],message:correct?'Верно!':'Нужен точный модуль. Проверьте квадраты координат и корень; десятичное приближение не заменяет точный ответ.'};
}
