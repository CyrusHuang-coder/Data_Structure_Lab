import test from 'node:test';import assert from 'node:assert/strict';import {runC,quickC} from '../study-server/runner.mjs';
test('stdin and stdout are isolated from MI, including text without newlines',async()=>{
  const source='int main(void) {\n int x;\n scanf("%d", &x);\n printf("value=%d",x*2);\n return 0;\n}';
  const quick=await quickC({source,input:'21\n'});assert.equal(quick.stdout,'value=42');
  const run=await runC({source,input:'21\n',profile:{kind:'free',watches:[]},maxSteps:80});
  assert.equal(run.status,'completed',run.diagnostics);assert.equal(run.stdout,'value=42');assert.ok(run.steps.some(s=>s.variables.some(v=>v.name==='x'&&v.value==='21')));
});
