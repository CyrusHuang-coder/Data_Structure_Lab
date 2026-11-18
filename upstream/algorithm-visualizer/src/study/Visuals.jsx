import React,{useMemo} from 'react';
import VisualViewport from './VisualViewport.jsx';
import Array1DTracer from '../core/tracers/Array1DTracer.js';
import Array2DTracer from '../core/tracers/Array2DTracer.js';
import GraphTracer from '../core/tracers/GraphTracer.js';
import {highlightEdges} from './edgeHighlights.mjs';

export const address=v=>/0x[\da-f]+/i.exec(String(v))?.[0]?.toLowerCase();
export function values(value){return value&&typeof value==='object'?Object.values(value):[];}
export function snapshotString(snapshot,fallback=''){
  if(snapshot===undefined)return fallback;
  const chars=values(snapshot);if(chars.length){const out=[];for(const v of chars){const code=parseInt(v);if(!Number.isFinite(code)||code===0)break;out.push(String.fromCharCode(code));}return out.join('');}
  return typeof snapshot==='string'?snapshot.replace(/^"|"$/g,''):fallback;
}
const numeric=v=>Number.parseInt(String(v));

export function ArrayView({data=[],previous=[],title='数组',active=[]}) {
  const tracer=useMemo(()=>new Array1DTracer(title,()=>null,title),[title]);
  tracer.set(data);
  data.forEach((v,i)=>{if(previous.length&&v!==previous[i])tracer.patch(i,v);if(active.includes(i))tracer.select(i);});
  return <div className="upstream-array">{tracer.render()}</div>;
}

export function MatrixView({data,title}) {
  const tracer=useMemo(()=>new Array2DTracer(title,()=>null,title),[title]);tracer.set(data);
  return <div className="upstream-matrix">{tracer.render()}</div>;
}

export function GraphView({step,profile,previous}) {
  const graph=useMemo(()=>new GraphTracer('logical',()=>null,''),[]);
  graph.nodes=[];graph.edges=[];graph.directed(profile.input?.directed??true);graph.weighted(true);
  graph.dimensions={...graph.dimensions,baseWidth:560,baseHeight:300,nodeRadius:18,padding:42};
  const objects=(step?.objects||[]).filter(o=>o.live&&o.fields&&Object.keys(o.fields).length);
  const idOf=Object.fromEntries(objects.map((o,i)=>[o.address,'N'+o.id.split('-')[1]]));
  const last=Object.fromEntries((previous?.objects||[]).map(o=>[o.id,o]));
  const pointers=[...(step?.variables||[]).filter(v=>v.type?.includes('*')||address(v.value)).map(v=>({name:v.name,target:address(v.value)})),...Object.entries(step?.watches||{}).filter(([k,v])=>['head','root','lc_head','dhead','ghead','broot','troot'].includes(k)).map(([name,v])=>({name,target:address(v)}))];
  let links=profile.nodeLinks||(['tree','threaded'].includes(profile.kind)?['left','right']:profile.kind==='generalized'?['head','tail']:['next']);
  if(profile.kind==='graph') {
    const n=profile.input.vertices;for(let i=0;i<n;i++)graph.addNode(i,null);
    if(step) {
      const roots=values(step.watches?.[Object.keys(step.watches||{}).find(k=>k.startsWith('first['))]);
      const lookup=new Map(objects.map(o=>[o.address,o]));
      roots.forEach((root,u)=>{let p=lookup.get(address(root));const seen=new Set();while(p&&!seen.has(p.id)){seen.add(p.id);const v=+p.fields.to;if(v>=0&&v<n)graph.addEdge(u,v,+p.fields.weight);p=lookup.get(address(p.fields.next));}});
    } else for(const[u,v,w=1]of profile.input.edges)graph.addEdge(u,v,w);
    graph.layoutCircle();
    const watch=step?.watches||{},visited=values(watch[Object.keys(watch).find(k=>k.startsWith('visited['))]);
    visited.forEach((v,i)=>{if(+v&&graph.findNode(i))graph.visit(i);});
    const offset=['lc-684','lc-743'].includes(profile.algorithmId)?1:0;
    const u=(step?.variables||[]).find(v=>v.name==='u');if(u&&graph.findNode(+u.value-offset))graph.select(+u.value-offset);
  } else {
    const label=o=>['btree','bplus'].includes(profile.kind)?values(o.fields.keys).slice(0,+o.fields.count).join(' | '):profile.kind==='generalized'?(+o.fields.tag?o.fields.atom:'表结点'):profile.kind==='orthogonal'?`${o.fields.tail}→${o.fields.head}`:profile.kind==='multilist'?`${o.fields.ivex}—${o.fields.jvex}`:profile.kind==='cross-matrix'?`(${o.fields.row},${o.fields.col})=${o.fields.val}`:profile.kind==='block-string'?values(o.fields.data).slice(0,+o.fields.len).map(v=>String.fromCharCode(parseInt(v)||0)).join(''):(o.fields.data??o.fields.val??'?');
    objects.forEach(o=>graph.addNode(idOf[o.address],label(o)));
    for(const o of objects){
      if(['btree','bplus'].includes(profile.kind)) {values(o.fields.child).slice(0,+o.fields.count+1).forEach((v,i)=>{const target=idOf[address(v)];if(target)graph.addEdge(idOf[o.address],target,`c${i}`);});const next=idOf[address(o.fields.next)];if(next)graph.addEdge(idOf[o.address],next,'叶链');}
      else for(const field of links) {const target=idOf[address(o.fields[field])];if(target){graph.addEdge(idOf[o.address],target,field);const edge=graph.findEdge(idOf[o.address],target);if(profile.kind==='threaded'&&+(o.fields[field==='left'?'ltag':'rtag']))edge.thread=true;}}
    }
    if(['tree','threaded','btree','bplus','generalized'].includes(profile.kind)&&objects.length) {
      const root=idOf[address(step?.watches?.[profile.rootSymbol||'root'])];
      if(root){
        let cursor=0;const seen=new Set();
        const place=(id,depth)=>{if(seen.has(id))return null;seen.add(id);const children=graph.edges.filter(e=>e.source===id&&!e.thread&&!['叶链','prev'].includes(e.weight)).map(e=>e.target);const xs=children.map(c=>place(c,depth+1)).filter(x=>x!==null);const x=xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:(cursor++*75);graph.updateNode(id,undefined,x,depth*75);return x;};
        place(root,0);const center=(Math.max(1,cursor)-1)*75/2;
        graph.nodes.forEach(n=>{if(seen.has(n.id)){n.x-=center;n.y-=90;}else{n.x=cursor++*65-center;n.y=130;}});
        graph.dimensions.baseWidth=Math.max(560,cursor*85);graph.dimensions.baseHeight=Math.max(300,...graph.nodes.map(n=>n.y+160));
      }else graph.layoutCircle();
    } else {
      const byAddress=new Map(objects.map(o=>[o.address,o]));const ordered=[],seen=new Set();
      let node=byAddress.get(address(step?.watches?.[profile.rootSymbol||'head']||step?.watches?.lc_head));
      while(node&&!seen.has(node.id)){seen.add(node.id);ordered.push(node);node=byAddress.get(address(node.fields.next));}
      const detached=objects.filter(o=>!seen.has(o.id));
      [...ordered,...detached].forEach((o,i)=>graph.updateNode(idOf[o.address],undefined,-220+(i%6)*86,Math.floor(i/6)*90-25+(ordered.length&&i>=ordered.length?70:0)));
      graph.dimensions.baseHeight=Math.max(300,Math.ceil(objects.length/6)*100+100);
    }
    for(const o of objects){const id=idOf[o.address];if(last[o.id]&&JSON.stringify(last[o.id].fields)!==JSON.stringify(o.fields))graph.visit(id);if(pointers.some(p=>p.target===o.address))graph.select(id);}
  }
  highlightEdges(graph,{step,previous,profile,objects,idOf,links});
  return <><div className="logical-graph">{graph.render()}</div><div className="edge-legend"><span><i/>正在访问</span><span><i className="changed"/>连接变化 / 已选路径</span><span><i className="removed"/>刚断开的边</span></div>{profile.kind!=='graph'&&<div className="pointer-tags">{pointers.map(p=><span key={p.name}><b>{p.name}</b> → {idOf[p.target]||p.target||'NULL'}</span>)}{!objects.length&&<span>运行后在此显示节点与指针</span>}</div>}</>;
}

export function MemoryTable({step}) {
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>对象</th><th>地址</th><th>生命周期</th><th>字段</th></tr></thead><tbody>{(step?.objects||[]).map(o=><tr key={o.id} className={!o.live?'released':''}><td>N{o.id.split('-')[1]}</td><td><code>{o.address}</code></td><td>{o.live?'已分配':'已释放'}</td><td>{Object.entries(o.fields||{}).map(([k,v])=><span className="field" key={k}>{k}: {typeof v==='object'?JSON.stringify(v):v} </span>)}</td></tr>)}</tbody></table>{!step?.objects?.length&&<p className="muted">当前没有登记的动态节点。数组与栈对象在变量面板查看。</p>}</div>;
}

export function Visualizer(props) {
  return <VisualViewport identity={props.algorithm?.id}><VisualizerContent {...props}/></VisualViewport>;
}

function VisualizerContent({algorithm,step,previous,input}) {
  const profile={...(algorithm||{}),input},w=step?.watches||{},pw=previous?.watches||{};
  if(profile.kind==='leetcode-list')profile.kind='list';
  if(profile.kind==='free'||!profile.kind){
    const arrays=(step?.variables||[]).filter(v=>v.type?.includes('[')&&v.children);
    return <div className="structure-stage">{arrays.length?arrays.map(v=><ArrayView key={v.name} data={v.children.map(c=>c.value)} title={v.name+' · '+v.type}/>):<p className="muted small">当前帧的数组将在这里显示。指针、结构体与调用栈见右侧面板，动态分配见存储视图。</p>}</div>;
  }
  const arrayKey=Object.keys(w).find(k=>k.startsWith('a[0]@'));
  const current=arrayKey?values(w[arrayKey]):(input.values||[]);
  if(['list','tree','graph','doubly','circular','generalized','btree','bplus','threaded','block-string','cross-matrix','orthogonal','multilist'].includes(profile.kind))return <GraphView step={step} previous={previous} profile={profile}/>;
  if(profile.kind==='stack'||profile.kind==='queue'){
    const state=w[profile.kind==='stack'?'stack':'fifo'];const data=values(state?.data);const start=+(state?.front||0),end=+(state?.rear||0);
    const queueData=[];if(state&&profile.kind==='queue')for(let i=start;i!==end&&queueData.length<128;i=(i+1)%128)queueData.push(data[i]);
    return <div className="structure-stage"><div className="structure-caption">{profile.kind==='stack'?`栈底 → 栈顶 · top=${state?.top??input.values?.length??0}`:`队首 → 队尾 · front=${start}, rear=${end}`}</div><ArrayView data={state?(profile.kind==='stack'?data.slice(0,+state.top):queueData):input.values} title={profile.kind==='stack'?'顺序栈':'循环队列'}/></div>;
  }
  if(profile.kind==='string')return <div className="string-stage"><label>主串</label><ArrayView data={[...snapshotString(step?w.text:undefined,input.text||'')]} previous={[...snapshotString(previous?.watches?.text,input.text||'')]} title="主串"/><label>模式串</label><ArrayView data={[...snapshotString(step?w.pattern:undefined,input.pattern||'')]} previous={[...snapshotString(previous?.watches?.pattern,input.pattern||'')]} title="模式串"/><label>next</label><ArrayView data={values(w[Object.keys(w).find(k=>k.startsWith('next['))])} title="next"/></div>;
  return <div className="structure-stage"><div className="array-bars">{current.slice(0,input.values?.length||0).map((v,i)=><div key={i} style={{height:Math.max(8,Math.min(160,Math.abs(+v)*12))+'px'}} className={pw[arrayKey]&&pw[arrayKey][i]!==v?'changed':''}><span>{v}</span></div>)}</div><ArrayView data={current} previous={values(pw[arrayKey])} title="顺序存储 · 下标从 0 开始" active={(step?.variables||[]).filter(v=>['i','j','low','high','mid','p'].includes(v.name)).map(v=>+v.value)}/></div>;
}

export function AuxiliaryPanels({step,profile={}}){
  const entries=Object.entries(step?.watches||{}).filter(([k,v])=>v&&typeof v==='object'&&!k.startsWith('a[')&&!k.startsWith('first[')&&!['stack','fifo'].includes(k));
  if(!entries.length)return null;
  return <div className="auxiliary-panels">{entries.map(([k,v])=>{
    const arr=values(v),isMatrix=arr.some(x=>x&&typeof x==='object');
    const length=k.startsWith('ds_output[')?+step.watches.ds_output_len:k.startsWith('queue[')?+step.watches.qtail:profile.input?.values?.length||profile.input?.vertices||16;
    const rows=isMatrix?arr.slice(0,profile.kind==='graph'?profile.input?.vertices:Math.min(12,+step.watches.count||profile.input?.rows||4)).map(r=>values(r).slice(0,profile.kind==='graph'?profile.input?.vertices:3)):null;
    return <details open key={k}><summary>{k.split('[')[0]} <small>{isMatrix?'二维工作表':'辅助存储'}</small></summary>{isMatrix?<MatrixView data={rows} title={k}/>:<ArrayView data={arr.slice(0,Math.max(1,length))} title={k}/>}</details>;
  })}</div>;
}
