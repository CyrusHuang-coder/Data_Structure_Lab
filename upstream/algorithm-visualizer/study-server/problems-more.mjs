import {link} from './problems.mjs';
import {makeTree} from './problems-extra.mjs';
const graphInput={vertices:4,directed:true,edges:[[0,1,1],[0,2,4],[1,2,1],[2,3,2]],start:0};
const reqSetup=i=>`int p[128][2]={${i.edges.length?i.edges.map(([u,v])=>`{${v},${u}}`).join(','):'{0,0}'}};int *req[128],columns[128];for(int z=0;z<${i.edges.length};z++){req[z]=p[z];columns[z]=2;}`;
const topoCode=`int Topo(int numCourses,int** prerequisites,int prerequisitesSize,int *order) {
    int degree[CAP]={0},q[CAP],front=0,rear=0;
    for(int i=0;i<prerequisitesSize;i++)degree[prerequisites[i][0]]++;
    for(int v=0;v<numCourses;v++)if(!degree[v])q[rear++]=v;
    while(front<rear) {
        int u=q[front++];order[front-1]=u;
        for(int i=0;i<prerequisitesSize;i++)if(prerequisites[i][1]==u){int v=prerequisites[i][0];if(--degree[v]==0)q[rear++]=v;}
    }
    return rear;
}`;
link(207,'course-schedule',topoCode+`
bool canFinish(int numCourses,int** prerequisites,int prerequisitesSize,int* prerequisitesColSize) {
    int order[CAP];return Topo(numCourses,prerequisites,prerequisitesSize,order)==numCourses;
}`,{chapter:'graph',kind:'graph',entry:'canFinish',call:'result=canFinish(n,req,m,columns);',setup:i=>reqSetup(i)+`m=${i.edges.length};`,input:graphInput,tests:[{vertices:2,directed:true,edges:[[0,1],[1,0]],start:0},{vertices:1,directed:true,edges:[],start:0}],summary:'edges 为“先修课→后续课”，平台转成原题 prerequisites 参数。以拓扑排序判环。',expected:i=>({result:+(topo(i).length===i.vertices)})});
link(210,'course-schedule-ii',topoCode+`
int* findOrder(int numCourses,int** prerequisites,int prerequisitesSize,int* prerequisitesColSize,int* returnSize) {
    int *order=malloc(CAP*sizeof(int));int len=Topo(numCourses,prerequisites,prerequisitesSize,order);
    *returnSize=len==numCourses?len:0;return order;
}`,{chapter:'graph',kind:'graph',entry:'findOrder',call:'int size=0;int *out=findOrder(n,req,m,columns,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',setup:i=>reqSetup(i)+`m=${i.edges.length};`,input:graphInput,tests:[{vertices:2,directed:true,edges:[[0,1],[1,0]],start:0}],summary:'返回任意合法课程顺序。本站 checker 检查所有先修约束，接受多种拓扑序。',checker:'topological-order',expected:i=>({output:topo(i).length===i.vertices?topo(i):[]})});
link(743,'network-delay-time',`int networkDelayTime(int** times,int timesSize,int* timesColSize,int n,int k) {
    int d[CAP],used[CAP]={0};for(int i=1;i<=n;i++)d[i]=1000000;d[k]=0;
    for(int round=0;round<n;round++) {
        int u=-1;
        for(int v=1;v<=n;v++)if(!used[v]&&(u<0||d[v]<d[u]))u=v;
        if(u<0||d[u]==1000000)break;
        used[u]=1;
        for(int i=0;i<timesSize;i++)if(times[i][0]==u) {int v=times[i][1],w=times[i][2];if(d[v]>d[u]+w)d[v]=d[u]+w;}
    }
    int answer=0;for(int v=1;v<=n;v++){if(d[v]==1000000)return -1;if(d[v]>answer)answer=d[v];}return answer;
}`,{chapter:'graph',kind:'graph',entry:'networkDelayTime',call:'result=networkDelayTime(times,m,columns,n,key+1);',setup:i=>`int data[128][3]={${i.edges.length?i.edges.map(([u,v,w=1])=>`{${u+1},${v+1},${w}}`).join(','):'{0,0,0}'}};int *times[128],columns[128];m=${i.edges.length};for(int z=0;z<m;z++){times[z]=data[z];columns[z]=3;}`,input:graphInput,tests:[{vertices:2,directed:true,edges:[],start:0}],summary:'本站图顶点从 0 开始，harness 转换成原题 1 起始编号。返回最晚到达时间或 -1。',expected:i=>{const d=Array(i.vertices).fill(Infinity);d[i.start??0]=0;for(let k=0;k<i.vertices;k++)for(const[u,v,w=1]of i.edges)d[v]=Math.min(d[v],d[u]+w);return {result:d.some(x=>!Number.isFinite(x))?-1:Math.max(...d)};}});
link(21,'merge-two-sorted-lists',`struct ListNode* mergeTwoLists(struct ListNode* list1,struct ListNode* list2) {
    struct ListNode dummy={0,NULL},*tail=&dummy;
    while(list1&&list2) {
        if(list1->val<=list2->val){tail->next=list1;list1=list1->next;}
        else {tail->next=list2;list2=list2->next;}
        tail=tail->next;
    }
    tail->next=list1?list1:list2;return dummy.next;
}`,{chapter:'linear',kind:'leetcode-list',entry:'mergeTwoLists',setup:i=>`struct ListNode *other=NULL,*otherTail=NULL;int b[]={${i.values2.length?i.values2.join(','):0}};for(int z=0;z<${i.values2.length};z++){struct ListNode *p=calloc(1,sizeof(struct ListNode));p->val=b[z];if(otherTail)otherTail->next=p;else other=p;otherTail=p;}`,call:'lc_head=mergeTwoLists(lc_head,other);',input:{values:[1,2,4],values2:[1,3,4]},tests:[{values:[],values2:[]},{values:[1],values2:[]}],summary:'两个无头结点的有序链表，返回复用原节点的归并链表。values2 表示第二个链表。',expected:i=>({output:[...i.values,...i.values2].sort((a,b)=>a-b)})});

link(150,'evaluate-reverse-polish-notation',`int evalRPN(char** tokens,int tokensSize) {
    int s[CAP],top=0;
    for(int i=0;i<tokensSize;i++) {
        char *t=tokens[i];
        if(t[1]=='\0'&&(t[0]=='+'||t[0]=='-'||t[0]=='*'||t[0]=='/')) {
            int b=s[--top],a=s[--top];
            s[top++]=t[0]=='+'?a+b:t[0]=='-'?a-b:t[0]=='*'?a*b:a/b;
        } else s[top++]=atoi(t);
    }
    return s[0];
}`,{chapter:'stack',kind:'array',entry:'evalRPN',setup:i=>`m=${i.tokens.length};char *tokens[]={${i.tokens.map(t=>JSON.stringify(t)).join(',')}};`,call:'result=evalRPN(tokens,m);',input:{values:[],tokens:['2','1','+','3','*']},tests:[{values:[],tokens:['4','13','5','/','+']},{values:[],tokens:['-7','3','/']}],serialize:()=>'',watches:()=>[],validate:validateRPN,summary:'tokens 是逆波兰表达式。数字入栈，二元运算弹出右、左两个操作数；除法向零截断。',expected:i=>({result:validateRPN(i)})});

link(102,'binary-tree-level-order-traversal',`int** levelOrder(struct TreeNode* root,int* returnSize,int** returnColumnSizes) {
    int **out=malloc(CAP*sizeof(int*)),*sizes=malloc(CAP*sizeof(int));
    struct TreeNode *q[CAP];int front=0,rear=0,levels=0;
    if(root)q[rear++]=root;
    while(front<rear) {
        int count=rear-front;sizes[levels]=count;out[levels]=malloc(count*sizeof(int));
        for(int i=0;i<count;i++) {
            struct TreeNode *p=q[front++];out[levels][i]=p->val;
            if(p->left)q[rear++]=p->left;if(p->right)q[rear++]=p->right;
        }
        levels++;
    }
    *returnSize=levels;*returnColumnSizes=sizes;return out;
}`,{chapter:'tree',kind:'tree',entry:'levelOrder',call:'int size=0,*cols=NULL;int **out=levelOrder(root,&size,&cols);for(int r=0;r<size;r++){ds_output[ds_output_len++]=cols[r];for(int c=0;c<cols[r];c++)ds_output[ds_output_len++]=out[r][c];}',input:{values:[3,9,20,null,null,15,7]},tests:[{values:[]},{values:[1]}],summary:'返回二维数组并填写每层列数。本站输出序列用“层长度、该层值”编码，保留分组信息。',expected:i=>{const t=makeTree(i.values),q=t?[t]:[],out=[];while(q.length){const len=q.length;out.push(len);for(let k=0;k<len;k++){const p=q.shift();out.push(p.v);if(p.l)q.push(p.l);if(p.r)q.push(p.r);}}return {output:out};}});
link(105,'construct-binary-tree-from-preorder-and-inorder-traversal',`struct TreeNode* Build(int *pre,int *in,int n) {
    if(!n)return NULL;
    int left=0;while(left<n&&in[left]!=pre[0])left++;
    struct TreeNode *p=calloc(1,sizeof(struct TreeNode));p->val=pre[0];
    p->left=Build(pre+1,in,left);
    p->right=Build(pre+1+left,in+left+1,n-left-1);return p;
}
struct TreeNode* buildTree(int* preorder,int preorderSize,int* inorder,int inorderSize) {
    return Build(preorder,inorder,preorderSize);
}`,{chapter:'tree',kind:'array',entry:'buildTree',nodeType:'TreeNode',viewKind:'tree',watches:()=>['root'],setup:i=>`m=${i.values2.length};int second[]={${i.values2.length?i.values2.join(','):0}};for(int z=0;z<m;z++)aux[z]=second[z];`,call:'root=buildTree(a,n,aux,m);',serialize:()=> 'TreeNode *q[CAP];int f=0,r=0;q[r++]=root;while(f<r){TreeNode *p=q[f++];if(!p){ds_output[ds_output_len++]=INT_MIN;continue;}ds_output[ds_output_len++]=p->val;q[r++]=p->left;q[r++]=p->right;}',input:{values:[3,9,20,15,7],values2:[9,3,15,20,7]},tests:[{values:[],values2:[]},{values:[1],values2:[1]}],summary:'values 为前序，values2 为中序；键唯一且遍历一致。输出含 INT_MIN 空位的层序编码。',expected:i=>{function build(pre,ino){if(!pre.length)return null;const split=ino.indexOf(pre[0]);return {v:pre[0],l:build(pre.slice(1,split+1),ino.slice(0,split)),r:build(pre.slice(split+1),ino.slice(split+1))};}const q=[build(i.values,i.values2)],out=[];while(q.length){const p=q.shift();if(!p)out.push(-2147483648);else{out.push(p.v);q.push(p.l,p.r);}}return {output:out};}});
link(236,'lowest-common-ancestor-of-a-binary-tree',`struct TreeNode* lowestCommonAncestor(struct TreeNode* root,struct TreeNode* p,struct TreeNode* q) {
    if(!root||root==p||root==q)return root;
    struct TreeNode *l=lowestCommonAncestor(root->left,p,q),*r=lowestCommonAncestor(root->right,p,q);
    if(l&&r)return root;return l?l:r;
}`,{chapter:'tree',kind:'tree',entry:'lowestCommonAncestor',call:'TreeNode *targets[CAP],*p=NULL,*q=NULL;int f=0,r=0;if(root)targets[r++]=root;while(f<r){TreeNode *u=targets[f++];if(u->val==key)p=u;if(u->val==aux[0])q=u;if(u->left)targets[r++]=u->left;if(u->right)targets[r++]=u->right;}TreeNode *out=lowestCommonAncestor(root,p,q);result=out?out->val:INT_MIN;',input:{values:[3,5,1,6,2,0,8,null,null,7,4],key:5,value:1},tests:[{values:[2,1,3],key:1,value:3},{values:[1],key:1,value:1}],summary:'key 与 value 指定两目标节点的值；键唯一且目标存在。返回两个查找分支首次汇合的节点。',expected:i=>{const root=makeTree(i.values);const search=p=>{if(!p||p.v===i.key||p.v===i.value)return p;const l=search(p.l),r=search(p.r);return l&&r?p:l||r;};return {result:search(root)?.v??-2147483648};}});
link(347,'top-k-frequent-elements',`int* topKFrequent(int* nums,int numsSize,int k,int* returnSize) {
    int value[CAP],freq[CAP],size=0;
    for(int i=0;i<numsSize;i++) {
        int j=0;while(j<size&&value[j]!=nums[i])j++;
        if(j==size){value[size]=nums[i];freq[size++]=0;}freq[j]++;
    }
    for(int i=0;i<size;i++)for(int j=i+1;j<size;j++)if(freq[j]>freq[i]||(freq[j]==freq[i]&&value[j]<value[i])) {
        int t=freq[i];freq[i]=freq[j];freq[j]=t;t=value[i];value[i]=value[j];value[j]=t;
    }
    int *out=malloc(k*sizeof(int));for(int i=0;i<k;i++)out[i]=value[i];*returnSize=k;return out;
}`,{chapter:'search',kind:'array',entry:'topKFrequent',call:'int size=0;int *out=topKFrequent(a,n,key,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',serialize:()=>'',input:{values:[1,1,1,2,2,3],key:2},tests:[{values:[1],key:1},{values:[2,2,1,1,3],key:2}],checker:'top-k-frequency',summary:'先计频再选择高频项。参考小规模实现使用线性表，允许替换为哈希表与堆。',expected:i=>{const freq=new Map();for(const x of i.values)freq.set(x,(freq.get(x)||0)+1);return {output:[...freq].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,i.key).map(p=>p[0])};}});

function topo(i){const deg=Array(i.vertices).fill(0),adj=Array.from({length:i.vertices},()=>[]);for(const[u,v]of i.edges){adj[u].push(v);deg[v]++;}const q=[];deg.forEach((d,u)=>{if(!d)q.push(u);});for(let n=0;n<q.length;n++)for(const v of adj[q[n]])if(--deg[v]===0)q.push(v);return q;}
function validateRPN(i){if(!Array.isArray(i.tokens)||!i.tokens.length||i.tokens.length>50)throw new Error('tokens 必须为非空的字符串数组，最多 50 项');const s=[];for(const t of i.tokens){if(typeof t!=='string')throw new Error('token 必须为字符串');if(['+','-','*','/'].includes(t)){if(s.length<2)throw new Error('逆波兰表达式操作数不足');const b=s.pop(),a=s.pop();if(t==='/'&&!b)throw new Error('除数不能为 0');s.push(t==='+'?a+b:t==='-'?a-b:t==='*'?a*b:Math.trunc(a/b));}else{if(!/^-?\d+$/.test(t)||Math.abs(+t)>100000)throw new Error('token 数值格式或范围错误');s.push(+t);}if(Math.abs(s.at(-1))>1000000)throw new Error('中间结果超出教学范围');}if(s.length!==1)throw new Error('逆波兰表达式未归约为单值');return s[0];}
