import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, access, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compile, command } from '../study-server/compiler.mjs';

test('real C compile and execute entry point', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ds-spine-'));
  try {
    const built = await compile('#include <stdio.h>\nint main(void) { printf("%d", 6 * 7); return 0; }', dir);
    assert.equal(built.code, 0, built.stderr);
    await access(built.executable);
    const run = await command(built.executable, [], { cwd: dir });
    assert.equal(run.stdout, '42');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
