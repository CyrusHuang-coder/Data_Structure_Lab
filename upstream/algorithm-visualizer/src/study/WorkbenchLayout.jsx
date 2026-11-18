import React,{Children,cloneElement,forwardRef,useId,useImperativeHandle,useLayoutEffect,useRef,useState,useEffect} from 'react';
import {GripVertical} from 'lucide-react';
import {defaultPaneWeights,normalizePaneWeights,fitPaneWidths,movePaneDivider,paneMinimums} from './paneLayout.mjs';
import './workbench-layout.css';
const storageKey=id=>'zhixu.panes.v1:'+id;
function load(id){try{const data=JSON.parse(localStorage.getItem(storageKey(id)));return normalizePaneWeights(data?.version===1?data.weights:null);}catch{return [...defaultPaneWeights];}}
const WorkbenchLayout=forwardRef(function WorkbenchLayout({layoutKey,showState,children},ref){
  const [weights,setWeights]=useState(()=>load(layoutKey)),[width,setWidth]=useState(1000),[dragging,setDragging]=useState(false);
  const root=useRef(null),drag=useRef(null),animation=useRef(null),pending=useRef(null),uid=useId();
  const latestWeights=useRef(weights);latestWeights.current=weights;
  const mode=showState&&width>=880?'three':width>=560?'two':'stack',count=mode==='three'?3:2;
  const available=Math.max(0,width-(count-1)*12),minimums=paneMinimums.slice(0,count),widths=fitPaneWidths(weights.slice(0,count),available,minimums);
  const stop=()=>{if(animation.current)cancelAnimationFrame(animation.current);animation.current=null;if(pending.current){setWeights(pending.current);pending.current=null;}drag.current=null;setDragging(false);};
  useLayoutEffect(()=>{const el=root.current;if(!el)return;const measure=()=>setWidth(el.getBoundingClientRect().width);measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect();},[]);
  useEffect(()=>{const timer=setTimeout(()=>{try{localStorage.setItem(storageKey(layoutKey),JSON.stringify({version:1,weights}));}catch{}},150);return()=>clearTimeout(timer);},[weights,layoutKey]);
  useEffect(()=>{const flush=()=>{try{localStorage.setItem(storageKey(layoutKey),JSON.stringify({version:1,weights:latestWeights.current}));}catch{}};window.addEventListener('pagehide',flush);return()=>{window.removeEventListener('pagehide',flush);flush();};},[layoutKey]);
  useEffect(()=>()=>{if(animation.current)cancelAnimationFrame(animation.current);},[]);
  useImperativeHandle(ref,()=>({reset(){stop();setWeights([...defaultPaneWeights]);}}));
  const commit=(pixels,oldWeights=weights)=>{
    const total=pixels.reduce((a,b)=>a+b,0),budget=pixels.length===3?100:oldWeights[0]+oldWeights[1];
    const next=[...oldWeights];pixels.forEach((n,i)=>{next[i]=n/total*budget;});return normalizePaneWeights(next);
  };
  const pointerMove=e=>{
    const record=drag.current;if(!record||e.pointerId!==record.pointerId)return;
    const pixels=movePaneDivider(record.widths,record.index,e.clientX-record.startX,record.minimums);
    pending.current=commit(pixels,record.weights);
    if(!animation.current)animation.current=requestAnimationFrame(()=>{animation.current=null;if(pending.current){setWeights(pending.current);pending.current=null;}});
  };
  const items=Children.toArray(children),nodes=[];
  items.forEach((child,index)=>{
    nodes.push(cloneElement(child,{key:'pane-'+index,id:uid+'-pane-'+index}));
    if(mode==='stack'||index>=count-1)return;
    const sum=widths[index]+widths[index+1],leftPercent=Math.round(widths[index]/sum*100);
    nodes.push(<div key={'divider-'+index} className="pane-resize-handle" role="separator" aria-orientation="vertical" aria-label={index?'调整可视化与运行状态宽度':'调整代码与可视化宽度'} aria-controls={uid+'-pane-'+index+' '+uid+'-pane-'+(index+1)} tabIndex={0} aria-valuemin={Math.round(minimums[index]/sum*100)} aria-valuemax={Math.round((sum-minimums[index+1])/sum*100)} aria-valuenow={leftPercent} aria-valuetext={'左侧 '+leftPercent+'%，右侧 '+(100-leftPercent)+'%'} title="拖动调整宽度；左右方向键微调；双击恢复默认" onDoubleClick={()=>{stop();setWeights([...defaultPaneWeights]);}}
      onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current={pointerId:e.pointerId,index,startX:e.clientX,widths:[...widths],minimums:[...minimums],weights:[...weights]};setDragging(true);}}
      onPointerMove={pointerMove} onPointerUp={e=>{pointerMove(e);stop();}} onPointerCancel={stop} onLostPointerCapture={()=>{if(drag.current)stop();}}
      onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){setWeights([...defaultPaneWeights]);return;}const delta=(e.key==='ArrowLeft'?-1:1)*(e.shiftKey?40:12);setWeights(commit(movePaneDivider(widths,index,delta,minimums)));}}><GripVertical size={14}/></div>);
  });
  // Fractional tracks shrink with the container immediately, before ResizeObserver
  // recalculates the minimum-width allocation for the new viewport.
  const columns=mode==='stack'?'minmax(0,1fr)':widths.map(n=>'minmax(0,'+n+'fr)').join(' 12px ');
  return <div ref={root} className={'workbench-grid resizable-workbench'+(!showState?' no-vars':'')+(dragging?' is-resizing':'')} data-layout={mode} style={{gridTemplateColumns:columns,columnGap:0,rowGap:mode==='stack'?14:0}}>{nodes}</div>;
});
export default WorkbenchLayout;
