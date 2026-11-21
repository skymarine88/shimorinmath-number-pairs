(function(root){
const modes=[
['early-add-10','Сложение до 10','Сумма от 0 до 10.'],
['early-sub-10','Вычитание до 10','Уменьшаемое до 10.'],
['early-add-20','Сложение до 20','Вычисления во втором десятке.'],
['early-sub-20','Вычитание до 20','Вычисления во втором десятке.'],
['mul-table','Таблица умножения','Множители от 1 до 10; ограничения задаются отдельно.'],['mul-100','Внетабличное умножение · до 100','Все пары натуральных множителей вне таблицы 1–10; произведение до 100.'],['mul-200','Внетабличное умножение · до 200','Все пары натуральных множителей вне таблицы 1–10; произведение до 200.'],['div-table','Табличное деление','Обратные примеры таблицы умножения.'],['div-100','Внетабличное деление · до 100','Делимое до 100, частное двузначное, без остатка.'],['div-200','Внетабличное деление · до 200','Делимое до 200, без остатка.'],['add-100','Сложение · до 100','Обязательный переход через разряд.'],['sub-100','Вычитание · до 100','Обязательный переход через разряд.'],['add-200','Сложение · до 200','Сумма до 200; переход через разряд.'],['sub-200','Вычитание · до 200','Уменьшаемое до 200; переход через разряд.']];
function bank(mode,limits={minA:1,minB:1}){const out=[]; const push=(a,b,op,answer)=>out.push({id:`${a}${op}${b}`,a,b,op,answer});
if (mode.startsWith('early-')) {
  const [,operation,range] = mode.split('-');
  const max = Number(range);
  for (let a=0; a<=max; a++) for (let b=0; b<=max; b++) {
    const sum = a+b;
    if (sum>max) continue;
    if (max===20 && sum<=10) continue;
    if (operation==='add') push(a,b,'+',sum);
    else push(sum,b,'−',a);
  }
}
else if(mode.startsWith('mul-')){const table=mode==='mul-table',max=table?100:Number(mode.split('-')[1]);const upper=table?10:max;for(let a=1;a<=upper;a++)for(let b=1;b<=upper;b++)if(a>=limits.minA&&b>=limits.minB&&a*b<=max&&(table||a>10||b>10))push(a,b,'×',a*b);}
else if(mode==='div-table'){for(let a=2;a<=9;a++)for(let b=2;b<=9;b++)push(a*b,a,':',b);}
else if(mode.startsWith('div-')){const max=Number(mode.split('-')[1]);for(let a=11;a<=99;a++)for(let b=2;b<=9;b++)if(a*b<=max)push(a*b,b,':',a);}
else {const max=Number(mode.split('-')[1]);const add=mode.startsWith('add');for(let a=1;a<=max;a++)for(let b=1;b<=max;b++){let answer=add?a+b:a-b;let cross=add?a%10+b%10>=10:a%10<b%10;if(cross&&answer>=0&&answer<=max)push(a,b,add?'+':'−',answer);}}
return out;}
function shuffle(items,rng=Math.random){let a=items.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function start(mode,count,limits={minA:1,minB:1}){const pool=bank(mode,limits);return {version:1,mode,limits,requestedCount:count,total:Math.min(count,pool.length),newQueue:shuffle(pool).slice(0,count),errors:[],solved:[],current:null,phase:'new',attempts:0,firstCorrect:0,seen:0,round:0,stopped:false};}
function next(s){if(s.current)return s.current; if(s.phase==='new'&&s.newQueue.length)s.current=s.newQueue.shift();else {if(s.phase==='new'){s.phase='review';s.round=1;} if(s.errors.length)s.current=s.errors.shift();else s.phase='done';}return s.current;}
function answer(s,value){if(!s.current)return null;let card=s.current;let ok=value===card.answer;s.attempts++;if(s.phase==='new'){s.seen++;if(ok)s.firstCorrect++;}if(ok)s.solved.push({...card,corrected:s.phase==='review'});else s.errors.push(card);s.current=null;return {ok,card};}
function review(s){if(s.phase!=='new')return;if(s.current){s.newQueue.unshift(s.current);s.current=null;}s.stopped=true;s.phase='review';s.round=1;}
const api={modes,bank,shuffle,start,next,answer,review};if(typeof module!=='undefined')module.exports=api;root.Arithmetic=api;
})(globalThis);
