import test from 'node:test';import assert from 'node:assert/strict';
import {normalizePaneWeights,fitPaneWidths,movePaneDivider,defaultPaneWeights} from '../src/study/paneLayout.mjs';
import {buildRuntimeState,pointerDescription} from '../src/study/runtimeState.mjs';
test('pane allocation respects minimums and exact available width across stored ratios and sizes',()=>{
  for(const weights of [[38,38,24],[90,5,5],[5,5,90]])for(const width of [700,880,1200,1800]){const result=fitPaneWidths(weights,width,[240,240,210]);assert.ok(Math.abs(result.reduce((a,b)=>a+b,0)-width)<1e-7);assert.ok(result.every((v,i)=>v>=[240,240,210][i]-1e-7));}
  for(const bad of [null,[1],[NaN,1,2],[0,2,3],[-1,1,1],[1e308,1e308,1e308]])assert.deepEqual(normalizePaneWeights(bad),defaultPaneWeights);
});
test('dragging a divider changes only neighboring panels and clamps at both minimum widths',()=>{
  const start=[400,400,300];assert.deepEqual(movePaneDivider(start,0,80,[240,240,210]),[480,320,300]);
  assert.deepEqual(movePaneDivider(start,0,10000,[240,240,210]),[560,240,300]);assert.deepEqual(movePaneDivider(start,1,-10000,[240,240,210]),[400,240,460]);assert.deepEqual(start,[400,400,300]);
});
const stack=[{func:'Insert',file:'user.c',level:'0'},{func:'main',file:'harness.c',level:'1'}];
test('runtime sections separate locals, pointers, globals, arrays, outputs and diagnostic flags',()=>{
  const previous={stack,variables:[{name:'i',type:'int',value:'1'},{name:'p',type:'LNode *',value:'0x10'}],watches:{result:'0',ds_memory_error:'0','queue[0]@2':{0:'0',1:'0'},qtail:'0'}};
  const step={stack,variables:[{name:'i',type:'int',value:'2'},{name:'p',type:'LNode *',value:'0x20'},{name:'a',type:'int [2]',children:[{name:'[0]',value:'4'},{name:'[1]',value:'5'}]}],watches:{head:'0x10',result:'1',ds_memory_error:'0',ds_invariant_error:'0','queue[0]@2':{0:'2',1:'0'},qtail:'1','ds_output[0]@2':{0:'7',1:'9'},ds_output_len:'1'}};
  const state=buildRuntimeState(step,previous);assert.deepEqual(state.locals.map(v=>v.name),['i']);assert.deepEqual(state.pointers.map(v=>v.name),['p','head']);assert.deepEqual(state.globals.map(v=>v.name),['qtail']);assert.equal(state.arrays.length,2);assert.deepEqual(state.output,['7']);assert.equal(state.currentResult,'1');assert.ok(state.locals[0].changed);assert.ok(state.pointers[0].changed);assert.ok(state.currentResultChanged);
});
test('entering another recursive frame does not compare unrelated local variables',()=>{
  const variable={name:'p',type:'TreeNode *',value:'0x20'};
  const state=buildRuntimeState({stack:[...stack,{func:'main'}],variables:[variable]},{stack,variables:[{...variable,value:'0x10'}]});assert.equal(state.pointers[0].changed,false);
});
test('pointer descriptions distinguish known nodes, freed nodes, NULL and unreadable values',()=>{
  const objects=[{id:'alloc-2',address:'0x10',type:'LNode',live:true},{id:'alloc-3',address:'0x20',live:false}];
  assert.equal(pointerDescription('0x10',objects).label,'N2');assert.equal(pointerDescription('0x20',objects).tone,'released');assert.equal(pointerDescription('0x0',objects).label,'NULL');assert.equal(pointerDescription('<optimized out>',objects).label,'无法读取');assert.equal(pointerDescription('0x30',objects).label,'未登记地址');
});
