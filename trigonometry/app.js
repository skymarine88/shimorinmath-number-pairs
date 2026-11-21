import {angles, deck, choices} from './tasks.js';
const $ = id=>document.getElementById(id);
const storageKey='shimorinmath.trigonometry.scores.v1';
let scores={};
try { scores=JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
let cards=[], task, answered=false;
const circle=$('circle');
function pointName(angle) { return String.fromCharCode(65+angles.indexOf(angle)); }
for (const a of angles) {
  const btn=document.createElement('button'), t=a*Math.PI/180;
  btn.type='button'; btn.textContent=pointName(a);
  btn.setAttribute('aria-label','Точка '+pointName(a));
  btn.style.left=(50+39*Math.cos(t))+'%';
  btn.style.top=(50-39*Math.sin(t))+'%';
  btn.dataset.value=String(a);
  circle.append(btn);
}
function stats() {
  const s=scores[$('mode').value]||{ok:0,bad:0};
  $('ok').textContent=s.ok; $('bad').textContent=s.bad;
  $('reset').disabled=!s.ok&&!s.bad;
}
function save() { try { localStorage.setItem(storageKey,JSON.stringify(scores)); } catch {} stats(); }
function next() {
  const mode=$('mode').value;
  if (!cards.length) cards=deck(mode);
  task=cards.pop(); answered=false;
  $('feedback').textContent=''; $('feedback').removeAttribute('class');
  $('next').textContent='Пропустить';
  $('prompt').textContent=task.prompt;
  $('instruction').textContent=task.note || (mode==='circle'?'Отметьте точку на окружности':'Выберите точное значение');
  $('options').replaceChildren();
  circle.hidden=mode!=='circle';
  for (const b of circle.querySelectorAll('button')) { b.disabled=false; b.className=''; }
  if (mode!=='circle') for (const v of choices(task)) {
    const btn=document.createElement('button');
    btn.textContent=v; btn.dataset.value=v; $('options').append(btn);
  }
  stats();
}
function answer(e) {
  const clicked=e.target.closest('button[data-value]');
  if (!clicked || answered) return;
  answered=true;
  const ok=clicked.dataset.value===task.answer, mode=$('mode').value;
  const s=scores[mode] ||= {ok:0,bad:0}; s[ok?'ok':'bad']++;
  for (const b of e.currentTarget.querySelectorAll('button')) {
    b.disabled=true;
    if (b.dataset.value===task.answer) b.className='correct';
    else if (b===clicked) b.className='incorrect';
  }
  $('feedback').className=ok?'correct':'incorrect';
  $('feedback').textContent=ok?'Верно.':(mode==='circle'?'Нужна точка '+pointName(task.point)+'. ':'')+task.explanation;
  $('next').textContent='Следующее задание'; save(); $('next').focus({preventScroll:true});
}
circle.addEventListener('click',answer); $('options').addEventListener('click',answer);
$('next').onclick=()=>{next();$('prompt').focus({preventScroll:true});};
$('mode').onchange=()=>{cards=[];next();};
$('reset').onclick=()=>{scores[$('mode').value]={ok:0,bad:0};save();};
$('theoryButton').onclick=()=>$('theory').showModal();
next();
