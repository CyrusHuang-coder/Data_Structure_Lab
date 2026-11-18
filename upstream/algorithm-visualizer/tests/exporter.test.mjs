import test from 'node:test';import assert from 'node:assert/strict';
import {algorithms} from '../study-server/catalog.mjs';import '../study-server/problems.mjs';import '../study-server/problems-extra.mjs';import '../study-server/problems-more.mjs';
import {exportCode} from '../study-server/exporter.mjs';
import '../study-server/problems-expanded.mjs';
for(const id of ['lc-20','lc-206','lc-94','lc-105','lc-150','list-insert'])test('standalone C export: '+id,async()=>{const a=algorithms.find(a=>a.id===id);const result=await exportCode(a.source,a);assert.ok(result.ok,result.diagnostics);assert.ok(result.behaviorVerified,result.diagnostics);if(a.problemNumber){assert.ok(!result.code.includes('ds_allocs'));assert.ok(!result.code.includes('int main('));}});
for(const id of ['lc-92','lc-100','lc-239','lc-1971','lc-684'])test('expanded original C interface export: '+id,async()=>{const a=algorithms.find(a=>a.id===id),result=await exportCode(a.source,a);assert.ok(result.ok,result.diagnostics);assert.ok(result.behaviorVerified,result.diagnostics);});
