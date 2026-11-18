import { mkdtemp, writeFile, readFile,stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID, createHash } from 'node:crypto';
import { compile, command } from './compiler.mjs';
import { MI } from './mi.mjs';
import { runtime, adt } from './runtime.mjs';

const unwrap = v => (v?.type?.includes('*') || /^0x[\da-f]+/i.test(v?.value||'')) && !v?.type?.includes('[') ? v.value : v?.children ? Object.fromEntries(v.children.map(c=>[c.name,unwrap(c)])) : v?.value;
const integer = value => {const n=parseInt(String(value));return Number.isNaN(n)?null:n;};
const addr = value => /0x[\da-f]+/i.exec(String(value))?.[0]?.toLowerCase() || null;
async function readOutput(dir){try{const file=path.join(dir,'stdout.txt');if((await stat(file)).size>1024*1024)throw new Error('OUTPUT_LIMIT');return await readFile(file,'utf8');}catch(e){if(e.code==='ENOENT')return '';throw e;}}

export function compose(source, harness='',profile={}) {
  const prefix=(profile.implementation==='linked'?'#define DS_LINKED_ADT 1\n':'')+(profile.hiddenOperations?.includes('ListInsert')?'#define DS_HIDE_LIST_INSERT 1\n':'')+(profile.hiddenOperations?.includes('ListDelete')?'#define DS_HIDE_LIST_DELETE 1\n':'')+'#include "ds_runtime.h"\n#include "adt.h"\n#line 1 "user.c"\n';
  return prefix+source+(harness?'\n#line 1 "harness.c"\n'+harness:'');
}

async function snapshot(mi, stop, profile, seq, previous) {
  const stack=(await mi.cmd('-stack-list-frames 0 63')).stack?.map(x=>x.frame||x)||[];
  const args=(await mi.cmd('-stack-list-arguments --simple-values 0 15'))['stack-args']||[];
  for(const entry of args){const frame=entry.frame||entry;const target=stack.find(s=>s.level===frame.level);if(target)target.args=frame.args;}
  const locals=(await mi.cmd('-stack-list-variables --simple-values')).variables||[];
  const variables=[];
  for(const v of locals.slice(0,24)) {
    const expanded=v.value===undefined?await mi.inspect(v.name,1):null;
    const value=v.value ?? expanded?.value;
    variables.push({name:v.name,type:v.type,value,children:expanded?.children,validity:'unknown',address:addr(value)});
  }
  const watches={};
  for(const expr of profile.watches||[]) watches[expr]=unwrap(await mi.inspect(expr.startsWith('::')?expr:'::'+expr,2));
  const count=Math.min(integer(await mi.eval('ds_alloc_count'))||0,512);
  const objects=[];
  const expectedSize=profile.nodeType?integer(await mi.eval(`sizeof(${profile.nodeType})`)):null;
  for(let i=0;i<count;i++) {
    const allocation=unwrap(await mi.inspect(`ds_allocs[${i}]`,1));
    if(!allocation) continue;
    const address=addr(allocation.address), live=integer(allocation.live)===1;
    let fields={};
    // Only dereference allocations matching the explicitly configured node type.
    if(profile.nodeType&&live && address && integer(allocation.size)===expectedSize) fields=unwrap(await mi.inspect(`*(${profile.nodeType}*)${address}`,2));
    if(!live)fields=previous?.objects?.find(o=>o.id===`alloc-${i}`)?.fields||{};
    objects.push({id:`alloc-${i}`,address,size:integer(allocation.size),live,type:Object.keys(fields||{}).length?profile.nodeType:'未配置类型',fields});
  }
  const location=stop.frame?{file:stop.frame.file?.replaceAll('\\','/').split('/').at(-1),line:+stop.frame.line,function:stop.frame.func}:null;
  const structure=JSON.stringify({watches:Object.fromEntries(Object.entries(watches).filter(([key])=>!['result','ds_memory_error'].includes(key))),objects});
  const memoryError=integer(watches.ds_memory_error??await mi.eval('ds_memory_error'))||0;
  const state={seq,nextLocation:location,executedLocation:previous?.nextLocation||null,variables:stop.frame?.func==='ds_finish'?[]:variables,stack:stack.filter(s=>s.func!=='ds_finish'),watches,objects,memoryError,stdout:mi.stdout,reason:stop.reason,structureChanged:structure!==previous?._structure,_structure:structure};
  return state;
}

export async function runC({ source, harness='', profile={}, entry='main', maxSteps=1200, signal, onStep, input='' }) {
  const runId=randomUUID();
  const dir=await mkdtemp(path.join(os.tmpdir(),'ds-run-'));
  const started=Date.now();
  const built=await compile(compose(source,harness,profile),dir,{extraFiles:{'ds_runtime.h':runtime,'adt.h':adt,'stdin.txt':input},signal});
  const run={runId,source,harness,stdin:input,sourceHash:createHash('sha256').update(source).digest('hex'),entry,profile,steps:[],status:'running',diagnostics:built.stderr,stdout:'',directory:dir};
  if(built.code!==0) return {...run,status:'compile_error',duration:Date.now()-started};
  const mi=new MI(built.executable,dir,signal);
  try {
    await mi.cmd('-gdb-set pagination off');
    await mi.cmd('-gdb-set print elements 128');
    await mi.cmd('-gdb-set confirm off');
    await mi.cmd('-break-insert '+entry);
    await mi.cmd('-break-insert ds_finish');
    await mi.cmd('-interpreter-exec console "skip file ds_runtime.h"').catch(()=>{});
    let stop=await mi.advance('-exec-run');
    let total=0;
    while(total++ < maxSteps && !signal?.aborted) {
      if(stop.reason?.startsWith('exited')) {run.status='completed';break;}
      if(stop.reason==='timeout') {run.status='limit_reached';break;}
      const file=stop.frame?.file?.replaceAll('\\','/').split('/').at(-1);
      if(file==='user.c' || file==='adt.h' || stop.frame?.func==='ds_finish' || stop.reason==='signal-received') {
        const state=await snapshot(mi,stop,profile,run.steps.length,run.steps.at(-1));
        state.stdout=await readOutput(dir);run.steps.push(state);onStep?.({...state,_structure:undefined});
        if(stop.reason==='signal-received') {run.status='runtime_error';run.diagnostics+='\n'+stop['signal-name']+': '+stop['signal-meaning'];break;}
        if(stop.frame?.func==='ds_finish') {state.nextLocation=null;run.status='completed';break;}
      }
      if(Date.now()-started>60000 || JSON.stringify(run.steps.at(-1)||{}).length * run.steps.length > 64*1024*1024) {run.status='limit_reached';break;}
      stop=await mi.advance(file==='user.c' || file==='adt.h'?'-exec-step':stop.frame?.func==='main'?'-exec-next':'-exec-finish');
    }
    if(run.status==='running') run.status=signal?.aborted?'cancelled':'limit_reached';
    run.stdout=await readOutput(dir);
    run.output=unwrap(await mi.inspect('ds_output',1));
    const length=integer(await mi.eval('ds_output_len'))||0;
    run.output=Object.values(run.output||{}).slice(0,length).map(integer);
    run.result=integer(await mi.eval('result'));
    run.memoryError=integer(await mi.eval('ds_memory_error'))??run.steps.at(-1)?.memoryError??0;
    if(run.memoryError&&run.status==='completed'){run.status='runtime_error';run.diagnostics+='\n分配跟踪检测到重复释放或非法释放。';}
  } catch(error) {run.status=signal?.aborted?'cancelled':error.message==='OUTPUT_LIMIT'?'limit_reached':'infrastructure_error';run.diagnostics+='\n'+error.message;}
  finally {mi.close();await Promise.race([mi.exit,new Promise(r=>setTimeout(r,1000))]);}
  run.steps.forEach(s=>delete s._structure);
  run.duration=Date.now()-started;
  await writeFile(path.join(dir,'trace.json'),JSON.stringify(run));
  return run;
}

export async function quickC({source,harness='',profile={},signal,input=''}) {
  const dir=await mkdtemp(path.join(os.tmpdir(),'ds-test-'));
  const built=await compile(compose(source,harness,profile),dir,{extraFiles:{'ds_runtime.h':runtime,'adt.h':adt,'stdin.txt':input},signal});
  if(built.code!==0) return {status:'compile_error',diagnostics:built.stderr};
  const ran=await command(built.executable,[],{cwd:dir,timeout:2000,signal,input});
  try{return {status:ran.exceeded?'limit_reached':ran.code===0?'completed':'runtime_error',stdout:await readOutput(dir),diagnostics:ran.stderr,code:ran.code};}catch{return {status:'limit_reached',stdout:'',diagnostics:'输出超过 1 MiB',code:ran.code};}
}
