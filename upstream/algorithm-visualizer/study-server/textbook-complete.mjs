import {add} from './catalog.mjs';

add('expression','栈应用 · 中缀表达式求值','stack','string',`int Priority(char op){return op=='+'||op=='-'?1:op=='*'||op=='/'?2:0;}
int Apply(int a,int b,char op){if(op=='+')return a+b;if(op=='-')return a-b;if(op=='*')return a*b;return a/b;}
int Evaluate(char *s) {
    int nums[CAP],nt=0;char ops[CAP];int ot=0;
    for(int i=0;s[i];) {
        if(s[i]==' '){i++;continue;}
        if(s[i]>='0'&&s[i]<='9') {
            int x=0;while(s[i]>='0'&&s[i]<='9'){x=x*10+s[i]-'0';i++;}nums[nt++]=x;
        } else if(s[i]=='('){ops[ot++]=s[i++];}
        else if(s[i]==')') {
            while(ot&&ops[ot-1]!='('){int b=nums[--nt],a=nums[--nt];nums[nt++]=Apply(a,b,ops[--ot]);}
            ot--;i++;
        } else {
            char op=s[i++];
            while(ot&&Priority(ops[ot-1])>=Priority(op)){int b=nums[--nt],a=nums[--nt];nums[nt++]=Apply(a,b,ops[--ot]);}
            ops[ot++]=op;
        }
    }
    while(ot){int b=nums[--nt],a=nums[--nt];nums[nt++]=Apply(a,b,ops[--ot]);}
    return nums[0];
}`,{entry:'Evaluate',call:'result=Evaluate(text);',input:{text:'3 + 4 * (2 + 1)',pattern:''},tests:[{text:'0'},{text:'(8-2)/3'},{text:'12+3*4'}],covers:['表达式求值'],summary:'数字栈与运算符栈配合处理优先级。支持非负整数字面量、二元 + - * / 和括号，除法向零截断。',complexity:'O(表达式长度)',validate:i=>evaluateExpression(i.text),expected:i=>({result:evaluateExpression(i.text)})});

export function evaluateExpression(text){
  if(typeof text!=='string'||!text.trim()||/[^\d\s+*/()\-]/.test(text))throw new Error('表达式只支持整数、二元四则运算与括号');
  const tokens=text.match(/\d+|[^\s]/g)||[];let pos=0;
  function primary(){const t=tokens[pos++];if(t==='('){const v=expr();if(tokens[pos++]!==')')throw new Error('括号不匹配');return v;}if(!/^\d+$/.test(t||''))throw new Error('需要数字或左括号，不支持一元负号');const v=+t;if(v>100000)throw new Error('字面量过大');return v;}
  function term(){let v=primary();while(['*','/'].includes(tokens[pos])){const op=tokens[pos++],w=primary();if(op==='/'&&!w)throw new Error('除数不能为 0');v=op==='*'?v*w:Math.trunc(v/w);if(Math.abs(v)>1000000)throw new Error('中间结果超出教学范围');}return v;}
  function expr(){let v=term();while(['+','-'].includes(tokens[pos])){const op=tokens[pos++],w=term();v=op==='+'?v+w:v-w;if(Math.abs(v)>1000000)throw new Error('中间结果超出教学范围');}return v;}
  const result=expr();if(pos!==tokens.length)throw new Error('表达式包含多余符号');return result;
}

add('maze','栈与回溯 · 迷宫求解','stack','array',`int Search(int cell) {
    if(cell<0||cell>=n||a[cell]||visited[cell])return 0;
    visited[cell]=1;queue[qtail++]=cell;
    if(cell==n-1)return 1;
    int r=cell/cols,c=cell%cols;
    if(c+1<cols&&Search(cell+1))return 1;
    if(r+1<rows&&Search(cell+cols))return 1;
    if(c>0&&Search(cell-1))return 1;
    if(r>0&&Search(cell-cols))return 1;
    qtail--;
    return 0;
}
void Solve(int a[],int n) {
    result=Search(0);
    for(int i=0;i<qtail;i++)ds_output[ds_output_len++]=queue[i];
}`,{input:{values:[0,0,1,0,1,0,0,0,0],rows:3,cols:3},tests:[{values:[0],rows:1,cols:1},{values:[1],rows:1,cols:1},{values:[0,1,1,0],rows:2,cols:2}],setup:i=>`rows=${i.rows};cols=${i.cols};`,serialize:()=>'',watches:()=>['visited[0]@32','queue[0]@32','qtail','rows','cols'],covers:['迷宫求解'],summary:'0 为可行格、1 为墙，从左上到右下。按右下左上顺序回溯，queue 保存当前路径的行优先下标。',complexity:'O(格子数)',expected:i=>{const seen=new Set(),path=[];function visit(p){if(p<0||p>=i.values.length||i.values[p]||seen.has(p))return false;seen.add(p);path.push(p);if(p===i.values.length-1)return true;const r=Math.floor(p/i.cols),c=p%i.cols;for(const q of [c+1<i.cols?p+1:-1,r+1<i.rows?p+i.cols:-1,c>0?p-1:-1,r>0?p-i.cols:-1])if(q>=0&&visit(q))return true;path.pop();return false;}const found=visit(0);return {result:+found,output:found?path:[]};}});

add('block-string','块链串 · 分块存储与遍历','string','string',`void Solve(void) {
    CharBlock *tail=NULL;
    int len=(int)strlen(text);
    for(int i=0;i<len;i+=4) {
        CharBlock *p=calloc(1,sizeof(CharBlock));
        for(int j=0;j<4&&i+j<len;j++)p->data[p->len++]=text[i+j];
        if(tail)tail->next=p;else strHead=p;
        tail=p;
    }
    result=0;
    for(CharBlock *p=strHead;p;p=p->next) {
        for(int j=0;j<p->len;j++)ds_output[ds_output_len++]=(unsigned char)p->data[j];
        result+=p->len;
    }
}`,{call:'Solve();',input:{text:'DataStructure',pattern:''},tests:[{text:''},{text:'abc'},{text:'abcd'}],nodeType:'CharBlock',viewKind:'block-string',rootSymbol:'strHead',watches:()=>['strHead'],serialize:()=>'',covers:['块链串'],summary:'每个块容纳 4 个字符，通过 next 连接；末块 len 表示有效字符数。输出 ASCII 值。',complexity:'O(n)',expected:i=>({result:i.text.length,output:[...i.text].map(c=>c.charCodeAt(0))})});

add('sparse-arithmetic','稀疏矩阵 · 加法与乘法','array','array',`void Solve(int a[],int n) {
    for(int i=0;i<rows;i++)for(int j=0;j<rows;j++) {
        int value=0;
        for(int k=0;k<rows;k++) {
            if(a[i*rows+k]&&a[k*rows+j])value+=a[i*rows+k]*a[k*rows+j];
        }
        matrix[i][j]=value;
        table[i*rows+j]=a[i*rows+j]+a[i*rows+j];
    }
    for(int i=0;i<rows;i++)for(int j=0;j<rows;j++)ds_output[ds_output_len++]=matrix[i][j];
}`,{input:{values:[1,0,2,0,3,0,4,0,5],rows:3},tests:[{values:[0],rows:1},{values:[1,0,0,1],rows:2}],setup:i=>`rows=${i.rows};`,serialize:()=>'',watches:()=>['matrix[0]@8','table[0]@32','rows'],covers:['稀疏矩阵加乘'],summary:'以单矩阵演示 A+A 与 A×A，零因子跳过乘法。table 保存和，matrix 保存积；输出积。',complexity:'本直接实现 O(r³)',expected:i=>{const r=i.rows,out=[];for(let u=0;u<r;u++)for(let v=0;v<r;v++){let x=0;for(let k=0;k<r;k++)x+=i.values[u*r+k]*i.values[k*r+v];out.push(x);}return {output:out};}});
add('cross-matrix','稀疏矩阵 · 十字链表','array','array',`void Solve(int a[],int n) {
    CrossNode *rowTail[8]={0},*colTail[8]={0};
    for(int i=0;i<rows;i++)for(int j=0;j<cols;j++) {
        int x=a[i*cols+j];if(!x)continue;
        CrossNode *p=calloc(1,sizeof(CrossNode));p->row=i;p->col=j;p->val=x;
        if(rowTail[i])rowTail[i]->right=p;else rowHead[i]=p;
        if(colTail[j])colTail[j]->down=p;else colHead[j]=p;
        rowTail[i]=colTail[j]=p;
    }
    for(int i=0;i<rows;i++)for(CrossNode *p=rowHead[i];p;p=p->right)aux[p->row*cols+p->col]=p->val;
    for(int k=0;k<n;k++)ds_output[ds_output_len++]=aux[k];
}`,{input:{values:[0,2,0,3,0,4],rows:2,cols:3},tests:[{values:[0],rows:1,cols:1},{values:[1,0,0,2],rows:2,cols:2}],setup:i=>`rows=${i.rows};cols=${i.cols};`,serialize:()=>'',nodeType:'CrossNode',viewKind:'cross-matrix',nodeLinks:['right','down'],watches:()=>['rowHead[0]@8','colHead[0]@8'],covers:['十字链表'],coverageChapter:'array',summary:'每个非零元素同时属于一条行链和一条列链。right 向同行，down 向同列。',complexity:'O(rows×cols) 构建，存储 O(非零数)',expected:i=>({output:i.values})});

const graph={vertices:4,directed:true,edges:[[0,1,2],[0,2,3],[1,3,4],[2,3,1]],start:0};
add('matrix-graph','图 · 邻接矩阵与度数','graph','graph',`void Solve(void) {
    for(int u=0;u<n;u++) {
        int out=0,in=0;
        for(int v=0;v<n;v++){if(matrix[u][v])out++;if(matrix[v][u])in++;}
        dist[u]=out;parent[u]=in;ds_output[ds_output_len++]=out;
    }
}`,{call:'Solve();',input:graph,tests:[{vertices:1,directed:true,edges:[],start:0}],watches:i=>[`matrix[0]@${i.vertices}`],covers:['邻接矩阵基本操作'],summary:'矩阵单元保存边权；此表示以 0 表示无边，故本模板要求非零权。dist 为出度，parent 为入度。',complexity:'O(V²)',expected:i=>({output:Array.from({length:i.vertices},(_,u)=>{const set=new Set();for(const[a,b]of i.edges){if(a===u)set.add(b);if(!i.directed&&b===u)set.add(a);}return set.size;})})});
add('orthogonal-graph','有向图 · 十字链表','graph','graph',`void Solve(void) {
    for(int u=0;u<n;u++)for(Arc *a=first[u];a;a=a->next) {
        OrthEdge *p=calloc(1,sizeof(OrthEdge));p->tail=u;p->head=a->to;p->weight=a->weight;
        p->tlink=outHead[u];outHead[u]=p;
        p->hlink=inHead[p->head];inHead[p->head]=p;
    }
    for(int v=0;v<n;v++) {
        int in=0;for(OrthEdge *p=inHead[v];p;p=p->hlink)in++;
        ds_output[ds_output_len++]=in;
    }
}`,{call:'Solve();',input:graph,tests:[{vertices:1,directed:true,edges:[],start:0}],nodeType:'OrthEdge',viewKind:'orthogonal',nodeLinks:['tlink','hlink'],watches:i=>[`outHead[0]@${i.vertices}`,`inHead[0]@${i.vertices}`],covers:['十字链表'],coverageChapter:'graph',summary:'边记录被出边链和入边链共享。tlink 连接同尾顶点的边，hlink 连接同头顶点的边。输出各顶点入度。',complexity:'O(V+E)',expected:i=>({output:Array.from({length:i.vertices},(_,v)=>i.edges.filter(e=>e[1]===v).length)})});
add('adjacency-multilist','无向图 · 邻接多重表','graph','graph',`void Solve(void) {
    for(int u=0;u<n;u++)for(Arc *a=first[u];a;a=a->next)if(u<a->to) {
        MultiEdge *p=calloc(1,sizeof(MultiEdge));p->ivex=u;p->jvex=a->to;p->weight=a->weight;
        p->ilink=edgeHead[u];p->jlink=edgeHead[a->to];edgeHead[u]=edgeHead[a->to]=p;
    }
    for(int u=0;u<n;u++) {
        int degree=0;
        for(MultiEdge *p=edgeHead[u];p;p=p->ivex==u?p->ilink:p->jlink)degree++;
        ds_output[ds_output_len++]=degree;
    }
}`,{call:'Solve();',input:{...graph,directed:false},tests:[{vertices:1,directed:false,edges:[],start:0}],nodeType:'MultiEdge',viewKind:'multilist',nodeLinks:['ilink','jlink'],watches:i=>[`edgeHead[0]@${i.vertices}`],covers:['邻接多重表'],summary:'一条无向边只保留一个记录，按当前端点选择 ilink 或 jlink。模板输入不含自环。输出度数。',complexity:'O(V+E)',expected:i=>({output:Array.from({length:i.vertices},(_,u)=>i.edges.filter(([a,b])=>a===u||b===u).length)})});
add('spanning-forest','图 · DFS 生成森林','graph','graph',`void DFS(int u) {
    visited[u]=1;ds_output[ds_output_len++]=u;
    for(Arc *p=first[u];p;p=p->next)if(!visited[p->to]) {
        parent[p->to]=u;DFS(p->to);
    }
}
void Solve(void) {
    for(int u=0;u<n;u++)parent[u]=-1;
    result=0;
    for(int u=0;u<n;u++)if(!visited[u]){result++;DFS(u);}
}`,{call:'Solve();',input:{vertices:6,directed:false,edges:[[0,1],[0,2],[3,4]],start:0},tests:[{vertices:1,directed:false,edges:[],start:0}],covers:['生成树与森林'],summary:'每次从尚未访问顶点启动 DFS，得到一个分量的生成树；parent 保存树边，result 为树的数量。',complexity:'O(V+E)',expected:i=>{const adj=Array.from({length:i.vertices},()=>[]);for(const[u,v]of i.edges){adj[u].push(v);if(!i.directed)adj[v].push(u);}const seen=new Set(),out=[];let roots=0;const dfs=u=>{seen.add(u);out.push(u);for(const v of adj[u])if(!seen.has(v))dfs(v);};for(let u=0;u<i.vertices;u++)if(!seen.has(u)){roots++;dfs(u);}return {output:out,result:roots};}});

add('nearly-optimal-tree','静态查找 · 次优查找树','search','array',`TreeNode *Build(int l,int r) {
    if(l>=r)return NULL;
    int best=l,difference=INT_MAX;
    for(int k=l;k<r;k++) {
        int left=0,right=0;
        for(int i=l;i<k;i++)left+=weights[i];
        for(int i=k+1;i<r;i++)right+=weights[i];
        int d=left>right?left-right:right-left;
        if(d<difference){difference=d;best=k;}
    }
    TreeNode *p=calloc(1,sizeof(TreeNode));p->val=a[best];
    p->left=Build(l,best);p->right=Build(best+1,r);return p;
}
void Solve(int a[],int n) {
    root=Build(0,n);
    TreeNode *p=root;result=-1;
    while(p){count++;if(p->val==key){result=p->val;return;}p=key<p->val?p->left:p->right;}
}`,{input:{values:[1,2,3,4,5],weights:[1,1,8,1,1],key:3},tests:[{values:[],weights:[],key:0},{values:[1],weights:[2],key:1}],setup:i=>`int w[]={${(i.weights?.length?i.weights:[0]).join(',')}};for(int i=0;i<n;i++)weights[i]=w[i];`,nodeType:'TreeNode',viewKind:'tree',watches:()=>['root','weights[0]@32','count'],covers:['次优查找树'],summary:'输入键严格升序，weights 为查找频率。选择左右累计权重最接近的根。result 返回查到的键或 -1。',complexity:'此直接计算教学实现最坏 O(n³)',expected:i=>({result:i.values.includes(i.key)?i.key:-1})});
