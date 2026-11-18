import test from 'node:test';import assert from 'node:assert/strict';
import {runC} from '../study-server/runner.mjs';
test('null dereference preserves error prefix and line',async()=>{
  const r=await runC({source:'int main(void) {\n int *p=NULL;\n *p=42;\n return 0;\n}',profile:{watches:[]},maxSteps:30});
  assert.equal(r.status,'runtime_error',r.diagnostics);assert.ok(r.steps.length);assert.equal(r.steps.at(-1).nextLocation.line,3);
});
test('infinite source loop stops at step bound',async()=>{
  const r=await runC({source:'int main(void) {\n volatile int n=0;\n while(1) {\n n++;\n }\n}',profile:{watches:[]},maxSteps:20});
  assert.equal(r.status,'limit_reached',r.diagnostics);assert.ok(r.steps.length<=20&&r.steps.length>1);
});
test('global scope qualifier survives recursive parameter shadowing',async()=>{
  const r=await runC({source:'void Visit(TreeNode *root) {\n if(!root)return;\n Visit(root->left);\n}',harness:'int main(void){root=calloc(1,sizeof(TreeNode));root->left=calloc(1,sizeof(TreeNode));Visit(root);ds_finish();return 0;}',entry:'Visit',profile:{watches:['::root']},maxSteps:60});
  assert.equal(r.status,'completed',r.diagnostics);const roots=r.steps.map(s=>s.watches['::root']);assert.match(roots[0],/^0x/);assert.equal(new Set(roots).size,1);
});
