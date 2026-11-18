const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function inputDocument(text){try{const input=JSON.parse(text);if(!input||typeof input!=='object'||Array.isArray(input))throw new Error();return {input};}catch{return {input:null,error:'高级输入须为有效的 JSON 对象。'};}}
const keyLabels={
 'array-insert':'插入下标','array-delete':'删除下标','stack-push':'入栈值','queue-enqueue':'入队值',
 'lc-19':'倒数位置 n','lc-61':'右移次数 k','lc-92':'左端位置 left','lc-236':'目标结点 p',
 'lc-215':'第 k 大','lc-230':'第 k 小','lc-347':'高频元素个数 k','lc-239':'窗口宽度 k',
 'matrix-address':'访问下标','matrix-triangle':'访问下标','base-conversion':'待转换整数'
};
export function inputFields(algorithm,input=algorithm?.input||{}){
  const defaults=algorithm?.input||{},keys=[...new Set([...Object.keys(defaults),...Object.keys(input)])];
  const used=(algorithm?.source||'')+' '+(algorithm?.call||'');
  return keys.filter(key=>!(key==='key'&&!/\bkey\b/.test(used))&&!(key==='pattern'&&!/\bpattern\b/.test(used))&&!(key==='values'&&(has(defaults,'tokens')||has(defaults,'structure')||has(defaults,'words')))).map(key=>{
    const sample=has(defaults,key)?defaults[key]:input[key];
    let kind=typeof sample,label=key,hint='';
    if(key==='values'||key==='values2'||key==='weights'){
      kind='numbers';label=key==='values'?(algorithm?.kind==='tree'?'树的层序序列':'数列'):key==='weights'?'权重序列':'第二个数列';
      if(key==='values'&&algorithm?.id==='lc-105')label='前序序列';
      if(key==='values2'&&algorithm?.id==='lc-105')label='中序序列';
      if(key==='values2'&&algorithm?.id==='lc-100')label='第二棵树的层序序列';
      if(algorithm?.id==='lc-946')label=key==='values'?'入栈序列':'出栈序列';
      hint='用逗号、空格或换行分隔；也可粘贴 [1, 2, 3]。留空表示空序列。';
    }else if(key==='edges'){kind='edges';label='边集';hint='每行一条边：起点 终点 [权重]。例如 0 1 2；无权边省略权重。也可粘贴二维数组。';}
    else if(key==='structure'){kind='nested';label='广义表';hint='例如 [1, [2, 3], []]，也支持教材括号写法 (1, (2, 3), ())。';}
    else if(key==='tokens'){kind='tokens';label='表达式符号序列';hint='例如 2, 1, +, 3, *，无需引号；也可粘贴字符串数组。';}
    else if(key==='operations'){kind='tokens';label='操作序列';hint='用逗号或换行分隔，例如 push:3, pop, empty。可用操作见题目说明。';}
    else if(key==='words'){kind='tokens';label='单词序列';hint='用逗号或换行分隔，例如 eat, tea, tan；空字符串请使用 ["", "a"] 格式。';}
    else if(key==='text'){label=algorithm?.id==='expression'?'表达式':/brackets|lc-20/.test(algorithm?.id)?'括号串':'主串';hint='直接输入文本，无需添加引号。';}
    else if(key==='pattern'){label=['fixed-string','heap-string'].includes(algorithm?.id)?'拼接串':'模式串';hint='直接输入文本，无需添加引号。';}
    else if(key==='key')label=keyLabels[algorithm?.id]||'目标值';
    else if(key==='position'){label=algorithm?.id==='lc-160'?'共享尾部在 A 中的下标':/delete/.test(algorithm?.id)?'删除位置':'插入位置';hint=algorithm?.id==='lc-160'?'从 0 开始；-1 表示两条链表不相交。':'链表数据位置从 1 开始。';}
    else if(key==='value')label=algorithm?.id==='lc-92'?'右端位置 right':algorithm?.id==='lc-236'?'目标结点 q':algorithm?.id==='lc-1971'?'目标顶点':'插入值';
    else if(key==='vertices'){label='顶点数';hint='顶点编号从 0 开始，最多 12 个顶点。';}
    else if(key==='start')label='起始顶点';
    else if(key==='directed')label='有向图';
    else if(key==='rows')label='行数';
    else if(key==='cols')label='列数';
    else if(key==='cycleTo'){label='尾结点连接位置';hint='0 起始下标；-1 表示不成环。';}
    const nullable=(key==='values'&&algorithm?.kind==='tree')||(key==='values2'&&algorithm?.id==='lc-100');
    if(nullable)hint='按层序填写，例如 1, 2, 3, null, 4。null 表示缺失孩子；留空表示空树。';
    if(key==='values'&&has(defaults,'rows')){label='矩阵元素';hint='可按行换行填写，或粘贴二维数组；平台按行展开。行、列数在下方填写。';}
    return {key,kind,label,hint,nullable};
  });
}
const integer=text=>{if(!/^[+-]?\d+$/.test(text.trim()))throw new Error('请填写整数。');const n=Number(text);if(!Number.isSafeInteger(n))throw new Error('整数超出可表示范围。');return n;};
const safeNumbers=(values,field)=>{if(values.length>32)throw new Error('最多填写 32 个元素。');return values.map(v=>{if(v===null&&field.nullable)return null;if(!Number.isInteger(v)||Math.abs(v)>100000)throw new Error(field.nullable?'请填写整数或 null，整数绝对值不超过 100000。':'请填写整数，绝对值不超过 100000。');return v;});};
function sequence(text){const s=text.trim();if(!s||s==='[]')return [];return s.replace(/，/g,',').split(/[,\s;；]+/).filter(Boolean);}
export function parseInputField(field,raw){
  const text=String(raw??'').trim();
  if(field.kind==='boolean')return raw===true||raw==='true';
  if(field.kind==='string')return String(raw??'');
  if(field.kind==='number')return integer(text);
  if(field.kind==='numbers'){
    let values;if(text.startsWith('[')){try{values=JSON.parse(text);}catch{throw new Error('数列格式有误，请检查方括号与分隔符。');}if(!Array.isArray(values))throw new Error('请填写数列。');if(field.key==='values'&&values.some(Array.isArray))values=values.flat();}
    else values=sequence(text).map(s=>s.toLowerCase()==='null'?null:integer(s));
    return safeNumbers(values,field);
  }
  if(field.kind==='tokens'){
    let tokens;if(text.startsWith('[')){try{tokens=JSON.parse(text);}catch{throw new Error('符号数组格式有误。');}}
    else tokens=sequence(text);
    if(!Array.isArray(tokens)||tokens.length>50||tokens.some(v=>typeof v!=='string'))throw new Error('请填写最多 50 个表达式符号。');return tokens;
  }
  if(field.kind==='edges'){
    let edges;if(!text||text==='[]')return [];
    if(text.startsWith('[')){try{edges=JSON.parse(text);}catch{throw new Error('边数组格式有误。');}}
    else edges=text.split(/[\n;；]+/).filter(row=>row.trim()).map(row=>sequence(row).map(integer));
    if(!Array.isArray(edges)||edges.length>80||edges.some(e=>!Array.isArray(e)||![2,3].includes(e.length)||e.some(v=>!Number.isInteger(v))))throw new Error('每条边填写 2 或 3 个整数，最多 80 条边。');return edges;
  }
  if(field.kind==='nested'){
    let nested;try{nested=JSON.parse(text.replace(/\(/g,'[').replace(/\)/g,']').replace(/，/g,','));}catch{throw new Error('请检查广义表的括号和元素，例如 [1, [2, 3], []]。');}
    let count=0;const walk=(v,depth)=>{if(++count>48||depth>8)throw new Error('广义表最多 48 项，嵌套最多 8 层。');if(Array.isArray(v))v.forEach(x=>walk(x,depth+1));else if(!Number.isInteger(v)||Math.abs(v)>100000)throw new Error('广义表原子须为范围内整数。');};
    if(!Array.isArray(nested))throw new Error('广义表最外层须为括号或方括号。');walk(nested,0);return nested;
  }
  try{return JSON.parse(text);}catch{throw new Error('参数格式有误。');}
}
export function formatInputField(field,value){
  if(field.kind==='boolean')return !!value;
  if(field.kind==='string')return String(value??'');
  if(field.kind==='tokens'&&Array.isArray(value)&&value.some(v=>typeof v==='string'&&(!v||/[,\s;，；]/.test(v))))return JSON.stringify(value);
  if(field.kind==='edges')return Array.isArray(value)?value.map(e=>Array.isArray(e)?e.join(' '):String(e)).join('\n'):String(value??'');
  if(field.kind==='numbers'||field.kind==='tokens')return Array.isArray(value)?value.some(Array.isArray)?JSON.stringify(value):value.map(v=>v===null?'null':typeof v==='object'?JSON.stringify(v):String(v)).join(', '):String(value??'');
  if(field.kind==='nested'||field.kind==='object')return JSON.stringify(value??[]);
  return String(value??'');
}
const fieldValue=(field,base)=>has(base,field.key)?base[field.key]:field.kind==='number'?(field.key==='position'?base.key??0:field.key==='key'?base.position??0:0):field.kind==='boolean'?false:['numbers','tokens','edges','nested','object'].includes(field.kind)?[]:'';
export function inputFormState(algorithm,text){
  const parsed=inputDocument(text),base=parsed.input||algorithm?.input||{},fields=inputFields(algorithm,base);
  const bad=fields.find(f=>has(base,f.key)&&(['numbers','tokens','edges','nested'].includes(f.kind)?!Array.isArray(base[f.key]):['string','number','boolean'].includes(f.kind)&&typeof base[f.key]!==f.kind));
  return {fields,raw:Object.fromEntries(fields.map(f=>[f.key,formatInputField(f,fieldValue(f,base))])),base,error:parsed.error||(bad?bad.label+' 的数据类型有误，请检查高级输入。':undefined)};
}
export function readInputFields(fields,raw,base){const input={...base},errors={};for(const field of fields){try{const value=parseInputField(field,raw[field.key]);if(has(base,field.key)||raw[field.key]!==formatInputField(field,fieldValue(field,base)))input[field.key]=value;}catch(e){errors[field.key]=e.message;}}return {input,errors,valid:!Object.keys(errors).length};}
export function previewInput(algorithm,text){
  const state=inputFormState(algorithm,text),decoded=readInputFields(state.fields,state.raw,state.base);
  return state.error||!decoded.valid?algorithm?.input||{}:decoded.input;
}
