import {link} from './problems.mjs';

link(160,'intersection-of-two-linked-lists',`struct ListNode* getIntersectionNode(struct ListNode* headA, struct ListNode* headB)
{
    struct ListNode *p = headA, *q = headB;
    while (p != q)
    {
        p = p ? p->next : headB;
        q = q ? q->next : headA;
    }
    return p;
}`,{chapter:'linear',kind:'leetcode-list',entry:'getIntersectionNode',input:{values:[4,1,8,4,5],values2:[5,6,1],position:2},tests:[{values:[],values2:[1],position:-1},{values:[1,2],values2:[3],position:-1},{values:[1],values2:[],position:0}],
  summary:'values 为链表 A；values2 为 B 的独立前缀；position 为共享尾部在 A 中的 0 起始下标，-1 表示不相交。按指针身份判定。',
  validate:i=>{if(!Array.isArray(i.values2)||i.values2.length>32||i.values2.some(x=>!Number.isInteger(x)||Math.abs(x)>100000)||!Number.isInteger(i.position)||i.position< -1||i.position>=i.values.length)throw new Error('请填写 B 的整数前缀和合法交点下标（-1 表示无交点）');},
  setup:i=>`struct ListNode *shared=lc_head;for(int z=0;z<${Math.max(0,i.position)}&&shared;z++)shared=shared->next;${i.position<0?'shared=NULL;':''}struct ListNode *other=shared;${[...i.values2].reverse().map(v=>`{struct ListNode *p=calloc(1,sizeof(*p));p->val=${v};p->next=other;other=p;}`).join('')}`,
  call:'struct ListNode *answer=getIntersectionNode(lc_head,other);result=answer==shared;',serialize:()=>'',expected:()=>({result:1,output:[]})});

const designs=[
  {number:155,slug:'min-stack',type:'MinStack',prefix:'minStack',topic:'栈',body:`typedef struct { int data[CAP], mins[CAP], size; } MinStack;
MinStack* minStackCreate(void) { return calloc(1,sizeof(MinStack)); }
void minStackPush(MinStack* obj,int val) { int k=obj->size;obj->data[k]=val;obj->mins[k]=k&&obj->mins[k-1]<val?obj->mins[k-1]:val;obj->size++; }
void minStackPop(MinStack* obj) { obj->size--; }
int minStackTop(MinStack* obj) { return obj->data[obj->size-1]; }
int minStackGetMin(MinStack* obj) { return obj->mins[obj->size-1]; }
void minStackFree(MinStack* obj) { free(obj); }`,input:{values:[-2,0,-3],operations:['getMin','pop','top','getMin']},tests:[{values:[2,2],operations:['getMin','pop','getMin']}]},
  {number:225,slug:'implement-stack-using-queues',type:'MyStack',prefix:'myStack',topic:'队列',body:`typedef struct { int data[CAP], front, rear; } MyStack;
MyStack* myStackCreate(void) { return calloc(1,sizeof(MyStack)); }
void myStackPush(MyStack* obj,int x) { int count=obj->rear-obj->front;obj->data[obj->rear++%CAP]=x;while(count--){int v=obj->data[obj->front++%CAP];obj->data[obj->rear++%CAP]=v;} }
int myStackPop(MyStack* obj) { return obj->data[obj->front++%CAP]; }
int myStackTop(MyStack* obj) { return obj->data[obj->front%CAP]; }
bool myStackEmpty(MyStack* obj) { return obj->front==obj->rear; }
void myStackFree(MyStack* obj) { free(obj); }`,input:{values:[1,2],operations:['top','pop','empty','pop','empty']},tests:[{values:[],operations:['empty','push:7','top','pop','empty']}]},
  {number:232,slug:'implement-queue-using-stacks',type:'MyQueue',prefix:'myQueue',topic:'栈',body:`typedef struct { int in[CAP], out[CAP], ni, no; } MyQueue;
MyQueue* myQueueCreate(void) { return calloc(1,sizeof(MyQueue)); }
void myQueuePush(MyQueue* obj,int x) { obj->in[obj->ni++]=x; }
void queueMove(MyQueue* obj) { if(!obj->no)while(obj->ni)obj->out[obj->no++]=obj->in[--obj->ni]; }
int myQueuePop(MyQueue* obj) { queueMove(obj);return obj->out[--obj->no]; }
int myQueuePeek(MyQueue* obj) { queueMove(obj);return obj->out[obj->no-1]; }
bool myQueueEmpty(MyQueue* obj) { return !obj->ni&&!obj->no; }
void myQueueFree(MyQueue* obj) { free(obj); }`,input:{values:[1,2],operations:['peek','pop','empty','push:3','pop','peek']},tests:[{values:[],operations:['empty','push:8','pop','empty']} ]}
];
function simulate(d,i){const a=[...i.values],output=[];for(const token of i.operations){const [op,arg]=token.split(':');if(op==='push')a.push(Number(arg));else if(op==='empty')output.push(+!a.length);else {if(!a.length)throw new Error('非空操作不能用于空栈或空队列');if(op==='pop'){const v=d.number===232?a.shift():a.pop();if(d.number!==155)output.push(v);}else if(op==='getMin')output.push(Math.min(...a));else output.push(d.number===232?a[0]:a.at(-1));}if(a.length>64)throw new Error('最多存储 64 项');}return {output};}
for(const d of designs)link(d.number,d.slug,d.body,{chapter:'stack',kind:'array',entry:d.prefix+'Create',input:d.input,tests:d.tests,summary:'values 为初始元素；操作逐项填写，例如 push:3, pop, '+(d.number===155?'top, getMin':d.number===225?'top, empty':'peek, empty')+'。输出仅包含有返回值的操作。',
  contract:'保留 LeetCode 对象的 Create / Push / Pop / 查询 / Free 接口。obj 是平台创建的对象地址。操作序列不能对空对象执行 pop 或读取顶部。',
  validate:i=>{const allowed=d.number===155?['push','pop','top','getMin']:d.number===225?['push','pop','top','empty']:['push','pop','peek','empty'];if(!Array.isArray(i.operations)||i.operations.length>50||i.operations.some(t=>typeof t!=='string'||!allowed.includes(t.split(':')[0])||!(t.startsWith('push:')?/^push:-?\d+$/.test(t)&&Math.abs(Number(t.slice(5)))<=100000:!t.includes(':'))))throw new Error('操作序列格式不合法');simulate(d,i);},
  call:`${d.type} *obj=${d.prefix}Create();for(int z=0;z<n;z++)${d.prefix}Push(obj,a[z]);`,
  serialize:i=>i.operations.map(t=>{const [op,arg]=t.split(':');const name=op[0].toUpperCase()+op.slice(1),call=`${d.prefix}${name}(obj${op==='push'?','+Number(arg):''})`;return (op==='push'||op==='pop'&&d.number===155?call+';':`ds_output[ds_output_len++]=${call};`);}).join('\n')+`${d.prefix}Free(obj);`,expected:i=>simulate(d,i)});

link(200,'number-of-islands',`void sink(char** grid,int rows,int cols,int r,int c)
{
    if(r<0||r>=rows||c<0||c>=cols||grid[r][c]!='1') return;
    grid[r][c]='0';
    sink(grid,rows,cols,r-1,c);sink(grid,rows,cols,r+1,c);
    sink(grid,rows,cols,r,c-1);sink(grid,rows,cols,r,c+1);
}
int numIslands(char** grid,int gridSize,int* gridColSize)
{
    int count=0,cols=gridSize?gridColSize[0]:0;
    for(int r=0;r<gridSize;r++)for(int c=0;c<cols;c++)
        if(grid[r][c]=='1'){count++;sink(grid,gridSize,cols,r,c);}
    return count;
}`,{chapter:'graph',kind:'array',entry:'numIslands',input:{values:[1,1,0,0,1,0,0,0,1],rows:3,cols:3},tests:[{values:[0],rows:1,cols:1},{values:[1,0,1,0],rows:2,cols:2}],summary:'按行输入 0/1 网格，平台构造原题 char** 和列长数组。上下左右相邻的陆地属于同一岛屿。',validate:i=>{if(i.values.length!==i.rows*i.cols||i.values.some(x=>x!==0&&x!==1))throw new Error('网格元素须为 0/1，长度等于行数乘列数');},setup:i=>`rows=${i.rows};cols=${i.cols};char cells[8][8],*grid[8];int widths[8];for(int r=0;r<${i.rows};r++){grid[r]=cells[r];widths[r]=${i.cols};for(int c=0;c<${i.cols};c++)cells[r][c]='0'+a[r*${i.cols}+c];}`,call:'result=numIslands(grid,rows,widths);',serialize:()=>'',expected:i=>{let count=0;const a=[...i.values];const dfs=(r,c)=>{if(r<0||c<0||r>=i.rows||c>=i.cols||!a[r*i.cols+c])return;a[r*i.cols+c]=0;dfs(r-1,c);dfs(r+1,c);dfs(r,c-1);dfs(r,c+1);};for(let r=0;r<i.rows;r++)for(let c=0;c<i.cols;c++)if(a[r*i.cols+c]){count++;dfs(r,c);}return {result:count};}});

link(49,'group-anagrams',`char*** groupAnagrams(char** strs,int strsSize,int* returnSize,int** returnColumnSizes)
{
    char*** groups=malloc(CAP*sizeof(char**));
    int (*keys)[26]=calloc(CAP,sizeof(*keys));
    *returnColumnSizes=calloc(CAP,sizeof(int));*returnSize=0;
    for(int i=0;i<strsSize;i++)
    {
        int key[26]={0};for(char *p=strs[i];*p;p++)key[*p-'a']++;
        int g=0;while(g<*returnSize&&memcmp(keys[g],key,sizeof(key)))g++;
        if(g==*returnSize){memcpy(keys[g],key,sizeof(key));groups[g]=malloc(CAP*sizeof(char*));(*returnSize)++;}
        groups[g][(*returnColumnSizes)[g]++]=strs[i];
    }
    free(keys);return groups;
}`,{chapter:'search',kind:'array',entry:'groupAnagrams',input:{values:[],words:['eat','tea','tan','ate','nat','bat']},tests:[{values:[],words:['']},{values:[],words:[]},{values:[],words:['a','b','a']}],summary:'输入小写英文单词。平台保留 char*** 原题接口，并验证分组与元素完整性；组及组内顺序均可不同。',validate:i=>{if(!Array.isArray(i.words)||i.words.length>24||i.words.some(s=>typeof s!=='string'||!/^[a-z]{0,24}$/.test(s)))throw new Error('最多 24 个小写英文单词，每个最多 24 字符');},setup:i=>`char *words[CAP]={${i.words.length?i.words.map(s=>JSON.stringify(s)).join(','):'NULL'}};int wordCount=${i.words.length};`,call:'int groupCount=0,*sizes=NULL;char ***groups=groupAnagrams(words,wordCount,&groupCount,&sizes);',serialize:i=>`result=groupCount>=0&&groupCount<=${i.words.length};int used[CAP]={0},total=0;for(int g=0;result&&g<groupCount;g++){if(sizes[g]<1||sizes[g]>${i.words.length}){result=0;break;}int firstKey[26]={0};for(int j=0;j<sizes[g];j++){char *s=groups[g][j];int k=0;while(k<wordCount&&(used[k]||strcmp(s,words[k])))k++;if(k==wordCount){result=0;break;}used[k]=1;total++;int key[26]={0};for(char *p=s;*p;p++)if(*p>='a'&&*p<='z')key[*p-'a']++;else result=0;if(!j)memcpy(firstKey,key,sizeof(key));else if(memcmp(firstKey,key,sizeof(key)))result=0;}for(int h=0;h<g;h++){int key[26]={0};for(char *p=groups[h][0];*p;p++)if(*p>='a'&&*p<='z')key[*p-'a']++;if(!memcmp(firstKey,key,sizeof(key)))result=0;}}result=result&&total==wordCount;`,expected:()=>({result:1})});

link(133,'clone-graph',`struct Node { int val; int numNeighbors; struct Node** neighbors; };
struct Node* cloneVisit(struct Node* node,struct Node** copies)
{
    if(!node) return NULL;
    if(copies[node->val]) return copies[node->val];
    struct Node* copy=calloc(1,sizeof(struct Node));copies[node->val]=copy;
    copy->val=node->val;copy->numNeighbors=node->numNeighbors;
    copy->neighbors=calloc(copy->numNeighbors,sizeof(struct Node*));
    for(int i=0;i<copy->numNeighbors;i++)copy->neighbors[i]=cloneVisit(node->neighbors[i],copies);
    return copy;
}
struct Node* cloneGraph(struct Node* node)
{
    struct Node* copies[CAP]={0};return cloneVisit(node,copies);
}`,{chapter:'graph',kind:'graph',entry:'cloneGraph',input:{vertices:4,edges:[[0,1],[1,2],[2,3],[3,0]],directed:false,start:0},tests:[{vertices:1,edges:[],directed:false,start:0},{vertices:3,edges:[[0,1]],directed:false,start:0}],summary:'输入顶点编号从 0 开始，原题 Node.val 为编号加 1。返回起点所在连通分量的深拷贝，测试同时检查邻接关系、原图完整性和新旧对象身份。',validate:i=>{if(i.directed||i.edges.some(e=>(e[2]??1)!==1)||i.edges.some(([u,v])=>u===v)||new Set(i.edges.map(([u,v])=>[Math.min(u,v),Math.max(u,v)].join(':'))).size!==i.edges.length)throw new Error('请输入无向、无自环、无重边图');},setup:i=>`struct Node *original[16];for(int v=0;v<n;v++){original[v]=calloc(1,sizeof(struct Node));original[v]->val=v+1;original[v]->neighbors=calloc(16,sizeof(struct Node*));}for(int u=0;u<n;u++)for(Arc *p=first[u];p;p=p->next)original[u]->neighbors[original[u]->numNeighbors++]=original[p->to];`,call:'struct Node *copy=cloneGraph(original[key]);',serialize:()=>`struct Node *mapped[16]={0},*todo[16];int f=0,r=0;result=copy!=NULL;if(copy){todo[r++]=copy;if(copy->val!=key+1)result=0;else mapped[key]=copy;}while(result&&f<r){struct Node *p=todo[f++];int u=p->val-1;if(u<0||u>=n||p->numNeighbors<0||p->numNeighbors>n){result=0;break;}for(int v=0;v<n;v++)if(p==original[v])result=0;int seen[16]={0};for(int j=0;result&&j<p->numNeighbors;j++){struct Node *q=p->neighbors[j];if(!q||q->val<1||q->val>n){result=0;break;}int v=q->val-1;if(seen[v]++||!matrix[u][v]){result=0;break;}if(mapped[v]&&mapped[v]!=q){result=0;break;}if(!mapped[v]){mapped[v]=q;todo[r++]=q;}}for(int v=0;v<n;v++)if(!!matrix[u][v]!=!!seen[v])result=0;}for(int u=0;u<n;u++){struct Node *p=original[u];int seen[16]={0};if(p->val!=u+1||p->numNeighbors<0||p->numNeighbors>n){result=0;break;}for(int j=0;j<p->numNeighbors;j++){int v=0;while(v<n&&p->neighbors[j]!=original[v])v++;if(v==n){result=0;break;}seen[v]++;}for(int v=0;v<n;v++)if(seen[v]!=!!matrix[u][v])result=0;}`,expected:()=>({result:1})});
