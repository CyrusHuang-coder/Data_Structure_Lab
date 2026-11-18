export const defaultPaneWeights=[38,38,24];
export const paneMinimums=[240,240,210];
export function normalizePaneWeights(value){
  if(!Array.isArray(value)||value.length!==3||value.some(n=>!Number.isFinite(n)||n<=0))return [...defaultPaneWeights];
  const sum=value.reduce((a,b)=>a+b,0);if(!Number.isFinite(sum))return [...defaultPaneWeights];const normalized=value.map(n=>n/sum*100);return normalized.some(n=>n<=0)?[...defaultPaneWeights]:normalized;
}
export function fitPaneWidths(weights,total,minimums){
  if(total<=0)return weights.map(()=>0);
  const minimumTotal=minimums.reduce((a,b)=>a+b,0);
  if(minimumTotal>total)return minimums.map(n=>n/minimumTotal*total);
  const result=weights.map(()=>0),remaining=new Set(weights.map((_,i)=>i));let budget=total;
  while(remaining.size){
    const sum=[...remaining].reduce((s,i)=>s+weights[i],0);
    const clipped=[...remaining].filter(i=>budget*weights[i]/sum<minimums[i]);
    if(!clipped.length){for(const i of remaining)result[i]=budget*weights[i]/sum;break;}
    for(const i of clipped){result[i]=minimums[i];budget-=minimums[i];remaining.delete(i);}
  }
  return result;
}
export function movePaneDivider(widths,index,delta,minimums){
  const result=[...widths],sum=widths[index]+widths[index+1];
  const left=Math.max(minimums[index],Math.min(sum-minimums[index+1],widths[index]+delta));
  result[index]=left;result[index+1]=sum-left;return result;
}
