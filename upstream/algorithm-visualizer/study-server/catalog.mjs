export const chapters = [
  ['intro','绪论','ADT、表示与复杂度'],['linear','线性表','顺序、链式与游标'],['stack','栈与队列','操作、应用与递归'],['string','串','存储、匹配与回退'],['array','数组与广义表','压缩、稀疏与递归结构'],['tree','树与二叉树','遍历、线索与编码'],['graph','图','遍历、路径与依赖'],['search','查找','区间、树与散列'],['sort','内部排序','比较、交换与分治'],['external','外部排序','归并段、缓冲与败者树'],['file','文件','记录、索引与块访问']
].map(([id,title,subtitle],index)=>({id,title,subtitle,index:index+1}));

export const algorithms=[];
export function add(id,title,chapter,kind,source,options={}) {
  const blockedOperations=id==='list-insert'?['ListInsert']:id==='list-delete'?['ListDelete']:[];
  algorithms.push({id,title,chapter,kind,source,entry:options.entry||'Solve',targetFunctions:[options.entry||'Solve'],blockedOperations,allowedOperations:['Push','Pop','GetTop','StackEmpty','EnQueue','DeQueue','ListInsert','ListDelete'].filter(x=>!blockedOperations.includes(x)),contentVersion:1,complexity:options.complexity||'见实现与输入规模',summary:options.summary||'',contract:options.contract||'数组下标从 0 开始。输入规模最多 32；平台构造输入并调用函数。',input:options.input||{values:[8,3,6,1,5],key:3},tests:options.tests||[],status:'implemented',...options});
}

add('list-insert','单链表 · 插入','linear','list',`Status Insert(LinkList L, int i, int e) {
    if (!L || i < 1) return ERROR;
    LNode *p = L;
    for (int j = 1; j < i && p; j++) {
        p = p->next;
    }
    if (!p) return ERROR;
    LNode *s = malloc(sizeof(LNode));
    if (!s) return OVERFLOW;
    s->data = e;
    s->next = p->next;
    p->next = s;
    return OK;
}`,{entry:'Insert',call:'result = Insert(head, key, aux[0]);',summary:'先定位前驱，再连接新节点。观察两次指针更新的先后顺序。',contract:'L 是带头结点链表。i 从 1 开始，范围 [1,长度+1]；e 是插入值。返回 OK/ERROR/OVERFLOW。',complexity:'时间 O(n)，额外空间 O(1)',input:{values:[1,3,5],position:2,value:2},tests:[{values:[],position:1,value:7},{values:[1],position:2,value:9},{values:[1],position:0,value:4}]});
add('list-delete','单链表 · 删除','linear','list',`Status Delete(LinkList L, int i) {
    if (!L || i < 1) return ERROR;
    LNode *p = L;
    for (int j = 1; j < i && p; j++) {
        p = p->next;
    }
    if (!p || !p->next) return ERROR;
    LNode *q = p->next;
    p->next = q->next;
    free(q);
    return OK;
}`,{entry:'Delete',call:'result = Delete(head, key);',summary:'用前驱绕过待删节点，再释放节点。释放的对象保留为灰色记录。',input:{values:[1,2,3,4],position:2},tests:[{values:[],position:1},{values:[1],position:1},{values:[1,2],position:3}],complexity:'时间 O(n)，额外空间 O(1)'});
add('list-reverse','单链表 · 原地逆置','linear','list',`void Reverse(LinkList L) {
    LNode *p = L->next;
    L->next = NULL;
    while (p) {
        LNode *next = p->next;
        p->next = L->next;
        L->next = p;
        p = next;
    }
}`,{entry:'Reverse',call:'Reverse(head);',summary:'保存后继后，将当前节点插到头结点后方。工作指针仍持有尚未接回的节点。',tests:[{values:[]},{values:[1]},{values:[3,3,2]}],complexity:'时间 O(n)，额外空间 O(1)'});
add('array-insert','顺序表 · 插入','linear','array',`void Solve(int a[], int n) {
    if (key < 0 || key > n) { result = ERROR; return; }
    for (int j = n; j > key; j--) {
        a[j] = a[j-1];
    }
    a[key] = aux[0];
    result = OK;
}`,{input:{values:[2,4,6],key:1,value:3},outputLength:'n + (result == OK)',summary:'从表尾向后移动，为指定下标腾出位置。key 是 0 起始插入下标。',complexity:'时间 O(n)，额外空间 O(1)'});
add('array-delete','顺序表 · 删除','linear','array',`void Solve(int a[], int n) {
    if (key < 0 || key >= n) { result = ERROR; return; }
    for (int j = key; j < n-1; j++) {
        a[j] = a[j+1];
    }
    result = OK;
}`,{input:{values:[2,4,6,8],key:1},outputLength:'n - (result == OK)',summary:'删除位置后的元素依次前移。key 是 0 起始删除下标。',complexity:'时间 O(n)，额外空间 O(1)'});

const sorts=[
['insertion','直接插入排序',`for (int i=1; i<n; i++) {
        int x=a[i], j=i-1;
        while (j>=0 && a[j]>x) {
            a[j+1]=a[j];
            j--;
        }
        a[j+1]=x;
    }`,'每轮将一个元素插入有序前缀。','O(n²)，稳定'],
['binary-insertion','折半插入排序',`for(int i=1;i<n;i++) {
        int x=a[i], l=0, r=i;
        while(l<r) {
            int m=(l+r)/2;
            if(a[m]<=x) l=m+1;
            else r=m;
        }
        for(int j=i;j>l;j--) a[j]=a[j-1];
        a[l]=x;
    }`,'折半查找插入位置，元素移动仍可能是线性的。','O(n²)，稳定'],
['bubble','冒泡排序',`for (int i=0; i<n-1; i++) {
        int changed=0;
        for (int j=0; j<n-1-i; j++) {
            if (a[j]>a[j+1]) {
                int t=a[j];
                a[j]=a[j+1];
                a[j+1]=t;
                changed=1;
            }
        }
        if(!changed) break;
    }`,'相邻比较并交换，每轮固定一个后缀元素。','O(n²)，稳定'],
['selection','简单选择排序',`for (int i=0; i<n-1; i++) {
        int m=i;
        for (int j=i+1; j<n; j++) {
            if (a[j]<a[m]) m=j;
        }
        int t=a[i];
        a[i]=a[m];
        a[m]=t;
    }`,'从未排序部分选择最小元素，交换到当前起点。','O(n²)，不稳定'],
['shell','希尔排序',`for (int gap=n/2; gap>0; gap/=2) {
        for (int i=gap; i<n; i++) {
            int x=a[i],j=i;
            while (j>=gap && a[j-gap]>x) {
                a[j]=a[j-gap];
                j-=gap;
            }
            a[j]=x;
        }
    }`,'按递减增量分组插入，最后一轮增量为 1。','复杂度依增量序列，不稳定'],
['heap','堆排序',`for(int start=n/2-1;start>=0;start--) {
        int p=start;
        while(2*p+1<n) {
            int c=2*p+1;
            if(c+1<n && a[c+1]>a[c]) c++;
            if(a[p]>=a[c]) break;
            int t=a[p];a[p]=a[c];a[c]=t;
            p=c;
        }
    }
    for(int end=n-1;end>0;end--) {
        int t=a[0];a[0]=a[end];a[end]=t;
        int p=0;
        while(2*p+1<end) {
            int c=2*p+1;
            if(c+1<end && a[c+1]>a[c]) c++;
            if(a[p]>=a[c]) break;
            t=a[p];a[p]=a[c];a[c]=t;
            p=c;
        }
    }`,'先建大根堆，再依次将堆顶交换到末尾。','O(n log n)，不稳定'],
['merge','归并排序 · 自底向上',`for(int width=1;width<n;width*=2) {
        for(int l=0;l<n;l+=2*width) {
            int m=l+width<n?l+width:n;
            int r=l+2*width<n?l+2*width:n;
            int i=l,j=m,k=l;
            while(i<m && j<r) aux[k++]=a[i]<=a[j]?a[i++]:a[j++];
            while(i<m) aux[k++]=a[i++];
            while(j<r) aux[k++]=a[j++];
            for(k=l;k<r;k++) a[k]=aux[k];
        }
    }`,'依次合并长度为 1、2、4 的有序段。辅助数组保存本轮结果。','O(n log n)，额外 O(n)，稳定'],
['radix','基数排序 · LSD',`int max=0;
    for(int i=0;i<n;i++) {
        if(a[i]<0) {result=ERROR;return;}
        if(a[i]>max) max=a[i];
    }
    for(int exp=1;max/exp>0;) {
        int count[10]={0};
        for(int i=0;i<n;i++) count[(a[i]/exp)%10]++;
        for(int i=1;i<10;i++) count[i]+=count[i-1];
        for(int i=n-1;i>=0;i--) aux[--count[(a[i]/exp)%10]]=a[i];
        for(int i=0;i<n;i++) a[i]=aux[i];
        if(exp>max/10) break;
        exp*=10;
    }`,'按个位到高位稳定分配与收集；本实现输入为非负整数。','O(d(n+10))，稳定']
];
for(const [id,title,body,summary,complexity] of sorts) add(id,title,'sort','array',`void Solve(int a[], int n) {\n    ${body}\n}`,{summary,complexity,tests:[{values:[]},{values:[7]},{values:[3,1,3,0]},{values:[5,4,3,2,1]}]});
add('quick','快速排序 · 双向划分','sort','array',`void QuickSort(int a[], int low, int high) {
    if(low>=high) return;
    int i=low,j=high,pivot=a[low];
    while(i<j) {
        while(i<j && a[j]>=pivot) j--;
        a[i]=a[j];
        while(i<j && a[i]<=pivot) i++;
        a[j]=a[i];
    }
    a[i]=pivot;
    QuickSort(a,low,i-1);
    QuickSort(a,i+1,high);
}`,{entry:'QuickSort',call:'QuickSort(a,0,n-1);',summary:'基准值单独保存，左右扫描交替填入空位，递归处理两侧。',complexity:'平均 O(n log n)，最坏 O(n²)，不稳定',tests:[{values:[]},{values:[1]},{values:[3,3,3]},{values:[5,4,3,2,1]}]});

add('linear-search','顺序查找','search','array',`int Search(int a[],int n,int target) {
    for(int i=0;i<n;i++) {
        if(a[i]==target) return i;
    }
    return -1;
}`,{entry:'Search',call:'result=Search(a,n,key);',summary:'依次比较，返回首次出现的下标；未找到返回 -1。',complexity:'O(n)',tests:[{values:[],key:1},{values:[2,2,3],key:2},{values:[1,3],key:4}]});
add('binary-search','折半查找','search','array',`int Search(int a[],int n,int target) {
    int low=0,high=n-1;
    while(low<=high) {
        int mid=low+(high-low)/2;
        if(a[mid]==target) return mid;
        if(a[mid]<target) low=mid+1;
        else high=mid-1;
    }
    return -1;
}`,{entry:'Search',call:'result=Search(a,n,key);',input:{values:[1,3,5,7,9],key:7},summary:'维护闭区间 [low,high]，每次排除一半候选。输入要求升序。',complexity:'O(log n)',tests:[{values:[],key:1},{values:[1],key:1},{values:[1,3,5],key:2}]});

add('stack-push','顺序栈 · 入栈','stack','stack',`Status Solve(IntStack *s,int value) {
    return Push(s,value);
}`,{call:'result=Solve(&stack,key);',input:{values:[2,4,6],key:8},summary:'栈顶 top 指向下一个空位置。可单步进入 ADT 的 Push。',complexity:'O(1)'});
add('stack-pop','顺序栈 · 出栈','stack','stack',`Status Solve(IntStack *s,int *out) {
    return Pop(s,out);
}`,{call:'result=Solve(&stack,&key);',input:{values:[2,4,6]},summary:'先检查空栈，再递减 top 并取值。out 是输出参数。',complexity:'O(1)'});
add('queue-enqueue','循环队列 · 入队','stack','queue',`Status Solve(IntQueue *q,int value) {
    return EnQueue(q,value);
}`,{call:'result=Solve(&fifo,key);',input:{values:[2,4,6],key:8},summary:'rear 是下一个空位，使用模运算推进。牺牲一个单元区分满与空。',complexity:'O(1)'});
add('queue-dequeue','循环队列 · 出队','stack','queue',`Status Solve(IntQueue *q,int *out) {
    return DeQueue(q,out);
}`,{call:'result=Solve(&fifo,&key);',input:{values:[2,4,6]},summary:'front 指向队首，取值后按模推进。',complexity:'O(1)'});

add('brackets','栈应用 · 括号匹配','stack','string',`int Match(const char *s) {
    IntStack st={0};
    for(int i=0;s[i];i++) {
        char c=s[i];
        if(c=='(' || c=='[' || c=='{') {
            Push(&st,c);
        } else if(c==')' || c==']' || c=='}') {
            int x;
            if(!Pop(&st,&x)) return 0;
            if((c==')' && x!='(') || (c==']' && x!='[') || (c=='}' && x!='{')) return 0;
        }
    }
    return StackEmpty(&st);
}`,{entry:'Match',call:'result=Match(text);',input:{text:'{[()]}',pattern:''},summary:'左括号入栈；右括号必须匹配当前栈顶。结束时栈应为空。',complexity:'O(n)',tests:[{text:'([)]'},{text:''},{text:'((('}]});
add('naive-match','串 · 朴素模式匹配','string','string',`int Index(const char *s,const char *p) {
    int n=(int)strlen(s),m=(int)strlen(p);
    for(int i=0;i<=n-m;i++) {
        int j=0;
        while(j<m && s[i+j]==p[j]) j++;
        if(j==m) return i;
    }
    return -1;
}`,{entry:'Index',call:'result=Index(text,pattern);',input:{text:'ababcabcacbab',pattern:'abcac'},summary:'从每个可能起点比较模式串，返回 0 起始匹配位置。',complexity:'最坏 O(nm)',tests:[{text:'abc',pattern:''},{text:'aaaaa',pattern:'b'},{text:'ab',pattern:'abc'}]});
add('kmp','串 · KMP 与 next 构造','string','string',`int KMP(const char *s,const char *p) {
    int m=(int)strlen(p);
    if(!m) return 0;
    next[0]=-1;
    int i=0,j=-1;
    while(i<m) {
        if(j==-1 || p[i]==p[j]) {
            i++;j++;
            next[i]=j;
        } else j=next[j];
    }
    i=0;j=0;
    while(s[i] && j<m) {
        if(j==-1 || s[i]==p[j]) {i++;j++;}
        else j=next[j];
    }
    return j==m?i-j:-1;
}`,{entry:'KMP',call:'result=KMP(text,pattern);',input:{text:'ababcabcacbab',pattern:'abcac'},summary:'next[0]=-1。失配时主串位置不回退，模式位置沿 next 回退。',complexity:'O(n+m)',tests:[{text:'abc',pattern:''},{text:'aaaaa',pattern:'b'},{text:'ababab',pattern:'abab'}]});

for(const [id,title,order] of [['preorder','先序遍历',[0,1,2]],['inorder','中序遍历',[1,0,2]],['postorder','后序遍历',[1,2,0]]]) {
  const ops=['ds_output[ds_output_len++]=p->val;','Traverse(p->left);','Traverse(p->right);'];
  add(id,'二叉树 · '+title,'tree','tree',`void Traverse(TreeNode *p) {\n    if(!p) return;\n    ${order.map(i=>ops[i]).join('\n    ')}\n}`,{entry:'Traverse',call:'Traverse(root);',input:{values:[1,2,3,null,4]},summary:'递归调用每层保存独立的 p。观察访问节点与左右子树调用的顺序。',complexity:'时间 O(n)，栈空间 O(h)',tests:[{values:[]},{values:[5]},{values:[1,null,2,3]}]});
}
add('tree-depth','二叉树 · 深度','tree','tree',`int Depth(TreeNode *p) {
    if(!p) return 0;
    int left=Depth(p->left);
    int right=Depth(p->right);
    return (left>right?left:right)+1;
}`,{entry:'Depth',call:'result=Depth(root);',input:{values:[1,2,3,null,4]},summary:'空树深度为 0，非空树深度为两子树最大深度加 1。',complexity:'O(n)',tests:[{values:[]},{values:[1]},{values:[1,null,2,null,3]}]});
add('tree-level','二叉树 · 层序遍历','tree','tree',`void Traverse(TreeNode *p) {
    if(!p) return;
    TreeNode *q[CAP];
    int front=0,rear=0;
    q[rear++]=p;
    while(front<rear) {
        TreeNode *u=q[front++];
        ds_output[ds_output_len++]=u->val;
        if(u->left) q[rear++]=u->left;
        if(u->right) q[rear++]=u->right;
    }
}`,{entry:'Traverse',call:'Traverse(root);',input:{values:[1,2,3,null,4]},summary:'辅助队列按发现顺序保存待访问节点。',complexity:'O(n)',tests:[{values:[]},{values:[1]},{values:[1,null,2,3]}]});
add('tree-inorder-stack','二叉树 · 非递归中序','tree','tree',`void Traverse(TreeNode *p) {
    TreeNode *s[CAP];
    int top=0;
    while(p || top) {
        while(p) {
            s[top++]=p;
            p=p->left;
        }
        p=s[--top];
        ds_output[ds_output_len++]=p->val;
        p=p->right;
    }
}`,{entry:'Traverse',call:'Traverse(root);',input:{values:[1,2,3,null,4]},summary:'沿左链入栈；弹出访问后转向右子树。',complexity:'时间 O(n)，空间 O(h)',tests:[{values:[]},{values:[1]},{values:[1,null,2,3]}]});

const graphInput={vertices:5,directed:true,edges:[[0,1,2],[0,2,5],[1,2,1],[1,3,4],[2,3,1],[3,4,3]],start:0};
add('bfs','图 · 邻接表 BFS','graph','graph',`void BFS(int start) {
    qhead=0;qtail=0;
    visited[start]=1;
    queue[qtail++]=start;
    while(qhead<qtail) {
        int u=queue[qhead++];
        ds_output[ds_output_len++]=u;
        for(Arc *p=first[u];p;p=p->next) {
            int v=p->to;
            if(!visited[v]) {
                visited[v]=1;
                queue[qtail++]=v;
            }
        }
    }
}`,{entry:'BFS',call:'BFS(key);',input:graphInput,summary:'节点入队时标记，避免重复入队。本入口遍历 start 所在的可达部分。',complexity:'O(V+E)'});
add('dfs','图 · 邻接表 DFS','graph','graph',`void DFS(int u) {
    visited[u]=1;
    ds_output[ds_output_len++]=u;
    for(Arc *p=first[u];p;p=p->next) {
        int v=p->to;
        if(!visited[v]) DFS(v);
    }
}`,{entry:'DFS',call:'DFS(key);',input:graphInput,summary:'访问顶点后递归探索未访问邻点；栈帧保留扫描位置。',complexity:'O(V+E)'});
add('dijkstra','图 · Dijkstra','graph','graph',`void Dijkstra(int start) {
    for(int i=0;i<n;i++) {dist[i]=1000000;parent[i]=-1;}
    dist[start]=0;
    for(int k=0;k<n;k++) {
        int u=-1;
        for(int i=0;i<n;i++) {
            if(!visited[i] && (u==-1 || dist[i]<dist[u])) u=i;
        }
        if(u==-1 || dist[u]==1000000) break;
        visited[u]=1;
        for(Arc *p=first[u];p;p=p->next) {
            int v=p->to;
            if(dist[u]+p->weight<dist[v]) {
                dist[v]=dist[u]+p->weight;
                parent[v]=u;
            }
        }
    }
    for(int i=0;i<n;i++) ds_output[ds_output_len++]=dist[i];
}`,{entry:'Dijkstra',call:'Dijkstra(key);',input:graphInput,summary:'每轮确定未访问顶点中最短的距离，再松弛出边。要求非负权。1000000 表示不可达。',complexity:'O(V²+E)'});
add('topological','图 · 拓扑排序','graph','graph',`void Topological(void) {
    for(int u=0;u<n;u++) {
        for(Arc *p=first[u];p;p=p->next) dist[p->to]++;
    }
    qhead=0;qtail=0;
    for(int u=0;u<n;u++) if(dist[u]==0) queue[qtail++]=u;
    while(qhead<qtail) {
        int u=queue[qhead++];
        ds_output[ds_output_len++]=u;
        for(Arc *p=first[u];p;p=p->next) {
            if(--dist[p->to]==0) queue[qtail++]=p->to;
        }
    }
    result=ds_output_len==n;
}`,{entry:'Topological',call:'Topological();',input:graphInput,summary:'入度为 0 的顶点入队；移除其出边后继续寻找新起点。输出不足 n 表示存在环。',complexity:'O(V+E)'});

// Full release inventory: unfinished entries stay visible and explicitly planned.
const planned={intro:['ADT 与表示','时间复杂度与操作计数'],linear:['双链表基本操作','循环链表基本操作','静态链表与游标','有序表合并'],stack:['链栈基本操作','链队列基本操作','进制转换','表达式求值','迷宫求解'],string:['定长顺序串基本操作','堆分配串基本操作','块链串','KMP nextval'],array:['多维数组地址计算','特殊矩阵压缩','稀疏矩阵转置','快速转置','稀疏矩阵加乘','十字链表','广义表基本操作与深度'],tree:['线索二叉树','树与森林转换','孩子兄弟表示','哈夫曼树与编码'],graph:['邻接矩阵基本操作','十字链表','邻接多重表','生成树与森林','Prim','Kruskal','Floyd','关键路径'],search:['哨兵顺序查找','分块查找','次优查找树','二叉排序树插入删除','AVL','B 树','B+ 树','开放定址哈希','链地址哈希'],external:['初始归并段','多路归并','败者树','置换选择','最佳归并树'],file:['顺序文件','索引文件','索引顺序文件','散列文件']};
export const inventory=[...algorithms.map(({id,title,chapter,status})=>({id,title,chapter,status})),...Object.entries(planned).flatMap(([chapter,names])=>names.map((title,index)=>({id:`planned-${chapter}-${index}`,title,chapter,status:'planned'})))];

export function validateInput(algorithm,input) {
  if(!input || typeof input!=='object' || Array.isArray(input)) throw new Error('输入必须为 JSON 对象');
  if(algorithm.kind==='graph') {
    if(!Number.isInteger(input.vertices)||input.vertices<1||input.vertices>12) throw new Error('顶点数必须为 1～12');
    if(!Array.isArray(input.edges)||input.edges.length>80) throw new Error('edges 必须为边数组，最多 80 条');
    for(const edge of input.edges) if(!Array.isArray(edge)||edge.length<2||edge.some(x=>!Number.isInteger(x))||edge[0]<0||edge[0]>=input.vertices||edge[1]<0||edge[1]>=input.vertices||Math.abs(edge[2]??1)>10000) throw new Error('边需为 [起点,终点,可选权重]，顶点编号从 0 开始');
    if(!Number.isInteger(input.start??0)||(input.start??0)<0||(input.start??0)>=input.vertices) throw new Error('start 超出范围');
    if(algorithm.id==='dijkstra'&&input.edges.some(e=>(e[2]??1)<0)) throw new Error('Dijkstra 输入要求非负权');
  } else if(algorithm.kind==='string') {
    for(const key of ['text','pattern']) if(input[key]!==undefined&&(typeof input[key]!=='string'||input[key].length>60||/[^\x20-\x7e]/.test(input[key]))) throw new Error('当前串模板支持最多 60 个 ASCII 可打印字符');
  } else {
    if(!Array.isArray(input.values)||input.values.length>32||input.values.some(x=>!(algorithm.kind==='tree'&&x===null)&&(!Number.isInteger(x)||Math.abs(x)>100000))) throw new Error('values 最多 32 个整数（树允许 null），绝对值不超过 100000');
    if(algorithm.id==='radix'&&input.values.some(x=>x<0)) throw new Error('本基数排序实现要求非负整数');
    if(algorithm.id==='binary-search'&&input.values.some((x,i,a)=>i&&x<a[i-1])) throw new Error('折半查找要求数组升序');
  }
  for(const k of ['key','position','value']) if(input[k]!==undefined&&(!Number.isInteger(input[k])||Math.abs(input[k])>100000)) throw new Error(k+' 必须为范围内整数');
  for(const k of ['rows','cols']) if(input[k]!==undefined&&(!Number.isInteger(input[k])||input[k]<1||input[k]>8))throw new Error(k+' 必须为 1～8 的整数');
  if(['matrix-address','matrix-triangle','sparse-transpose','sparse-fast-transpose','maze','cross-matrix','sparse-arithmetic'].includes(algorithm.id)) {
    const cols=['matrix-triangle','sparse-arithmetic'].includes(algorithm.id)?input.rows:input.cols;
    if(!input.rows||!cols||input.values.length!==input.rows*cols)throw new Error('values 长度必须等于 rows × cols');
    if(['matrix-address','matrix-triangle'].includes(algorithm.id)&&(!Number.isInteger(input.key)||input.key<0||input.key>=input.values.length))throw new Error('key 必须为矩阵内的行优先下标');
    if(algorithm.id==='matrix-triangle'&&input.values.some((x,k)=>x!==input.values[(k%cols)*cols+Math.floor(k/cols)]))throw new Error('请输入对称矩阵');
  }
  if(['base-conversion','huffman','optimal-merge'].includes(algorithm.id)&&((algorithm.id==='base-conversion'&&(input.key??0)<0)||input.values?.some(v=>v<0)))throw new Error('本算法要求非负输入');
  if(['prim','kruskal'].includes(algorithm.id)&&input.directed)throw new Error('最小生成树模板要求无向图');
  if(['topological','critical-path'].includes(algorithm.id)&&!input.directed)throw new Error('本模板要求有向图');
  if(['binary-search','lc-704','lc-35','lc-83'].includes(algorithm.id)&&input.values.some((x,i,a)=>i&&x<a[i-1]))throw new Error('本模板要求输入升序');
  if(algorithm.id==='generalized-list') {
    let nodes=0;const walk=(v,depth)=>{if(++nodes>48||depth>8)throw new Error('广义表最多 48 项，嵌套深度最多 8');if(Array.isArray(v))v.forEach(x=>walk(x,depth+1));else if(!Number.isInteger(v)||Math.abs(v)>100000)throw new Error('广义表原子必须为范围内整数');};
    if(!Array.isArray(input.structure))throw new Error('structure 必须为嵌套数组');walk(input.structure,0);
  }
  if(algorithm.id==='maze'&&input.values.some(v=>![0,1].includes(v)))throw new Error('迷宫单元只能为 0 或 1');
  if(algorithm.id==='sparse-arithmetic'&&input.values.some(v=>Math.abs(v)>1000))throw new Error('矩阵乘法元素绝对值最多 1000');
  if(['matrix-graph','orthogonal-graph'].includes(algorithm.id)&&input.edges.some(e=>(e[2]??1)===0))throw new Error('本存储演示要求非零边权');
  if(algorithm.id==='orthogonal-graph'&&!input.directed)throw new Error('十字链表模板要求有向图');
  if(algorithm.id==='adjacency-multilist'&&(input.directed||input.edges.some(e=>e[0]===e[1])))throw new Error('邻接多重表模板要求无向无自环图');
  if(algorithm.id==='nearly-optimal-tree'){
    if(!Array.isArray(input.weights)||input.weights.length!==input.values.length||input.weights.some(v=>!Number.isInteger(v)||v<0||v>10000))throw new Error('weights 必须与键数组等长，且为非负整数');
    if(input.values.some((v,i,a)=>i&&v<=a[i-1]))throw new Error('次优查找树键必须严格升序');
  }
  algorithm.validate?.(input);
  if(['lc-88','lc-21','lc-105'].includes(algorithm.id)) {
    if(!Array.isArray(input.values2)||input.values2.length>32||input.values2.some(v=>!Number.isInteger(v)||Math.abs(v)>100000))throw new Error('values2 必须为最多 32 个整数');
    if(algorithm.id!=='lc-105'&&[input.values,input.values2].some(a=>a.some((v,i)=>i&&v<a[i-1])))throw new Error('两个输入序列都应升序');
    if(algorithm.id==='lc-105') {
      if(input.values.length!==input.values2.length||new Set(input.values).size!==input.values.length||[...input.values].sort((a,b)=>a-b).join(',')!==[...input.values2].sort((a,b)=>a-b).join(','))throw new Error('前序与中序须包含相同且唯一的键');
      const valid=(pre,ino)=>{if(!pre.length)return true;const k=ino.indexOf(pre[0]);return k>=0&&valid(pre.slice(1,k+1),ino.slice(0,k))&&valid(pre.slice(k+1),ino.slice(k+1));};if(!valid(input.values,input.values2))throw new Error('遍历顺序不一致');
    }
  }
  if(['lc-19','lc-215','lc-230','lc-347'].includes(algorithm.id)) {
    const size=algorithm.id==='lc-347'?new Set(input.values).size:input.values.filter(v=>v!==null).length;
    if(!Number.isInteger(input.key)||input.key<1||input.key>size)throw new Error('key 表示 k，必须处于 1 到有效元素数之间');
  }
  if(['lc-141','lc-142'].includes(algorithm.id)&&(!Number.isInteger(input.cycleTo)||input.cycleTo< -1||input.cycleTo>=input.values.length))throw new Error('cycleTo 必须为 -1 或链表内的 0 起始下标');
  if(algorithm.id==='lc-26'&&input.values.some((v,i,a)=>i&&v<a[i-1]))throw new Error('本题要求升序数组');
  if(['lc-207','lc-210','lc-743'].includes(algorithm.id)&&!input.directed)throw new Error('本题要求有向图');
  if(algorithm.id==='lc-743'&&input.edges.some(e=>(e[2]??1)<0))throw new Error('网络延迟要求非负权');
  if(algorithm.id==='lc-236'&&(!input.values.includes(input.key)||!input.values.includes(input.value)||new Set(input.values.filter(v=>v!==null)).size!==input.values.filter(v=>v!==null).length))throw new Error('两目标值必须存在，且树中键唯一');
  return input;
}

export function buildHarness(algorithm,input,{implementation='sequential'}={}) {
  validateInput(algorithm,input);
  const kind=algorithm.kind,v=input.values||[],k=input.position??input.key??0;
  const init=[`n=${kind==='graph'?input.vertices:v.length};key=${k};aux[0]=${input.value??0};`];
  if(v.length) init.push(`int initial[]={${v.map(x=>x??0).join(',')}};for(int z=0;z<n;z++) a[z]=initial[z];`);
  let output='for(int z=0;z<n;z++) ds_output[ds_output_len++]=a[z];';
  const profile={kind,watches:[],input,implementation,algorithmId:algorithm.id,hiddenOperations:algorithm.blockedOperations};
  if(kind==='list' || kind==='leetcode-list') {
    init.push('head=calloc(1,sizeof(LNode));LNode *tail=head;for(int z=0;z<n;z++){tail->next=calloc(1,sizeof(LNode));tail=tail->next;tail->data=a[z];}');
    profile.nodeType='LNode';profile.watches=['head'];
    output='LNode *p=head->next;for(int z=0;p && z<CAP;z++,p=p->next) ds_output[ds_output_len++]=p->data;';
    if(kind==='leetcode-list') {
      init.pop();init.push('struct ListNode *tail=NULL;for(int z=0;z<n;z++){struct ListNode *p=calloc(1,sizeof(struct ListNode));p->val=a[z];if(tail)tail->next=p;else lc_head=p;tail=p;}');
      profile.kind='list';profile.nodeType='struct ListNode';profile.watches=['lc_head'];
      output='struct ListNode *p=lc_head;for(int z=0;p && z<CAP;z++,p=p->next) ds_output[ds_output_len++]=p->val;';
    }
  } else if(kind==='tree') {
    const vals=v.map(x=>x??0),nulls=v.map(x=>x===null?1:0);
    if(!algorithm.emptyTree && v.length&&v[0]!==null) init.push(`int nil[]={${nulls.join(',')}};TreeNode *q[CAP];int f=0,r=0,z=1;root=calloc(1,sizeof(TreeNode));root->val=${vals[0]};q[r++]=root;while(f<r && z<n){TreeNode *p=q[f++];if(!nil[z]){p->left=calloc(1,sizeof(TreeNode));p->left->val=a[z];q[r++]=p->left;}z++;if(z<n&&!nil[z]){p->right=calloc(1,sizeof(TreeNode));p->right->val=a[z];q[r++]=p->right;}z++;}`);
    profile.nodeType='TreeNode';profile.watches=['root','ds_output[0]@32','ds_output_len'];output='';
  } else if(kind==='graph') {
    if(['dijkstra','prim'].includes(algorithm.id))init.push('for(int z=0;z<n;z++)parent[z]=-1;');
    for(const [u,v,w=1] of [...input.edges].reverse()) {
      init.push(`{Arc *p=calloc(1,sizeof(Arc));p->to=${v};p->weight=${w};p->next=first[${u}];first[${u}]=p;matrix[${u}][${v}]=${w};}`);
      if(!input.directed) init.push(`{Arc *p=calloc(1,sizeof(Arc));p->to=${u};p->weight=${w};p->next=first[${v}];first[${v}]=p;matrix[${v}][${u}]=${w};}`);
    }
    init.push(`key=${input.start??0};`);
    profile.nodeType='Arc';profile.watches=[`first[0]@${input.vertices}`,`visited[0]@${input.vertices}`,`dist[0]@${input.vertices}`,`parent[0]@${input.vertices}`,'queue[0]@32','qhead','qtail','ds_output[0]@32','ds_output_len'];output='';
  } else if(kind==='stack') {
    init.push('for(int z=0;z<n;z++) Push(&stack,a[z]);');
    profile.watches=['stack'];output='for(int z=0;z<stack.top;z++) ds_output[ds_output_len++]=stack.data[z];';
  } else if(kind==='queue') {
    init.push('for(int z=0;z<n;z++) EnQueue(&fifo,a[z]);');
    profile.watches=['fifo'];output='for(int z=fifo.front;z!=fifo.rear;z=(z+1)%CAP) ds_output[ds_output_len++]=fifo.data[z];';
  } else if(kind==='string') {
    init.push(`strcpy(text,${JSON.stringify(input.text||'')});strcpy(pattern,${JSON.stringify(input.pattern||'')});`);
    profile.watches=['text','pattern',`next[0]@${Math.max(1,(input.pattern||'').length+1)}`];output='';
  } else {
    profile.watches=[`a[0]@${Math.max(1,v.length+1)}`,'n',`aux[0]@${Math.max(1,v.length)}`];
    output=`for(int z=0;z<(${algorithm.outputLength||'n'});z++) ds_output[ds_output_len++]=a[z];`;
  }
  profile.watches.push('result','ds_memory_error','ds_invariant_error');
  const customSetup=algorithm.setup?algorithm.setup(input):'';
  if(algorithm.serialize)output=algorithm.serialize(input);
  if(algorithm.watches)profile.watches=[...new Set([...profile.watches,...algorithm.watches(input)])];
  if(algorithm.nodeType)profile.nodeType=algorithm.nodeType;
  if(algorithm.viewKind)profile.kind=algorithm.viewKind;
  if(algorithm.nodeLinks)profile.nodeLinks=algorithm.nodeLinks;
  if(algorithm.rootSymbol)profile.rootSymbol=algorithm.rootSymbol;
  if(implementation==='linked'&&/\b(Push|Pop|EnQueue|DeQueue|GetTop|StackEmpty)\s*\(/.test(algorithm.source)) {
    profile.nodeType='LNode';
    if(kind==='stack'||kind==='queue') {
      profile.kind='list';profile.rootSymbol=kind==='stack'?'stack.top':'fifo.front';
      profile.watches.push(profile.rootSymbol);
      output=kind==='stack'?'ds_output_len=stack.size;int z=stack.size-1;for(LNode *p=stack.top;p;p=p->next)ds_output[z--]=p->data;':'for(LNode *p=fifo.front;p;p=p->next)ds_output[ds_output_len++]=p->data;';
    }
  }
  const call=algorithm.call||'Solve(a,n);';
  const invariant=['avl','bst'].includes(algorithm.id)?`ds_invariant_error=ds_validate_bst(root,LLONG_MIN,LLONG_MAX,${algorithm.id==='avl'?1:0},0)<0;`:['btree','bplus'].includes(algorithm.id)?`{int depth=-1;ds_invariant_error=broot?!ds_validate_btree(broot,LLONG_MIN,LLONG_MAX,0,&depth,${algorithm.id==='bplus'?1:0}):0;}`:'';
  const harness=`int main(void) {\n{${init.join('\n')}}\n${customSetup}\n${call}\n{${output}}\n${invariant}\nds_finish();\nprintf("\\nDS_RESULT:{\\"result\\":%d,\\"output\\":[",result);\nfor(int z=0;z<ds_output_len;z++) printf("%s%d",z?",":"",ds_output[z]);\nprintf("],\\"memoryError\\":%d,\\"invariantError\\":%d}\\n",ds_memory_error,ds_invariant_error);\nreturn 0;\n}`;
  return {harness,profile};
}

export function expectedFor(a,input) {
  if(a.oracleId)return expectedFor(algorithms.find(x=>x.id===a.oracleId),input);
  if(a.expected)return a.expected(input);
  const values=[...(input.values||[])];
  if(a.chapter==='sort') return {output:values.sort((x,y)=>x-y)};
  if(a.id==='list-insert') {const i=input.position;if(i<1||i>values.length+1)return {output:values,result:0};values.splice(i-1,0,input.value);return {output:values,result:1};}
  if(a.id==='list-delete') {const i=input.position;if(i<1||i>values.length)return {output:values,result:0};values.splice(i-1,1);return {output:values,result:1};}
  if(a.id==='list-reverse') return {output:values.reverse()};
  if(a.id==='array-insert') {const i=input.key;if(i<0||i>values.length)return {output:values,result:0};values.splice(i,0,input.value);return {output:values,result:1};}
  if(a.id==='array-delete') {const i=input.key;if(i<0||i>=values.length)return {output:values,result:0};values.splice(i,1);return {output:values,result:1};}
  if(a.id.endsWith('search')) {const i=values.indexOf(input.key);return {result:i};}
  if(a.id==='stack-push'||a.id==='queue-enqueue') return {output:[...values,input.key],result:1};
  if(a.id==='stack-pop')return {output:values.slice(0,-1),result:values.length?1:0};
  if(a.id==='queue-dequeue')return {output:values.slice(1),result:values.length?1:0};
  if(a.id==='brackets') {const s=[],pairs={')':'(',']':'[','}':'{'};for(const c of input.text){if('([{'.includes(c))s.push(c);else if(pairs[c]&&s.pop()!==pairs[c])return {result:0};}return {result:+!s.length};}
  if(a.kind==='string')return {result:(input.text||'').indexOf(input.pattern||'')};
  if(a.kind==='tree') {
    let root=null;
    if(values.length&&values[0]!==null){root={v:values[0]};const q=[root];let i=1;while(q.length&&i<values.length){const p=q.shift();if(values[i]!=null){p.l={v:values[i]};q.push(p.l);}i++;if(i<values.length&&values[i]!=null){p.r={v:values[i]};q.push(p.r);}i++;}}
    const out=[];const visit=p=>{if(!p)return;if(a.id==='preorder')out.push(p.v);visit(p.l);if(a.id==='inorder'||a.id==='tree-inorder-stack')out.push(p.v);visit(p.r);if(a.id==='postorder')out.push(p.v);};
    if(a.id==='tree-depth'){const depth=p=>p?1+Math.max(depth(p.l),depth(p.r)):0;return {result:depth(root)};}
    if(a.id==='tree-level'){const q=root?[root]:[];while(q.length){const p=q.shift();out.push(p.v);if(p.l)q.push(p.l);if(p.r)q.push(p.r);}}else visit(root);
    return {output:out};
  }
  if(a.kind==='graph') {
    const n=input.vertices,adj=Array.from({length:n},()=>[]);for(const [u,v,w=1]of input.edges){adj[u].push([v,w]);if(!input.directed)adj[v].push([u,w]);}
    if(a.id==='dijkstra'){const d=Array(n).fill(1000000);d[input.start??0]=0;for(let k=0;k<n;k++)for(let u=0;u<n;u++)for(const[v,w]of adj[u])d[v]=Math.min(d[v],d[u]+w);return {output:d};}
    const seen=new Set(),out=[];
    if(a.id==='dfs'){const walk=u=>{seen.add(u);out.push(u);for(const[v]of adj[u])if(!seen.has(v))walk(v);};walk(input.start??0);return {output:out};}
    if(a.id==='bfs'){const q=[input.start??0];seen.add(q[0]);while(q.length){const u=q.shift();out.push(u);for(const[v]of adj[u])if(!seen.has(v)){seen.add(v);q.push(v);}}return {output:out};}
    if(a.id==='topological'){const deg=Array(n).fill(0);for(const edges of adj)for(const[v]of edges)deg[v]++;const q=[];deg.forEach((d,i)=>{if(!d)q.push(i);});while(q.length){const u=q.shift();out.push(u);for(const[v]of adj[u])if(--deg[v]===0)q.push(v);}return {output:out,result:+(out.length===n)};}
  }
  return null;
}
