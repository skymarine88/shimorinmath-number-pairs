// Each answered task contributes once; retries never inflate either counter.
export function answerTotals(attempts, mode='practice') {
 const answered=new Map();
 for (const a of attempts) {
  if (a.mode!==mode || !a.taskId || answered.has(a.taskId)) continue;
  if ((a.errorCodes||[]).some(e=>['skipped','revealed','unanswered','timeout'].includes(e))) continue;
  answered.set(a.taskId,Boolean(a.correct));
 }
 let correct=0,incorrect=0;
 for(const value of answered.values()) value?correct++:incorrect++;
 return {correct,incorrect};
}
