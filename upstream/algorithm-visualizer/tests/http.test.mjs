import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';import os from 'node:os';import path from 'node:path';

test('local API: isolation, drafts, stdin, submissions, cancellation and backups',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'ds-http-'));process.env.DS_DATA_DIR=dir;
  const {server}=await import('../study-server/server.mjs');
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  const session=await fetch(base+'/api/session'),cookie=session.headers.get('set-cookie').split(';')[0];
  const request=async(url,method='GET',data,extra={})=>{const r=await fetch(base+url,{method,headers:{cookie,'Content-Type':'application/json',...extra},body:data===undefined?undefined:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
  try{
    assert.equal((await request('/api/catalog','GET',undefined,{Origin:'https://example.com'})).status,403);
    const catalog=(await request('/api/catalog')).data;
    assert.equal(catalog.chapters.length,11);assert.ok(catalog.algorithms.length>=118);assert.equal(catalog.inventory.filter(x=>x.status==='planned').length,0);
    assert.equal(catalog.problems.filter(p=>p.algorithmId).length,62);
    await request('/api/records/draft/test','PUT',{code:'new',stdin:'7',revision:200});
    assert.equal((await request('/api/records/draft/test','PUT',{code:'old',revision:100})).status,409);
    assert.equal((await request('/api/records/draft/test')).data.code,'new');
    assert.equal((await request('/api/records/draft/test')).data.stdin,'7');
    await request('/api/records/case/free-example','PUT',{algorithmId:'free',input:{},stdin:'21'});
    const backup=(await request('/api/backup')).data;
    assert.ok(backup.records.some(r=>r.kind==='case'&&JSON.parse(r.value).stdin==='21'));
    const algorithm=catalog.algorithms.find(a=>a.id==='list-insert');
    const submit=(await request('/api/submit','POST',{algorithmId:algorithm.id,source:algorithm.source,mode:'independent'})).data;
    assert.ok(submit.passed,JSON.stringify(submit));
    const progress=(await request('/api/records/progress/'+algorithm.id)).data;
    assert.equal(progress.lastPassedSource,algorithm.source);assert.equal(progress.lastPassedContentVersion,1);
    assert.ok(progress.independentPassedSubmissionId);
    const pending=request('/api/submit','POST',{algorithmId:algorithm.id,source:'Status Insert(LinkList L,int i,int e){while(1){}return OK;}',mode:'independent'});
    await new Promise(r=>setTimeout(r,250));assert.equal((await request('/api/stop-active','POST',{})).status,200);
    const cancelled=await pending;assert.equal(cancelled.status,200);assert.equal(cancelled.data.status,'cancelled');
    const archived=(await request('/api/records/submission/'+cancelled.data.submissionId)).data;
    assert.ok(archived.cancelled);assert.ok(Array.isArray(archived.results));
    assert.equal((await request('/api/restore','POST',backup)).status,200);
  }finally{
    await new Promise(r=>server.close(r));
    const target=path.resolve(dir);if(target.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(target).startsWith('ds-http-'))await rm(target,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }
});
