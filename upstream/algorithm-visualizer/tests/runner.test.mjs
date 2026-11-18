import test from 'node:test';
import assert from 'node:assert/strict';
import { runC } from '../study-server/runner.mjs';

test('GDB records actual C array mutation and source positions',async()=>{
  const run=await runC({source:'void solve(void) {\n a[0] = a[0] + 7;\n a[1] = a[0] * 2;\n}\n',harness:'int main(void){n=2;a[0]=1;a[1]=0;solve();ds_finish();return 0;}',entry:'solve',profile:{watches:['a[0]@2','n']},maxSteps:80});
  assert.equal(run.status,'completed',run.diagnostics);
  assert.ok(run.steps.length>=3);
  assert.equal(run.steps.at(-1).watches['a[0]@2']['0'],'8');
  assert.equal(run.steps.at(-1).watches['a[0]@2']['1'],'16');
  assert.ok(run.steps.some(s=>s.nextLocation?.line===2));
});

test('typedef pointer roots retain addresses rather than expanding to struct fields',async()=>{
  const run=await runC({source:'void Solve(void) {\n head=calloc(1,sizeof(LNode));\n head->data=7;\n}',harness:'int main(void){Solve();ds_finish();return 0;}',entry:'Solve',profile:{watches:['head'],nodeType:'LNode'},maxSteps:80});
  assert.equal(run.status,'completed',run.diagnostics);
  assert.match(run.steps.at(-1).watches.head,/^0x/);
});
