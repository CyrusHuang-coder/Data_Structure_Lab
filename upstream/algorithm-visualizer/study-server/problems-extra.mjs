import {link} from './problems.mjs';
import {algorithms} from './catalog.mjs';
const array={chapter:'linear',kind:'array'};
link(26,'remove-duplicates-from-sorted-array',`int removeDuplicates(int* nums,int numsSize) {
    if(!numsSize)return 0;
    int k=1;
    for(int i=1;i<numsSize;i++)if(nums[i]!=nums[k-1])nums[k++]=nums[i];
    return k;
}`,{...array,entry:'removeDuplicates',call:'result=removeDuplicates(a,n);',outputLength:'result',input:{values:[0,0,1,1,2,3,3]},tests:[{values:[]},{values:[1,1]}],summary:'使用读写双指针，结果保留在数组前 result 个位置。输入要求升序。',expected:i=>({result:new Set(i.values).size,output:[...new Set(i.values)]})});
link(27,'remove-element',`int removeElement(int* nums,int numsSize,int val) {
    int k=0;
    for(int i=0;i<numsSize;i++)if(nums[i]!=val)nums[k++]=nums[i];
    return k;
}`,{...array,entry:'removeElement',call:'result=removeElement(a,n,key);',outputLength:'result',input:{values:[3,2,2,3],key:3},tests:[{values:[],key:0},{values:[1,1],key:1}],summary:'过滤指定值，前 result 个单元为有效结果。',expected:i=>({result:i.values.filter(v=>v!==i.key).length,output:i.values.filter(v=>v!==i.key)})});
link(88,'merge-sorted-array',`void merge(int* nums1,int nums1Size,int m,int* nums2,int nums2Size,int n) {
    int i=m-1,j=n-1,k=m+n-1;
    while(j>=0) {
        if(i>=0&&nums1[i]>nums2[j])nums1[k--]=nums1[i--];
        else nums1[k--]=nums2[j--];
    }
}`,{...array,entry:'merge',call:'merge(a,n+m,n,aux,m,m);',setup:i=>`m=${i.values2.length};int second[]={${i.values2.length?i.values2.join(','):0}};for(int z=0;z<m;z++)aux[z]=second[z];`,outputLength:'n+m',input:{values:[1,2,3],values2:[2,5,6]},tests:[{values:[],values2:[1]},{values:[1],values2:[]}],summary:'values 为第一个数组的有效部分，values2 为第二个数组。平台分配额外容量，从后向前归并。',expected:i=>({output:[...i.values,...i.values2].sort((a,b)=>a-b)})});
link(24,'swap-nodes-in-pairs',`struct ListNode* swapPairs(struct ListNode* head) {
    struct ListNode dummy={0,head};
    struct ListNode *p=&dummy;
    while(p->next&&p->next->next) {
        struct ListNode *a=p->next,*b=a->next;
        a->next=b->next;b->next=a;p->next=b;
        p=a;
    }
    return dummy.next;
}`,{chapter:'linear',kind:'leetcode-list',entry:'swapPairs',call:'lc_head=swapPairs(lc_head);',input:{values:[1,2,3,4]},tests:[{values:[]},{values:[1]},{values:[1,2,3]}],summary:'用栈上哑结点统一首对节点交换；动态节点图显示实际 next，局部哑结点在变量中展开。',expected:i=>{const a=[...i.values];for(let j=0;j+1<a.length;j+=2)[a[j],a[j+1]]=[a[j+1],a[j]];return {output:a};}});
link(19,'remove-nth-node-from-end-of-list',`struct ListNode* removeNthFromEnd(struct ListNode* head,int n) {
    struct ListNode dummy={0,head};struct ListNode *fast=&dummy,*slow=&dummy;
    for(int i=0;i<n;i++)fast=fast->next;
    while(fast->next){fast=fast->next;slow=slow->next;}
    struct ListNode *removed=slow->next;slow->next=removed->next;free(removed);
    return dummy.next;
}`,{chapter:'linear',kind:'leetcode-list',entry:'removeNthFromEnd',call:'lc_head=removeNthFromEnd(lc_head,key);',input:{values:[1,2,3,4,5],key:2},tests:[{values:[1],key:1},{values:[1,2],key:2}],summary:'快指针先走 n 步，再同步移动。key 表示倒数位置，范围 1 到链表长度。',expected:i=>({output:i.values.filter((_,k)=>k!==i.values.length-i.key)})});
link(141,'linked-list-cycle',`bool hasCycle(struct ListNode* head) {
    struct ListNode *slow=head,*fast=head;
    while(fast&&fast->next) {
        slow=slow->next;fast=fast->next->next;
        if(slow==fast)return true;
    }
    return false;
}`,{chapter:'linear',kind:'leetcode-list',entry:'hasCycle',call:'result=hasCycle(lc_head);',setup:i=>(i.cycleTo??-1)<0?'':`{struct ListNode *target=lc_head,*tail=lc_head;for(int z=0;z<${i.cycleTo};z++)target=target->next;while(tail->next)tail=tail->next;tail->next=target;}`,serialize:()=>'',input:{values:[3,2,0,-4],cycleTo:1},tests:[{values:[],cycleTo:-1},{values:[1],cycleTo:0},{values:[1,2],cycleTo:-1}],summary:'cycleTo 是尾节点连接的 0 起始节点下标，-1 为无环。快慢指针同址相遇表示有环。',expected:i=>({result:+((i.cycleTo??-1)>=0)})});
link(142,'linked-list-cycle-ii',`struct ListNode* detectCycle(struct ListNode* head) {
    struct ListNode *slow=head,*fast=head;
    while(fast&&fast->next) {
        slow=slow->next;fast=fast->next->next;
        if(slow==fast) {
            slow=head;
            while(slow!=fast){slow=slow->next;fast=fast->next;}
            return slow;
        }
    }
    return NULL;
}`,{chapter:'linear',kind:'leetcode-list',entry:'detectCycle',call:'struct ListNode *found=detectCycle(lc_head);result=-1;struct ListNode *cursor=lc_head;for(int z=0;z<n;z++){if(found==cursor){result=z;break;}cursor=cursor?cursor->next:NULL;}',setup:i=>(i.cycleTo??-1)<0?'':`{struct ListNode *target=lc_head,*tail=lc_head;for(int z=0;z<${i.cycleTo};z++)target=target->next;while(tail->next)tail=tail->next;tail->next=target;}`,serialize:()=>'',input:{values:[3,2,0,-4],cycleTo:1},tests:[{values:[],cycleTo:-1},{values:[1],cycleTo:0}],summary:'相遇后一个指针回到头部，同速推进找到入口。平台将返回节点换算为下标用于核对。',expected:i=>({result:i.cycleTo??-1})});
link(739,'daily-temperatures',`int* dailyTemperatures(int* temperatures,int temperaturesSize,int* returnSize) {
    int *answer=calloc(temperaturesSize,sizeof(int)),s[CAP],top=0;
    for(int i=0;i<temperaturesSize;i++) {
        while(top&&temperatures[i]>temperatures[s[top-1]]) {int j=s[--top];answer[j]=i-j;}
        s[top++]=i;
    }
    *returnSize=temperaturesSize;return answer;
}`,{chapter:'stack',kind:'array',entry:'dailyTemperatures',call:'int size=0;int *out=dailyTemperatures(a,n,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',serialize:()=>'',input:{values:[73,74,75,71,69,72,76,73]},tests:[{values:[]},{values:[30,40,50]},{values:[30,30]}],summary:'单调栈保存等待更高温度的下标，出栈时计算等待天数。',expected:i=>({output:i.values.map((v,k)=>{const j=i.values.findIndex((x,j)=>j>k&&x>v);return j<0?0:j-k;})})});
link(459,'repeated-substring-pattern',`bool repeatedSubstringPattern(char* s) {
    int n=(int)strlen(s);
    for(int len=1;len<=n/2;len++)if(n%len==0) {
        int ok=1;
        for(int i=len;i<n;i++)if(s[i]!=s[i%len]){ok=0;break;}
        if(ok)return true;
    }
    return false;
}`,{chapter:'string',kind:'string',entry:'repeatedSubstringPattern',call:'result=repeatedSubstringPattern(text);',input:{text:'abab',pattern:''},tests:[{text:'aba'},{text:'abcabcabc'},{text:'a'}],summary:'枚举可能的周期长度，用模下标验证整个字符串。',expected:i=>({result:+(i.text.length>0&&(i.text+i.text).slice(1,-1).includes(i.text))})});
link(98,'validate-binary-search-tree',`bool Valid(struct TreeNode *p,long long low,long long high) {
    if(!p)return true;
    if(p->val<=low||p->val>=high)return false;
    return Valid(p->left,low,p->val)&&Valid(p->right,p->val,high);
}
bool isValidBST(struct TreeNode* root) {
    return Valid(root,LLONG_MIN,LLONG_MAX);
}`,{chapter:'tree',kind:'tree',entry:'isValidBST',call:'result=isValidBST(root);',input:{values:[2,1,3]},tests:[{values:[5,1,4,null,null,3,6]},{values:[]},{values:[2,2,2]}],summary:'每层传递严格的上下界，避免只比较父子节点。',expected:i=>{const tree=makeTree(i.values);const check=(p,l,r)=>!p||p.v>l&&p.v<r&&check(p.l,l,p.v)&&check(p.r,p.v,r);return {result:+check(tree,-Infinity,Infinity)};}});
link(226,'invert-binary-tree',`struct TreeNode* invertTree(struct TreeNode* root) {
    if(!root)return NULL;
    struct TreeNode *left=root->left;
    root->left=invertTree(root->right);
    root->right=invertTree(left);
    return root;
}`,{chapter:'tree',kind:'tree',entry:'invertTree',call:'root=invertTree(root);',serialize:()=> 'TreeNode *q[CAP];int f=0,r=0;if(root)q[r++]=root;while(f<r){TreeNode *p=q[f++];ds_output[ds_output_len++]=p->val;if(p->left)q[r++]=p->left;if(p->right)q[r++]=p->right;}',input:{values:[4,2,7,1,3,6,9]},tests:[{values:[]},{values:[1,null,2]}],summary:'递归交换左右子树；平台按层序序列核对结果并检查节点连接。',expected:i=>{const t=makeTree(i.values),q=t?[t]:[],out=[];while(q.length){const p=q.shift();out.push(p.v);if(p.r)q.push(p.r);if(p.l)q.push(p.l);}return {output:out};}});
link(230,'kth-smallest-element-in-a-bst',`void Visit(struct TreeNode *p,int k,int *seen,int *answer) {
    if(!p)return;
    Visit(p->left,k,seen,answer);
    if(++*seen==k)*answer=p->val;
    Visit(p->right,k,seen,answer);
}
int kthSmallest(struct TreeNode* root,int k) {
    int seen=0,answer=0;Visit(root,k,&seen,&answer);return answer;
}`,{chapter:'tree',kind:'tree',entry:'kthSmallest',call:'result=kthSmallest(root,key);',input:{values:[3,1,4,null,2],key:1},tests:[{values:[1],key:1},{values:[2,1,3],key:2}],summary:'利用 BST 中序有序性质计数。key 是从 1 开始的 k。',expected:i=>({result:i.values.filter(v=>v!==null).sort((a,b)=>a-b)[i.key-1]})});
link(215,'kth-largest-element-in-an-array',`int findKthLargest(int* nums,int numsSize,int k) {
    for(int i=0;i<k;i++) {
        int m=i;
        for(int j=i+1;j<numsSize;j++)if(nums[j]>nums[m])m=j;
        int t=nums[i];nums[i]=nums[m];nums[m]=t;
    }
    return nums[k-1];
}`,{chapter:'sort',kind:'array',entry:'findKthLargest',call:'result=findKthLargest(a,n,key);',input:{values:[3,2,1,5,6,4],key:2},tests:[{values:[1],key:1},{values:[3,2,3,1,2,4,5,5,6],key:4}],summary:'执行 k 轮选择最大值。用于理解选择过程；可自行改为堆或快速选择。',expected:i=>({result:[...i.values].sort((a,b)=>b-a)[i.key-1]})});
link(912,'sort-an-array',`int* sortArray(int* nums,int numsSize,int* returnSize) {
    for(int i=1;i<numsSize;i++) {
        int x=nums[i],j=i-1;
        while(j>=0&&nums[j]>x){nums[j+1]=nums[j];j--;}
        nums[j+1]=x;
    }
    *returnSize=numsSize;return nums;
}`,{chapter:'sort',kind:'array',entry:'sortArray',call:'int size=0;int *out=sortArray(a,n,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',serialize:()=>'',input:{values:[5,2,3,1]},tests:[{values:[]},{values:[5,1,1,2,0,0]}],summary:'保留原题返回数组与 returnSize 接口；参考教学实现为插入排序，适合替换成 O(n log n) 版本。',expected:i=>({output:[...i.values].sort((a,b)=>a-b)})});
link(128,'longest-consecutive-sequence',`int longestConsecutive(int* nums,int numsSize) {
    int best=0;
    for(int i=0;i<numsSize;i++) {
        int hasPrev=0;for(int j=0;j<numsSize;j++)if(nums[j]==nums[i]-1)hasPrev=1;
        if(hasPrev)continue;
        int len=1,next=nums[i]+1;
        while(1) {
            int found=0;for(int j=0;j<numsSize;j++)if(nums[j]==next)found=1;
            if(!found)break;len++;next++;
        }
        if(len>best)best=len;
    }
    return best;
}`,{chapter:'search',kind:'array',entry:'longestConsecutive',call:'result=longestConsecutive(a,n);',input:{values:[100,4,200,1,3,2]},tests:[{values:[]},{values:[1,2,0,1]}],summary:'先找连续段起点，再延伸。参考版用线性成员查询，便于替换为哈希集合以达到期望 O(n)。',expected:i=>{const s=new Set(i.values);let best=0;for(const x of s)if(!s.has(x-1)){let n=1;while(s.has(x+n))n++;best=Math.max(best,n);}return {result:best};}});
link(1,'two-sum',`int* twoSum(int* nums,int numsSize,int target,int* returnSize) {
    int *out=malloc(2*sizeof(int));*returnSize=0;
    for(int i=0;i<numsSize;i++)for(int j=i+1;j<numsSize;j++)if(nums[i]+nums[j]==target){out[0]=i;out[1]=j;*returnSize=2;return out;}
    return out;
}`,{chapter:'search',kind:'array',entry:'twoSum',call:'int size=0;int *out=twoSum(a,n,key,&size);for(int z=0;z<size;z++)ds_output[ds_output_len++]=out[z];',serialize:()=>'',input:{values:[2,7,11,15],key:9},tests:[{values:[3,2,4],key:6},{values:[3,3],key:6}],summary:'参考版为双循环，返回两个不同元素下标。可自行改为哈希查找。',expected:i=>{for(let a=0;a<i.values.length;a++)for(let b=a+1;b<i.values.length;b++)if(i.values[a]+i.values[b]===i.key)return {output:[a,b]};return {output:[]};},checker:'two-sum'});

export function makeTree(values){if(!values.length||values[0]===null)return null;const root={v:values[0]},q=[root];let k=1;while(q.length&&k<values.length){const p=q.shift();if(values[k]!=null){p.l={v:values[k]};q.push(p.l);}k++;if(k<values.length&&values[k]!=null){p.r={v:values[k]};q.push(p.r);}k++;}return root;}
