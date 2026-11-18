import {randomBytes} from 'node:crypto';import {read,write,remove,quota} from './storage.mjs';import {credentials,passwordHash,passwordMatches,digest} from './identity.mjs';
const cookie='__Host-ds_cloud';
export function sessionToken(req){return req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookie+'='))?.slice(cookie.length+1);}
const sendCookie=(res,token,age)=>res.setHeader('Set-Cookie',`${cookie}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`);
export async function currentUser(req){const token=sessionToken(req);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const session=(await read('sessions/'+digest(token)+'.json'))?.value;if(!session||session.expires<Date.now())return null;return (await read('users/'+session.userKey+'.json'))?.value||null;}
export async function accountRequest(req,res,path,body){
  if(path==='/api/account/session'&&req.method==='GET'){const user=await currentUser(req);return {user:user?{id:user.id,username:user.name}:null,cloud:true};}
  if(req.method!=='POST')throw new Error('请求方法不支持');
  if(path==='/api/account/logout'){const token=sessionToken(req);if(token)await remove('sessions/'+digest(token)+'.json');sendCookie(res,'',0);return {ok:true};}
  const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0];await quota('auth-'+digest(ip),30,15*60*1000);
  const {name,password}=credentials(body),key=digest(name);let user=(await read('users/'+key+'.json'))?.value;
  if(path==='/api/account/register'){
    if(user)throw new Error('该用户名已注册');
    await quota('registrations',Number(process.env.CLOUD_MAX_USERS||50),3650*24*60*60*1000);
    user={id:randomBytes(16).toString('hex'),name,userKey:key,...await passwordHash(password),workerSecret:randomBytes(32).toString('hex'),createdAt:new Date().toISOString()};
    try{await write('users/'+key+'.json',user,{create:true});}catch(e){if(/already exists/i.test(e.message))throw new Error('该用户名已注册');throw e;}
  }else if(path==='/api/account/login'){
    if(!user){await passwordHash(password,'00000000000000000000000000000000');throw new Error('用户名或密码错误');}
    if(!await passwordMatches(password,user))throw new Error('用户名或密码错误');
  }else throw new Error('账号接口不存在');
  const token=randomBytes(32).toString('hex');await write('sessions/'+digest(token)+'.json',{userKey:key,expires:Date.now()+14*24*3600000},{create:true,ttlDays:14});sendCookie(res,token,14*24*3600);return {user:{id:user.id,username:user.name}};
}
