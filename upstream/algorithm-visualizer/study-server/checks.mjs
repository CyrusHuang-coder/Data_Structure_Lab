const addr=v=>/0x[\da-f]+/i.exec(String(v))?.[0]?.toLowerCase();
export function checkStructure(step,profile) {
  if(!step)return [];
  const findings=[],objects=step.objects||[],live=objects.filter(o=>o.live),byAddress=new Map(live.map(o=>[o.address,o]));
  const kind=profile.kind;
  const fields=['tree','threaded'].includes(kind)?['left','right']:['list','leetcode-list','circular','doubly','graph'].includes(kind)?['next',...(kind==='doubly'?['prev']:[])]:kind==='generalized'?['head','tail']:[];
  for(const o of live)for(const field of fields){const target=addr(o.fields?.[field]);if(target&&target!=='0x0'&&!byAddress.has(target))findings.push({severity:'error',message:`${o.id}.${field} 指向未登记或已释放对象 ${target}`,objectId:o.id});}
  if(profile.kind==='list'||profile.kind==='leetcode-list'){
    const root=addr(step.watches?.[profile.rootSymbol||'head']||step.watches?.lc_head),seen=new Set();let p=byAddress.get(root);
    while(p){if(seen.has(p.id)){const expected=(profile.input?.cycleTo??-1)>=0;findings.push({severity:expected?'info':'error',message:`${expected?'按本题输入形成环':'从头指针到达环'}，重复节点 ${p.id}`,objectId:p.id});break;}seen.add(p.id);p=byAddress.get(addr(p.fields?.next));}
    const unreachable=live.filter(o=>!seen.has(o.id));
    if(unreachable.length)findings.push({severity:'info',message:`${unreachable.length} 个已分配节点暂时无法从 head 到达；检查局部工作指针及操作完成状态。`});
  }
  if(profile.kind==='doubly')for(const o of live){const next=byAddress.get(addr(o.fields?.next));if(next&&addr(next.fields?.prev)!==o.address)findings.push({severity:step.nextLocation?'info':'error',message:`${o.id} 与后继的前后指针尚未一致。`});}
  if(['tree','threaded'].includes(profile.kind)){
    const child=(o,field)=>kind==='threaded'&&+(o.fields?.[field==='left'?'ltag':'rtag'])?null:addr(o.fields?.[field]);
    const parents=new Map();for(const o of live)for(const field of fields){const target=child(o,field);if(target&&target!=='0x0'){parents.set(target,(parents.get(target)||0)+1);if(parents.get(target)>1)findings.push({severity:'error',message:`节点 ${target} 被多个孩子链接引用`});}}
    const done=new Set(),active=new Set();const walk=o=>{if(!o||done.has(o.id))return;if(active.has(o.id)){findings.push({severity:'error',message:'孩子链接形成环：'+o.id});return;}active.add(o.id);walk(byAddress.get(child(o,'left')));walk(byAddress.get(child(o,'right')));active.delete(o.id);done.add(o.id);};live.forEach(walk);
  }
  if(+step.watches?.ds_memory_error)findings.push({severity:'error',message:'运行时分配跟踪检测到重复释放或非法释放。'});
  if(+step.watches?.ds_invariant_error)findings.push({severity:'error',message:'算法完成后的排序树/平衡树不变量检查失败。'});
  if(profile.algorithmId==='avl'||profile.id==='avl'){
    const seen=new Set();
    const height=(node,low,high)=>{if(!node)return 0;if(seen.has(node.id))return 0;seen.add(node.id);const v=+node.fields.val;if(v<=low||v>=high)findings.push({severity:step.nextLocation?'info':'error',message:`${node.id} 不满足二叉排序树键区间`});const l=height(byAddress.get(addr(node.fields.left)),low,v),r=height(byAddress.get(addr(node.fields.right)),v,high);if(Math.abs(l-r)>1)findings.push({severity:step.nextLocation?'info':'error',message:`${node.id} 的实际平衡因子为 ${l-r}`});if(+node.fields.height!==Math.max(l,r)+1)findings.push({severity:step.nextLocation?'info':'error',message:`${node.id} 的 height 与实际高度不一致`});return Math.max(l,r)+1;};
    height(byAddress.get(addr(step.watches?.root)),-Infinity,Infinity);
  }
  if(!findings.length)findings.push({severity:'ok',message:'当前已登记对象的结构规则通过。初始化有效性与完整内存检查尚未覆盖。'});
  return findings;
}
