// One shared sequence for every cosine exercise, including skipped tasks and
// switches between preparation, coordinates and drawings. Keep it in saved state.
export const isCollinear=(a,b)=>a[0]*b[1]===a[1]*b[0];
export const cosineSlot=sequence=>Math.max(0,Math.floor(sequence))%10===9;

export function chooseCosinePair(pick,first,second,sequence){
 const a=pick(first),collinear=cosineSlot(sequence);
 const b=pick(second.filter(v=>isCollinear(a,v)===collinear));
 return [a,b];
}

export function scheduledCosine(state,createTask){
 const sequence=state.cosineSequence||0,task=createTask({sequence});
 state.cosineSequence=sequence+1;
 return {...task,id:`${task.id}-cosine-${sequence}`,cosineVersion:1,cosineSequence:sequence};
}
