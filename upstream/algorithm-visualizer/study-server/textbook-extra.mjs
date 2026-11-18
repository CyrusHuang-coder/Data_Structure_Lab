import {add,algorithms} from './catalog.mjs';
const arrayOptions={tests:[{values:[]},{values:[1]},{values:[3,1,3,2]}]};
function register(id,title,chapter,source,options={}){add(id,title,chapter,'array',source,{...arrayOptions,...options});}
const treeValues=input=>{const nodes=(input.values||[]).filter(v=>v!==null);return nodes;};

register('adt-sequence','ADT · 同一序列的顺序与链式表示','intro',`void Solve(int a[],int n) {
    LNode *tail=head;
    for(int i=0;i<n;i++) {
        LNode *node=calloc(1,sizeof(LNode));
        node->data=a[i];
        tail->next=node;
        tail=node;
    }
    result=n;
}`,{setup:()=> 'head=calloc(1,sizeof(LNode));',nodeType:'LNode',viewKind:'list',watches:()=>['head'],serialize:()=> 'for(LNode *p=head->next;p&&ds_output_len<CAP;p=p->next)ds_output[ds_output_len++]=p->data;',summary:'将同一个逻辑序列存入链式节点，观察连续数组与非连续节点的对应关系。',complexity:'构造 O(n)',covers:['ADT 与表示'],expected:i=>({output:i.values,result:i.values.length})});
register('complexity-count','操作计数 · 双重循环','intro',`void Solve(int a[],int n) {
    count=0;
    for(int i=0;i<n;i++) {
        for(int j=0;j<=i;j++) {
            count++;
        }
    }
    result=count;
}`,{watches:()=>['count'],summary:'内层循环次数依次为 1 到 n，总次数 n(n+1)/2。count 是显式执行的计数器。',complexity:'O(n²)',covers:['时间复杂度与操作计数'],expected:i=>({result:i.values.length*(i.values.length+1)/2})});
register('list-merge','有序链表 · 原地归并','linear',`void Solve(int a[],int n) {
    for(int i=1;i<n;i++) {
        int x=a[i],j=i-1;
        while(j>=0 && a[j]>x) {a[j+1]=a[j];j--;}
        a[j+1]=x;
    }
    LNode *left=calloc(1,sizeof(LNode)),*right=calloc(1,sizeof(LNode));
    LNode *l=left,*r=right;
    for(int i=0;i<n;i++) {
        LNode *p=calloc(1,sizeof(LNode));p->data=a[i];
        if(i%2==0) {l->next=p;l=p;} else {r->next=p;r=p;}
    }
    LNode *p=left->next,*q=right->next,*tail=head;
    while(p && q) {
        if(p->data<=q->data) {tail->next=p;p=p->next;}
        else {tail->next=q;q=q->next;}
        tail=tail->next;
    }
    tail->next=p?p:q;
    free(left);free(right);
}`,{nodeType:'LNode',setup:()=> 'head=calloc(1,sizeof(LNode));',viewKind:'list',watches:()=>['head'],serialize:()=> 'for(LNode *p=head->next;p&&ds_output_len<CAP;p=p->next)ds_output[ds_output_len++]=p->data;',covers:['有序表合并'],summary:'先将输入划为两个有序链表，归并阶段复用原节点。输出按值升序。',complexity:'归并 O(n)，示例含输入排序',expected:i=>({output:[...i.values].sort((a,b)=>a-b)})});
register('doubly-list','双链表 · 构造、插入与删除','linear',`void Solve(int a[],int n) {
    dhead=calloc(1,sizeof(DNode));
    DNode *tail=dhead;
    for(int i=0;i<n;i++) {
        DNode *s=calloc(1,sizeof(DNode));
        s->data=a[i];s->prev=tail;
        tail->next=s;tail=s;
    }
    DNode *p=dhead;
    for(int j=0;j<key && p->next;j++) p=p->next;
    DNode *s=calloc(1,sizeof(DNode));
    s->data=aux[0];
    s->next=p->next;
    s->prev=p;
    if(p->next) p->next->prev=s;
    p->next=s;
    if(s->next) {
        DNode *q=s->next;
        s->next=q->next;
        if(q->next) q->next->prev=s;
        free(q);
    }
}`,{nodeType:'DNode',viewKind:'doubly',nodeLinks:['next','prev'],rootSymbol:'dhead',input:{values:[1,2,3],key:1,value:8},tests:[{values:[],key:0,value:7},{values:[1],key:0,value:9}],watches:()=>['dhead'],serialize:()=> 'for(DNode *p=dhead->next;p;p=p->next)ds_output[ds_output_len++]=p->data;',covers:['双链表基本操作'],summary:'key 个数据节点之后插入 value，再删除新节点原本的后继。观察双向链接更新的中间状态。',complexity:'定位 O(n)，修改 O(1)',expected:i=>{const a=[...i.values],k=Math.max(0,Math.min(i.key??0,a.length));a.splice(k,1,i.value??0);return {output:a};}});
register('circular-list','循环链表 · 插入与遍历','linear',`void Solve(int a[],int n) {
    head=calloc(1,sizeof(LNode));
    head->next=head;
    LNode *tail=head;
    for(int i=0;i<n;i++) {
        LNode *s=calloc(1,sizeof(LNode));
        s->data=a[i];s->next=head;
        tail->next=s;tail=s;
    }
    LNode *p=head->next;
    while(p!=head) {
        ds_output[ds_output_len++]=p->data;
        p=p->next;
    }
}`,{nodeType:'LNode',viewKind:'circular',watches:()=>['head'],serialize:()=>'',covers:['循环链表基本操作'],summary:'尾节点的 next 回到头结点。遍历终止条件是回到 head。',complexity:'O(n)',expected:i=>({output:i.values})});
register('static-list','静态链表 · 游标分配与连接','linear',`void Solve(int a[],int n) {
    for(int i=0;i<CAP-1;i++) cursor[i]=i+1;
    cursor[CAP-1]=0;
    int freeHead=1,tail=0;
    cursor[0]=0;
    for(int i=0;i<n;i++) {
        int node=freeHead;
        freeHead=cursor[freeHead];
        table[node]=a[i];
        cursor[tail]=node;
        tail=node;cursor[tail]=0;
    }
    for(int p=cursor[0];p;p=cursor[p]) ds_output[ds_output_len++]=table[p];
    result=freeHead;
}`,{watches:i=>[`cursor[0]@${i.values.length+2}`,`table[0]@${i.values.length+2}`],serialize:()=>'',covers:['静态链表与游标'],summary:'以数组下标代替地址，分别维护可用空间链与数据链。0 是头结点及空游标。',complexity:'O(n)',expected:i=>({output:i.values,result:i.values.length+1})});
register('linked-stack','链栈 · 入栈与出栈','stack',`void Solve(int a[],int n) {
    head=calloc(1,sizeof(LNode));
    for(int i=0;i<n;i++) {
        LNode *s=calloc(1,sizeof(LNode));
        s->data=a[i];s->next=head->next;head->next=s;
    }
    while(head->next) {
        LNode *p=head->next;
        ds_output[ds_output_len++]=p->data;
        head->next=p->next;
        free(p);
    }
}`,{nodeType:'LNode',viewKind:'list',watches:()=>['head'],serialize:()=>'',covers:['链栈基本操作'],summary:'头部入栈、头部出栈，输出序列反映后进先出。',complexity:'每次操作 O(1)',expected:i=>({output:[...i.values].reverse()})});
register('linked-queue','链队列 · 入队与出队','stack',`void Solve(int a[],int n) {
    head=calloc(1,sizeof(LNode));
    LNode *rear=head;
    for(int i=0;i<n;i++) {
        LNode *s=calloc(1,sizeof(LNode));s->data=a[i];
        rear->next=s;rear=s;
    }
    while(head->next) {
        LNode *p=head->next;
        ds_output[ds_output_len++]=p->data;
        head->next=p->next;
        if(rear==p) rear=head;
        free(p);
    }
}`,{nodeType:'LNode',viewKind:'list',watches:()=>['head'],serialize:()=>'',covers:['链队列基本操作'],summary:'尾部入队、头部出队。最后一个节点出队后 rear 回到头结点。',complexity:'每次操作 O(1)',expected:i=>({output:i.values})});
register('base-conversion','栈应用 · 进制转换','stack',`void Solve(int a[],int n) {
    IntStack s={0};
    int x=key;
    do {
        Push(&s,x%8);
        x/=8;
    } while(x);
    while(!StackEmpty(&s)) {
        int digit;Pop(&s,&digit);
        ds_output[ds_output_len++]=digit;
    }
}`,{input:{values:[],key:83},tests:[{values:[],key:0},{values:[],key:8}],serialize:()=>'',covers:['进制转换'],summary:'非负十进制整数转八进制，余数先入栈再逆序输出。',complexity:'O(log key)',expected:i=>({output:(i.key>>>0).toString(8).split('').map(Number)})});
register('sentinel-search','顺序查找 · 哨兵','search',`void Solve(int a[],int n) {
    a[n]=key;
    int i=0;
    while(a[i]!=key) i++;
    result=i<n?i:-1;
}`,{covers:['哨兵顺序查找'],summary:'在额外单元放置 key，循环内部省去下标边界判断。结果为 0 起始下标。',complexity:'O(n)',input:{values:[4,7,2],key:7},expected:i=>({result:i.values.indexOf(i.key)})});
register('block-search','分块查找','search',`void Solve(int a[],int n) {
    int b=3;
    result=-1;
    for(int start=0;start<n;start+=b) {
        int end=start+b<n?start+b:n;
        int max=a[start];
        for(int i=start+1;i<end;i++) if(a[i]>max)max=a[i];
        if(key<=max) {
            for(int i=start;i<end;i++) if(a[i]==key){result=i;return;}
            return;
        }
    }
}`,{covers:['分块查找'],input:{values:[2,1,3,5,4,6,9,7,8],key:7},tests:[{values:[],key:0},{values:[1],key:1}],summary:'每块最多 3 个元素，块间有序、块内可无序。先比较块最大值，再顺序查找。',complexity:'约 O(n/b+b)',expected:i=>({result:i.values.indexOf(i.key)})});

const bstSource=`TreeNode *Insert(TreeNode *p,int x) {
    if(!p) {p=calloc(1,sizeof(TreeNode));p->val=x;return p;}
    if(x<p->val)p->left=Insert(p->left,x);
    else if(x>p->val)p->right=Insert(p->right,x);
    return p;
}
TreeNode *Delete(TreeNode *p,int x) {
    if(!p)return NULL;
    if(x<p->val)p->left=Delete(p->left,x);
    else if(x>p->val)p->right=Delete(p->right,x);
    else {
        if(!p->left || !p->right) {
            TreeNode *q=p->left?p->left:p->right;free(p);return q;
        }
        TreeNode *q=p->right;
        while(q->left)q=q->left;
        p->val=q->val;p->right=Delete(p->right,q->val);
    }
    return p;
}
void Visit(TreeNode *p) {
    if(!p)return;
    Visit(p->left);ds_output[ds_output_len++]=p->val;Visit(p->right);
}
void Solve(int a[],int n) {
    for(int i=0;i<n;i++)root=Insert(root,a[i]);
    root=Delete(root,key);
    Visit(root);
}`;
register('bst','二叉排序树 · 插入与删除','search',bstSource,{setup:()=> 'root=NULL;',nodeType:'TreeNode',viewKind:'tree',watches:()=>['root'],serialize:()=>'',covers:['二叉排序树插入删除'],input:{values:[5,3,7,2,4,6,8],key:5},tests:[{values:[],key:1},{values:[1],key:1},{values:[2,1,3],key:9}],summary:'重复值忽略。删除有两个孩子的节点时用中序后继替换，最后中序输出。',complexity:'O(h) 每次操作',expected:i=>({output:[...new Set(i.values)].filter(v=>v!==i.key).sort((a,b)=>a-b)})});
register('avl','AVL · 插入与旋转','search',`int Height(TreeNode *p){return p?p->height:0;}
void Update(TreeNode *p){int l=Height(p->left),r=Height(p->right);p->height=1+(l>r?l:r);}
TreeNode *RightRotate(TreeNode *y) {
    TreeNode *x=y->left,*t=x->right;
    x->right=y;y->left=t;
    Update(y);Update(x);return x;
}
TreeNode *LeftRotate(TreeNode *x) {
    TreeNode *y=x->right,*t=y->left;
    y->left=x;x->right=t;
    Update(x);Update(y);return y;
}
TreeNode *Insert(TreeNode *p,int x) {
    if(!p){p=calloc(1,sizeof(TreeNode));p->val=x;p->height=1;return p;}
    if(x<p->val)p->left=Insert(p->left,x);
    else if(x>p->val)p->right=Insert(p->right,x);
    else return p;
    Update(p);
    int balance=Height(p->left)-Height(p->right);
    if(balance>1) {
        if(x>p->left->val)p->left=LeftRotate(p->left);
        return RightRotate(p);
    }
    if(balance < -1) {
        if(x<p->right->val)p->right=RightRotate(p->right);
        return LeftRotate(p);
    }
    return p;
}
void Visit(TreeNode *p){if(!p)return;Visit(p->left);ds_output[ds_output_len++]=p->val;Visit(p->right);}
void Solve(int a[],int n) {
    for(int i=0;i<n;i++) root=Insert(root,a[i]);
    Visit(root);
}`,{setup:()=> 'root=NULL;',nodeType:'TreeNode',viewKind:'tree',watches:()=>['root'],serialize:()=>'',covers:['AVL'],input:{values:[3,2,1,4,5,6]},tests:[{values:[]},{values:[3,1,2]},{values:[1,3,2]},{values:[1,1]}],summary:'插入后更新高度；按 LL、LR、RR、RL 情形旋转。height 字段随节点显示。',complexity:'每次插入 O(log n)',expected:i=>({output:[...new Set(i.values)].sort((a,b)=>a-b)})});
register('hash-open','哈希 · 线性探测与删除标记','search',`void Solve(int a[],int n) {
    for(int i=0;i<CAP;i++) {table[i]=0;cursor[i]=0;}
    for(int i=0;i<n;i++) {
        int h=((a[i]%37)+37)%37;
        while(cursor[h]==1 && table[h]!=a[i])h=(h+1)%37;
        table[h]=a[i];cursor[h]=1;
    }
    int h=((key%37)+37)%37,start=h;
    result=-1;
    while(cursor[h]) {
        if(cursor[h]==1 && table[h]==key){result=h;cursor[h]=2;break;}
        h=(h+1)%37;
        if(h==start)break;
    }
    for(int i=0;i<37;i++) if(cursor[i]==1)ds_output[ds_output_len++]=table[i];
}`,{watches:()=>['table[0]@37','cursor[0]@37'],serialize:()=>'',covers:['开放定址哈希'],input:{values:[1,38,75,2],key:38},tests:[{values:[],key:0},{values:[1],key:8}],summary:'容量 37，线性探测；cursor 为 0 空、1 有值、2 墓碑。查到 key 后设置墓碑。',complexity:'平均依装载因子，最坏 O(37)',expected:i=>{const t=Array(37),state=Array(37).fill(0);for(const x of i.values){let h=((x%37)+37)%37;while(state[h]&&t[h]!==x)h=(h+1)%37;t[h]=x;state[h]=1;}let h=((i.key%37)+37)%37,start=h,r=-1;while(state[h]){if(t[h]===i.key){r=h;state[h]=0;break;}h=(h+1)%37;if(h===start)break;}return {output:t.filter((_,j)=>state[j]),result:r};}});

const graphInput={vertices:5,directed:false,edges:[[0,1,2],[0,2,5],[1,2,1],[1,3,4],[2,3,1],[3,4,3]],start:0};
add('prim','图 · Prim 最小生成树','graph','graph',`void Prim(int start) {
    for(int i=0;i<n;i++){dist[i]=1000000;parent[i]=-1;}
    dist[start]=0;result=0;
    for(int k=0;k<n;k++) {
        int u=-1;
        for(int i=0;i<n;i++)if(!visited[i]&&(u<0||dist[i]<dist[u]))u=i;
        if(u<0||dist[u]==1000000){result=-1;break;}
        visited[u]=1;result+=dist[u];
        for(Arc *p=first[u];p;p=p->next) {
            if(!visited[p->to]&&p->weight<dist[p->to]){dist[p->to]=p->weight;parent[p->to]=u;}
        }
    }
}`,{entry:'Prim',call:'Prim(key);',input:graphInput,tests:[{vertices:1,directed:false,edges:[],start:0},{vertices:3,directed:false,edges:[[0,1,2]],start:0}],covers:['Prim'],summary:'选择连接已选集合的最小权边。result 为总权值；不连通返回 -1。输入须为无向图。',complexity:'O(V²+E)',expected:i=>({result:mstWeight(i)})});
add('kruskal','图 · Kruskal 与并查集','graph','graph',`int Find(int x) {
    if(parent[x]!=x)parent[x]=Find(parent[x]);
    return parent[x];
}
void Kruskal(void) {
    int from[256],to[256],weight[256],m=0;
    for(int u=0;u<n;u++) {
        parent[u]=u;
        for(Arc *p=first[u];p;p=p->next)if(u<p->to){from[m]=u;to[m]=p->to;weight[m++]=p->weight;}
    }
    for(int i=0;i<m;i++)for(int j=i+1;j<m;j++)if(weight[i]>weight[j]) {
        int t=weight[i];weight[i]=weight[j];weight[j]=t;
        t=from[i];from[i]=from[j];from[j]=t;t=to[i];to[i]=to[j];to[j]=t;
    }
    result=0;int accepted=0;
    for(int i=0;i<m;i++) {
        int x=Find(from[i]),y=Find(to[i]);
        if(x!=y){parent[x]=y;result+=weight[i];accepted++;}
    }
    if(accepted!=n-1)result=-1;
}`,{entry:'Kruskal',call:'Kruskal();',input:graphInput,tests:[{vertices:1,directed:false,edges:[],start:0}],covers:['Kruskal'],summary:'边按权排序，以并查集排除环。示例排序采用简单比较排序以便观察。',complexity:'此教学实现边排序 O(E²)',expected:i=>({result:mstWeight(i)})});
add('floyd','图 · Floyd 全源最短路径','graph','graph',`void Floyd(void) {
    for(int i=0;i<n;i++)for(int j=0;j<n;j++)matrix[i][j]=i==j?0:1000000;
    for(int u=0;u<n;u++)for(Arc *p=first[u];p;p=p->next) {
        if(p->weight<matrix[u][p->to])matrix[u][p->to]=p->weight;
    }
    for(int k=0;k<n;k++) {
        for(int i=0;i<n;i++) {
            for(int j=0;j<n;j++) {
                if(matrix[i][k]<1000000&&matrix[k][j]<1000000&&matrix[i][j]>matrix[i][k]+matrix[k][j])matrix[i][j]=matrix[i][k]+matrix[k][j];
            }
        }
    }
    for(int i=0;i<n;i++)ds_output[ds_output_len++]=matrix[key][i];
}`,{entry:'Floyd',call:'Floyd();',input:{...graphInput,directed:true},watches:i=>[`matrix[0]@${i.vertices}`],covers:['Floyd'],summary:'依次允许顶点 k 作为中间点。工作表显示距离矩阵；输出 start 行。无负环输入。',complexity:'O(V³)',expected:i=>{const d=Array.from({length:i.vertices},(_,u)=>Array.from({length:i.vertices},(_,v)=>u===v?0:1000000));for(const[u,v,w=1]of i.edges){d[u][v]=Math.min(d[u][v],w);if(!i.directed)d[v][u]=Math.min(d[v][u],w);}for(let k=0;k<d.length;k++)for(let u=0;u<d.length;u++)for(let v=0;v<d.length;v++)if(d[u][k]<1000000&&d[k][v]<1000000)d[u][v]=Math.min(d[u][v],d[u][k]+d[k][v]);return {output:d[i.start??0]};}});
add('critical-path','图 · AOE 网关键路径','graph','graph',`void CriticalPath(void) {
    for(int u=0;u<n;u++)for(Arc *p=first[u];p;p=p->next)parent[p->to]++;
    qhead=0;qtail=0;
    for(int u=0;u<n;u++)if(!parent[u])queue[qtail++]=u;
    while(qhead<qtail) {
        int u=queue[qhead++];
        for(Arc *p=first[u];p;p=p->next) {
            if(dist[p->to]<dist[u]+p->weight)dist[p->to]=dist[u]+p->weight;
            if(--parent[p->to]==0)queue[qtail++]=p->to;
        }
    }
    if(qtail<n){result=-1;return;}
    int duration=0;
    for(int u=0;u<n;u++)if(dist[u]>duration)duration=dist[u];
    for(int u=0;u<n;u++)aux[u]=duration;
    for(int i=qtail-1;i>=0;i--) {
        int u=queue[i];
        for(Arc *p=first[u];p;p=p->next)if(aux[u]>aux[p->to]-p->weight)aux[u]=aux[p->to]-p->weight;
    }
    for(int u=0;u<n;u++)for(Arc *p=first[u];p;p=p->next)if(dist[u]==aux[p->to]-p->weight){ds_output[ds_output_len++]=u;ds_output[ds_output_len++]=p->to;}
    result=duration;
}`,{entry:'CriticalPath',call:'CriticalPath();',input:{vertices:4,directed:true,edges:[[0,1,3],[0,2,2],[1,3,4],[2,3,2]],start:0},watches:i=>[`aux[0]@${i.vertices}`],covers:['关键路径'],summary:'先拓扑求事件最早时间，再逆序求最迟时间；输出关键活动的端点对。result 为工期，环返回 -1。',complexity:'O(V+E)',expected:i=>criticalOracle(i)});

function mstWeight(input){const n=input.vertices,seen=new Set([input.start??0]);let sum=0;while(seen.size<n){let best=null;for(const[u,v,w=1]of input.edges){if(seen.has(u)&&!seen.has(v)&&(!best||w<best[1]))best=[v,w];if(seen.has(v)&&!seen.has(u)&&(!best||w<best[1]))best=[u,w];}if(!best)return -1;seen.add(best[0]);sum+=best[1];}return sum;}
function criticalOracle(input){const n=input.vertices,adj=Array.from({length:n},()=>[]),ind=Array(n).fill(0);for(const[u,v,w=1]of input.edges){adj[u].push([v,w]);ind[v]++;}const q=[];ind.forEach((d,i)=>{if(!d)q.push(i);});const ve=Array(n).fill(0);for(let k=0;k<q.length;k++){const u=q[k];for(const[v,w]of adj[u]){ve[v]=Math.max(ve[v],ve[u]+w);if(--ind[v]===0)q.push(v);}}if(q.length!==n)return {result:-1,output:[]};const duration=Math.max(...ve),vl=Array(n).fill(duration);for(const u of [...q].reverse())for(const[v,w]of adj[u])vl[u]=Math.min(vl[u],vl[v]-w);const out=[];adj.forEach((edges,u)=>edges.forEach(([v,w])=>{if(ve[u]===vl[v]-w)out.push(u,v);}));return {result:duration,output:out};}

register('huffman','哈夫曼树 · 构造与 WPL','tree',`void Solve(int a[],int n) {
    for(int i=0;i<n;i++){weights[i]=a[i];parent[i]=-1;leftChild[i]=-1;rightChild[i]=-1;}
    result=0;
    for(int k=n;k<2*n-1;k++) {
        int x=-1,y=-1;
        for(int i=0;i<k;i++)if(parent[i]==-1) {
            if(x==-1 || weights[i]<weights[x]){y=x;x=i;}
            else if(y==-1 || weights[i]<weights[y])y=i;
        }
        weights[k]=weights[x]+weights[y];parent[k]=-1;
        leftChild[k]=x;rightChild[k]=y;parent[x]=parent[y]=k;
        result+=weights[k];
    }
    for(int i=0;i<n;i++) {
        int code=0,length=0;
        for(int v=i;parent[v]>=0;v=parent[v]) {
            if(rightChild[parent[v]]==v)code|=1u<<length;
            length++;
        }
        table[i]=code;cursor[i]=length;
    }
}`,{watches:i=>[`weights[0]@${Math.max(1,i.values.length*2-1)}`,`parent[0]@${Math.max(1,i.values.length*2-1)}`,`leftChild[0]@${Math.max(1,i.values.length*2-1)}`,`rightChild[0]@${Math.max(1,i.values.length*2-1)}`,`table[0]@${Math.max(1,i.values.length)}`,`cursor[0]@${Math.max(1,i.values.length)}`],serialize:()=> 'for(int i=0;i<n;i++){ds_output[ds_output_len++]=table[i];ds_output[ds_output_len++]=cursor[i];}',input:{values:[5,9,12,13,16,45]},tests:[{values:[]},{values:[7]},{values:[1,1,2]}],covers:['哈夫曼树与编码'],summary:'每轮合并两个最小无父节点，累加合并权值得到 WPL；table 保存编码数值，cursor 保存位数，含前导零。单叶树采用长度 0 的空编码。',complexity:'此选择实现 O(n²)',expected:i=>{const nodes=i.values.map((w,index)=>({w,index,parent:-1}));let sum=0;while(nodes.filter(p=>p.parent===-1).length>1){const q=nodes.filter(p=>p.parent===-1).sort((a,b)=>a.w-b.w||a.index-b.index),left=q[0],right=q[1],index=nodes.length;left.parent=right.parent=index;const w=left.w+right.w;nodes.push({w,index,parent:-1,left:left.index,right:right.index});sum+=w;}const output=[];for(let j=0;j<i.values.length;j++){let code=0,length=0;for(let v=j;nodes[v].parent>=0;v=nodes[v].parent){if(nodes[nodes[v].parent].right===v)code+=2**length;length++;}output.push(code,length);}return {result:sum,output};}});

export const extraAlgorithmIds=algorithms.filter(a=>a.covers).map(a=>a.id);
