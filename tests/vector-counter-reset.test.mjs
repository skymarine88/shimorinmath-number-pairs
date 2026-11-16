import test from 'node:test';
import assert from 'node:assert/strict';
import {answerTotals} from '../vectors/score.js';

test('reset uses a baseline without deleting history or affecting EGE',()=>{
 const attempts=[{mode:'practice',taskId:'p1',correct:true},{mode:'practice',taskId:'p2',correct:false},{mode:'ege',taskId:'e1',correct:true}];
 const saved=JSON.stringify(attempts),baseline=answerTotals(attempts,'practice');
 assert.deepEqual(answerTotals(attempts,'practice',baseline),{correct:0,incorrect:0});
 assert.equal(JSON.stringify(attempts),saved);
 assert.deepEqual(answerTotals(attempts,'ege'),{correct:1,incorrect:0});
 attempts.push({mode:'practice',taskId:'p3',correct:false});
 assert.deepEqual(answerTotals(attempts,'practice',baseline),{correct:0,incorrect:1});
});

test('correcting a task after reset does not count a retry as a new task',()=>{
 const attempts=[{mode:'practice',taskId:'p1',correct:false}];
 const baseline=answerTotals(attempts,'practice');
 attempts.push({mode:'practice',taskId:'p1',correct:true});
 assert.deepEqual(answerTotals(attempts,'practice',baseline),{correct:0,incorrect:0});
 attempts.push({mode:'practice',taskId:'p2',correct:true});
 assert.deepEqual(answerTotals(attempts,'practice',baseline),{correct:1,incorrect:0});
});

test('a second reset and a saved-state reload keep counters at zero',()=>{
 const attempts=[{mode:'practice',taskId:'p1',correct:true}];
 let baseline=answerTotals(attempts,'practice');
 attempts.push({mode:'practice',taskId:'p2',correct:false});
 baseline=answerTotals(attempts,'practice');
 const restored=JSON.parse(JSON.stringify({attempts,counterBaselines:{practice:baseline}}));
 assert.deepEqual(answerTotals(restored.attempts,'practice',restored.counterBaselines.practice),{correct:0,incorrect:0});
 restored.attempts.push({mode:'practice',taskId:'p3',correct:true});
 assert.deepEqual(answerTotals(restored.attempts,'practice',restored.counterBaselines.practice),{correct:1,incorrect:0});
});

test('skips and reveal events stay outside the reset counters',()=>{
 const attempts=[{mode:'practice',taskId:'p1',correct:true}],baseline=answerTotals(attempts);
 attempts.push({mode:'practice',taskId:'p2',correct:false,errorCodes:['skipped']},{mode:'practice',taskId:'p3',correct:false,errorCodes:['revealed']});
 assert.deepEqual(answerTotals(attempts,'practice',baseline),{correct:0,incorrect:0});
});
