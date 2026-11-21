'use strict';
const A=Arithmetic,$=id=>document.getElementById(id),key='shimorinmath.arithmetic.v1';let session=null,pending=null;
const groups = [
  ['Первые вычисления', ['early-add-10','early-sub-10','early-add-20','early-sub-20']],
  ['Переход через десяток', ['add-100','sub-100','add-200','sub-200']],
  ['Умножение', ['mul-table','mul-100','mul-200']],
  ['Деление', ['div-table','div-100','div-200']]
];
for (const [name, ids] of groups) {
  const group = document.createElement('optgroup');
  group.label = name;
  for (const id of ids) group.append(new Option(A.modes.find(m=>m[0]===id)[1],id));
  $('mode').append(group);
}
function limits(){return {minA:Number($('minA').value),minB:Number($('minB').value)};}
function validLimits(){return ['minA','minB'].every(id=>/^\d+$/.test($(id).value)&&Number($(id).value)>=1&&Number($(id).value)<=200);}
function description(){const mode=$('mode').value;$('factorSettings').hidden=!mode.startsWith('mul-');if(mode.startsWith('mul-')){let n=validLimits()?A.bank(mode,limits()).length:0;$('bankSize').textContent=validLimits()?`Карточек в базе: ${n}. В серии: ${Math.min(n,Number($('count').value))}. Переставленные множители — отдельные карточки.`:'Укажите целые минимумы от 1 до 200.';}}
function canStart(){let mode=$('mode').value;let message='';if(mode.startsWith('mul-')){if(!validLimits())message='Минимум каждого множителя должен быть целым числом от 1 до 200.';else if(!A.bank(mode,limits()).length)message='При этих ограничениях нет примеров. Уменьшите минимум одного из множителей или выберите больший диапазон.';}$('settingsError').textContent=message;$('settingsError').hidden=!message;return !message;}
function persist(){try{localStorage.setItem(key,JSON.stringify({session,reveal:$('reveal').checked}));}catch{$('saveStatus').textContent='Сохранение недоступно. Не закрывайте страницу до завершения.';}}
try{let saved=JSON.parse(localStorage.getItem(key));if(saved&&saved.session&&saved.session.version===1&&A.modes.some(m=>m[0]===saved.session.mode)&&Array.isArray(saved.session.errors)&&Array.isArray(saved.session.newQueue)&&Array.isArray(saved.session.solved)){session=saved.session;$('mode').value=session.mode;$('count').value=[10,20,30,50].includes(session.requestedCount||session.total)?(session.requestedCount||session.total):20;$('reveal').checked=saved.reveal!==false;if(session.limits){$('minA').value=session.limits.minA;$('minB').value=session.limits.minB;}}}catch{}
function stats(){
  const baseline=session.counterBaseline || {correct:0,incorrect:0};
  const correct=session.firstCorrect-baseline.correct;
  const incorrect=session.seen-session.firstCorrect-baseline.incorrect;
  $('goodCount').textContent=correct;
  $('badCount').textContent=incorrect;
  $('resetScores').disabled=!correct && !incorrect;
  $('progress').max=session.stopped?session.seen:session.total;$('progress').value=session.solved.length;$('progressText').textContent=`Решено ${session.solved.length} из ${session.stopped?session.seen:session.total}`;$('phase').textContent=session.phase==='new'?`Новые карточки · ${Math.min(session.total,session.seen+(session.current?1:0))} / ${session.total}`:session.phase==='review'?'Исправление ошибок':'Серия завершена';$('review').disabled=session.phase!=='new'||!session.errors.length;}
function render(){if(!session)return;$('workspace').hidden=false;let c=A.next(session);stats();$('card').hidden=!c;$('summary').hidden=!!c;if(!c){let untouched=session.newQueue.length;$('result').textContent=`С первой попытки: ${session.firstCorrect} из ${session.seen}. Исправлено: ${session.solved.filter(c=>c.corrected).length}. Всего попыток: ${session.attempts}.`+(untouched?` Новых карточек отложено: ${untouched}.`:'');$('recommendation').textContent=session.firstCorrect===session.seen?'Следующий шаг: выберите более сложный навык или увеличьте серию.':'Следующий шаг: повторите этот навык в новой серии без показа ответов.';persist();return;}$('expression').textContent=`${c.a} ${c.op} ${c.b}`;$('cardLabel').textContent=session.phase==='new'?'НОВАЯ КАРТОЧКА':'ИСПРАВЛЕНИЕ ОШИБКИ';$('answerForm').hidden=false;$('continue').hidden=true;$('feedback').textContent='';$('feedback').className='';$('answer').value='';$('check').disabled=false;persist();$('answer').focus({preventScroll:true});}
function begin(){if(!canStart())return;pending=null;session=A.start($('mode').value,Number($('count').value),limits());render();}
$('mode').onchange=description;$('minA').oninput=description;$('minB').oninput=description;$('count').onchange=description;$('reveal').onchange=persist;$('start').onclick=()=>{if(!canStart())return;if(session&&session.phase!=='done')$('restartDialog').showModal();else begin();};$('confirmRestart').onclick=()=>{$('restartDialog').close();begin();};$('cancelRestart').onclick=()=>$('restartDialog').close();$('again').onclick=begin;
$('answerForm').onsubmit=e=>{e.preventDefault();if(pending||!session||!session.current)return;let raw=$('answer').value.trim();if(!/^\d{1,3}$/.test(raw)){$('feedback').textContent='Введите ответ целым неотрицательным числом.';$('answer').focus();return;}let r=A.answer(session,Number(raw));pending=r;$('answerForm').hidden=true;$('continue').hidden=false;$('feedback').className=r.ok?'good-text':'bad-text';$('feedback').textContent=r.ok?'Верно.':($('reveal').checked?`${r.card.a} ${r.card.op} ${r.card.b} = ${r.card.answer}. `:'Ответ неверный. ')+'Карточка вернётся на повторение.';stats();persist();$('continue').focus({preventScroll:true});};
$('continue').onclick=()=>{pending=null;render();};$('review').onclick=()=>{if(!session.errors.length)return;pending=null;A.review(session);render();};description();if(session)render();

$('openTheory').onclick=()=>$('theory').showModal();

$('resetScores').onclick=()=>{
  session.counterBaseline={correct:session.firstCorrect,incorrect:session.seen-session.firstCorrect};
  stats();
  persist();
};
