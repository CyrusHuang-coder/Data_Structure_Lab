import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { debuggerPath } from './compiler.mjs';

// GDB/MI recursive values: strings, tuples, lists and repeated result keys.
export function parseMI(text) {
  let i = 0;
  const ws = () => { while (/\s/.test(text[i] || '') && i < text.length) i++; };
  function string() {
    i++; let out = '';
    while (i < text.length) {
      const c = text[i++];
      if (c === '"') break;
      if (c !== '\\') { out += c; continue; }
      const e = text[i++];
      if (/[0-7]/.test(e)) {
        let oct = e;
        while (oct.length < 3 && /[0-7]/.test(text[i] || 'x')) oct += text[i++];
        out += String.fromCharCode(parseInt(oct, 8));
      } else out += ({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f','"':'"','\\':'\\'}[e] ?? e);
    }
    return out;
  }
  function key() { const start = i; while (i < text.length && /[\w-]/.test(text[i])) i++; return text.slice(start, i); }
  function value() {
    ws();
    if (text[i] === '"') return string();
    if (text[i] === '{') { i++; return results('}'); }
    if (text[i] === '[') {
      i++; const arr = [];
      while (i < text.length && text[i] !== ']') {
        const start = i; const k = key();
        if (k && text[i] === '=') { i++; arr.push({[k]: value()}); }
        else { i = start; arr.push(value()); }
        if (text[i] === ',') i++; else break;
      }
      if (text[i] === ']') i++;
      return arr;
    }
    const start = i; while (i < text.length && !/[,}\]]/.test(text[i])) i++;
    return text.slice(start, i);
  }
  function results(end) {
    const out = {};
    while (i < text.length && text[i] !== end) {
      const k = key(); if (!k || text[i] !== '=') break;
      i++; const v = value();
      if (Object.hasOwn(out,k)) out[k] = [].concat(out[k],v); else out[k] = v;
      if (text[i] === ',') i++; else break;
    }
    if (end && text[i] === end) i++;
    return out;
  }
  return results();
}

export class MI {
  constructor(executable, cwd, signal) {
    this.proc = spawn(debuggerPath, ['-q','-nx','--interpreter=mi2',executable], {cwd,windowsHide:true});
    this.token = 0; this.pending = new Map(); this.stops = []; this.waiters = []; this.stdout = ''; this.console = '';
    this.exit = new Promise(resolve => this.proc.once('close', resolve));
    this.onAbort = () => this.close();
    this.signal = signal; signal?.addEventListener('abort',this.onAbort,{once:true});
    readline.createInterface({input:this.proc.stdout}).on('line', line => this.line(line));
    this.proc.stderr.on('data',chunk => {this.console += chunk.toString();});
    this.proc.on('error', e => this.fail(e));
    this.proc.on('close', () => this.fail(new Error('调试器已退出')));
  }
  fail(error) {
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(error); }
    this.pending.clear();
    for(const w of this.waiters.splice(0)) { clearTimeout(w.timer); w.resolve({reason:'exited'}); }
  }
  line(line) {
    const m = /^(\d+)\^(\w+)(?:,(.*))?$/.exec(line);
    if (m) {
      const p = this.pending.get(+m[1]);
      if(p) { clearTimeout(p.timer); this.pending.delete(+m[1]); const data=parseMI(m[3]||'');
        m[2]==='error' ? p.reject(new Error(data.msg||'GDB error')) : p.resolve(data); }
    } else if(line.startsWith('*stopped,')) {
      const stop=parseMI(line.slice(9)), w=this.waiters.shift();
      if(w) {clearTimeout(w.timer);w.resolve(stop);} else this.stops.push(stop);
    } else if(line.startsWith('@"')) this.stdout += parseMI(`v=${line.slice(1)}`).v||'';
    else if(line.startsWith('~"')) this.console += parseMI(`v=${line.slice(1)}`).v||'';
    else if(line && !/^[=~*&^]|^\(gdb\)/.test(line)) this.stdout += line+'\n';
  }
  cmd(text) {
    return new Promise((resolve,reject) => {
      const token=++this.token;
      const timer=setTimeout(()=>{this.pending.delete(token);reject(new Error('GDB 命令超时：'+text));},5000);
      this.pending.set(token,{resolve,reject,timer});
      this.proc.stdin.write(token+text+'\n');
    });
  }
  stop() {
    if(this.stops.length) return Promise.resolve(this.stops.shift());
    return new Promise(resolve=>{const w={resolve};w.timer=setTimeout(()=>{this.waiters=this.waiters.filter(x=>x!==w);resolve({reason:'timeout'});},5000);this.waiters.push(w);});
  }
  async advance(command='-exec-step') {await this.cmd(command);return this.stop();}
  async eval(expression) {try {return (await this.cmd('-data-evaluate-expression '+JSON.stringify(expression))).value;} catch {return null;}}
  async inspect(expression, depth=1, max=64) {
    let root;
    try {
      root=await this.cmd('-var-create - * '+JSON.stringify(expression));
      const walk=async(obj,level)=>{
        const result={type:obj.type,value:obj.value};
        if(+obj.numchild && level>0 && !(/^0x[\da-f]+/i.test(obj.value||'') && !obj.type?.includes('['))) {
          const r=await this.cmd(`-var-list-children --all-values ${obj.name} 0 ${max}`);
          result.children=[];
          for(const entry of r.children||[]) {const c=entry.child||entry;result.children.push({name:c.exp,...await walk(c,level-1)});}
        }
        return result;
      };
      return await walk(root,depth);
    } catch {return {value:'不可用',validity:'unknown'};}
    finally {if(root?.name) await this.cmd('-var-delete '+root.name).catch(()=>{});}
  }
  close() {
    if(this.closed)return;this.closed=true;
    this.signal?.removeEventListener('abort',this.onAbort);
    if(this.proc.exitCode!==null)return;
    this.proc.stdin.end('999999-gdb-exit\n');
    const timer=setTimeout(()=>{
      if(this.proc.exitCode!==null)return;
      if(process.platform==='win32'){
        const killer=spawn('taskkill',['/PID',String(this.proc.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
        killer.on('error',()=>this.proc.kill());killer.on('close',()=>{if(this.proc.exitCode===null)this.proc.kill();});
      }else this.proc.kill('SIGKILL');
    },800);
    timer.unref();this.proc.once('close',()=>clearTimeout(timer));
  }
}
