import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { algorithms, chapters, inventory, buildHarness, expectedFor } from './catalog.mjs';
import { problems } from './problems.mjs';
import './textbook-extra.mjs';
import './textbook-storage.mjs';
import './textbook-advanced.mjs';
import './textbook-complete.mjs';
import './problems-extra.mjs';
import './problems-more.mjs';
import './problems-expanded.mjs';
import './problems-pending.mjs';
import {interfaceTemplates,normalizeProblem,customAlgorithm,customMetadata} from './custom-problems.mjs';
import {validateInterface} from './validate-interface.mjs';
import { runC, quickC } from './runner.mjs';
import { checkStructure } from './checks.mjs';
import { createStore } from './store.mjs';
import { runtime, adt } from './runtime.mjs';
import { command,compiler,debuggerPath } from './compiler.mjs';
import {judge} from './judging.mjs';
import {exportCode} from './exporter.mjs';

const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=process.env.DS_DATA_DIR?path.resolve(process.env.DS_DATA_DIR):path.resolve(base,'../../user-data');
const store=createStore(dataDir);
const token=randomBytes(24).toString('hex');
const jobs=new Map();let busy=false,activeController=null;
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(text.length>4*1024*1024)throw new Error('请求过大');}return text?JSON.parse(text):{};}
function authorized(req){const origin=req.headers.origin;return (!origin||origin==='http://'+req.headers.host||['http://127.0.0.1:5173','http://localhost:5173','http://127.0.0.1:4174','http://localhost:4174'].includes(origin))&&req.headers.cookie?.split(';').some(c=>c.trim()===`ds_session=${token}`);}
function allAlgorithms(){return [...algorithms,...store.list('problem').map(p=>customAlgorithm(p))];}
function findAlgorithm(id){const a=allAlgorithms().find(a=>a.id===id);if(!a)throw new Error('算法不存在或尚未接入');return a;}
async function schedule(job,task){
  if(busy)throw new Error('已有 C 任务运行，请先等待完成或停止。');
  busy=true;activeController=job.controller;jobs.set(job.id,job);
  task().then(async result=>{
    store.put('history',job.id,{algorithmId:job.algorithmId,status:result.status,source:result.source,input:job.input,stdin:result.stdin||'',steps:result.steps?.length||0,duration:result.duration});
    await mkdir(path.join(dataDir,'runs'),{recursive:true});
    await writeFile(path.join(dataDir,'runs',job.id+'.json'),JSON.stringify(result));
    job.status=result.status;job.result=result;job.partial=[];
    while(jobs.size>20){const oldest=[...jobs].find(([id,j])=>id!==job.id&&j.status!=='running');if(!oldest)break;jobs.delete(oldest[0]);}
  }).catch(error=>{job.status=job.controller.signal.aborted?'cancelled':'infrastructure_error';job.error=error.message;}).finally(()=>{busy=false;activeController=null;});
}
export const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  try {
    if(process.env.DS_GATEWAY_SECRET&&req.headers['x-ds-gateway']!==process.env.DS_GATEWAY_SECRET)return json(res,403,{error:'请从平台登录后访问'});
    const localPort=req.socket.localPort;
    if(![`127.0.0.1:${localPort}`,`localhost:${localPort}`,'127.0.0.1:5173','localhost:5173',process.env.DS_ALLOWED_HOST].filter(Boolean).includes(req.headers.host))return json(res,403,{error:'访问地址不合法'});
    if(req.method==='GET'&&url.pathname==='/api/session'){res.setHeader('Set-Cookie',`ds_session=${token}; HttpOnly; SameSite=Strict; Path=/`);return json(res,200,{ok:true});}
    if(url.pathname.startsWith('/api/')&&!authorized(req))return json(res,403,{error:'请刷新页面以建立本机会话'});
    if(req.method==='GET'&&url.pathname==='/api/catalog'){
      const covered=new Set(algorithms.flatMap(a=>(a.covers||[]).map(title=>a.chapter+':'+title)));
      const fullInventory=[...inventory.filter(x=>x.status!=='planned'||!covered.has(x.chapter+':'+x.title)),...algorithms.filter(a=>!a.problemNumber&&!inventory.some(x=>x.id===a.id)).map(({id,title,chapter,status})=>({id,title,chapter,status}))];
      return json(res,200,{chapters,algorithms:allAlgorithms().map(({expected,...a})=>a),inventory:fullInventory,problems:[...problems,...store.list('problem').map(customMetadata)],adt,interfaceTemplates});
    }
    if(req.method==='POST'&&['/api/problems','/api/problems/validate'].includes(url.pathname)){
      const b=await body(req),id=b.id||'custom-'+randomBytes(8).toString('hex');
      if(!/^custom-[a-f0-9]{16}$/.test(id))throw new Error('导入题目标识不合法');
      const existing=store.get('problem',id),p=normalizeProblem({...b,createdAt:existing?.createdAt,contentVersion:existing?(existing.contentVersion||1)+1:1},id);
      const checked=await validateInterface(customAlgorithm(p));if(!checked.ok)return json(res,400,{error:'接口编译检查失败：\n'+checked.diagnostics});
      if(url.pathname.endsWith('/validate'))return json(res,200,{ok:true,notice:'函数签名、参数构造与调用适配已通过编译检查；请使用可信的预期结果验证算法。'});
      if(existing){const fingerprint=x=>JSON.stringify([x.kind,x.entry,x.signature,x.call,x.setup,x.definitions,x.serialize,x.cases]);if(fingerprint(existing)===fingerprint(p))p.contentVersion=existing.contentVersion||1;else {const progress=store.get('progress',id);if(progress)store.put('progress',id,{...progress,independentPassed:false,completionPassed:false,needsReview:true,interfaceChangedAt:new Date().toISOString()});}}
      store.put('problem',id,p);return json(res,200,{id,algorithmId:id});
    }
    const customRoute=/^\/api\/problems\/(custom-[a-f0-9]{16})$/.exec(url.pathname);
    if(customRoute){const p=store.get('problem',customRoute[1]);if(!p)return json(res,404,{error:'导入题目不存在'});if(req.method==='GET')return json(res,200,p);if(req.method==='DELETE'){if(busy)throw new Error('请等待当前 C 任务完成后再删除题目');store.remove('problem',p.id);return json(res,200,{ok:true});}}
    if(req.method==='GET'&&url.pathname==='/api/mistakes'){
      const explicit=store.list('mistake'),ids=new Set(explicit.map(m=>m.id));
      return json(res,200,[...explicit,...store.list('progress').filter(p=>p.recentFailures&&!ids.has(p.id)).map(p=>({id:p.id,algorithmId:p.id,mastered:false,reason:'最近一次提交未通过',submissionId:p.lastSubmissionId,updated:p.updated}))]);
    }
    if(req.method==='GET'&&url.pathname==='/api/health'){const checks=await Promise.all([command(compiler,['--version']),command(debuggerPath,['--version'])]);return json(res,200,{compiler:checks[0].stdout.split('\n')[0],debugger:checks[1].stdout.split('\n')[0],runner:process.env.DS_SANDBOX?'sandbox':'native',isolated:!!process.env.DS_SANDBOX,busy});}
    if(req.method==='POST'&&url.pathname==='/api/runs'){
      const b=await body(req);if(typeof b.source!=='string'||b.source.length>100000)throw new Error('代码长度不合法');
      const a=b.free?null:findAlgorithm(b.algorithmId), input=b.input||{},built=a?buildHarness(a,input,{implementation:b.implementation}):{profile:{kind:'free',watches:[]},harness:''};
      if(b.stdin!==undefined&&(typeof b.stdin!=='string'||b.stdin.length>65536))throw new Error('标准输入最多 64 KiB');
      const id=randomBytes(12).toString('hex'),controller=new AbortController();const job={id,status:'running',controller,algorithmId:a?.id||'free',input,partial:[]};
      await schedule(job,()=>runC({source:b.source,...built,input:b.stdin||'',entry:a?.entry||'main',maxSteps:Math.min(3000,Math.max(10,b.maxSteps||1200)),signal:controller.signal,onStep:s=>job.partial.push(s)}));
      return json(res,202,{id});
    }
    const match=/^\/api\/runs\/([a-f\d-]+)(\/stop)?$/.exec(url.pathname);
    if(match){const job=jobs.get(match[1]);if(req.method==='POST'&&match[2]){job?.controller.abort();return json(res,200,{ok:true});}if(req.method==='GET'){if(job)return json(res,200,{id:job.id,status:job.status,error:job.error,result:job.result,steps:job.result?undefined:job.partial});try{return json(res,200,{id:match[1],result:JSON.parse(await readFile(path.join(dataDir,'runs',match[1]+'.json'),'utf8'))});}catch{return json(res,404,{error:'记录不存在'});}}}
    if(req.method==='POST'&&url.pathname==='/api/check'){const b=await body(req);return json(res,200,{findings:checkStructure(b.step,b.profile||{})});}
    if(req.method==='POST'&&url.pathname==='/api/stop-active'){activeController?.abort();return json(res,200,{ok:true});}
    if(req.method==='POST'&&url.pathname==='/api/submit'){
      if(busy)throw new Error('请先等待当前任务完成');busy=true;activeController=new AbortController();
      try{
        const b=await body(req),a=findAlgorithm(b.algorithmId);
        if(typeof b.source!=='string'||b.source.length>100000)throw new Error('代码长度不合法');
        const cases=[a.input,...a.tests,...(b.cases||[]).slice(0,12)],results=[];
        const plans=cases.map(input=>({input,expected:expectedFor(a,input),built:buildHarness(a,input,{implementation:b.implementation})}));
        let cancelled=false;
        for(const {input,expected,built} of plans){
          if(activeController.signal.aborted){cancelled=true;break;}
          try{
            const ran=await quickC({source:b.source,...built,signal:activeController.signal});
            let actual=null;try{actual=JSON.parse(ran.stdout?.split('DS_RESULT:').at(-1));}catch{}
            const passed=ran.status==='completed'&&judge(a,input,actual,expected);
            results.push({input,expected,actual,passed:!!passed,status:ran.status,diagnostics:ran.diagnostics});
          }catch(error){if(activeController.signal.aborted){cancelled=true;break;}throw error;}
        }
        const passed=!cancelled&&results.length===plans.length&&results.every(x=>x.passed),at=new Date().toISOString(),submissionId=randomBytes(12).toString('hex');
        const status=cancelled?'cancelled':passed?'completed':'test_failed';
        const snapshot={algorithmId:a.id,contentVersion:a.contentVersion,source:b.source,mode:b.mode,implementation:b.implementation||'sequential',at,status,cancelled,passed,results,totalCases:plans.length};
        store.put('submission',submissionId,snapshot);
        if(!cancelled&&!passed){const old=store.get('mistake',a.id)||{};store.put('mistake',a.id,{...old,algorithmId:a.id,mastered:false,reason:old.reason||'提交测试未通过',failures:(old.failures||0)+1,submissionId,lastFailedAt:at});}
        else if(passed){const old=store.get('mistake',a.id);if(old)store.put('mistake',a.id,{...old,lastPassedAt:at});}
        const progress=store.get('progress',a.id)||{};
        store.put('progress',a.id,{...progress,lastPracticedAt:at,...(!cancelled?{recentFailures:!passed,needsReview:!passed}:{}),lastSubmissionId:submissionId,lastSource:b.source,...(passed?{lastPassedSubmissionId:submissionId,lastPassedSource:b.source,lastPassedContentVersion:a.contentVersion}:{}),...(passed&&b.mode==='complete'?{completionPassed:true}:passed&&b.mode==='independent'?{independentPassed:true,independentPassedSubmissionId:submissionId}:{})});
        return json(res,200,{status,cancelled,passed,results,submissionId,totalCases:plans.length});
      }finally{busy=false;activeController=null;}
    }
    const record=/^\/api\/records\/([a-z]+)(?:\/([^/]+))?$/.exec(url.pathname);
    if(record){
      const [,kind,rawId]=record,id=rawId?decodeURIComponent(rawId):null;
      if(!['draft','progress','note','case','layout','settings','history','submission','mistake'].includes(kind))throw new Error('记录类型不合法');
      if(req.method==='GET')return json(res,200,id?store.get(kind,id):store.list(kind));
      if((req.method==='PUT'||req.method==='POST'&&kind==='draft')&&id){
        const value=await body(req),current=store.get(kind,id);
        if(kind==='draft'&&current?.revision&&value.revision&&value.revision<current.revision)return json(res,409,{error:'草稿已有更新版本；本页代码仍保留，请重新保存或先导出代码。'});
        return json(res,200,store.put(kind,id,value));
      }
      if(req.method==='DELETE'&&id){store.remove(kind,id);return json(res,200,{ok:true});}
    }
    if(req.method==='GET'&&url.pathname==='/api/backup')return json(res,200,store.backup());
    if(req.method==='POST'&&url.pathname==='/api/restore'){const b=await body(req);for(const r of b.records||[])if(r.kind==='problem'){if(!/^custom-[a-f0-9]{16}$/.test(r.id))throw new Error('备份题目标识不合法');r.value=JSON.stringify(normalizeProblem(JSON.parse(r.value),r.id));}store.restore(b);return json(res,200,{ok:true});}
    if(req.method==='POST'&&url.pathname==='/api/ai/explain')return json(res,501,{error:'DeepSeek 接口已预留。当前版本尚未配置远程调用，代码保留在本机。'});
    if(req.method==='POST'&&url.pathname==='/api/export-code'){const b=await body(req);return json(res,200,await exportCode(b.source,b.algorithmId&&b.algorithmId!=='free'?findAlgorithm(b.algorithmId):null,{implementation:b.implementation}));}
    if(url.pathname.startsWith('/api/'))return json(res,404,{error:'接口不存在'});
    const requested=decodeURIComponent(url.pathname);const file=requested==='/'?'index.html':requested.slice(1);let target=path.resolve(base,'dist',file);if(!target.startsWith(path.resolve(base,'dist')+path.sep)&&target!==path.resolve(base,'dist/index.html'))return json(res,403,{error:'非法路径'});
    let data;try{data=await readFile(target);}catch{target=path.join(base,'dist/index.html');data=await readFile(target);}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(target)]||'application/octet-stream'));res.end(data);
  }catch(error){json(res,400,{error:error.message});}
});

server.on('close',()=>store.close());
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(process.env.DS_PORT===undefined?4174:Number(process.env.DS_PORT),process.env.DS_BIND||'127.0.0.1',()=>console.log('数据结构复习平台：http://127.0.0.1:'+server.address().port));
