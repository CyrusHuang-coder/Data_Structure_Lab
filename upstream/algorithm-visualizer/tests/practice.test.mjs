import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {algorithms,buildHarness,expectedFor} from '../study-server/catalog.mjs';
import {problems} from '../study-server/problems.mjs';
import '../study-server/problems-extra.mjs';import '../study-server/problems-more.mjs';import '../study-server/problems-expanded.mjs';import '../study-server/problems-pending.mjs';
import {quickC,runC} from '../study-server/runner.mjs';import {judge} from '../study-server/judging.mjs';
import {blankSource} from '../src/study/codeTools.js';
import {interfaceTemplates,normalizeProblem,customAlgorithm} from '../study-server/custom-problems.mjs';
import {validateInterface} from '../study-server/validate-interface.mjs';
for(const number of [160,155,225,232,133,200,49])test('configured original C interface '+number,async()=>{
  const a=algorithms.find(a=>a.id==='lc-'+number);
  assert.ok(a);for(const input of [a.input,...a.tests]){const r=await quickC({source:a.source,...buildHarness(a,input)});assert.equal(r.status,'completed',r.diagnostics);const actual=JSON.parse(r.stdout.split('DS_RESULT:').at(-1));assert.ok(judge(a,input,actual,expectedFor(a,input)),JSON.stringify({number,input,actual}));}
  if([155,225,232,133].includes(number)){const template=blankSource(a.source,true);assert.match(template,/struct|typedef/);assert.ok(template.includes(number===133?'numNeighbors':number===155?'mins':number===225?'rear':'ni'));}
});
test('all 62 built-in entries have runnable adapters',()=>{assert.equal(problems.length,62);assert.ok(problems.every(p=>p.algorithmId&&algorithms.some(a=>a.id===p.algorithmId)));});
test('all import templates compile and structural checkers reject identity shortcuts',async()=>{
  for(const t of interfaceTemplates){const p=normalizeProblem({title:t.id,url:'https://leetcode.cn/problems/test/',tags:['测试'],template:t.id,entry:'solve',signature:t.signature,cases:[{input:t.input,expected:{result:0}}]},'custom-1234567890abcdef');assert.ok((await validateInterface(customAlgorithm(p))).ok,t.id);}
  for(const number of [133,160]){const a=algorithms.find(a=>a.id==='lc-'+number),source=number===133?a.source.replace('return cloneVisit(node,copies);','return node;'):a.source.replace('return p;','return headA;');const r=await quickC({source,...buildHarness(a,a.input)});assert.equal(r.status,'completed');assert.equal(judge(a,a.input,JSON.parse(r.stdout.split('DS_RESULT:').at(-1)),expectedFor(a,a.input)),false);}
});
test('import, configured execution, automatic mistakes, review, backup and restore',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'ds-practice-'));process.env.DS_DATA_DIR=dir;
  const {server}=await import('../study-server/server.mjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port,cookie=(await fetch(base+'/api/session')).headers.get('set-cookie').split(';')[0];
  const req=async(url,method='GET',body)=>{const r=await fetch(base+'/api'+url,{method,headers:{cookie,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
  const config={title:'Array sum',url:'https://leetcode.cn/problems/test-sum/',difficulty:'简单',tags:['数组','遍历'],template:'array-int',entry:'sum',signature:'int sum(int* nums, int numsSize)',cases:[{input:{values:[1,2,3]},expected:{result:6}},{input:{values:[]},expected:{result:0}}]};
  try {
    assert.equal((await req('/problems','POST',{...config,url:'javascript:alert(1)'})).status,400);
    assert.equal((await req('/problems','POST',{...config,signature:'int sum(char* s)'})).status,400);
    assert.equal((await req('/problems','POST',{...config,cases:[...config.cases,config.cases[0]]})).status,400);
    assert.equal((await req('/problems/validate','POST',config)).data.ok,true);
    const saved=await req('/problems','POST',config);assert.equal(saved.status,200,JSON.stringify(saved.data));const id=saved.data.id;
    let catalog=(await req('/catalog')).data;assert.equal(catalog.problems.length,63);assert.ok(catalog.algorithms.some(a=>a.id===id));
    assert.deepEqual((await req('/problems/'+id)).data.tags,['数组','遍历']);
    const wrong=await req('/submit','POST',{algorithmId:id,source:'int sum(int* nums,int numsSize){return -1;}',mode:'independent'});assert.equal(wrong.data.passed,false);
    let mistakes=(await req('/mistakes')).data;assert.equal(mistakes[0].id,id);assert.equal(mistakes[0].failures,1);
    const source='int sum(int* nums,int numsSize){int total=0;for(int i=0;i<numsSize;i++)total+=nums[i];return total;}';
    const pass=await req('/submit','POST',{algorithmId:id,source,mode:'independent'});assert.equal(pass.data.passed,true,JSON.stringify(pass.data));
    mistakes=(await req('/mistakes')).data;assert.equal(mistakes[0].mastered,false);assert.ok(mistakes[0].lastPassedAt);
    await req('/records/mistake/'+id,'PUT',{...mistakes[0],mastered:true,notes:'check empty input',reviewTags:'边界'});
    const backup=(await req('/backup')).data;assert.ok(backup.records.some(r=>r.kind==='problem'));assert.ok(backup.records.some(r=>r.kind==='mistake'));
    await req('/problems/'+id,'DELETE');assert.ok(!(await req('/catalog')).data.problems.some(p=>p.algorithmId===id));
    assert.equal((await req('/restore','POST',backup)).status,200);assert.equal((await req('/records/mistake/'+id)).data.notes,'check empty input');
    assert.equal((await req('/submit','POST',{algorithmId:id,source,mode:'independent'})).data.passed,true);
    assert.equal((await req('/problems','POST',{...config,id})).data.id,id);assert.equal((await req('/catalog')).data.problems.length,63);
    assert.equal((await req('/records/progress/'+id)).data.independentPassed,true);
    await req('/problems','POST',{...config,id,cases:[...config.cases,{input:{values:[3]},expected:{result:3}}]});
    assert.equal((await req('/records/progress/'+id)).data.independentPassed,false);
    assert.equal((await req('/problems/'+id)).data.contentVersion,2);
    const c=await req('/problems','POST',{...config,template:'custom',kind:'array',signature:'int sum(int* nums,int numsSize)',call:'result=sum(a);'});assert.equal(c.status,400);assert.match(c.data.error,/编译/);
    const run=await req('/runs','POST',{algorithmId:id,source,input:{values:[2,4]}});let result;for(let i=0;i<100;i++){const job=await req('/runs/'+run.data.id);if(job.data.result){result=job.data.result;break;}await new Promise(r=>setTimeout(r,150));}assert.equal(result?.status,'completed');assert.ok(result.steps.length>0);
  } finally {await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
});
