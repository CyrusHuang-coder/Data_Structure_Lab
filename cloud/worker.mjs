import {Sandbox} from '@vercel/sandbox';
import {quota} from './storage.mjs';
const active=new Map();
async function launch(user){
  if(!process.env.DS_BASE_SNAPSHOT)throw new Error('云端执行环境尚未初始化');
  const start=async sandbox=>{
    const host=new URL(sandbox.domain(4174)).host;
    await sandbox.runCommand({cmd:'sh',args:['-c','mkdir -p /vercel/data; node /vercel/sandbox/study-server/server.mjs > /tmp/ds-server.log 2>&1'],env:{DS_DATA_DIR:'/vercel/data',DS_PORT:'4174',DS_BIND:'0.0.0.0',DS_ALLOWED_HOST:host,DS_GATEWAY_SECRET:user.workerSecret,DS_SANDBOX:'1'},detached:true});
  };
  const sandbox=await Sandbox.getOrCreate({name:'ds-user-'+user.id,region:'iad1',source:{type:'snapshot',snapshotId:process.env.DS_BASE_SNAPSHOT},resources:{vcpus:1},ports:[4174],timeout:300000,networkPolicy:'deny-all',persistent:true,snapshotExpiration:0,keepLastSnapshots:{count:1,expiration:0,deleteEvicted:true},resume:true,onCreate:start,onResume:start});
  if(sandbox.expiresAt&&sandbox.expiresAt.getTime()-Date.now()<90000)await sandbox.extendTimeout(180000);
  const url=sandbox.domain(4174);let cookie;
  for(let i=0;i<25;i++){
    try{const r=await fetch(url+'/api/session',{headers:{'x-ds-gateway':user.workerSecret},signal:AbortSignal.timeout(5000)});if(r.ok){cookie=r.headers.get('set-cookie')?.split(';')[0];if(cookie)break;}}catch{}
    if(i===4)await start(sandbox);await new Promise(r=>setTimeout(r,400));
  }
  if(!cookie)throw new Error('执行环境正在唤醒，请稍后重试');return {sandbox,url,cookie};
}
export async function worker(user){
  const old=active.get(user.id);if(old&&old.until>Date.now()){const w=await old.promise;if(w.sandbox.expiresAt&&w.sandbox.expiresAt.getTime()-Date.now()<90000)await w.sandbox.extendTimeout(180000);return w;}
  const promise=launch(user);active.set(user.id,{promise,until:Date.now()+45000});try{return await promise;}catch(e){active.delete(user.id);throw e;}
}
export async function executionQuota(user){const day=new Date().toISOString().slice(0,10);await quota('run-global-'+day,100,86400000);await quota('run-user-'+user.id+'-'+day,20,86400000);}
