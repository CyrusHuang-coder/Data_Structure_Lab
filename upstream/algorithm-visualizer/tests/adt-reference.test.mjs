import test from 'node:test';import assert from 'node:assert/strict';
import {adt} from '../study-server/runtime.mjs';
import {activeAdt,functionReferences,adtCategories,operations} from '../src/study/adtReference.mjs';
test('ADT cards cover all 33 actual public functions and their parameter names',()=>{
  const documented=new Set(adtCategories.flatMap(c=>c.functions));
  assert.equal(documented.size,33);assert.equal(adtCategories.length,6);
  for(const linked of [false,true]){
    const actual=functionReferences(adt,linked);assert.equal(actual.size,33);
    assert.deepEqual([...documented].sort(),[...actual.keys()].sort());
    for(const name of documented){const op=operations[name],reference=actual.get(name);assert.ok(op.example,name+' example');assert.ok(op.returns,name+' return contract');for(const p of op.params)assert.match(reference.signature,new RegExp('\\b'+p.name+'\\b'),name+' documents real parameter '+p.name);}
  }
});
test('ADT reference resolves both storage variants including conditionals inside functions',()=>{
  const sequential=functionReferences(adt),linked=functionReferences(adt,true);
  assert.match(sequential.get('Push').source,/s->data/);assert.doesNotMatch(sequential.get('Push').source,/malloc/);
  assert.match(linked.get('Push').source,/malloc/);assert.doesNotMatch(linked.get('Push').source,/s->data/);
  assert.match(sequential.get('StackLength').source,/s->top/);assert.doesNotMatch(sequential.get('StackLength').source,/s->size/);
  assert.match(linked.get('GetHead').source,/q->front->data/);assert.doesNotMatch(linked.get('GetHead').source,/q->data/);
  assert.doesNotMatch(activeAdt(adt,true),/#(?:if|else|endif)/);
});
test('ADT extraction preserves function-pointer parameters and ignores braces in comments and strings',()=>{
  const source='void Traverse(void (*visit)(int)) { /* } */ puts("}"); visit(1); }\nint Empty(int n) { return n==0; }';
  const actual=functionReferences(source);assert.equal(actual.size,2);assert.equal(actual.get('Traverse').signature,'void Traverse(void (*visit)(int))');assert.ok(actual.get('Traverse').source.endsWith('visit(1); }'));
});
