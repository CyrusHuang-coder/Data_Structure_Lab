import {validateInput} from './catalog.mjs';

export const interfaceTemplates = [
  {id:'array-target',label:'整数数组 + 目标值 → 整数',kind:'array',signature:'int solve(int* nums, int numsSize, int target)',call:'result=ENTRY(a,n,key);',input:{values:[1,2,3],key:2},serialize:''},
  {id:'array-int',label:'整数数组 → 整数',kind:'array',signature:'int solve(int* nums, int numsSize)',call:'result=ENTRY(a,n);',input:{values:[1,2,3]},serialize:''},
  {id:'array-array',label:'整数数组 → 返回数组',kind:'array',signature:'int* solve(int* nums, int numsSize, int* returnSize)',call:'int count=0;int *out=ENTRY(a,n,&count);',input:{values:[1,2,3]},serialize:'if(count<0||count>CAP){ds_invariant_error=1;}else for(int z=0;z<count;z++)ds_output[ds_output_len++]=out[z];'},
  {id:'list',label:'链表 → 链表',kind:'leetcode-list',signature:'struct ListNode* solve(struct ListNode* head)',call:'lc_head=ENTRY(lc_head);',input:{values:[1,2,3]}},
  {id:'tree-int',label:'二叉树 → 整数 / 布尔值',kind:'tree',signature:'int solve(struct TreeNode* root)',call:'result=ENTRY(root);',input:{values:[1,2,3]},serialize:''},
  {id:'string-int',label:'字符串 → 整数 / 布尔值',kind:'string',signature:'int solve(char* s)',call:'result=ENTRY(text);',input:{text:'abc'},serialize:''},
  {id:'strings-int',label:'两个字符串 → 整数',kind:'string',signature:'int solve(char* s, char* t)',call:'result=ENTRY(text,pattern);',input:{text:'abc',pattern:'b'},serialize:''},
];
const clean=(s,max,name)=>{if(typeof s!=='string'||!s.trim()||s.length>max)throw new Error(name+'不能为空或过长');return s.trim();};
const canonical=o=>JSON.stringify(o, Object.keys(o).sort());
export function normalizeProblem(raw,id) {
  const title=clean(raw.title,160,'题名'),description=typeof raw.description==='string'?raw.description.slice(0,30000):'';
  const url=clean(raw.url,500,'原题链接');let parsed;try{parsed=new URL(url);}catch{throw new Error('请填写 LeetCode 原题链接');}
  if(parsed.protocol!=='https:'||!['leetcode.cn','leetcode.com','www.leetcode.cn','www.leetcode.com'].includes(parsed.hostname)||!/^\/problems\/[a-z0-9-]+\/?$/.test(parsed.pathname))throw new Error('原题链接须为 https://leetcode.cn/problems/题目名称/ 或 leetcode.com 对应链接');
  const tags=Array.isArray(raw.tags)?[...new Set(raw.tags.map(t=>clean(t,30,'标签')))]:[];if(!tags.length||tags.length>10)throw new Error('请填写 1～10 个分类标签');
  const template=interfaceTemplates.find(t=>t.id===raw.template);if(!template&&raw.template!=='custom')throw new Error('请选择接口模板');
  const entry=clean(raw.entry,60,'函数名');if(!/^[A-Za-z_]\w*$/.test(entry)||['main','ds_finish'].includes(entry))throw new Error('函数名必须为合法 C 标识符');
  const signature=clean(raw.signature,1000,'函数签名');if(!new RegExp('\\b'+entry+'\\s*\\(').test(signature)||/[{};#]/.test(signature))throw new Error('签名须包含函数名和参数，不填写函数体、分号或预处理指令');
  const advanced=raw.template==='custom',kind=advanced?raw.kind:template.kind;if(!['array','leetcode-list','tree','string','graph'].includes(kind))throw new Error('请选择支持的结构类型');
  if(!advanced){const normalize=s=>s.replace(/\bsolve\b/g,entry).replace(/\s+/g,'');if(normalize(template.signature)!==normalize(signature))throw new Error('签名与模板不匹配，请使用自定义接口配置');}
  const call=advanced?clean(raw.call,5000,'调用适配代码'):template.call.replaceAll('ENTRY',entry);
  const serialize=advanced?String(raw.serialize??'').slice(0,10000):template.serialize;
  const setup=advanced?String(raw.setup??'').slice(0,10000):'';
  const definitions=advanced?String(raw.definitions??'').slice(0,10000):'';
  if(!Array.isArray(raw.cases)||raw.cases.length<1||raw.cases.length>20)throw new Error('至少填写 1 个测试用例，最多 20 个');
  const cases=raw.cases.map(c=>{const expected=c.expected;if(!expected||typeof expected!=='object'||Array.isArray(expected)||!['result','output'].some(k=>Object.hasOwn(expected,k))||Object.keys(expected).some(k=>!['result','output'].includes(k))||expected.result!==undefined&&(!Number.isInteger(expected.result)||Math.abs(expected.result)>2147483647)||expected.output!==undefined&&(!Array.isArray(expected.output)||expected.output.length>128||expected.output.some(v=>!Number.isInteger(v)||Math.abs(v)>2147483647)))throw new Error('预期结果须为整数 result 和/或整数数组 output');validateInput({id,kind},c.input);return {input:c.input,expected};});
  if(new Set(cases.map(c=>canonical(c.input))).size!==cases.length)throw new Error('测试输入重复，请合并并确认预期结果');
  return {id,title,description,url:parsed.origin+parsed.pathname,difficulty:['简单','中等','困难'].includes(raw.difficulty)?raw.difficulty:'中等',tags,template:raw.template,entry,signature,kind,call,setup,definitions,serialize,cases,contentVersion:Number.isInteger(raw.contentVersion)?raw.contentVersion:1,createdAt:raw.createdAt||new Date().toISOString()};
}
export function customAlgorithm(p) {
  return {id:p.id,title:p.title,chapter:({tree:'tree',string:'string',graph:'graph','leetcode-list':'linear'})[p.kind]||'array',kind:p.kind,entry:p.entry,targetFunctions:[p.entry],source:(p.definitions?p.definitions+'\n':'')+p.signature+'\n{\n    /* TODO：实现函数；参数由平台构造，勿另写 main。 */\n}\n',problemNumber:'自定义',custom:true,description:p.description,summary:'用户导入 · '+p.tags.join(' / '),contract:'ListNode / TreeNode 由平台提供。数组长度由参数传入；返回数组须设置 returnSize。当前题目以用户配置的预期结果作为本地测试依据。\n'+p.signature,call:p.call,setup:()=>p.setup,serialize:p.serialize===undefined?undefined:()=>p.serialize,input:p.cases[0].input,tests:p.cases.slice(1).map(c=>c.input),expected:input=>{const c=p.cases.find(c=>canonical(c.input)===canonical(input));if(!c)throw new Error('该输入尚未配置预期结果，请在题目配置中添加测试用例');return c.expected;},contentVersion:p.contentVersion||1,status:'implemented',allowedOperations:[],blockedOperations:[],complexity:'用户自定义'};
}
export function customMetadata(p){return {number:p.id,title:p.title,difficulty:p.difficulty,topic:p.tags[0],tags:p.tags,url:p.url,algorithmId:p.id,custom:true};}
