import {link as register,problems} from './problems.mjs';
import {makeTree} from './problems-extra.mjs';

function link(number,slug,source,options){
  const validate=options.validate;
  register(number,slug,source,{...options,validate:i=>{if([86,203,112,33,34].includes(number)&&!Number.isInteger(i.key))throw new Error('请用 key 指定整数目标值');validate?.(i);}});
}

const entries=[
 [92,'反转链表 II','中等','链表'],[61,'旋转链表','中等','链表'],[86,'分隔链表','中等','链表'],[203,'移除链表元素','简单','链表'],[328,'奇偶链表','中等','链表'],
 [100,'相同的树','简单','树'],[101,'对称二叉树','简单','树'],[110,'平衡二叉树','简单','树'],[111,'二叉树的最小深度','简单','树'],[112,'路径总和','简单','树'],[199,'二叉树的右视图','中等','树'],[543,'二叉树的直径','简单','树'],
 [33,'搜索旋转排序数组','中等','二分查找'],[34,'在排序数组中查找元素的第一个和最后一个位置','中等','二分查找'],[153,'寻找旋转排序数组中的最小值','中等','二分查找'],
 [239,'滑动窗口最大值','困难','队列'],[496,'下一个更大元素 I','简单','栈'],[946,'验证栈序列','中等','栈'],[1971,'寻找图中是否存在路径','简单','图'],[684,'冗余连接','中等','图']
];
for(const [number,title,difficulty,topic]of entries)problems.push({number,title,difficulty,topic,algorithmId:null,url:'',metadataStatus:'精选目录；接口与教学规模见本站说明'});
const list={chapter:'linear',kind:'leetcode-list'},tree={chapter:'tree',kind:'tree'},search={chapter:'search',kind:'array',serialize:()=>''};
const empty=()=>'';
const second=i=>`int second[CAP]={${i.values2.length?i.values2.join(','):0}};m=${i.values2.length};`;
function validateSecond(i){if(!Array.isArray(i.values2)||i.values2.length>32||i.values2.some(x=>!Number.isInteger(x)||Math.abs(x)>100000))throw new Error('values2 须为最多 32 个范围内整数');}
function rotated(i){if(new Set(i.values).size!==i.values.length)throw new Error('数组元素须互不相同');const a=i.values;if(a.length&&a.filter((v,k)=>v>a[(k+1)%a.length]).length>1)throw new Error('请输入严格升序数组的旋转结果');}

link(92,'reverse-linked-list-ii',`struct ListNode* reverseBetween(struct ListNode* head,int left,int right) {
    struct ListNode dummy={0,head},*before=&dummy;
    for(int i=1;i<left;i++)before=before->next;
    struct ListNode *tail=before->next;
    for(int i=left;i<right;i++) {
        struct ListNode *p=tail->next;
        tail->next=p->next;p->next=before->next;before->next=p;
    }
    return dummy.next;
}`,{...list,entry:'reverseBetween',call:'lc_head=reverseBetween(lc_head,key,aux[0]);',input:{values:[1,2,3,4,5],key:2,value:4},tests:[{values:[1],key:1,value:1},{values:[1,2,3],key:1,value:3},{values:[1,2,3],key:2,value:2}],validate:i=>{if(!Number.isInteger(i.key)||!Number.isInteger(i.value)||i.key<1||i.value<i.key||i.value>i.values.length)throw new Error('key=left、value=right，满足 1 ≤ left ≤ right ≤ 长度');},summary:'key 与 value 为从 1 开始的左右位置。区间内反复头插，观察三条 next 边的更新。',complexity:'O(n) 时间，O(1) 空间',expected:i=>({output:[...i.values.slice(0,i.key-1),...i.values.slice(i.key-1,i.value).reverse(),...i.values.slice(i.value)]})});
link(61,'rotate-list',`struct ListNode* rotateRight(struct ListNode* head,int k) {
    if(!head||!head->next)return head;
    int len=1;struct ListNode *tail=head;
    while(tail->next){tail=tail->next;len++;}
    k%=len;if(!k)return head;
    tail->next=head;struct ListNode *p=head;
    for(int i=1;i<len-k;i++)p=p->next;
    head=p->next;p->next=NULL;return head;
}`,{...list,entry:'rotateRight',call:'lc_head=rotateRight(lc_head,key);',input:{values:[1,2,3,4,5],key:2},tests:[{values:[],key:0},{values:[1],key:12},{values:[1,2,3],key:3},{values:[0,1,2],key:4}],validate:i=>{if(!Number.isInteger(i.key)||i.key<0)throw new Error('key 为非负旋转次数');},summary:'key 是右移次数。先接成环，再在新尾结点处断开；中间的环会保留在回放中。',complexity:'O(n) 时间，O(1) 空间',expected:i=>{const n=i.values.length,k=n?i.key%n:0;return {output:k?[...i.values.slice(n-k),...i.values.slice(0,n-k)]:i.values};}});
link(86,'partition-list',`struct ListNode* partition(struct ListNode* head,int x) {
    struct ListNode low={0,NULL},high={0,NULL},*a=&low,*b=&high;
    while(head) {
        struct ListNode *next=head->next;head->next=NULL;
        if(head->val<x){a->next=head;a=head;}else{b->next=head;b=head;}
        head=next;
    }
    a->next=high.next;return low.next;
}`,{...list,entry:'partition',call:'lc_head=partition(lc_head,key);',input:{values:[1,4,3,2,5,2],key:3},tests:[{values:[],key:0},{values:[3,1,2],key:9},{values:[3,1,2],key:0}],summary:'key 是分隔值 x。分别连接两个保持原顺序的链，再拼接。',complexity:'O(n) 时间，O(1) 空间',expected:i=>({output:[...i.values.filter(v=>v<i.key),...i.values.filter(v=>v>=i.key)]})});
link(203,'remove-linked-list-elements',`struct ListNode* removeElements(struct ListNode* head,int val) {
    struct ListNode dummy={0,head},*p=&dummy;
    while(p->next) {
        if(p->next->val==val){struct ListNode *q=p->next;p->next=q->next;free(q);}
        else p=p->next;
    }
    return dummy.next;
}`,{...list,entry:'removeElements',call:'lc_head=removeElements(lc_head,key);',input:{values:[1,2,6,3,4,5,6],key:6},tests:[{values:[],key:1},{values:[7,7,7],key:7},{values:[1,2],key:3}],summary:'key 是目标值。哑结点统一处理表头删除；被删除节点的释放记录保留。',complexity:'O(n) 时间，O(1) 空间',expected:i=>({output:i.values.filter(v=>v!==i.key)})});
link(328,'odd-even-linked-list',`struct ListNode* oddEvenList(struct ListNode* head) {
    if(!head)return NULL;
    struct ListNode *odd=head,*even=head->next,*evenHead=even;
    while(even&&even->next) {
        odd->next=even->next;odd=odd->next;
        even->next=odd->next;even=even->next;
    }
    odd->next=evenHead;return head;
}`,{...list,entry:'oddEvenList',call:'lc_head=oddEvenList(lc_head);',input:{values:[1,2,3,4,5]},tests:[{values:[]},{values:[1]},{values:[2,1,3,5,6,4,7]}],summary:'按从 1 开始的位置分奇偶，保留各组相对顺序，再连接两组。',complexity:'O(n) 时间，O(1) 空间',expected:i=>({output:[...i.values.filter((_,k)=>k%2===0),...i.values.filter((_,k)=>k%2===1)]})});

link(101,'symmetric-tree',`bool Mirror(struct TreeNode *a,struct TreeNode *b) {
    if(!a||!b)return a==b;
    return a->val==b->val&&Mirror(a->left,b->right)&&Mirror(a->right,b->left);
}
bool isSymmetric(struct TreeNode* root) {return !root||Mirror(root->left,root->right);}
`,{...tree,entry:'isSymmetric',call:'result=isSymmetric(root);',input:{values:[1,2,2,3,4,4,3]},tests:[{values:[]},{values:[1,2,2,null,3,null,3]},{values:[1]}],summary:'递归比较左树与右树的镜像位置。返回值通过 result 查看。',complexity:'O(n) 时间，O(h) 调用栈',expected:i=>{const t=makeTree(i.values),mirror=(a,b)=>!a||!b?a==b:a.v===b.v&&mirror(a.l,b.r)&&mirror(a.r,b.l);return {result:+(!t||mirror(t.l,t.r))};}});
link(110,'balanced-binary-tree',`int BalancedHeight(struct TreeNode *p) {
    if(!p)return 0;
    int left=BalancedHeight(p->left);if(left<0)return -1;
    int right=BalancedHeight(p->right);if(right<0||abs(left-right)>1)return -1;
    return 1+(left>right?left:right);
}
bool isBalanced(struct TreeNode* root) {return BalancedHeight(root)>=0;}
`,{...tree,entry:'isBalanced',call:'result=isBalanced(root);',input:{values:[3,9,20,null,null,15,7]},tests:[{values:[]},{values:[1,2,null,3,null,4]},{values:[1,2,2,3,3,null,null,4,4]}],summary:'后序遍历同时计算高度与平衡性，-1 向上传播失衡。',complexity:'O(n) 时间，O(h) 调用栈',expected:i=>{const height=p=>!p?0:1+Math.max(height(p.l),height(p.r));const balanced=p=>!p||Math.abs(height(p.l)-height(p.r))<=1&&balanced(p.l)&&balanced(p.r);return {result:+balanced(makeTree(i.values))};}});
link(111,'minimum-depth-of-binary-tree',`int minDepth(struct TreeNode* root) {
    if(!root)return 0;
    if(!root->left)return 1+minDepth(root->right);
    if(!root->right)return 1+minDepth(root->left);
    int a=minDepth(root->left),b=minDepth(root->right);return 1+(a<b?a:b);
}`,{...tree,entry:'minDepth',call:'result=minDepth(root);',input:{values:[3,9,20,null,null,15,7]},tests:[{values:[]},{values:[2,null,3,null,4,null,5]},{values:[1]}],summary:'只有叶子才结束路径。单边为空时继续走非空子树，避免把空孩子当最短路径。',expected:i=>{const q=[],t=makeTree(i.values);if(t)q.push([t,1]);while(q.length){const [p,d]=q.shift();if(!p.l&&!p.r)return {result:d};for(const c of [p.l,p.r])if(c)q.push([c,d+1]);}return {result:0};}});
link(112,'path-sum',`bool hasPathSum(struct TreeNode* root,int targetSum) {
    if(!root)return false;
    if(!root->left&&!root->right)return root->val==targetSum;
    return hasPathSum(root->left,targetSum-root->val)||hasPathSum(root->right,targetSum-root->val);
}`,{...tree,entry:'hasPathSum',call:'result=hasPathSum(root,key);',input:{values:[5,4,8,11,null,13,4,7,2,null,null,null,1],key:22},tests:[{values:[],key:0},{values:[1,2],key:1},{values:[-2,null,-3],key:-5}],summary:'key 是目标和。递归参数保留剩余目标，必须到叶子才能成功。',expected:i=>{const sums=[],walk=(p,sum)=>{if(!p)return;sum+=p.v;if(!p.l&&!p.r)sums.push(sum);walk(p.l,sum);walk(p.r,sum);};walk(makeTree(i.values),0);return {result:+sums.includes(i.key)};}});
link(199,'binary-tree-right-side-view',`int* rightSideView(struct TreeNode* root,int* returnSize) {
    int *out=malloc(CAP*sizeof(int));struct TreeNode *queue[CAP];int front=0,rear=0;*returnSize=0;
    if(root)queue[rear++]=root;
    while(front<rear) {
        int end=rear;
        while(front<end) {
            struct TreeNode *p=queue[front++];
            if(front==end)out[(*returnSize)++]=p->val;
            if(p->left)queue[rear++]=p->left;if(p->right)queue[rear++]=p->right;
        }
    }
    return out;
}`,{...tree,entry:'rightSideView',call:'int size=0;int *out=rightSideView(root,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',input:{values:[1,2,3,null,5,null,4]},tests:[{values:[]},{values:[1,2,null,3]},{values:[1]}],summary:'每层队列的最后一个节点形成右视图。对照队列下标、调用变量与树图。',expected:i=>{const out=[],walk=(p,d)=>{if(!p)return;out[d]=p.v;walk(p.l,d+1);walk(p.r,d+1);};walk(makeTree(i.values),0);return {output:out};}});
link(543,'diameter-of-binary-tree',`int DiameterHeight(struct TreeNode *p,int *best) {
    if(!p)return 0;
    int left=DiameterHeight(p->left,best),right=DiameterHeight(p->right,best);
    if(left+right>*best)*best=left+right;
    return 1+(left>right?left:right);
}
int diameterOfBinaryTree(struct TreeNode* root) {int best=0;DiameterHeight(root,&best);return best;}
`,{...tree,entry:'diameterOfBinaryTree',call:'result=diameterOfBinaryTree(root);',input:{values:[1,2,3,4,5]},tests:[{values:[]},{values:[1]},{values:[1,2,null,3,null,4]}],summary:'后序返回高度，左右高度之和更新直径。直径按边数计，可以不经过根。',complexity:'O(n) 时间，O(h) 调用栈',expected:i=>{const t=makeTree(i.values),adj=new Map();const connect=p=>{if(!p)return;adj.set(p,adj.get(p)||[]);for(const c of [p.l,p.r])if(c){adj.get(p).push(c);adj.set(c,[p]);connect(c);}};connect(t);let best=0;for(const p of adj.keys()){const q=[[p,null,0]];for(const [u,prev,d]of q){best=Math.max(best,d);for(const v of adj.get(u))if(v!==prev)q.push([v,u,d+1]);}}return {result:best};}});
function secondTree(i){
  // Build an independent tree from compact level order; nulls are not integer zero.
  const a=i.values2,vals=a.map(x=>x??0),nil=a.map(x=>x===null?1:0);
  return `TreeNode *other=NULL;${a.length&&a[0]!==null?`{int vals[]={${vals}},nil[]={${nil}};TreeNode *q[CAP];int f=0,r=0,z=1;other=calloc(1,sizeof(TreeNode));other->val=vals[0];q[r++]=other;while(f<r&&z<${a.length}){TreeNode *p=q[f++];if(!nil[z]){p->left=calloc(1,sizeof(TreeNode));p->left->val=vals[z];q[r++]=p->left;}z++;if(z<${a.length}&&!nil[z]){p->right=calloc(1,sizeof(TreeNode));p->right->val=vals[z];q[r++]=p->right;}z++;}}`:''}`;
}
link(100,'same-tree',`bool isSameTree(struct TreeNode* p,struct TreeNode* q) {
    if(!p||!q)return p==q;
    return p->val==q->val&&isSameTree(p->left,q->left)&&isSameTree(p->right,q->right);
}`,{...tree,entry:'isSameTree',setup:secondTree,call:'result=isSameTree(root,other);',input:{values:[1,2,3],values2:[1,2,3]},tests:[{values:[],values2:[]},{values:[1,2],values2:[1,null,2]},{values:[1],values2:[2]}],validate:i=>{if(!Array.isArray(i.values2)||i.values2.length>32||i.values2.some(x=>x!==null&&(!Number.isInteger(x)||Math.abs(x)>100000)))throw new Error('values2 为最多 32 项的层序数组，允许 null');},summary:'values 与 values2 构造两棵独立二叉树。同时比较节点值与左右结构。',expected:i=>({result:+(JSON.stringify(makeTree(i.values))===JSON.stringify(makeTree(i.values2)))})});

link(33,'search-in-rotated-sorted-array',`int search(int* nums,int numsSize,int target) {
    int left=0,right=numsSize-1;
    while(left<=right) {
        int mid=left+(right-left)/2;if(nums[mid]==target)return mid;
        if(nums[left]<=nums[mid]) {
            if(nums[left]<=target&&target<nums[mid])right=mid-1;else left=mid+1;
        }else {
            if(nums[mid]<target&&target<=nums[right])left=mid+1;else right=mid-1;
        }
    }
    return -1;
}`,{...search,entry:'search',call:'result=search(a,n,key);',validate:rotated,input:{values:[4,5,6,7,0,1,2],key:0},tests:[{values:[4,5,6,7,0,1,2],key:3},{values:[1],key:0},{values:[1,2,3],key:3},{values:[3,1],key:1}],summary:'输入为无重复的升序旋转数组，key 为目标。每轮识别有序半区，缩小查找范围。',complexity:'O(log n) 时间，O(1) 空间',expected:i=>({result:i.values.indexOf(i.key)})});
link(34,'find-first-and-last-position-of-element-in-sorted-array',`int Bound(int *nums,int n,int target,bool upper) {
    int left=0,right=n;
    while(left<right) {int mid=left+(right-left)/2;if(nums[mid]<target||(upper&&nums[mid]==target))left=mid+1;else right=mid;}
    return left;
}
int* searchRange(int* nums,int numsSize,int target,int* returnSize) {
    int *out=malloc(2*sizeof(int));*returnSize=2;
    int left=Bound(nums,numsSize,target,false),right=Bound(nums,numsSize,target,true)-1;
    out[0]=left<=right?left:-1;out[1]=left<=right?right:-1;return out;
}`,{...search,entry:'searchRange',call:'int size=0;int *out=searchRange(a,n,key,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',input:{values:[5,7,7,8,8,10],key:8},tests:[{values:[],key:0},{values:[1,1,1],key:1},{values:[1,3],key:2}],validate:i=>{if(i.values.some((x,k,a)=>k&&x<a[k-1]))throw new Error('数组必须非递减有序');},summary:'两次边界二分分别求首次出现和最后出现位置。未找到返回 [-1,-1]。',complexity:'O(log n) 时间，O(1) 辅助空间',expected:i=>({output:[i.values.indexOf(i.key),i.values.lastIndexOf(i.key)]})});
link(153,'find-minimum-in-rotated-sorted-array',`int findMin(int* nums,int numsSize) {
    int left=0,right=numsSize-1;
    while(left<right) {int mid=left+(right-left)/2;if(nums[mid]>nums[right])left=mid+1;else right=mid;}
    return nums[left];
}`,{...search,entry:'findMin',call:'result=findMin(a,n);',validate:i=>{rotated(i);if(!i.values.length)throw new Error('本题数组不能为空');},input:{values:[3,4,5,1,2]},tests:[{values:[1]},{values:[1,2,3]},{values:[2,1]}],summary:'输入为无重复升序数组的旋转结果。用中点与右端比较来保留最小值所在区间。',complexity:'O(log n) 时间，O(1) 空间',expected:i=>({result:Math.min(...i.values)})});

link(239,'sliding-window-maximum',`int* maxSlidingWindow(int* nums,int numsSize,int k,int* returnSize) {
    int *out=malloc(numsSize*sizeof(int)),deque[CAP],front=0,rear=0;*returnSize=0;
    for(int i=0;i<numsSize;i++) {
        while(front<rear&&deque[front]<=i-k)front++;
        while(front<rear&&nums[deque[rear-1]]<=nums[i])rear--;
        deque[rear++]=i;
        if(i>=k-1)out[(*returnSize)++]=nums[deque[front]];
    }
    return out;
}`,{chapter:'stack',kind:'array',entry:'maxSlidingWindow',serialize:empty,call:'int size=0;int *out=maxSlidingWindow(a,n,key,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',input:{values:[1,3,-1,-3,5,3,6,7],key:3},tests:[{values:[1],key:1},{values:[4,4,4],key:2},{values:[9,8,7,6],key:4},{values:[1,2,3],key:1}],validate:i=>{if(!Number.isInteger(i.key)||i.key<1||i.key>i.values.length)throw new Error('key 为窗口宽度，范围 1 到数组长度');},summary:'单调双端队列存下标：队首清理过期项，队尾清理较小项。key 为窗口宽度。',complexity:'O(n) 时间，O(k) 有效队列空间（教学数组预分配 CAP）',expected:i=>({output:i.values.slice(i.key-1).map((_,k)=>Math.max(...i.values.slice(k,k+i.key)))})});
link(496,'next-greater-element-i',`int* nextGreaterElement(int* nums1,int nums1Size,int* nums2,int nums2Size,int* returnSize) {
    int stack[CAP],next[CAP],top=0;int *out=malloc(nums1Size*sizeof(int));*returnSize=nums1Size;
    for(int i=nums2Size-1;i>=0;i--) {
        while(top&&stack[top-1]<=nums2[i])top--;
        next[i]=top?stack[top-1]:-1;stack[top++]=nums2[i];
    }
    for(int i=0;i<nums1Size;i++){out[i]=-1;for(int j=0;j<nums2Size;j++)if(nums1[i]==nums2[j]){out[i]=next[j];break;}}
    return out;
}`,{chapter:'stack',kind:'array',entry:'nextGreaterElement',setup:second,serialize:empty,call:'int size=0;int *out=nextGreaterElement(a,n,second,m,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',input:{values:[4,1,2],values2:[1,3,4,2]},tests:[{values:[2,4],values2:[1,2,3,4]},{values:[],values2:[]},{values:[1],values2:[1]}],validate:i=>{validateSecond(i);if(new Set(i.values).size!==i.values.length||new Set(i.values2).size!==i.values2.length||i.values.some(x=>!i.values2.includes(x)))throw new Error('两数组各自无重复，values 是 values2 的子集');},summary:'values 为查询值，values2 为完整序列。先用单调栈求后继较大值，再查表；教学版查询为线性查找。',complexity:'预处理 O(m)，查询 O(nm)；可扩展哈希索引',expected:i=>({output:i.values.map(v=>{const k=i.values2.indexOf(v);return i.values2.slice(k+1).find(x=>x>v)??-1;})})});
link(946,'validate-stack-sequences',`bool validateStackSequences(int* pushed,int pushedSize,int* popped,int poppedSize) {
    int stack[CAP],top=0,j=0;
    for(int i=0;i<pushedSize;i++) {
        stack[top++]=pushed[i];
        while(top&&j<poppedSize&&stack[top-1]==popped[j]){top--;j++;}
    }
    return j==poppedSize;
}`,{chapter:'stack',kind:'array',entry:'validateStackSequences',setup:second,serialize:empty,call:'result=validateStackSequences(a,n,second,m);',input:{values:[1,2,3,4,5],values2:[4,5,3,2,1]},tests:[{values:[1,2,3,4,5],values2:[4,3,5,1,2]},{values:[1],values2:[1]},{values:[],values2:[]}],validate:i=>{validateSecond(i);if(new Set(i.values).size!==i.values.length||i.values.length!==i.values2.length||[...i.values].sort((a,b)=>a-b).join()!=[...i.values2].sort((a,b)=>a-b).join())throw new Error('入栈序列须无重复，出栈序列为其排列');},summary:'values 为入栈序列，values2 为候选出栈序列。模拟每次入栈后尽可能出栈。',complexity:'O(n) 时间，O(n) 空间',expected:i=>{let next=0;const work=[];for(const x of i.values2){while(!work.length||work.at(-1)!==x){if(next===i.values.length)return {result:0};work.push(i.values[next++]);}work.pop();}return {result:1};}});

const graphSetup=i=>`int data[128][2]={${i.edges.length?i.edges.map(([u,v])=>`{${u},${v}}`).join(','):'{0,0}'}};int *edges[128],columns[128];m=${i.edges.length};for(int z=0;z<m;z++){edges[z]=data[z];columns[z]=2;}`;
link(1971,'find-if-path-exists-in-graph',`bool validPath(int n,int** edges,int edgesSize,int* edgesColSize,int source,int destination) {
    bool seen[CAP]={0};int queue[CAP],front=0,rear=0;queue[rear++]=source;seen[source]=true;
    while(front<rear) {
        int u=queue[front++];if(u==destination)return true;
        for(int i=0;i<edgesSize;i++) {
            int v=-1;if(edges[i][0]==u)v=edges[i][1];else if(edges[i][1]==u)v=edges[i][0];
            if(v>=0&&!seen[v]){seen[v]=true;queue[rear++]=v;}
        }
    }
    return false;
}`,{chapter:'graph',kind:'graph',entry:'validPath',setup:graphSetup,call:'result=validPath(n,edges,m,columns,key,aux[0]);',input:{vertices:5,directed:false,edges:[[0,1],[1,2],[3,4]],start:0,value:2},tests:[{vertices:5,directed:false,edges:[[0,1],[1,2],[3,4]],start:0,value:4},{vertices:1,directed:false,edges:[],start:0,value:0},{vertices:3,directed:false,edges:[[0,1],[1,2],[2,0]],start:0,value:2}],validate:i=>{if(i.directed||!Number.isInteger(i.value)||i.value<0||i.value>=i.vertices)throw new Error('本题使用无向图，value 为有效目标顶点，start 为起点');},summary:'start 与 value 为起终点。保留原题边表接口，BFS 检查无向图的可达性；教学版逐轮扫描边表。',complexity:'教学边表扫描 O(VE)，可扩展邻接表 O(V+E)',expected:i=>{const seen=new Set([i.start??0]);let count=-1;while(count!==seen.size){count=seen.size;for(const[u,v]of i.edges){if(seen.has(u))seen.add(v);if(seen.has(v))seen.add(u);}}return {result:+seen.has(i.value)};}});
link(684,'redundant-connection',`int FindRoot(int *parent,int x) {
    if(parent[x]!=x)parent[x]=FindRoot(parent,parent[x]);return parent[x];
}
int* findRedundantConnection(int** edges,int edgesSize,int* edgesColSize,int* returnSize) {
    int parent[CAP];for(int i=0;i<CAP;i++)parent[i]=i;int *out=malloc(2*sizeof(int));*returnSize=0;
    for(int i=0;i<edgesSize;i++) {
        int u=edges[i][0],v=edges[i][1],a=FindRoot(parent,u),b=FindRoot(parent,v);
        if(a==b){out[0]=u;out[1]=v;*returnSize=2;}else parent[a]=b;
    }
    return out;
}`,{chapter:'graph',kind:'graph',entry:'findRedundantConnection',setup:i=>graphSetup({...i,edges:i.edges.map(([u,v])=>[u+1,v+1])}),call:'int size=0;int *out=findRedundantConnection(edges,m,columns,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',input:{vertices:3,directed:false,edges:[[0,1],[0,2],[1,2]],start:0},tests:[{vertices:5,directed:false,edges:[[0,1],[1,2],[2,3],[0,3],[0,4]],start:0},{vertices:4,directed:false,edges:[[0,1],[1,2],[2,3],[0,3]],start:0}],validate:i=>{if(i.directed||i.edges.length!==i.vertices)throw new Error('输入应为无向树添加一条边，边数等于顶点数');const seen=new Set([0]),pairs=new Set();for(const[u,v]of i.edges){const key=[u,v].sort((a,b)=>a-b).join();if(u===v||pairs.has(key))throw new Error('不允许自环或重边');pairs.add(key);}for(let k=0;k<i.vertices;k++)for(const[u,v]of i.edges){if(seen.has(u))seen.add(v);if(seen.has(v))seen.add(u);}if(seen.size!==i.vertices)throw new Error('图须连通');},summary:'本站图编号从 0 开始，调用时转为原题 1 起始编号，输出也为 1 起始边。并查集找出最后一条成环边。',complexity:'路径压缩并查集，O(E log V) 上界，O(V) 空间',expected:i=>{const adj=Array.from({length:i.vertices},()=>[]);let out=[];for(const[u,v]of i.edges){const seen=new Set([u]),q=[u];for(const x of q)for(const y of adj[x])if(!seen.has(y)){seen.add(y);q.push(y);}if(seen.has(v))out=[u+1,v+1];adj[u].push(v);adj[v].push(u);}return {output:out};}});
