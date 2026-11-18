import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMI } from '../study-server/mi.mjs';
test('MI parser preserves repeated list results and nested values',()=>{
  assert.deepEqual(parseMI('stack=[frame={level="0",func="f"},frame={level="1",func="main"}],reason="breakpoint-hit"'), {stack:[{frame:{level:'0',func:'f'}},{frame:{level:'1',func:'main'}}],reason:'breakpoint-hit'});
  assert.equal(parseMI('v="hello\\n\\\"x\\\""').v,'hello\n"x"');
});
