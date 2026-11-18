export function judge(algorithm,input,actual,expected){
  if(!actual||!expected||actual.memoryError||actual.invariantError)return false;
  if(algorithm.checker==='two-sum'){
    const out=actual.output;
    return Array.isArray(out)&&out.length===2&&out.every(Number.isInteger)&&out[0]!==out[1]&&out.every(i=>i>=0&&i<input.values.length)&&input.values[out[0]]+input.values[out[1]]===input.key;
  }
  if(algorithm.checker==='topological-order'||algorithm.id==='topological'){
    const out=actual.output;
    if(!Array.isArray(out))return false;
    if(expected.result!==undefined&&actual.result!==expected.result)return false;
    if(algorithm.id!=='topological'&&!expected.output.length)return out.length===0;
    if(out.length!==expected.output.length||new Set(out).size!==out.length||out.some(v=>!Number.isInteger(v)||v<0||v>=input.vertices)||expected.output.some(v=>!out.includes(v)))return false;
    const positions=new Map(out.map((v,i)=>[v,i]));return input.edges.every(([u,v])=>!positions.has(v)||positions.has(u)&&positions.get(u)<positions.get(v));
  }
  if(algorithm.checker==='top-k-frequency'){
    const out=actual.output;if(!Array.isArray(out)||out.length!==input.key||new Set(out).size!==out.length)return false;
    const freq=new Map();input.values.forEach(v=>freq.set(v,(freq.get(v)||0)+1));
    if(out.some(v=>!freq.has(v)))return false;
    const min=Math.min(...out.map(v=>freq.get(v)));return [...freq].every(([v,n])=>out.includes(v)||n<=min);
  }
  if(algorithm.id==='lc-27')return actual.result===expected.result&&JSON.stringify([...actual.output].sort((a,b)=>a-b))===JSON.stringify([...expected.output].sort((a,b)=>a-b));
  return (expected.output===undefined||JSON.stringify(actual.output)===JSON.stringify(expected.output))&&(expected.result===undefined||actual.result===expected.result);
}
