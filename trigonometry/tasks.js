export const angles = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];
const functions = ['sin','cos','tg','ctg'];
const undefinedValue = 'Не определён';
const firstQuadrant = {
  sin: ['0','1/2','√2/2','√3/2','1'],
  cos: ['1','√3/2','√2/2','1/2','0'],
  tg: ['0','√3/3','1','√3',undefinedValue],
  ctg: [undefinedValue,'√3','1','√3/3','0']
};
const baseAngles = [0,30,45,60,90];
const normalize = a => ((a % 360) + 360) % 360;

export function radians(degrees) {
  if (!degrees) return '0';
  let a = Math.abs(degrees), b = 180;
  while (b) [a,b] = [b,a%b];
  const n = Math.abs(degrees)/a, d = 180/a;
  return (degrees<0?'−':'') + (n===1?'':n) + 'π' + (d===1?'':'/'+d);
}

function sign(f, angle) {
  const a = normalize(angle);
  if (f==='sin') return a>180 ? -1 : 1;
  if (f==='cos') return a>90 && a<270 ? -1 : 1;
  return (a>90 && a<180) || a>270 ? -1 : 1;
}

export function exact(f, angle) {
  const a = normalize(angle);
  const acute = Math.min(a%180,180-a%180);
  const v = firstQuadrant[f][baseAngles.indexOf(acute)];
  return v!==undefinedValue && v!=='0' && sign(f,a)<0 ? '−'+v : v;
}

export function shuffled(items) {
  const copy = items.slice();
  for (let i=copy.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

export function deck(mode) {
  const cards = [];
  const signedAngles = [...angles, ...angles.slice(1).map(a=>a-360),360];
  if (mode==='reduction') {
    const paired = {sin:'cos',cos:'sin',tg:'ctg',ctg:'tg'};
    for (const f of functions) for (const axis of [90,180,270,360]) for (const dir of [-1,1]) {
      const result = axis%180===0 ? f : paired[f];
      const prefix = sign(f,axis+dir*30)<0?'−':'';
      const prompt = f+'('+radians(axis)+(dir<0?' − ':' + ')+'α)';
      cards.push({prompt,answer:prefix+result+' α',pool:functions.flatMap(g=>[g+' α','−'+g+' α']),
        note:'0 < α < π/2',explanation:prompt+' = '+prefix+result+' α.'});
    }
  } else {
    for (const angle of signedAngles) {
      const deg=String(angle).replace('-','−')+'°', rad=radians(angle);
      if (mode==='circle') {
        for (const unit of [deg,rad]) cards.push({prompt:unit,point:normalize(angle),answer:String(normalize(angle)),
          explanation:'Угол '+unit+' соответствует точке '+normalize(angle)+'° на окружности.'});
      } else if (mode==='units') {
        for (const toRad of [true,false]) {
          const format = a=>toRad?radians(a):String(a).replace('-','−')+'°';
          cards.push({prompt:toRad?deg:rad,answer:format(angle),pool:signedAngles.map(format),
            note:toRad?'Запишите угол в радианах':'Запишите угол в градусах',explanation:deg+' = '+rad+' рад.'});
        }
      } else {
        for (const f of functions) {
          const arg = angle<0?'('+rad+')':rad;
          const prompt=f+' '+arg, answer=exact(f,angle);
          cards.push({prompt,answer,pool:signedAngles.map(a=>exact(f,a)),
            explanation:answer===undefinedValue?prompt+' не определён: знаменатель равен нулю.':prompt+' = '+answer+'.'});
        }
      }
    }
  }
  return shuffled(cards);
}

export function choices(task) {
  const others = [...new Set(task.pool)].filter(v=>v!==task.answer);
  return shuffled([task.answer,...shuffled(others).slice(0,3)]);
}
