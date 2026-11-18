const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const pointerAddress=v=>/0x[\da-f]+/i.exec(String(v))?.[0]?.toLowerCase();
export const isPointer=v=>!v.type?.includes('[')&&(v.type?.includes('*')||!!pointerAddress(v.value)||/^(LinkList|StackPtr|QueuePtr)$/.test(v.type||''));
const frameKey=step=>(step?.stack||[]).map(f=>f.func+':'+f.file).join('>');
const nameOf=key=>key.split('[')[0];
export const watchLabels={a:'输入 / 工作数组',aux:'辅助数列',visited:'已访问标记',dist:'距离 / 权值',parent:'前驱 / 父结点',first:'邻接表表头',queue:'工作队列',next:'匹配回退表',cursor:'游标',table:'工作表',weights:'权值',n:'元素 / 顶点数',qhead:'队首下标',qtail:'队尾下标',count:'计数',rows:'行数',cols:'列数'};
export function buildRuntimeState(step,previous){
  const sameFrame=!!previous&&frameKey(step)===frameKey(previous),before=new Map((sameFrame?previous?.variables||[]:[]).map(v=>[v.name,v]));
  const result={locals:[],pointers:[],globals:[],arrays:[],stack:step?.stack||[],output:[],changed:0};
  const update=(item,old,comparable)=>({...item,changed:!!comparable&&!equal(item.value,old?.value),isNew:!!previous&&old===undefined});
  for(const variable of step?.variables||[]){
    const old=before.get(variable.name),value=variable.children||variable.value;
    const row=update({...variable,value,scope:'局部'},old?{value:old.children||old.value}:undefined,old!==undefined);
    if(variable.type?.includes('['))result.arrays.push({...row,key:'local:'+variable.name,name:variable.name});
    else if(isPointer(variable))result.pointers.push(row);
    else result.locals.push(row);
  }
  for(const [name,value]of Object.entries(step?.watches||{})){
    if(['ds_memory_error','ds_invariant_error','ds_output_len'].includes(name)||name.startsWith('ds_output[')||name==='result')continue;
    const row=update({name,value,scope:'全局'},own(previous?.watches,name)?{value:previous.watches[name]}:undefined,own(previous?.watches,name));
    if(value&&typeof value==='object')result.arrays.push({...row,key:'global:'+name});
    else if(pointerAddress(value))result.pointers.push(row);
    else result.globals.push(row);
  }
  const outputKey=Object.keys(step?.watches||{}).find(k=>k.startsWith('ds_output['));
  const outputLength=Math.max(0,Number(step?.watches?.ds_output_len)||0);
  if(outputKey)result.output=Object.values(step.watches[outputKey]||{}).slice(0,outputLength);
  result.currentResult=own(step?.watches,'result')?step.watches.result:undefined;
  result.currentResultChanged=own(previous?.watches,'result')&&step?.watches?.result!==previous.watches.result;
  result.changed=[...result.locals,...result.pointers,...result.globals,...result.arrays].filter(r=>r.changed).length;
  return result;
}
export function pointerDescription(value,objects=[]){
  const address=pointerAddress(value);if(address&&/^0x0+$/.test(address)||['0','NULL','(nil)'].includes(String(value).trim()))return {label:'NULL',address:address||String(value),tone:'null'};
  if(!address)return {label:'无法读取',address:String(value??'暂无值'),tone:'unknown'};
  const object=objects.find(o=>o.address?.toLowerCase()===address);
  if(!object)return {label:'未登记地址',address,tone:'unknown'};
  return {label:'N'+object.id.split('-').at(-1),address,tone:object.live?'live':'released',type:object.type};
}
export function arrayEntries(row){
  const value=row.value;if(Array.isArray(value))return value.map((v,i)=>[String(i),v&&typeof v==='object'&&'value'in v?v.value:v]);
  if(value&&typeof value==='object')return Object.entries(value);return [];
}
export const shortName=nameOf;
