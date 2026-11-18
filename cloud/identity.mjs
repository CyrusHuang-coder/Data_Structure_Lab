import {randomBytes,scrypt,timingSafeEqual,createHash} from 'node:crypto';import {promisify} from 'node:util';
const derive=promisify(scrypt);
export const digest=s=>createHash('sha256').update(s).digest('hex');
export function credentials(raw){const name=String(raw?.username||'').trim().toLowerCase(),password=raw?.password;if(!/^[a-z0-9_]{3,32}$/.test(name))throw new Error('用户名为 3～32 位字母、数字或下划线');if(typeof password!=='string'||password.length<10||password.length>128)throw new Error('密码长度为 10～128 个字符');return {name,password};}
export async function passwordHash(password,salt=randomBytes(16).toString('hex')){return {salt,hash:Buffer.from(await derive(password,salt,32,{N:16384,r:8,p:1,maxmem:64*1024*1024})).toString('hex')};}
export async function passwordMatches(password,user){const candidate=await passwordHash(password,user.salt);return timingSafeEqual(Buffer.from(candidate.hash,'hex'),Buffer.from(user.hash,'hex'));}
