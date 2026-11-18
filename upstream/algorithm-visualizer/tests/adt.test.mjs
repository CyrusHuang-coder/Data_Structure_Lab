import test from 'node:test';import assert from 'node:assert/strict';
import {algorithms,buildHarness,expectedFor} from '../study-server/catalog.mjs';
import {quickC} from '../study-server/runner.mjs';
for(const id of ['stack-push','stack-pop','queue-enqueue','queue-dequeue','brackets'])test('linked ADT shares public operations: '+id,async()=>{
  const a=algorithms.find(a=>a.id===id);for(const input of [a.input,...a.tests]){const r=await quickC({source:a.source,...buildHarness(a,input,{implementation:'linked'})});assert.equal(r.status,'completed',r.diagnostics);const actual=JSON.parse(r.stdout.split('DS_RESULT:').at(-1)),expected=expectedFor(a,input);if(expected.output)assert.deepEqual(actual.output,expected.output);if(expected.result!==undefined)assert.equal(actual.result,expected.result);}
});
