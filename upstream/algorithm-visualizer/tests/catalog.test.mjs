import test from 'node:test';
import assert from 'node:assert/strict';
import { algorithms, buildHarness, expectedFor } from '../study-server/catalog.mjs';
import '../study-server/problems.mjs';
import '../study-server/textbook-extra.mjs';
import '../study-server/textbook-storage.mjs';
import '../study-server/textbook-advanced.mjs';
import '../study-server/textbook-complete.mjs';
import '../study-server/problems-extra.mjs';
import '../study-server/problems-more.mjs';
import '../study-server/problems-expanded.mjs';
import '../study-server/problems-pending.mjs';
import { quickC, runC } from '../study-server/runner.mjs';

for(const a of algorithms) test('C/reference: '+a.id,async()=>{
  for(const input of [a.input,...a.tests]) {
    const built=buildHarness(a,input);
    const r=await quickC({source:a.source,...built});
    assert.equal(r.status,'completed',a.id+' '+r.diagnostics);
    const actual=JSON.parse(r.stdout.split('DS_RESULT:').at(-1));
    assert.equal(actual.memoryError,0,a.id+' memory diagnostics');
    assert.equal(actual.invariantError,0,a.id+' structural invariant');
    const expected=expectedFor(a,input);
    assert.ok(expected,'Missing independent expected result: '+a.id);
    if(expected?.output)assert.deepEqual(actual.output,expected.output,a.id+' '+JSON.stringify(input));
    if(expected?.result!==undefined)assert.equal(actual.result,expected.result);
  }
});

for(const id of ['list-insert','inorder','bfs'])test('trace vertical: '+id,async()=>{
  const a=algorithms.find(x=>x.id===id);
  const run=await runC({source:a.source,entry:a.entry,...buildHarness(a,a.input),maxSteps:500});
  assert.equal(run.status,'completed',run.diagnostics);
  assert.deepEqual(run.output,expectedFor(a,a.input).output);
  assert.ok(run.steps.some(s=>s.objects.length>0));
  assert.ok(run.steps.some(s=>s.nextLocation?.file==='user.c'));
  assert.ok(run.steps.at(-1).objects.every(x=>x.address));
});
