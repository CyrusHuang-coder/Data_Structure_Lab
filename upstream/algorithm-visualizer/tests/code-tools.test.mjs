import test from 'node:test';
import assert from 'node:assert/strict';
import {blankSource} from '../src/study/codeTools.js';
import {algorithms} from '../study-server/catalog.mjs';
import '../study-server/problems.mjs';
test('C template parser ignores literal and comment braces',()=>{
  const source='int f(char c) { if(c==\'{\') return 1; /* } */ return 0; }\nint g(void) { return 1; }';
  const blank=blankSource(source,true);assert.equal((blank.match(/TODO/g)||[]).length,2);assert.ok(blank.includes('int g(void)'));
});
test('every template retains function declarations',()=>{for(const a of algorithms){assert.ok(blankSource(a.source,true).includes(a.entry+'('),a.id);}});
