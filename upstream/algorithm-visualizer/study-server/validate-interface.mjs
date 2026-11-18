import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';import os from 'node:os';
import {buildHarness} from './catalog.mjs';import {compile} from './compiler.mjs';
import {runtime,adt} from './runtime.mjs';import {compose} from './runner.mjs';
export async function validateInterface(a){
  const dir=await mkdtemp(path.join(os.tmpdir(),'ds-interface-'));
  try {
    await writeFile(path.join(dir,'ds_runtime.h'),runtime);await writeFile(path.join(dir,'adt.h'),adt);
    for(const input of [a.input,...a.tests]){const built=buildHarness(a,input);const r=await compile(compose(a.source,built.harness,built.profile),dir);if(r.code!==0||/incompatible pointer|too (few|many) arguments|implicit declaration|makes (pointer|integer) from/i.test(r.stderr))return {ok:false,diagnostics:r.stderr};}
    return {ok:true};
  }finally{await rm(dir,{recursive:true,force:true,maxRetries:3,retryDelay:100});}
}
