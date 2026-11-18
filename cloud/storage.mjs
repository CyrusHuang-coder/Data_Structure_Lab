import {get,put,del} from '@vercel/blob';
export async function read(key){const r=await get(key,{access:'private',useCache:false});if(!r)return null;return {value:await new Response(r.stream).json(),etag:r.blob.etag};}
export async function write(key,value,{etag,create=false,ttlDays}={}){return put(key,JSON.stringify(value),{access:'private',addRandomSuffix:false,allowOverwrite:!create,contentType:'application/json',...(etag?{ifMatch:etag}:{}),...(ttlDays?{ttlDays}:{})});}
export async function remove(key){await del(key);}
export async function mutate(key,fn){for(let i=0;i<8;i++){const old=await read(key),value=await fn(old?.value);try{await write(key,value,{etag:old?.etag,create:!old});return value;}catch(e){if(!/precondition|already exists/i.test(e.message))throw e;}}throw new Error('记录正在更新，请稍后重试');}
export async function quota(key,max,windowMs){const now=Date.now();return mutate('limits/'+key+'.json',old=>{const next=old&&old.until>now?{...old}:{count:0,until:now+windowMs};if(next.count>=max){const e=new Error('免费共享额度已用完，请稍后再试');e.status=429;throw e;}next.count++;return next;});}
