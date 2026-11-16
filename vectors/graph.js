import{add,sub,norm}from'./engine.js';
const INK='#2B3038',CORAL='#E06357',GRAY='#97979e';
export class VectorBoard{
 constructor(svg,onChange){this.svg=svg;this.onChange=onChange;this.range=10;this.vectors=[];this.showGrid=true;this.selected='';this.drag=null;this.snap=.5;this.tool='select';this.draft=null;svg.setAttribute('viewBox','0 0 600 600');svg.setAttribute('role','application');svg.setAttribute('aria-label','Координатная плоскость. Перетаскивайте векторы или используйте поля координат под графиком.');svg.tabIndex=0;svg.addEventListener('pointerdown',e=>this.down(e));svg.addEventListener('pointermove',e=>this.move(e));svg.addEventListener('pointerup',e=>this.up(e));svg.addEventListener('pointercancel',e=>this.up(e));svg.addEventListener('keydown',e=>this.key(e));}
 set(vectors,{range,triangle=false,angle=null,grid=true}={}){this.vectors=structuredClone(vectors);this.triangle=triangle;this.angle=angle;this.showGrid=grid;this.range=range||Math.max(8,Math.ceil(Math.max(...vectors.flatMap(v=>[...v.start,...v.end]).map(Math.abs))+2));if(!this.vectors.some(v=>v.id===this.selected&&v.editable))this.selected=this.vectors.find(v=>v.id==='r')?.id||this.vectors.find(v=>v.editable)?.id||'';this.render();}
 point(a){const u=520/(2*this.range);return[300+a[0]*u,300-a[1]*u];}
 mathPoint(e){const p=this.svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(this.svg.getScreenCTM().inverse());return[(q.x-300)*this.range/260,(300-q.y)*this.range/260];}
 zoom(delta){this.range=Math.max(6,Math.min(80,this.range+delta));this.render();}
 render(){const S=this.svg,unit=260/this.range;let h=`<defs><marker id="head-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${CORAL}"/></marker><marker id="head-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${INK}"/></marker><marker id="head-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="${GRAY}"/></marker></defs>`;
 if(this.showGrid)for(let i=-this.range;i<=this.range;i++){const q=300+i*unit;h+=`<path d="M ${q} 35 V565 M35 ${q} H565" stroke="${i%5===0?'#e2e2e5':'#f0f0f2'}" stroke-width="1"/>`;}
 h+='<path d="M35 300H569M300 565V31" stroke="#bebec5" stroke-width="1.3"/><path d="M563 296L570 300L563 304M296 37L300 30L304 37" fill="none" stroke="#bebec5"/>';
 const step=this.range>16?4:2;for(let i=-this.range+1;i<this.range;i++){if(i===0||i%step)continue;const [x,y]=this.point([i,i]);h+=`<text x="${x}" y="318" text-anchor="middle" class="tick">${i}</text><text x="288" y="${y+3}" text-anchor="end" class="tick">${i}</text>`;}
 h+='<text x="286" y="317" class="tick">0</text><text x="577" y="295" class="axis-label">x</text><text x="311" y="31" class="axis-label">y</text>';
 if(this.triangle){const v=this.vectors.find(x=>x.id===this.selected)||this.vectors[0];if(v){const p=this.point(v.start),q=this.point([v.end[0],v.start[1]]),r=this.point(v.end);h+=`<path d="M${p}L${q}L${r}" stroke="#babac1" stroke-width="1.5" stroke-dasharray="5 5" fill="none"/>`;}}
 if(this.angle!==null){const r=40,theta=this.angle*Math.PI/180,p=[300+r*Math.cos(theta),300-r*Math.sin(theta)];if(this.angle>0&&this.angle<180)h+=`<path d="M340 300A40 40 0 0 0 ${p}" fill="none" stroke="#a0a0a7" stroke-width="1.4"/>`;h+=`<text x="349" y="280" class="tick">${this.angle}°</text>`;}
 for(const v of this.vectors){const p=this.point(v.start),q=this.point(v.end),color=v.color||CORAL,marker=color===CORAL?'a':color===INK?'b':'c';const chosen=v.id===this.selected,zero=norm(sub(v.end,v.start))<.01;h+=`<g data-vector="${v.id}"><title>${v.label}${v.editable?' — можно перемещать':''}</title>`;
 if(!zero&&v.kind!=='point')h+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${color}" stroke-width="${v.dashed?2:3}" ${v.dashed?'stroke-dasharray="7 5"':''} ${v.kind==='segment'?'':`marker-end="url(#head-${marker})"`}/>`;
 if(v.editable&&v.kind!=='point')h+=`<line data-part="body" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="transparent" stroke-width="25" style="cursor:grab"/>`;
 h+=`<circle cx="${p[0]}" cy="${p[1]}" r="${v.kind==='point'?5:3.5}" fill="${color}"/>`;
 if(v.editable==='all'&&v.kind!=='point')h+=`<circle class="handle" data-part="tail" cx="${p[0]}" cy="${p[1]}" r="11" fill="white" fill-opacity=".01" stroke="${color}" stroke-opacity=".4"/>`;
 if(v.kind==='point'&&v.editable)h+=`<circle class="handle" data-part="body" cx="${p[0]}" cy="${p[1]}" r="13" fill="transparent"/>`;
 if(v.kind!=='point'&&(v.editable==='head'||v.editable==='all'))h+=`<circle class="handle" data-part="head" cx="${q[0]}" cy="${q[1]}" r="${chosen?10:8}" fill="white" stroke="${color}" stroke-width="1.5"/><circle class="handle" data-part="head" cx="${q[0]}" cy="${q[1]}" r="3" fill="${color}"/>`;
 if(v.startLabel)h+=`<text x="${p[0]-11}" y="${p[1]+18}" class="vlabel" fill="${color}">${v.startLabel}</text>`;
 if(v.endLabel)h+=`<text x="${q[0]+12}" y="${q[1]-9}" class="vlabel" fill="${color}">${v.endLabel}</text>`;
 if(v.label){
 const lx=v.kind==='point'?p[0]+11:(p[0]+q[0])/2+12,ly=v.kind==='point'?p[1]-9:(p[1]+q[1])/2-11;
 if(v.kind!=='point'&&v.kind!=='segment'){
  const width=Math.max(12,[...v.label].length*9),right=lx+width-1,top=ly-21;
  h+=`<g class="vector-notation" data-notation="vector"><path d="M${lx-1} ${top}H${right}M${right-3} ${top-2}L${right} ${top}L${right-3} ${top+2}" stroke="white" stroke-width="4"/><path d="M${lx-1} ${top}H${right}M${right-3} ${top-2}L${right} ${top}L${right-3} ${top+2}" stroke="${color}" stroke-width="1.2"/><text x="${lx}" y="${ly}" class="vlabel" fill="${color}">${v.label}</text></g>`;
 }else h+=`<text x="${lx}" y="${ly}" class="vlabel" fill="${color}">${v.label}</text>`;
 }
 h+='</g>';}
 if(this.draft){const p=this.point(this.draft),q=this.point(this.hover||this.draft);h+=`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${CORAL}"/><path d="M${p}L${q}" stroke="${CORAL}" stroke-width="2" stroke-dasharray="5 5"/>`;}
 S.innerHTML=h;
 }
 snapped(p){const limit=this.range-1;return p.map(x=>Math.max(-limit,Math.min(limit,Math.round(x/this.snap)*this.snap)));}
 down(e){
  const p=this.snapped(this.mathPoint(e));
  if(['point','segment','vector'].includes(this.tool)){
   e.preventDefault();if(this.tool==='point'){this.onCreate?.({kind:'point',start:p,end:p});return;}
   if(!this.draft){this.draft=p;this.hover=p;this.render();return;}
   if(norm(sub(p,this.draft))<.001)return;
   const start=[...this.draft];this.draft=null;this.hover=null;this.onCreate?.({kind:this.tool,start,end:p});return;
  }
  const group=e.target.closest('[data-vector]');if(!group)return;const v=this.vectors.find(x=>x.id===group.dataset.vector);if(!v)return;
  if(this.tool==='delete'){if(v.user)this.onRemove?.(v.id);return;}
  if(!v.editable)return;e.preventDefault();this.onBeforeChange?.();this.selected=v.id;let part=e.target.dataset.part||'body';if(v.editable==='translate')part='body';if(v.editable==='head')part='head';
  this.drag={id:v.id,part,from:this.mathPoint(e),start:[...v.start],end:[...v.end]};this.svg.setPointerCapture(e.pointerId);this.svg.focus({preventScroll:true});this.render();
 }
 move(e){
  if(this.draft){this.hover=this.snapped(this.mathPoint(e));this.render();return;}
  if(!this.drag)return;e.preventDefault();const d=this.drag,v=this.vectors.find(x=>x.id===d.id),p=this.mathPoint(e),bound=this.range-1;
  if(v.kind==='point'){v.start=this.snapped(p);v.end=[...v.start];}
  else if(d.part==='head')v.end=this.snapped(p);else if(d.part==='tail')v.start=this.snapped(p);else{const shift=sub(p,d.from).map(x=>Math.round(x/this.snap)*this.snap);for(let i=0;i<2;i++)shift[i]=Math.max(-bound-Math.min(d.start[i],d.end[i]),Math.min(bound-Math.max(d.start[i],d.end[i]),shift[i]));v.start=add(d.start,shift);v.end=add(d.end,shift);}
  this.render();this.onChange?.(v,false);
 }
 up(e){if(!this.drag)return;const v=this.vectors.find(x=>x.id===this.drag.id);this.drag=null;if(this.svg.hasPointerCapture(e.pointerId))this.svg.releasePointerCapture(e.pointerId);this.onChange?.(v,true);}
 key(e){
  if(e.key==='Escape'){this.draft=null;this.hover=null;this.render();return;}
  const v=this.vectors.find(x=>x.id===this.selected);
  if((e.key==='Delete'||e.key==='Backspace')&&v?.user){e.preventDefault();this.onRemove?.(v.id);return;}
  const step=this.snap,ds={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,step],ArrowDown:[0,-step]};if(!v?.editable||!ds[e.key])return;
  e.preventDefault();this.onBeforeChange?.();const d=ds[e.key],bound=this.range-1;
  if(v.editable==='translate'||v.kind==='point'){if([...add(v.start,d),...add(v.end,d)].some(x=>Math.abs(x)>bound))return;v.start=add(v.start,d);v.end=add(v.end,d);}else v.end=add(v.end,d).map(x=>Math.max(-bound,Math.min(bound,x)));
  this.render();this.onChange?.(v,true);
 }
}
