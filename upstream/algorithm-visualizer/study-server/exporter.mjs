import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';import os from 'node:os';
import {runtime,adt} from './runtime.mjs';import {compile,command} from './compiler.mjs';
import {buildHarness} from './catalog.mjs';import {quickC} from './runner.mjs';

const headers='#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n#include <limits.h>\n#define CAP 128\n';
const simpleTypes=`typedef int Status;\n#define OK 1\n#define ERROR 0\n#define OVERFLOW -2\ntypedef struct LNode {int data;struct LNode *next;} LNode,*LinkList;\n`;
const stackTypes=linked=>(linked?'typedef struct {LNode *top;int size;} IntStack;\ntypedef struct {LNode *front,*rear;int size;} IntQueue;\n':'typedef struct {int data[CAP];int top;} IntStack;\ntypedef struct {int data[CAP];int front,rear;} IntQueue;\n')+'typedef struct {int data[CAP];int length;} SqList;\n';

export async function exportCode(source,algorithm,{implementation='sequential'}={}) {
  if(typeof source!=='string'||source.length>100000)throw new Error('代码长度不合法');
  let code,provided='';
  if(algorithm?.problemNumber){
    const usesADT=/\b(Push|Pop|GetTop|StackEmpty|EnQueue|DeQueue|ListInsert|ListDelete|IntStack|IntQueue)\b/.test(source);
    code=headers+(usesADT?simpleTypes+stackTypes(implementation==='linked')+(implementation==='linked'?'#define DS_LINKED_ADT 1\n':'')+adt+'\n':'')+source;
    if(!/struct\s+ListNode\s*\{/.test(source))provided+='struct ListNode {int val;struct ListNode *next;};\n';
    if(!/struct\s+TreeNode\s*\{/.test(source))provided+='struct TreeNode {int val;struct TreeNode *left,*right;};\ntypedef struct TreeNode TreeNode;\n';
  }else code=(implementation==='linked'?'#define DS_LINKED_ADT 1\n':'')+runtime.replace(/^#define (malloc|calloc|realloc|free) .*$/gm,'').replace(/__attribute__\(\(constructor\)\) static void ds_bind_io\(void\) \{[^}]*\}/,'')+'\n'+adt+'\n'+source;
  const dir=await mkdtemp(path.join(os.tmpdir(),'ds-export-'));
  try {
    const verification=headers+provided+code+(/\bmain\s*\(/.test(source)?'':'\nint main(void){return 0;}');
    const check=await compile(verification,dir);
    if(check.code!==0)return {ok:false,code,diagnostics:check.stderr,notice:'导出代码独立编译未通过，请先检查诊断。'};
    let behaviorVerified=false,behaviorDiagnostics='';
    if(algorithm){
      const built=buildHarness(algorithm,algorithm.input,{implementation});
      const support=algorithm.problemNumber?`\ntypedef struct VerifyArc {int to,weight;struct VerifyArc *next;} Arc;
int a[CAP],aux[CAP],n,m,key,result,ds_output[CAP],ds_output_len,ds_memory_error,ds_invariant_error;
struct TreeNode *root;struct ListNode *lc_head;Arc *first[16];
int matrix[128][16],visited[CAP],dist[CAP],parent[CAP],queue[CAP],qhead,qtail,next[CAP];
char text[CAP],pattern[CAP];void ds_finish(void){}\n`:'';
      const standalone=await compile(headers+provided+code+support+built.harness,dir);
      if(standalone.code!==0)return {ok:false,code,diagnostics:standalone.stderr,notice:'导出后的原题接口调用未编译通过。'};
      const run=await command(standalone.executable,[],{cwd:dir,timeout:2000});
      const original=await quickC({source,...built});
      let actual,baseline;
      try{actual=JSON.parse(run.stdout.split('DS_RESULT:').at(-1));baseline=JSON.parse(original.stdout.split('DS_RESULT:').at(-1));}catch{}
      behaviorVerified=run.code===0&&original.status==='completed'&&!!actual&&JSON.stringify(actual)===JSON.stringify(baseline);
      if(!behaviorVerified)behaviorDiagnostics='默认用例的独立运行未确认与站内一致，请先完成调试。';
    }
    return {ok:true,code,behaviorVerified,diagnostics:check.stderr+'\n'+behaviorDiagnostics,notice:behaviorVerified?'独立接口编译与默认用例运行均通过，行为与站内一致。导出不包含测试入口与追踪包装。':'代码已独立编译；运行行为尚未验证。'};
  }finally {
    const target=path.resolve(dir);if(target.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(target).startsWith('ds-export-'))await rm(target,{recursive:true,force:true,maxRetries:3,retryDelay:100});
  }
}
