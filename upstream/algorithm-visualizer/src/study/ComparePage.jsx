import React,{useState,useRef,useEffect} from 'react';
import {Play,RotateCcw,ArrowRight} from 'lucide-react';
import {api} from './api.js';import {Visualizer} from './Visuals.jsx';
import TestInput from './TestInput.jsx';import {previewInput} from './testInput.mjs';
export default function ComparePage({catalog,onError}){
  const initial=['insertion','quick'].map(id=>{const a=catalog.algorithms.find(a=>a.id===id);return {id,code:a.source,input:JSON.stringify(a.input,null,2),inputValid:true,revision:0};});
  const [sides,setSides]=useState(initial),[runs,setRuns]=useState([]),[seq,setSeq]=useState([0,0]),[busy,setBusy]=useState(false),active=useRef(true),inputs=useRef([]);
  useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
  const change=(i,patch)=>setSides(s=>s.map((v,j)=>j===i?{...v,...patch}:v));
  const replaceInput=(i,text)=>setSides(s=>s.map((v,j)=>j===i?{...v,input:text,inputValid:true,revision:v.revision+1}:v));
  const select=(i,id)=>{const a=catalog.algorithms.find(a=>a.id===id);change(i,{id,code:a.source,input:JSON.stringify(a.input,null,2),inputValid:true,revision:sides[i].revision+1});};
  const start=async()=>{try{
    const parsed=sides.map((_,i)=>inputs.current[i].read());setBusy(true);setRuns([]);setSeq([0,0]);
    for(const [index,side]of sides.entries()){
      const job=await api('/runs',{method:'POST',body:{algorithmId:side.id,source:side.code,input:parsed[index]}});let r;
      do{await new Promise(resolve=>setTimeout(resolve,500));r=await api('/runs/'+job.id);}while(active.current&&!r.result&&!r.error);
      if(!active.current)return;if(!r.result)throw new Error(r.error);setRuns(previous=>[...previous,r.result]);
      if(r.result.status!=='completed')throw new Error(r.result.diagnostics||r.result.status);
    }
  }catch(e){onError(e.message);}finally{if(active.current)setBusy(false);}};
  const nextChange=(run,index)=>{const found=run?.steps.findIndex((s,i)=>i>index&&s.structureChanged);return found===undefined||found<0?Math.max(0,(run?.steps.length||1)-1):found;};
  return <><div className="page-heading"><div><div className="eyebrow">SIDE BY SIDE</div><h1>对比工作台</h1><p>编辑两份代码或两个用例。每侧保留自己的执行记录与源码快照。</p></div><button className="button primary" disabled={busy||sides.some(s=>!s.inputValid)} onClick={start}><Play size={15}/>{busy?'正在采集…':'运行两侧'}</button></div>
    <div className="filter-bar"><button className="button secondary" disabled={busy||!sides[0].inputValid} onClick={()=>{try{replaceInput(1,JSON.stringify(inputs.current[0].read(),null,2));}catch(e){onError(e.message);}}}>左输入用于右侧 <ArrowRight size={14}/></button><button className="button secondary" disabled={!runs.length||busy} onClick={()=>setSeq([0,0])}><RotateCcw size={14}/> 回到开始</button><button className="button secondary" disabled={runs.length!==2||busy} onClick={()=>setSeq(s=>s.map((index,i)=>nextChange(runs[i],index)))}>两侧下一次结构变化</button></div>
    <div className="compare-grid">{sides.map((side,i)=>{const a=catalog.algorithms.find(a=>a.id===side.id),run=runs[i],step=run?.steps[seq[i]];return <section className="card compare-card" key={i}>
      <select aria-label={i?'右侧算法':'左侧算法'} value={side.id} disabled={busy} onChange={e=>select(i,e.target.value)}>{catalog.algorithms.filter(a=>!a.problemNumber).map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select>
      <div className="compare-actions"><button className="text-button" disabled={busy} onClick={async()=>{try{const draft=await api('/records/draft/'+side.id);if(draft){change(i,{code:draft.code});replaceInput(i,draft.inputText||JSON.stringify(a.input));}else onError('此算法还没有个人草稿');}catch(e){onError(e.message);}}}>载入我的草稿</button></div>
      <textarea className="compare-edit" aria-label={i?'右侧代码':'左侧代码'} value={side.code} onChange={e=>change(i,{code:e.target.value})} disabled={busy} spellCheck={false}/>
      <TestInput ref={element=>{inputs.current[i]=element;}} key={side.id} algorithm={a} value={side.input} onChange={text=>change(i,{input:text})} onValidityChange={valid=>change(i,{inputValid:valid})} resetKey={side.revision} disabled={busy} prefix={i?'右侧':'左侧'}/>
      <Visualizer algorithm={{...a,...run?.profile}} input={run?.profile?.input||previewInput(a,side.input)} step={step} previous={run?.steps[seq[i]-1]}/>
      <div className="compare-actions"><button className="button secondary" disabled={!run?.steps.length} onClick={()=>setSeq(s=>s.map((v,j)=>j===i?Math.min(v+1,run.steps.length-1):v))}>下一步</button><button className="text-button" disabled={!run} onClick={()=>setSeq(s=>s.map((v,j)=>j===i?nextChange(run,v):v))}>下一次变化</button><span>{run?.steps.length?seq[i]+1:0}/{run?.steps.length||0}</span></div>
      <pre className="compare-code">{(run?.source||side.code).split('\n').map((line,n)=><div key={n} className={step?.nextLocation?.file==='user.c'&&step.nextLocation.line===n+1?'active':''}><span>{n+1}</span>{line}</div>)}</pre>
    </section>;})}</div>
  </>;
}
