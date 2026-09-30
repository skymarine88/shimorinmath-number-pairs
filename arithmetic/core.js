(function(root){
const modes=[
['mul-table','Таблица умножения','Множители от 2 до 9.'],['mul-100','Внетабличное умножение · до 100','Двузначное число × однозначное; произведение до 100.'],['mul-200','Внетабличное умножение · до 200','Произведение от 101 до 200.'],['div-table','Табличное деление','Обратные примеры таблицы умножения.'],['div-100','Внетабличное деление · до 100','Делимое до 100, частное двузначное, без остатка.'],['div-200','Внетабличное деление · до 200','Делимое от 101 до 200, без остатка.'],['add-100','Сложение · до 100','Обязательный переход через разряд.'],['sub-100','Вычитание · до 100','Обязательный переход через разряд.'],['add-200','Сложение · до 200','Сумма от 101 до 200; переход через разряд.'],['sub-200','Вычитание · до 200','Уменьшаемое от 101 до 200; переход через разряд.']];
function bank(mode){const out=[]; const push=(a,b,op,answer)=>out.push({id:`${a}${op}${b}`,a,b,op,answer});
if(mode==='mul-table'||mode==='div-table'){for(let a=2;a<=9;a++)for(let b=2;b<=9;b++)mode==='mul-table'?push(a,b,'×',a*b):push(a*b,a,':',b);}
else if(mode.startsWith('mul-')||mode.startsWith('div-')){const max=Number(mode.split('-')[1]);for(let a=11;a<=99;a++)for(let b=2;b<=9;b++){let p=a*b;if(p<=max&&(max===100||p>100))mode.startsWith('mul')?push(a,b,'×',p):push(p,b,':',a);}}
else {const max=Number(mode.split('-')[1]);const add=mode.startsWith('add');for(let a=1;a<=max;a++)for(let b=1;b<=max;b++){let answer=add?a+b:a-b;let cross=add?a%10+b%10>=10:a%10<b%10;if(cross&&answer>=0&&answer<=max&&(add?(max===100||answer>100):(max===100||a>100)))push(a,b,add?'+':'−',answer);}}
return out;}
function shuffle(items,rng=Math.random){let a=items.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function start(mode,count){return {version:1,mode,total:count,newQueue:shuffle(bank(mode)).slice(0,count),errors:[],solved:[],current:null,phase:'new',attempts:0,firstCorrect:0,seen:0,round:0,stopped:false};}
function next(s){if(s.current)return s.current; if(s.phase==='new'&&s.newQueue.length)s.current=s.newQueue.shift();else {if(s.phase==='new'){s.phase='review';s.round=1;} if(s.errors.length)s.current=s.errors.shift();else s.phase='done';}return s.current;}
function answer(s,value){if(!s.current)return null;let card=s.current;let ok=value===card.answer;s.attempts++;if(s.phase==='new'){s.seen++;if(ok)s.firstCorrect++;}if(ok)s.solved.push({...card,corrected:s.phase==='review'});else s.errors.push(card);s.current=null;return {ok,card};}
function review(s){if(s.phase!=='new')return;if(s.current){s.newQueue.unshift(s.current);s.current=null;}s.stopped=true;s.phase='review';s.round=1;}
const api={modes,bank,shuffle,start,next,answer,review};if(typeof module!=='undefined')module.exports=api;root.Arithmetic=api;
})(globalThis);
