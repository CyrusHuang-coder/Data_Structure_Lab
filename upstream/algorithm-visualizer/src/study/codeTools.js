// Scan C tokens so braces in comments and character/string literals do not
// corrupt function templates (notably the bracket matching exercises).
export function blankSource(source,all=false){
  if(!all){
    const lines=source.split('\n');let candidate=0;
    return lines.map(line=>{
      if(!/[{}]/.test(line)&&/\breturn\b|->next\s*=|\ba\[.*\]\s*=|\bdist\[.*\]\s*=/.test(line)&&!line.trim().startsWith('//')){
        if(candidate++%3===0)return '    /* TODO：补全此处关键语句 */';
      }
      return line;
    }).join('\n');
  }
  let state='code',depth=0,start=0,out='',erase=false;
  for(let i=0;i<source.length;i++){
    const c=source[i],next=source[i+1];
    if(state==='line'){if(c==='\n')state='code';continue;}
    if(state==='comment'){if(c==='*'&&next==='/'){state='code';i++;}continue;}
    if(state==='string'||state==='char'){if(c==='\\'){i++;continue;}if(c===(state==='string'?'"':"'"))state='code';continue;}
    if(c==='/'&&next==='/'){state='line';i++;continue;}
    if(c==='/'&&next==='*'){state='comment';i++;continue;}
    if(c==='"'){state='string';continue;}if(c==="'"){state='char';continue;}
    if(c==='{'){if(depth++===0){erase=/\)\s*$/.test(source.slice(0,i));if(erase)out+=source.slice(start,i+1)+'\n    /* TODO：实现函数体 */\n';}}
    else if(c==='}'&&--depth===0&&erase){out+='}';start=i+1;}
  }
  return out+source.slice(start);
}
