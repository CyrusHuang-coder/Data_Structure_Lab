const address=v=>/0x[\da-f]+/i.exec(String(v))?.[0]?.toLowerCase();
const entries=v=>v&&typeof v==='object'?Object.values(v):[];
const local=(step,name)=>step?.variables?.find(v=>v.name===name)?.value;
const watch=(step,name)=>entries(step?.watches?.[Object.keys(step?.watches||{}).find(k=>k.startsWith(name+'['))]);

// Only exact observed transitions are highlighted. Missing/optimized locals add no inferred edge.
export function highlightEdges(graph,{step,previous,profile,objects,idOf,links}){
  const mark=(from,to,kind='selected')=>{const e=graph.findEdge(from,to);if(e)e[kind+'Count']=1;};
  if(profile.kind==='graph'){
    const offset=['lc-684','lc-743'].includes(profile.algorithmId)?1:0;
    const u=Number(local(step,'u'))-offset,v=Number(local(step,'v'))-offset;
    const arc=objects.find(o=>o.address===address(local(step,'p'))&&o.fields.to!==undefined);
    if(arc&&local(step,'u')!==undefined)mark(u,Number(arc.fields.to));
    else if(local(step,'u')!==undefined&&local(step,'v')!==undefined)mark(u,v);
    const parents=watch(step,'parent'),oldParents=watch(previous,'parent'),dist=watch(step,'dist'),oldDist=watch(previous,'dist');
    (['dijkstra','prim'].includes(profile.algorithmId)?parents:[]).forEach((p,to)=>{const from=Number(p);if(from>=0&&from<profile.input.vertices&&from!==to){
      // Retain the chosen search/MST tree, and emphasize the edge just updated.
      mark(from,to,'visited');if(previous&&(p!==oldParents[to]||dist[to]!==oldDist[to]))mark(from,to);
    }});
    return;
  }
  const before=new Map((previous?.objects||[]).map(o=>[o.id,o]));
  for(const o of objects){
    const old=before.get(o.id);if(!old)continue;
    const fields=['btree','bplus'].includes(profile.kind)?[...entries(o.fields.child).map((v,i)=>['c'+i,v,entries(old.fields.child)[i]]),['叶链',o.fields.next,old.fields.next]]:links.map(k=>[k,o.fields[k],old.fields[k]]);
    for(const [field,current,prior]of fields){
      const target=idOf[address(current)],oldTarget=idOf[address(prior)],source=idOf[o.address];
      if(address(current)===address(prior))continue;
      if(target)mark(source,target,'visited');
      // A detached link remains visible for this one transition, including reversal to NULL.
      if(oldTarget&&!graph.findEdge(source,oldTarget)){graph.addEdge(source,oldTarget,field);const e=graph.findEdge(source,oldTarget);e.removed=true;e.visitedCount=1;}
    }
  }
  for(const variable of step?.variables||[]){
    const target=idOf[address(variable.value)],oldTarget=idOf[address(local(previous,variable.name))];
    if(target&&oldTarget&&target!==oldTarget)mark(oldTarget,target);
  }
}
