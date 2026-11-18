import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const compiler = process.env.DS_GCC || 'gcc';
export const debuggerPath = process.env.DS_GDB || 'gdb';

export function command(file, args, { cwd, timeout = 15000, input, signal } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { cwd, windowsHide: true, signal });
    let stdout = '', stderr = '', exceeded = false;
    const timer = setTimeout(() => { exceeded = true; child.kill(); }, timeout);
    const collect = name => chunk => {
      if (name === 'stdout') stdout += chunk.toString(); else stderr += chunk.toString();
      if (stdout.length + stderr.length > 1024 * 1024) { exceeded = true; child.kill(); }
    };
    child.stdout.on('data', collect('stdout'));
    child.stderr.on('data', collect('stderr'));
    child.on('error', err => { clearTimeout(timer); reject(err); });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr, exceeded }); });
    child.stdin.end(input);
  });
}

export async function compile(source, dir, { extraFiles = {}, signal } = {}) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'user.c'), source);
  for (const [name, text] of Object.entries(extraFiles)) await writeFile(path.join(dir, name), text);
  const executable = path.join(dir, process.platform === 'win32' ? 'program.exe' : 'program');
  const result = await command(compiler, ['-std=c11', '-O0', '-g3', '-fno-omit-frame-pointer', '-Wall', '-Wextra', 'user.c', '-o', executable, '-lm'], { cwd: dir, signal });
  return { ...result, executable };
}
