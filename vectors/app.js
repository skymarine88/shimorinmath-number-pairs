import {PREP,EGE,generatePrep,generateEge,checkTask,parseLinear} from './catalog.js?v=cosine-20261117';
import {scheduledCosine} from './cosine.js';
import {VectorBoard} from './graph.js?v=midpoint-20261116';
import {add,sub,vec,fmt,parseNumber,same} from './engine.js';
import {openStore,readState,saveState} from './storage.js';
import {answerTotals} from './score.js?v=counter-reset-20261116';
const $=q=>document.querySelector(q),CORAL='#E06357',INK='#2B3038',GRAY='#97979e';
const clone=x=>structuredClone(x),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich=s=>esc(s).replace(/([A-Z]{2}|[abcuv])⃗/g,'<span class="vector">$1</span>').replace(/([abcuv])([ₓᵧ])/g,'$1<sub>$2</sub>').replace(/\(([−-]?\d+)\/(\d+)\)/g,'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>$1</mn><mn>$2</mn></mfrac></math>');
const randomSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
let bank=[];try{const r=await fetch('./ege-bank.json');if(r.ok)bank=(await r.json()).tasks||[];}catch{}
await openStore();const prior=await readState();
let state=prior?.schemaVersion===2?prior:{schemaVersion:2,version:'2.0.0',view:'tasks',section:'prepare',selected:{prepare:'sum',ege:EGE[0].id},currents:{prepare:null,ege:null},cursors:{},attempts:prior?.attempts||[],legacy:prior?{current:prior.current,checks:prior.checks,lab:prior.lab}:null,lab:{work:[],history:[],tool:'select',snap:.5,range:10},savedAt:null};
if(!['prepare','ege'].includes(state.section))state.section='prepare';
if(['#prepare','#ege'].includes(location.hash)){state.section=location.hash.slice(1);state.view='tasks';}
let board=null,celebrateId=null,counterBump=null,saveTimer=null,toastTimer=null,dragBefore=null;
const list=section=>section==='ege'?EGE:PREP;
const current=()=>state.currents[state.section];
const metadata=()=>list(state.section).find(x=>x.id===state.selected[state.section]);
const mode=()=>state.section==='ege'?'ege':'practice';
function taskCurrent(task){return{task,raw:[],endpoint:clone(task.endpoint||[1,1]),given:clone(task.given||[]),work:[],history:[],tool:'select',snap:task.snap||.5,range:null,tries:0,helped:false,done:false,feedback:null,presentedAt:new Date().toISOString()};}
function nextTask(section,type){
 if(type==='cosine'||type.startsWith('ege-cosine-')){
  const key=section+':'+type,index=state.cursors[key]||0;state.cursors[key]=index+1;
  const seed=section==='ege'?bank.filter(t=>t.type===type)[index]?.seed??randomSeed():randomSeed();
  return scheduledCosine(state,options=>section==='prepare'?generatePrep(type,seed,options):generateEge(type,seed,options));
 }
 if(section==='prepare'){if(type==='length'){const sequence=state.cursors['prepare:length']||0;state.cursors['prepare:length']=sequence+1;state.modulusScheduleSeed??=randomSeed();return generatePrep(type,randomSeed(),{sequence,scheduleSeed:state.modulusScheduleSeed});}return generatePrep(type,randomSeed());}
 const pool=bank.filter(t=>t.type===type),index=state.cursors[type]||0;state.cursors[type]=index+1;
 return clone(pool[index]||generateEge(type,randomSeed()));
}
function ensureCurrent(section=state.section){const types=list(section);if(!types.some(x=>x.id===state.selected[section]))state.selected[section]=types[0].id;if(!state.currents[section])state.currents[section]=taskCurrent(nextTask(section,state.selected[section]));}
ensureCurrent('prepare');ensureCurrent('ege');
state.version='2.1.0';
if(state.currents.prepare?.task.type==='length'&&!state.currents.prepare.task.modulusVersion)state.currents.prepare=taskCurrent(nextTask('prepare','length'));
async function persist(){state.savedAt=new Date().toISOString();await saveState(state);}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(persist,150);}
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3000);}
function sectionTabs(){return `<nav class="task-sections" aria-label="Разделы заданий"><button data-section="prepare" class="section-tab ${state.section==='prepare'?'active':''}" aria-pressed="${state.section==='prepare'}"><span class="section-index">01</span><span>Подготовительные задания</span></button><button data-section="ege" class="section-tab ${state.section==='ege'?'active':''}" aria-pressed="${state.section==='ege'}"><span class="section-index">02</span><span>Задачи ЕГЭ</span></button></nav>`;}
function renderNav(){
 document.querySelectorAll('[data-nav-section]').forEach(b=>b.classList.toggle('active',state.view==='tasks'&&b.dataset.navSection===state.section));
 document.querySelectorAll('#navigation [data-view]').forEach(b=>b.classList.toggle('active',state.view===b.dataset.view));
 $('#skills-label').textContent=state.section==='ege'?'ПРОТОТИПЫ ЕГЭ · № 2':'ПОДГОТОВКА · 7 БЛОКОВ';
 $('#skills').innerHTML=list(state.section).map((t,i)=>`<button class="skill ${state.selected[state.section]===t.id?'active':''}" data-type="${t.id}"><span class="num">${String(i+1).padStart(2,'0')}</span><span>${t.name}</span></button>`).join('');
}
function scoreMarkup(){const totals=answerTotals(state.attempts,mode(),state.counterBaselines?.[mode()]);const sectionName=state.section==='ege'?'Задачи ЕГЭ':'Подготовительные задания';return`<div class="score-controls"><div class="answer-scoreboard" role="group" aria-label="Счёт в разделе ${sectionName}" title="По первой проверке каждого задания"><div class="answer-count count-correct ${counterBump==='correct'?'counter-pop':''}" data-testid="correct-counter"><span class="score-emoji" aria-hidden="true">🔥</span><div><b id="score-correct">${totals.correct}</b><span>Верно</span></div></div><div class="answer-count count-incorrect ${counterBump==='incorrect'?'counter-pop':''}" data-testid="incorrect-counter"><span class="score-emoji" aria-hidden="true">💩</span><div><b id="score-incorrect">${totals.incorrect}</b><span>Неверно</span></div></div></div><button class="score-reset" data-action="reset-counters" aria-label="Сбросить счётчики в разделе ${sectionName}" ${totals.correct+totals.incorrect===0?'disabled':''}>Сбросить счётчики</button></div>`;}
function resetCounters(){state.counterBaselines??={};state.counterBaselines[mode()]=answerTotals(state.attempts,mode());counterBump=null;const controls=$('.score-controls');if(controls)controls.outerHTML=scoreMarkup();persist();toast('Счётчики обнулены');}
function feedbackMarkup(c){if(!c.feedback)return'<div id="feedback" class="feedback" role="status" aria-live="polite"></div>';if(c.feedback.correct)return`<div id="feedback" class="feedback correct ${celebrateId===c.task.id?'celebrate':''}" role="status" aria-live="polite"><span class="success-stamp" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M8 16l5 5L24 10"/></svg></span><strong>Верно!</strong><span class="success-flame" aria-hidden="true">🔥</span><div class="success-sparks" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div></div>`;return`<div id="feedback" class="feedback ${c.feedback.valid?'answer-error':''}" role="status" aria-live="polite"><strong>${c.feedback.valid?'💩 Неверно':'Проверьте запись'}</strong>${rich(c.feedback.message)}</div>`;}
function answerMarkup(c){const t=c.task;if(t.answerKind==='construction')return'<div class="answer-zone"><span class="answer-label">Ответ — ваше построение на поле</span></div>';if(t.answerKind==='linear')return`<div class="answer-zone"><label class="answer-label" for="answer-0">${rich(t.type==='basis'?'c⃗ =':t.geometry.target+'⃗ =')}</label><input id="answer-0" data-answer="0" class="number-input linear-answer" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Линейная комбинация через a и b" placeholder="Например: (a+b)/2" value="${esc(c.raw[0]||'')}" ${c.done?'disabled':''}></div>`;return`<div class="answer-zone"><label class="answer-label" for="answer-0">Ответ</label><input id="answer-0" data-answer="0" class="number-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Числовой ответ" placeholder="${t.answerKind==='radical'?'Точный ответ, например 2√5':'Число или дробь через /'}" value="${esc(c.raw[0]||'')}" ${c.done?'disabled':''}></div>`;}
function mathKeyboard(c){
 if(c.task.answerKind!=='radical'||c.done)return '';
 const keys=['7','8','9','⌫','4','5','6','√','1','2','3','²','0',',','/','−','(',')','×','+'];
 return `<div class="math-keyboard" role="group" aria-label="Математическая клавиатура">${keys.map(key=>`<button type="button" class="math-key ${['√','²','⌫'].includes(key)?'math-symbol':''}" data-math-key="${key}" aria-label="${key==='√'?'Квадратный корень':key==='²'?'Возвести в квадрат':key==='⌫'?'Удалить символ':key}">${key}</button>`).join('')}</div>`;
}
function typeMathKey(key){
 const input=$('#answer-0'),c=current();if(!input||input.disabled||c.task.answerKind!=='radical')return;
 let start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
 input.focus({preventScroll:true});
 if(key==='⌫'){if(start===end&&start>0)start--;input.setRangeText('',start,end,'end');}
 else{const value=key==='√'?'√()':key;input.setRangeText(value,start,end,'end');if(key==='√')input.setSelectionRange(start+2,start+2);}
 c.raw[0]=input.value;scheduleSave();
}
function toolsMarkup(c,readonly=false){if(readonly)return'';return`<div class="drawing-tools" role="toolbar" aria-label="Инструменты построения">${[['select','Выбрать'],['point','Точка'],['segment','Отрезок'],['vector','Вектор'],['delete','Удалить']].map(([id,label])=>`<button data-tool="${id}" class="draw-tool ${c.tool===id?'active':''}" aria-pressed="${c.tool===id}" title="${id==='point'?'Нажмите на поле':id==='vector'||id==='segment'?'Укажите начало и конец':label}">${label}</button>`).join('')}<button class="draw-tool" data-action="undo" aria-label="Отменить последнее построение" ${!c.history.length?'disabled':''}>↶</button><button class="draw-tool" data-action="clear-work">Сброс</button></div>`;}
function boardMarkup(c,{readonly=false}={}){const construction=c.task?.build;return`<div class="board"><div class="board-toolbar"><strong>Координатное поле</strong><div class="board-tools"><button class="tool" data-action="zoom-in" aria-label="Увеличить масштаб">＋</button><button class="tool" data-action="zoom-out" aria-label="Уменьшить масштаб">−</button><button class="tool" data-action="grid" aria-label="Показать или скрыть сетку">Сетка</button></div></div>${toolsMarkup(c,readonly)}<div class="graph-holder"><svg class="graph" id="graph"></svg></div><div class="board-caption"><span>1 клетка = 1</span>${readonly?'':`<label>Шаг <select id="snap-select" aria-label="Шаг привязки"><option value="1" ${c.snap===1?'selected':''}>1</option><option value="0.5" ${c.snap===.5?'selected':''}>½</option><option value="0.25" ${c.snap===.25?'selected':''}>¼</option></select></label>`}</div>${!readonly?`<div class="exact-tools"><label>x<input id="plot-x" type="text" inputmode="text" class="number-input" aria-label="Координата x для построения" placeholder="0"></label><label>y<input id="plot-y" type="text" inputmode="text" class="number-input" aria-label="Координата y для построения" placeholder="0"></label><button class="secondary" data-action="plot-point">Поставить точку</button>${construction?'<button class="secondary" data-action="set-answer-end">Конец c</button>':''}</div>`:''}</div>`;}
function allShapes(c){const given=clone(c.given||c.task?.given||[]);if(c.task?.build)given.push({id:'r',kind:'vector',label:'c',start:c.task.anchor,end:c.endpoint,color:GRAY,editable:c.done?false:'head'});return[...given,...clone(c.work||[])];}
function snapshot(c){return{endpoint:clone(c.endpoint||null),given:clone(c.given||[]),work:clone(c.work)};}
function pushHistory(c,snap=snapshot(c)){c.history.push(snap);if(c.history.length>35)c.history.shift();}
function fitRange(shapes){return Math.min(80,Math.max(8,Math.ceil(Math.max(0,...shapes.flatMap(v=>[...v.start,...v.end]).map(Math.abs)))+2));}
function mountBoard(c,readonly=false){
 board=new VectorBoard($('#graph'),(v,final)=>{
  if(readonly)return;
  if(v.id==='r')c.endpoint=clone(v.end);else if(v.user){const i=c.work.findIndex(x=>x.id===v.id);if(i>=0)c.work[i]=clone(v);}else{const i=c.given.findIndex(x=>x.id===v.id);if(i>=0)c.given[i]=clone(v);}
  if(final&&dragBefore){pushHistory(c,dragBefore);dragBefore=null;refreshUndo(c);}scheduleSave();
 });
 const fitShapes=allShapes(c);if(c.task?.build)fitShapes.push({start:c.task.anchor,end:add(c.task.anchor,c.task.expected)});board.set(allShapes(c).map(v=>readonly?{...v,editable:false}:v),{range:c.range||fitRange(fitShapes)});board.snap=c.snap||.5;board.tool=readonly?'select':c.tool;
 board.onBeforeChange=()=>{dragBefore=snapshot(c);};
 board.onCreate=shape=>{pushHistory(c);const index=c.work.filter(x=>x.kind===shape.kind).length+1;const item={...shape,id:'user-'+crypto.randomUUID(),label:shape.kind==='point'?'P'+index:shape.kind==='vector'?'u'+String(index).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[Number(d)]):'',color:CORAL,editable:'all',user:true};c.work.push(item);board.range=Math.max(board.range,fitRange(allShapes(c)));c.range=board.range;board.vectors=allShapes(c);board.selected=item.id;board.render();refreshUndo(c);persist();};
 board.onRemove=id=>{pushHistory(c);c.work=c.work.filter(x=>x.id!==id);board.vectors=allShapes(c);board.render();refreshUndo(c);persist();};
}
function refreshUndo(c){const b=document.querySelector('[data-action="undo"]');if(b)b.disabled=!c.history.length;}
function renderTasks(){
 ensureCurrent();const c=current(),t=c.task,m=metadata(),i=list(state.section).indexOf(m)+1;
 $('#main').innerHTML=sectionTabs()+`<div class="practice-toolbar"><label class="task-skill-picker">${state.section==='ege'?'Прототип ЕГЭ':'Подготовительный блок'}<select id="task-type" class="select" aria-label="${state.section==='ege'?'Прототип ЕГЭ':'Подготовительный блок'}">${list(state.section).map((x,n)=>`<option value="${x.id}" ${x.id===t.type?'selected':''}>${String(n+1).padStart(2,'0')}. ${x.name}</option>`).join('')}</select></label>${scoreMarkup()}</div><div class="mobile-task-brief"><p>${rich(t.prompt)}</p></div><div class="workspace">${boardMarkup(c)}<section class="task-card" aria-labelledby="task-title"><div class="task-top"><span>${state.section==='ege'?'ЕГЭ · ЗАДАНИЕ № 2':'ПОДГОТОВИТЕЛЬНЫЕ ЗАДАНИЯ'}</span><span class="badge">${String(i).padStart(2,'0')} / ${list(state.section).length}</span></div><h2 id="task-title" class="task-title">${m.name}</h2><p class="task-prompt">${rich(t.prompt)}</p>${answerMarkup(c)}${mathKeyboard(c)}${feedbackMarkup(c)}<div class="actions">${c.done?'<button class="primary full" data-action="next">Следующее задание →</button>':'<button class="primary" data-action="submit">Проверить →</button><button class="secondary" data-action="next">Следующее</button>'}</div></section></div>`;
 mountBoard(c);celebrateId=null;counterBump=null;
}
function renderReference(examples){
 const types=[...PREP,...EGE],id=state.referenceId||state.selected[state.section],meta=types.find(x=>x.id===id)||PREP[0];state.referenceId=meta.id;
 const isEge=meta.id.startsWith('ege-'),t=isEge?generateEge(meta.id,9031):generatePrep(meta.id,9031);
 $('#main').innerHTML=sectionTabs()+`<div class="reference-heading"><h1>${examples?'Примеры решений':'Теория'}</h1><button class="secondary" data-view="tasks">К заданиям →</button></div><label class="answer-label">Тип задания<select id="reference-type" class="select" aria-label="Тип задания в справочнике"><optgroup label="Подготовительные задания">${PREP.map(x=>`<option value="${x.id}" ${x.id===meta.id?'selected':''}>${x.name}</option>`).join('')}</optgroup><optgroup label="Задачи ЕГЭ">${EGE.map(x=>`<option value="${x.id}" ${x.id===meta.id?'selected':''}>${x.name}</option>`).join('')}</optgroup></select></label>${examples?`<div class="workspace reference-workspace">${boardMarkup({task:t,given:t.given,work:[],history:[],snap:.5,endpoint:t.expected},{readonly:true})}<section class="section-card"><h2>${meta.name}</h2><p class="reference-question">${rich(t.prompt)}</p><div class="worked-solution">${t.solutionMath||rich(t.solution)}</div></section></div>`:`<section class="section-card reference-rule"><h2>${meta.name}</h2>${isEge?`<p>${rich(referenceIdea(meta.id))}</p>`:`<p>${rich(meta.idea)}</p><div class="formula">${rich(meta.rule)}</div>`}<button class="secondary" data-view="examples">Пример решения →</button></section>`}`;
 if(examples){const c={task:{...t,build:false},given:t.given,work:[],history:[],snap:.5,endpoint:t.expected};mountBoard(c,true);}
}
function referenceIdea(id){if(id.includes('dot')&&id!=='ege-three-dot')return'Считайте координаты с рисунка или выпишите их из условия. Затем a⃗ · b⃗ = aₓbₓ + aᵧbᵧ. Коэффициенты перед векторами перемножаются.';if(id.includes('length')&&id!=='ege-length-parameter')return'Сначала вычислите координаты всей комбинации, затем найдите её длину по теореме Пифагора.';if(id.includes('cosine'))return'Скалярное произведение разделите на произведение длин: cos φ = (a⃗ · b⃗)/(|a⃗| · |b⃗|).';if(id==='ege-orthogonal')return'Приравняйте скалярное произведение к нулю и решите линейное уравнение относительно неизвестной координаты.';if(id==='ege-length-parameter')return'Используйте условие на длины и возведите обе части в квадрат. Полученные положительный и отрицательный корни сравните с требованием выбрать меньший или больший.';return'Сначала сложите нужные векторы по координатам, затем вычислите скалярное произведение.';}
function renderLab(){const c=state.lab;$('#main').innerHTML=sectionTabs()+`<div class="reference-heading"><h1>Свободное поле</h1></div>${boardMarkup(c)}`;mountBoard(c);}
function render(){renderNav();board=null;if(state.view==='tasks')renderTasks();else if(state.view==='lab')renderLab();else renderReference(state.view==='examples');}
function switchSection(section){if(!['prepare','ege'].includes(section))return;state.section=section;state.view='tasks';history.replaceState(null,'','#'+section);ensureCurrent();render();window.scrollTo(0,0);persist();}
function chooseType(type){if(!list(state.section).some(x=>x.id===type))return;if(type!==state.selected[state.section]){recordSkipped();state.selected[state.section]=type;state.currents[state.section]=taskCurrent(nextTask(state.section,type));}state.view='tasks';render();window.scrollTo(0,0);persist();}
function readAnswers(c){document.querySelectorAll('[data-answer]').forEach(i=>c.raw[+i.dataset.answer]=i.value);}
function record(c,result,skipped=false){c.tries++;state.attempts.push({taskId:c.task.id,taskType:c.task.type,section:state.section,mode:mode(),seedIndex:c.task.seed,source:c.task.source||null,presentedAt:c.presentedAt,answeredAt:new Date().toISOString(),durationMs:Date.now()-Date.parse(c.presentedAt),rawAnswer:clone(c.raw),normalizedAnswer:result.values||null,construction:c.task.build?clone(c.endpoint):null,correct:result.correct,independent:result.correct&&c.tries===1&&!c.helped,errorCodes:skipped?['skipped']:result.error?[result.error]:[],hintIds:c.helped?['reference']:[],attemptNo:c.tries});}
function recordSkipped(){const c=current();if(c&&!c.done&&!c.tries)record(c,{correct:false},true);}
function submit(){const c=current();if(c.done)return;readAnswers(c);c.feedback=checkTask(c.task,c.raw,c.endpoint,c.work);if(c.feedback.valid){record(c,c.feedback);if(c.tries===1)counterBump=c.feedback.correct?'correct':'incorrect';if(c.feedback.correct){c.done=true;celebrateId=c.task.id;}}render();persist();$('#feedback')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function newTask(){recordSkipped();state.currents[state.section]=taskCurrent(nextTask(state.section,state.selected[state.section]));render();persist();}
function canvasCurrent(){return state.view==='lab'?state.lab:current();}
function readPlotPoint(){const p=[$('#plot-x'),$('#plot-y')].map(x=>parseNumber(x.value||'0'));if(p.some(x=>x===null||Math.abs(x)>45)){toast('Введите координаты от −45 до 45. Дроби через / поддерживаются.');return null;}return p;}
function exportData(){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}));a.href=url;a.download='SHIMORINMATH_Vectors_Progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.mathKey!==undefined){typeMathKey(b.dataset.mathKey);return;}
 if(b.dataset.navSection){switchSection(b.dataset.navSection);return;}if(b.dataset.section){switchSection(b.dataset.section);return;}if(b.dataset.type){chooseType(b.dataset.type);return;}
 if(b.dataset.view){state.view=b.dataset.view;if(['theory','examples'].includes(state.view)&&!current().done)current().helped=true;render();window.scrollTo(0,0);persist();return;}
 if(b.dataset.tool){const c=canvasCurrent();c.tool=b.dataset.tool;board.tool=c.tool;board.draft=null;board.render();document.querySelectorAll('[data-tool]').forEach(x=>{x.classList.toggle('active',x.dataset.tool===c.tool);x.setAttribute('aria-pressed',String(x.dataset.tool===c.tool));});persist();return;}
 const action=b.dataset.action;
 if(action==='reset-counters'){resetCounters();return;}
 if(action==='submit'){submit();return;}if(action==='next'){newTask();return;}if(action==='export'){exportData();return;}
 if(action==='zoom-in'||action==='zoom-out'){board?.zoom(action==='zoom-in'?-2:2);canvasCurrent().range=board.range;scheduleSave();return;}if(action==='grid'){board.showGrid=!board.showGrid;board.render();return;}
 if(action==='undo'){const c=canvasCurrent(),snap=c.history.pop();if(snap){Object.assign(c,snap);render();persist();}return;}
 if(action==='clear-work'){const c=canvasCurrent();pushHistory(c);c.work=[];c.endpoint=clone(c.task?.endpoint||[1,1]);c.given=clone(c.task?.given||[]);c.tool='select';render();persist();return;}
 if(action==='plot-point'||action==='set-answer-end'){const p=readPlotPoint();if(!p)return;const c=canvasCurrent();if(action==='plot-point'){board.onCreate({kind:'point',start:p,end:p});}else{pushHistory(c);c.endpoint=p;c.feedback=null;c.range=Math.max(board.range,fitRange(allShapes(c)));render();persist();}return;}
 });
 document.addEventListener('mousedown',e=>{if(e.target.closest('[data-math-key]'))e.preventDefault();});
 document.addEventListener('change',e=>{if(e.target.id==='task-type')chooseType(e.target.value);if(e.target.id==='reference-type'){state.referenceId=e.target.value;render();persist();}if(e.target.id==='snap-select'){canvasCurrent().snap=Number(e.target.value);board.snap=Number(e.target.value);persist();}});
 document.addEventListener('input',e=>{if(e.target.dataset.answer!==undefined){current().raw[+e.target.dataset.answer]=e.target.value;scheduleSave();}});
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-answer]')){e.preventDefault();current().done?newTask():submit();}if(e.key==='Enter'&&e.target.matches('#plot-x,#plot-y')){e.preventDefault();document.querySelector('[data-action="plot-point"]').click();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});
 render();persist();
