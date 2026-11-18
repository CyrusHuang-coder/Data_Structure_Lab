import test from 'node:test';import assert from 'node:assert/strict';
import {highlightEdges} from '../src/study/edgeHighlights.mjs';
function graph(initial=[]){const edges=initial.map(([source,target])=>({source,target}));return {edges,findEdge:(s,t)=>edges.find(e=>e.source===s&&e.target===t),addEdge:(source,target,weight)=>edges.push({source,target,weight})};}
test('pointer rewiring highlights new edge and retains removed edge for one transition',()=>{
  const g=graph([['N1','N3']]);highlightEdges(g,{step:{},previous:{objects:[{id:'a-1',fields:{next:'0x2'}}]},profile:{kind:'list'},objects:[{id:'a-1',address:'0x1',fields:{next:'0x3'}}],idOf:{'0x1':'N1','0x2':'N2','0x3':'N3'},links:['next']});
  assert.equal(g.findEdge('N1','N3').visitedCount,1);assert.equal(g.findEdge('N1','N2').removed,true);
});
test('pointer advance selects the traversed link without selecting unrelated edges',()=>{
  const g=graph([['N1','N2'],['N1','N3']]);highlightEdges(g,{step:{variables:[{name:'p',value:'0x2'}]},previous:{variables:[{name:'p',value:'0x1'}]},profile:{kind:'tree'},objects:[],idOf:{'0x1':'N1','0x2':'N2'},links:['left','right']});
  assert.equal(g.findEdge('N1','N2').selectedCount,1);assert.equal(g.findEdge('N1','N3').selectedCount,undefined);
});
test('graph highlights current Arc and changed predecessor but ignores unrelated DSU parent table',()=>{
  const objects=[{address:'0x9',fields:{to:'2'}}],step={variables:[{name:'u',value:'1'},{name:'p',value:'0x9'}],watches:{'parent[0]@3':{'0':'-1','1':'0','2':'1'}}},g=graph([[0,1],[1,2]]);
  highlightEdges(g,{step,previous:{watches:{'parent[0]@3':{'0':'-1','1':'0','2':'-1'}}},profile:{kind:'graph',algorithmId:'dijkstra',input:{vertices:3}},objects});
  assert.equal(g.findEdge(1,2).selectedCount,1);assert.equal(g.findEdge(0,1).visitedCount,1);
  const dsu=graph([[0,1]]);highlightEdges(dsu,{step:{watches:step.watches},profile:{kind:'graph',algorithmId:'lc-684',input:{vertices:3}},objects:[]});assert.equal(dsu.findEdge(0,1).visitedCount,undefined);
});
test('one-based original problem vertices map back to zero-based graph edges',()=>{
  const g=graph([[0,2],[1,2]]);highlightEdges(g,{step:{variables:[{name:'u',value:'1'},{name:'v',value:'3'}]},profile:{kind:'graph',algorithmId:'lc-684',input:{vertices:3}},objects:[]});
  assert.equal(g.findEdge(0,2).selectedCount,1);assert.equal(g.findEdge(1,2).selectedCount,undefined);
});
