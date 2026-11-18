import test from 'node:test';import assert from 'node:assert/strict';
import {algorithms,validateInput} from '../study-server/catalog.mjs';
import '../study-server/problems.mjs';import '../study-server/textbook-extra.mjs';import '../study-server/textbook-storage.mjs';import '../study-server/textbook-advanced.mjs';import '../study-server/textbook-complete.mjs';import '../study-server/problems-extra.mjs';import '../study-server/problems-more.mjs';import '../study-server/problems-expanded.mjs';
import '../study-server/problems-pending.mjs';
import {inputFields,inputFormState,readInputFields,parseInputField,previewInput} from '../src/study/testInput.mjs';
const field=(id,key)=>inputFields(algorithms.find(a=>a.id===id)).find(f=>f.key===key);
test('all 146 algorithm defaults and edge cases round-trip through parameter fields and backend validation',()=>{
  assert.equal(algorithms.length,146);
  for(const a of algorithms)for(const input of [a.input,...a.tests]){const state=inputFormState(a,JSON.stringify(input)),result=readInputFields(state.fields,state.raw,state.base);assert.equal(state.error,undefined,a.id);assert.equal(result.valid,true,a.id+' '+JSON.stringify(result.errors));assert.deepEqual(result.input,input,a.id+' unchanged stored case');assert.doesNotThrow(()=>validateInput(a,result.input),a.id);}
});
test('number sequences accept commas, whitespace, Chinese separators and pasted arrays without converting empty tokens to zero',()=>{
  const f=field('insertion','values');for(const text of ['8, 3, -6','8 3 -6','[8,3,-6]','8，3；-6','8,3,-6,'])assert.deepEqual(parseInputField(f,text),[8,3,-6]);
  assert.deepEqual(parseInputField(f,''),[]);assert.deepEqual(parseInputField(f,'[]'),[]);for(const text of ['1,-','1,abc','[1,]','1.5','null'])assert.throws(()=>parseInputField(f,text));
});
test('tree nulls, multiple arrays, expressions and graph edge rows retain their actual types',()=>{
  assert.deepEqual(parseInputField(field('lc-100','values2'),'1, null, 2'),[1,null,2]);
  assert.deepEqual(parseInputField(field('bfs','edges'),'0 1 2\n1, 2, 3\n2 0'),[[0,1,2],[1,2,3],[2,0]]);
  assert.deepEqual(parseInputField(field('bfs','edges'),'[[0,1],[1,2,3]]'),[[0,1],[1,2,3]]);
  assert.deepEqual(parseInputField(field('lc-150','tokens'),'2, 1, +, 3, *'),['2','1','+','3','*']);
  assert.deepEqual(parseInputField(field('generalized-list','structure'),'(1, (2, 3), ())'),[1,[2,3],[]]);
  assert.equal(parseInputField(field('brackets','text'),'{[()]}'),'{[()]}');
  assert.deepEqual(parseInputField(field('sparse-transpose','values'),'[[0,2,0],[3,0,4]]'),[0,2,0,3,0,4]);
});
test('sorting hides unused key and matching hides unused pattern while preserving stored fields',()=>{
  assert.deepEqual(inputFields(algorithms.find(a=>a.id==='insertion')).map(f=>f.key),['values']);
  assert.deepEqual(inputFields(algorithms.find(a=>a.id==='brackets')).map(f=>f.key),['text']);
  assert.deepEqual(inputFields(algorithms.find(a=>a.id==='lc-105')).map(f=>f.label),['前序序列','中序序列']);
});
test('malformed documents and wrong field types use a safe visualization fallback',()=>{
  const a=algorithms.find(a=>a.id==='insertion');for(const text of ['{','null','[]','{"values":"oops"}']){assert.ok(inputFormState(a,text).error);assert.deepEqual(previewInput(a,text),a.input);}
});
