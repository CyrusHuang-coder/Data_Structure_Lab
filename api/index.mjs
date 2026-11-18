import {accountRequest,currentUser} from '../cloud/accounts.mjs';import {worker,executionQuota} from '../cloud/worker.mjs';
export const config={maxDuration:300};
const json=(res,status,value)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','private, no-store');res.end(JSON.stringify(value));};
async function body(req){if(req.body!==undefined)return typeof req.body==='string'?JSON.parse(req.body):req.body;let text='';for await(const chunk of req){text+=chunk;if(text.length>4*1024*1024)throw new Error('请求过大');}return text?JSON.parse(text):{};}
export default async function handler(req,res){
  try{
    const url=new URL(req.url,'https://'+req.headers.host),route=url.searchParams.get('route'),path=route?'/api/'+route:url.pathname;
    const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)return json(res,403,{error:'请求来源不合法'});
    if(path.startsWith('/api/account/'))return json(res,200,await accountRequest(req,res,path,req.method==='POST'?await body(req):{}));
    const user=await currentUser(req);if(!user)return json(res,401,{error:'请先登录'});
    if(req.method==='POST'&&['/api/runs','/api/submit','/api/export-code','/api/problems','/api/problems/validate'].includes(path))await executionQuota(user);
    const w=await worker(user),method=req.method||'GET';
    if(!['GET','POST','PUT','DELETE'].includes(method))return json(res,405,{error:'请求方法不支持'});
    const response=await fetch(w.url+path,{method,headers:{'x-ds-gateway':user.workerSecret,cookie:w.cookie,'Content-Type':'application/json'},body:['GET','HEAD'].includes(method)?undefined:JSON.stringify(await body(req)),signal:AbortSignal.timeout(240000),redirect:'error'});
    res.statusCode=response.status;res.setHeader('Cache-Control','private, no-store');res.setHeader('Content-Type','application/json; charset=utf-8');for await(const chunk of response.body)res.write(Buffer.from(chunk));res.end();
  }catch(e){console.error('cloud-api:',e.message?.slice(0,500));json(res,e.status||400,{error:/quota|limit|payment|402/i.test(e.message)?'免费云端额度暂时不足，请稍后再试或使用本地版。':e.message||'请求失败'});}
}
