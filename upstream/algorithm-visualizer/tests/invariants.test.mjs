import test from 'node:test';import assert from 'node:assert/strict';
import {checkStructure} from '../study-server/checks.mjs';
import {algorithms,buildHarness} from '../study-server/catalog.mjs';import '../study-server/textbook-extra.mjs';
import {quickC} from '../study-server/runner.mjs';import {judge} from '../study-server/judging.mjs';
test('unbalanced sorted tree fails AVL structural check',()=>{
  const node=(id,value,next,height)=>({id,address:'0x'+id,live:true,fields:{val:String(value),left:next?'0x'+next:'0x0',right:'0x0',height:String(height)}});
  const findings=checkStructure({nextLocation:null,watches:{root:'0x1'},objects:[node('1',3,'2',3),node('2',2,'3',2),node('3',1,null,1)]},{kind:'tree',algorithmId:'avl'});
  assert.ok(findings.some(f=>f.severity==='error'));
});
test('auxiliary library cannot supply the operation under examination',async()=>{
  const a=algorithms.find(a=>a.id==='list-insert');const r=await quickC({source:'Status Insert(LinkList L,int i,int e){return ListInsert(L,i,e);}',...buildHarness(a,a.input)});
  assert.equal(r.status,'compile_error');
});
test('topological textbook exercise accepts another valid order',()=>{
  assert.ok(judge({id:'topological'},{vertices:3,edges:[[0,2],[1,2]]},{output:[1,0,2],result:1},{output:[0,1,2],result:1}));
});
