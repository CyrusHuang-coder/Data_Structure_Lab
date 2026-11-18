import React,{useRef,useState,useLayoutEffect,useEffect} from 'react';
import {Minus,Plus,Scan,LocateFixed,Maximize2,Minimize2} from 'lucide-react';
import './visual-viewport.css';

export default function VisualViewport({children,identity}){
  const canvas=useRef(null),content=useRef(null),expandButton=useRef(null),frame=useRef(null);
  const [view,setView]=useState({scale:1,x:0,y:0}),[expanded,setExpanded]=useState(false);
  const current=useRef(view);current.current=view;
  const bounds=()=>{
    const el=content.current,origin=el.getBoundingClientRect(),s=current.current.scale,rects=[];
    for(const node of el.querySelectorAll('table,.array-bars>div,[data-study-renderer]>span,.structure-caption,.pointer-tags>span,.edge-legend>span,.string-stage>label,.structure-stage>p')){const r=node.getBoundingClientRect();if(r.width&&r.height)rects.push({x:(r.left-origin.left)/s,y:(r.top-origin.top)/s,w:r.width/s,h:r.height/s});}
    for(const svg of el.querySelectorAll('.logical-graph svg')){try{const b=svg.getBBox(),m=svg.getScreenCTM();if(!b.width&&!b.height)continue;const p=new DOMPoint(b.x,b.y).matrixTransform(m),q=new DOMPoint(b.x+b.width,b.y+b.height).matrixTransform(m);rects.push({x:(p.x-origin.left)/s,y:(p.y-origin.top)/s,w:(q.x-p.x)/s,h:(q.y-p.y)/s});}catch{}}
    if(!rects.length)return {x:0,y:0,w:el.offsetWidth||1,h:el.offsetHeight||1};
    const x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y));return {x,y,w:Math.max(...rects.map(r=>r.x+r.w))-x,h:Math.max(...rects.map(r=>r.y+r.h))-y};
  };
  const place=(fit=false,scaleOverride)=>{if(!canvas.current)return;const b=bounds(),w=canvas.current.clientWidth,h=canvas.current.clientHeight;const scale=scaleOverride??(fit?Math.min(2,Math.max(.15,Math.min((w-48)/Math.max(1,b.w),(h-48)/Math.max(1,b.h)))):current.current.scale);setView({scale,x:w/2-(b.x+b.w/2)*scale,y:h/2-(b.y+b.h/2)*scale});};
  const reset=(fit)=>{content.current?.querySelectorAll('[data-study-renderer]').forEach(el=>el.resetStudyView?.());cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>place(fit));};
  useLayoutEffect(()=>{reset(true);const observer=new ResizeObserver(()=>reset(true));observer.observe(canvas.current);return()=>{observer.disconnect();cancelAnimationFrame(frame.current);};},[identity]);
  useEffect(()=>{if(!expanded)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const close=e=>{if(e.key==='Tab'){const buttons=[...canvas.current.parentElement.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}if(e.key==='Escape'){setExpanded(false);expandButton.current?.focus();}};window.addEventListener('keydown',close);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',close);};},[expanded]);
  const zoom=factor=>place(false,Math.min(3,Math.max(.15,current.current.scale*factor)));
  return <div className={'visual-viewport'+(expanded?' is-expanded':'')} role={expanded?'dialog':undefined} aria-modal={expanded?true:undefined} aria-label={expanded?'\u56fe\u5f62\u6700\u5927\u5316\u89c6\u56fe':undefined}>
    <div className="visual-view-tools" role="group" aria-label="图形视图控制">
      <button type="button" aria-label="缩小图形" title="缩小" onClick={()=>zoom(1/1.2)} disabled={view.scale<=.15}><Minus size={16}/></button><output aria-label="图形缩放比例">{Math.round(view.scale*100)}%</output><button type="button" aria-label="放大图形" title="放大" onClick={()=>zoom(1.2)} disabled={view.scale>=3}><Plus size={16}/></button>
      <span className="visual-tool-divider"/>
      <button type="button" aria-label="图形居中" title="居中（保留缩放比例）" onClick={()=>reset(false)}><LocateFixed size={16}/><span>居中</span></button><button type="button" aria-label="适应画布" title="按内容自动缩放并居中" onClick={()=>reset(true)}><Scan size={16}/><span>适应画布</span></button><button type="button" ref={expandButton} aria-label={expanded?'还原图形面板':'最大化图形面板'} title={expanded?'还原（Esc）':'最大化图形面板'} aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
    </div>
    <div className="visual-view-canvas" ref={canvas}><div className="visual-view-content" ref={content} style={{transform:`translate(${view.x}px, ${view.y}px) scale(${view.scale})`}}>{children}</div></div>
  </div>;
}
