import test from 'node:test';import assert from 'node:assert/strict';import {judge} from '../study-server/judging.mjs';
test('multiple valid answers use constraints instead of fixed sequences',()=>{
  assert.ok(judge({checker:'two-sum'},{values:[2,7],key:9},{output:[1,0]},{output:[0,1]}));
  assert.ok(judge({checker:'topological-order'},{vertices:3,edges:[[0,2],[1,2]]},{output:[1,0,2]},{output:[0,1,2]}));
  assert.ok(!judge({checker:'topological-order'},{vertices:3,edges:[[0,2],[1,2]]},{output:[2,1,0]},{output:[0,1,2]}));
  assert.ok(judge({checker:'top-k-frequency'},{values:[1,1,2,2,3],key:1},{output:[2]},{output:[1]}));
  assert.ok(!judge({checker:'top-k-frequency'},{values:[1,1,2,2,3],key:1},{output:[3]},{output:[1]}));
});
