// Each answered task contributes once; retries never inflate either counter.
// A reset baseline hides earlier totals while retaining the complete learning history.
export function answerTotals(attempts, mode='practice', baseline=null) {
 const answered=new Map();
 for (const a of attempts) {
  if (a.mode!==mode || !a.taskId || answered.has(a.taskId)) continue;
  if ((a.errorCodes||[]).some(e=>['skipped','revealed','unanswered','timeout'].includes(e))) continue;
  answered.set(a.taskId,Boolean(a.correct));
 }
 let correct=0,incorrect=0;
 for(const value of answered.values()) value?correct++:incorrect++;
 return {correct:Math.max(0,correct-(baseline?.correct||0)),incorrect:Math.max(0,incorrect-(baseline?.incorrect||0))};
}
