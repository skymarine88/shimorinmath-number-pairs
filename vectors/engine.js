export const VERSION='1.0.0';
export const TYPES=[
 {id:'coordinates',name:'Координаты вектора',group:'Основа',short:'От начала к концу',idea:'Координаты вектора — это перемещение, а не положение его конца.',rule:'AB⃗ = (xB − xA; yB − yA)',example:'A(−2; 1), B(3; −2): AB⃗ = (3 − (−2); −2 − 1) = (5; −3).',hint:'От координат конца вычтите координаты начала. Вправо и вверх — плюс, влево и вниз — минус.'},
 {id:'build',name:'Построение',group:'Основа',short:'Два шага по осям',idea:'Сначала отложите горизонтальное перемещение, затем вертикальное.',rule:'a⃗ = (x; y)',example:'Для a⃗ = (3; −2) от начала вектора: 3 клетки вправо, 2 вниз.',hint:'Первое число отвечает за движение по горизонтали, второе — по вертикали.'},
 {id:'translate',name:'Перенос вектора',group:'Основа',short:'Место другое, вектор тот же',idea:'При переносе сохраняются длина и направление.',rule:'CD⃗ = AB⃗',example:'Если AB⃗ = (3; −2), то от C нужно пройти 3 клетки вправо и 2 вниз.',hint:'Сосчитайте перемещение от A к B. Повторите его от C, сохранив направление.'},
 {id:'sum',name:'Сумма и разность',group:'Действия',short:'Сложить перемещения',idea:'Сумма — два последовательных перемещения. Разность a⃗ − b⃗ равна a⃗ + (−b⃗).',rule:'a⃗ ± b⃗ = (ax ± bx; ay ± by)',example:'(2; −3) + (−4; 1) = (−2; −2).',hint:'Работайте отдельно с первыми и со вторыми координатами. При вычитании меняются оба знака второго вектора.'},
 {id:'scale',name:'Умножение на число',group:'Действия',short:'Масштаб и направление',idea:'Модуль коэффициента меняет длину, отрицательный знак разворачивает вектор.',rule:'ka⃗ = (kax; kay)',example:'−2 · (3; −1) = (−6; 2).',hint:'Умножьте на коэффициент обе координаты. При отрицательном коэффициенте направление меняется на противоположное.'},
 {id:'length',name:'Длина вектора',group:'Вычисления',short:'Теорема Пифагора',idea:'Координаты — катеты прямоугольного треугольника, длина — гипотенуза.',rule:'|a⃗| = √(ax² + ay²)',example:'|(−3; 4)| = √(9 + 16) = 5.',hint:'Возведите обе координаты в квадрат, сложите и извлеките квадратный корень. Длина не бывает отрицательной.'},
 {id:'combination',name:'Длина комбинации',group:'Вычисления',short:'Сначала вектор, затем длина',idea:'Сначала найдите координаты результирующего вектора, затем его длину.',rule:'c⃗ = ma⃗ + nb⃗,  |c⃗| = √(cx² + cy²)',example:'a⃗ = (1; 2), b⃗ = (1; 0): 2a⃗ + b⃗ = (3; 4), длина равна 5.',hint:'Не складывайте длины. Вычислите две координаты комбинации и только после этого примените формулу длины.'},
 {id:'dot',name:'Скалярное произведение',group:'Вычисления',short:'В ответе — число',idea:'Скалярное произведение двух векторов — число, которое может быть отрицательным.',rule:'a⃗ · b⃗ = axbx + ayby',example:'(−2; 3) · (4; −1) = −8 − 3 = −11.',hint:'Перемножьте первые координаты и вторые координаты. Результаты сложите.'},
 {id:'cosine',name:'Косинус угла',group:'Связи',short:'Привести к общему началу',idea:'Угол между векторами измеряют после переноса к общему началу: от 0° до 180°.',rule:'cos φ = (a⃗ · b⃗) / (|a⃗| · |b⃗|)',example:'a⃗ = (3; 4), b⃗ = (4; 3): cos φ = 24/25 = 0,96.',hint:'Найдите скалярное произведение и разделите на произведение длин. Если векторы образуют тупой угол, косинус отрицателен.'},
 {id:'angleDot',name:'Длины и угол',group:'Связи',short:'Вторая формула произведения',idea:'Когда известны длины и угол, координаты искать не нужно.',rule:'a⃗ · b⃗ = |a⃗| · |b⃗| · cos φ',example:'|a⃗| = 4, |b⃗| = 5, φ = 120°: a⃗ · b⃗ = 4 · 5 · (−0,5) = −10.',hint:'Умножьте длины на косинус угла. cos 60° = 0,5; cos 90° = 0; cos 120° = −0,5.'},
 {id:'perpendicular',name:'Перпендикулярность',group:'Связи',short:'Произведение равно нулю',idea:'Скалярное произведение ненулевых перпендикулярных векторов равно нулю.',rule:'a⃗ ⟂ b⃗ ⇔ axbx + ayby = 0',example:'(2; 3) ⟂ (t; 4): 2t + 12 = 0, t = −6.',hint:'Составьте уравнение: скалярное произведение равно нулю. Затем решите линейное уравнение.'},
 {id:'parallel',name:'Коллинеарность',group:'Связи',short:'Один вектор кратен другому',idea:'У коллинеарных векторов соответствующие координаты связаны одним множителем.',rule:'a⃗ ∥ b⃗ ⇔ axby − aybx = 0',example:'(2; 3) ∥ (t; 6): множитель 2, значит t = 4.',hint:'Найдите множитель по известным координатам или приравняйте к нулю выражение axby − aybx.'}
];
export const EXAM=['dot','combination','length','coordinates','angleDot','perpendicular','dot','combination','cosine','parallel'];
export const DIAGNOSTIC=['coordinates','sum','length','dot','cosine','perpendicular'];
export const add=(a,b)=>a.map((x,i)=>x+b[i]);
export const sub=(a,b)=>a.map((x,i)=>x-b[i]);
export const mul=(k,a)=>a.map(x=>k*x);
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const norm=a=>Math.hypot(...a);
export const same=(a,b)=>a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<1e-8);
export const fmt=n=>Number.isInteger(n)?String(n).replace('-','−'):String(+n.toFixed(8)).replace('.',',').replace('-','−');
export const vec=a=>'('+a.map(fmt).join('; ')+')';
export function rng(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function parseNumber(value){
 const s=String(value).trim().replace(/[−–—]/g,'-').replace(/,/g,'.').replace(/\s/g,'');
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s))return null;
 const p=s.split('/').map(Number);if(p.length===2&&p[1]===0)return null;
 const n=p.length===2?p[0]/p[1]:p[0];return Number.isFinite(n)&&Math.abs(n)<1e9?n:null;
}
const triples=[[3,4],[4,3],[-3,4],[3,-4],[-4,-3],[-4,3],[0,5],[5,0],[-5,0],[0,-5]];
export function generate(type,seed,mode='practice'){
 const R=rng(seed),ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=xs=>xs[ri(0,xs.length-1)],nz=()=>pick([-4,-3,-2,2,3,4]);
 const rand=()=>{let a;do{a=[ri(-5,5),ri(-5,5)];}while(norm(a)<2);return a;};
 const a=rand(),b=rand(),start=[ri(-4,0),ri(-3,1)];
 let t={id:'v-'+type+'-'+seed,type,seed,mode,a,b,start,expected:[],answerKind:'scalar',build:false,anchor:[0,0],endpoint:[1,1],title:TYPES.find(x=>x.id===type).name,prompt:'',solution:'',graph:'vectors'};
 const pair=e=>{t.answerKind='pair';t.expected=e;};const scalar=e=>{t.expected=[e];};
 switch(type){
 case 'coordinates':pair(a);t.graph='AB';t.prompt='На рисунке изображён вектор AB⃗. Найдите его координаты.';t.solution=`AB⃗ = B − A = ${vec(add(start,a))} − ${vec(start)} = ${vec(a)}.`;if(mode==='exam'){t.component=ri(0,1);t.answerKind='scalar';t.expected=[a[t.component]];t.prompt=`На рисунке изображён вектор AB⃗. Найдите его ${t.component===0?'первую':'вторую'} координату.`;t.solution+=` Ответ: ${fmt(t.expected[0])}.`;}break;
 case 'build':pair(a);t.build=true;t.graph='build';t.prompt=`Постройте вектор a⃗ = ${vec(a)} с началом в O. Переместите его конец в нужный узел сетки.`;t.solution=`От начала вектора нужно пройти ${fmt(a[0])} по оси x и ${fmt(a[1])} по оси y. Конец: ${vec(a)}.`;break;
 case 'translate':pair(a);t.build=true;t.graph='translate';t.anchor=[ri(-1,3),ri(-3,1)];t.endpoint=add(t.anchor,[1,1]);t.prompt='Перенесите вектор AB⃗ в точку C. Поставьте конец D так, чтобы CD⃗ = AB⃗.';t.solution=`Перенос сохраняет координаты ${vec(a)}. Поэтому D = C + AB⃗ = ${vec(add(t.anchor,a))}.`;break;
 case 'sum':{t.op=pick([1,-1]);const c=t.op===1?add(a,b):sub(a,b);pair(c);t.build=mode==='practice';t.prompt=`Найдите координаты вектора c⃗ = a⃗ ${t.op===1?'+':'−'} b⃗.${t.build?' Постройте c⃗ от O и запишите его координаты.':''}`;t.solution=`c⃗ = ${vec(a)} ${t.op===1?'+':'−'} ${vec(b)} = ${vec(c)}.`;break;}
 case 'scale':{t.k=pick([-2,-1,2]);pair(mul(t.k,a));t.build=mode==='practice';t.prompt=`Найдите координаты c⃗ = ${fmt(t.k)}a⃗ при a⃗ = ${vec(a)}.${t.build?' Постройте c⃗ от O.':''}`;t.solution=`${fmt(t.k)} · ${vec(a)} = ${vec(t.expected)}. Умножаем обе координаты.`;break;}
 case 'length':t.a=pick(triples);t.k=pick([1,1,2]);t.a=mul(t.k,t.a);scalar(norm(t.a));t.graph='one';t.prompt=`Найддите длину вектора a⃗ = ${vec(t.a)}.`.replace('Найддите','Найдите');t.solution=`|a⃗| = √((${fmt(t.a[0])})² + (${fmt(t.a[1])})²) = √${dot(t.a,t.a)} = ${fmt(t.expected[0])}.`;break;
 case 'combination':{t.k=pick([-2,-1,2,3]);t.n=pick([-2,-1,1,2]);const c=mul(pick([1,2]),pick(triples));t.a=[ri(-3,3),ri(-3,3)];t.b=mul(1/t.n,sub(c,mul(t.k,t.a)));if(!t.b.every(Number.isInteger)||norm(t.a)===0){return generate(type,seed+997,mode);}scalar(norm(c));t.prompt=`Даны a⃗ = ${vec(t.a)} и b⃗ = ${vec(t.b)}. Найдите длину вектора ${fmt(t.k)}a⃗ ${t.n>0?'+':'−'} ${Math.abs(t.n)===1?'':Math.abs(t.n)}b⃗.`;t.solution=`c⃗ = ${fmt(t.k)} · ${vec(t.a)} + (${fmt(t.n)}) · ${vec(t.b)} = ${vec(c)}. |c⃗| = √(${c[0]**2} + ${c[1]**2}) = ${fmt(norm(c))}.`;break;}
 case 'dot':scalar(dot(a,b));t.numeric=R()<0.5;t.prompt=t.numeric?`Даны векторы a⃗ = ${vec(a)} и b⃗ = ${vec(b)}. Найдите a⃗ · b⃗.`:'На координатной плоскости изображены a⃗ и b⃗. Найдите их скалярное произведение a⃗ · b⃗.';t.solution=`a⃗ · b⃗ = (${fmt(a[0])}) · (${fmt(b[0])}) + (${fmt(a[1])}) · (${fmt(b[1])}) = ${fmt(t.expected[0])}.`;break;
 case 'cosine':t.a=pick(triples);t.b=pick(triples);scalar(dot(t.a,t.b)/(norm(t.a)*norm(t.b)));t.prompt=`Найдите косинус угла между a⃗ = ${vec(t.a)} и b⃗ = ${vec(t.b)}.`;t.solution=`a⃗ · b⃗ = ${fmt(dot(t.a,t.b))}; |a⃗| = |b⃗| = 5. cos φ = ${fmt(dot(t.a,t.b))}/25 = ${fmt(t.expected[0])}.`;break;
 case 'angleDot':t.la=ri(2,9);t.lb=ri(2,9);t.angle=pick([0,60,90,120,180]);t.graph='angle';scalar(t.la*t.lb*Math.round(Math.cos(t.angle*Math.PI/180)*2)/2);t.prompt=`Длины векторов равны ${t.la} и ${t.lb}, угол между ними ${t.angle}°. Найдите их скалярное произведение.`;t.solution=`a⃗ · b⃗ = ${t.la} · ${t.lb} · cos ${t.angle}° = ${fmt(t.expected[0])}.`;break;
 case 'perpendicular':t.a=[nz(),ri(-4,4)];t.b=[0,t.a[0]*pick([-2,-1,1,2])];scalar(-t.a[1]*t.b[1]/t.a[0]);t.graph='parameter';t.prompt=`При каком t векторы a⃗ = ${vec(t.a)} и b⃗ = (t; ${fmt(t.b[1])}) перпендикулярны?`;t.solution=`(${fmt(t.a[0])})t + (${fmt(t.a[1])}) · (${fmt(t.b[1])}) = 0. t = ${fmt(t.expected[0])}.`;break;
 case 'parallel':t.a=[nz(),nz()];t.k=pick([-3,-2,2,3]);t.b=[0,t.a[1]*t.k];scalar(t.a[0]*t.k);t.graph='parameter';t.prompt=`При каком t векторы a⃗ = ${vec(t.a)} и b⃗ = (t; ${fmt(t.b[1])}) коллинеарны?`;t.solution=`По вторым координатам множитель равен ${fmt(t.b[1])}/(${fmt(t.a[1])}) = ${fmt(t.k)}. t = ${fmt(t.k)} · (${fmt(t.a[0])}) = ${fmt(t.expected[0])}.`;break;
 default:throw new Error('Unknown type');
 }
 return t;
}
export function evaluate(t,raw,endpoint=t.endpoint){
 const pureGraph=t.type==='build'||t.type==='translate';
 let values=pureGraph?sub(endpoint,t.anchor):raw.map(parseNumber);
 if(!pureGraph&&(values.length!==t.expected.length||values.some(x=>x===null)))return {valid:false,correct:false,error:'format',message:'Введите число, десятичную дробь или дробь через /. Например: −3, 0,5 или 3/4.'};
 const numeric=same(values,t.expected),drawn=!t.build||same(sub(endpoint,t.anchor),t.expected);
 if(numeric&&drawn)return {valid:true,correct:true,error:null,message:'Верно. Направление и вычисления согласованы.'};
 let error='calculation',message='Проверьте вычисления и знаки. При необходимости откройте правило.';
 if(!drawn){error='construction';message=numeric&&!pureGraph?'Координаты верны, но построение им не соответствует. Переместите конец вектора.':'Построение пока не совпадает с заданным перемещением. Проверьте обе координаты.';}
 if(same(values,mul(-1,t.expected))&&norm(t.expected)>0){error='direction';message='Получился противоположный вектор. Проверьте, где начало, а где конец: конец минус начало.';}
 else if(t.answerKind==='pair'&&same(values,[t.expected[1],t.expected[0]])&&t.expected[0]!==t.expected[1]){error='coordinate-order';message='Координаты поменялись местами. Сначала x — горизонталь, затем y — вертикаль.';}
 else if(t.type==='coordinates'&&same(values,add(t.start,t.a))){error='endpoint';message='Это координаты конца B. У вектора координаты равны разности B − A.';}
 else if(['length','combination'].includes(t.type)&&same(values,[t.expected[0]**2])&&t.expected[0]>1){error='square-root';message='Вы нашли квадрат длины. Осталось извлечь квадратный корень.';}
 else if(t.type==='dot'&&same(values,[t.a[0]*t.b[0]-t.a[1]*t.b[1]])&&t.a[1]*t.b[1]!==0){error='dot-sign';message='В скалярном произведении произведения координат складываются. Сохраните знаки самих произведений.';}
 return {valid:true,correct:false,error,message};
}
export function mastery(attempts,type){const xs=attempts.filter(a=>a.taskType===type&&a.mode==='practice').slice(-10);const wins=xs.filter(a=>a.independent).length;return {count:xs.length,wins,ready:xs.length>=10&&wins>=9};}
