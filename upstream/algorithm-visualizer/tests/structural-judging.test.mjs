import test from 'node:test';import assert from 'node:assert/strict';
import {algorithms,buildHarness} from '../study-server/catalog.mjs';import '../study-server/textbook-extra.mjs';
import {quickC} from '../study-server/runner.mjs';import {judge} from '../study-server/judging.mjs';
test('sorted output without AVL rotations is rejected by native invariant check',async()=>{
  const a=algorithms.find(a=>a.id==='avl');
  const bad=a.source.replace(/    if\(balance>1\) \{[\s\S]*?    return p;\n\}/,'    return p;\n}');
  assert.notEqual(bad,a.source);
  const input={values:[3,2,1]},r=await quickC({source:bad,...buildHarness(a,input)});
  assert.equal(r.status,'completed',r.diagnostics);const actual=JSON.parse(r.stdout.split('DS_RESULT:').at(-1));
  assert.equal(actual.invariantError,1);assert.ok(!judge(a,input,actual,{output:[1,2,3]}));
});
