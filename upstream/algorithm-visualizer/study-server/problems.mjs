import { add, algorithms } from './catalog.mjs';
const definitions=[
 [26,'删除有序数组中的重复项','简单','数组'],[27,'移除元素','简单','数组'],[35,'搜索插入位置','简单','二分查找'],[88,'合并两个有序数组','简单','数组'],[704,'二分查找','简单','二分查找'],[19,'删除链表的倒数第 N 个结点','中等','链表'],[21,'合并两个有序链表','简单','链表'],[24,'两两交换链表中的节点','中等','链表'],[83,'删除排序链表中的重复元素','简单','链表'],[141,'环形链表','简单','链表'],[142,'环形链表 II','中等','链表'],[160,'相交链表','简单','链表'],[206,'反转链表','简单','链表'],[20,'有效的括号','简单','栈'],[150,'逆波兰表达式求值','中等','栈'],[155,'最小栈','中等','栈'],[225,'用队列实现栈','简单','队列'],[232,'用栈实现队列','简单','栈'],[739,'每日温度','中等','栈'],[28,'找出字符串中第一个匹配项的下标','简单','串'],[459,'重复的子字符串','简单','串'],[94,'二叉树的中序遍历','简单','树'],[98,'验证二叉搜索树','中等','树'],[102,'二叉树的层序遍历','中等','树'],[104,'二叉树的最大深度','简单','树'],[105,'从前序与中序遍历序列构造二叉树','中等','树'],[144,'二叉树的前序遍历','简单','树'],[145,'二叉树的后序遍历','简单','树'],[226,'翻转二叉树','简单','树'],[230,'二叉搜索树中第 K 小的元素','中等','树'],[236,'二叉树的最近公共祖先','中等','树'],[215,'数组中的第 K 个最大元素','中等','堆'],[347,'前 K 个高频元素','中等','堆'],[912,'排序数组','中等','排序'],[133,'克隆图','中等','图'],[200,'岛屿数量','中等','图'],[207,'课程表','中等','图'],[210,'课程表 II','中等','图'],[743,'网络延迟时间','中等','图'],[1,'两数之和','简单','哈希'],[49,'字母异位词分组','中等','哈希'],[128,'最长连续序列','中等','哈希']
];
export const problems=definitions.map(([number,title,difficulty,topic])=>({number,title,difficulty,topic,url:`https://leetcode.cn/problemset/?search=${number}`,algorithmId:null,metadataStatus:'初步目录，原站信息待逐题核对'}));
export function link(number,slug,source,options) {
  const p=problems.find(x=>x.number===number),id='lc-'+number;
  add(id,`${number}. ${p.title}`,options.chapter,options.kind,source,{...options,problemNumber:number,contract:options.contract||'使用本题 C 函数签名。结构类型由平台提供；导出时查看依赖说明。',tests:options.tests||[]});
  p.algorithmId=id;p.url='https://leetcode.cn/problems/'+slug+'/';p.slug=slug;
}
link(206,'reverse-linked-list',`struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode *prev=NULL,*curr=head;
    while(curr) {
        struct ListNode *next=curr->next;
        curr->next=prev;
        prev=curr;
        curr=next;
    }
    return prev;
}`,{chapter:'linear',kind:'leetcode-list',entry:'reverseList',call:'lc_head=reverseList(lc_head);',input:{values:[1,2,3,4]},tests:[{values:[]},{values:[1]}],summary:'保留原题无头结点接口，逐个反转 next。',expected:i=>({output:[...i.values].reverse()})});
link(83,'remove-duplicates-from-sorted-list',`struct ListNode* deleteDuplicates(struct ListNode* head) {
    struct ListNode *p=head;
    while(p && p->next) {
        if(p->val==p->next->val) p->next=p->next->next;
        else p=p->next;
    }
    return head;
}`,{chapter:'linear',kind:'leetcode-list',entry:'deleteDuplicates',call:'lc_head=deleteDuplicates(lc_head);',input:{values:[1,1,2,3,3]},tests:[{values:[]},{values:[1,1]}],summary:'在有序链表中跳过相邻重复值，观察暂不可达节点。',expected:i=>({output:i.values.filter((v,j,a)=>!j||v!==a[j-1])})});
link(704,'binary-search',`int search(int* nums, int numsSize, int target) {
    int l=0,r=numsSize-1;
    while(l<=r) {
        int m=l+(r-l)/2;
        if(nums[m]==target) return m;
        if(nums[m]<target) l=m+1;
        else r=m-1;
    }
    return -1;
}`,{chapter:'search',kind:'array',entry:'search',call:'result=search(a,n,key);',input:{values:[-1,0,3,5,9,12],key:9},tests:[{values:[],key:1},{values:[1],key:2}],summary:'闭区间二分查找。输入要求有序且无重复。',expected:i=>({result:i.values.indexOf(i.key)})});
link(35,'search-insert-position',`int searchInsert(int* nums,int numsSize,int target) {
    int l=0,r=numsSize;
    while(l<r) {
        int m=l+(r-l)/2;
        if(nums[m]<target) l=m+1;
        else r=m;
    }
    return l;
}`,{chapter:'search',kind:'array',entry:'searchInsert',call:'result=searchInsert(a,n,key);',input:{values:[1,3,5,6],key:2},tests:[{values:[1],key:0},{values:[1,3],key:4}],summary:'寻找第一个不小于 target 的位置，区间为 [l,r)。',expected:i=>({result:i.values.findIndex(v=>v>=i.key)<0?i.values.length:i.values.findIndex(v=>v>=i.key)})});
for(const [number,baseId,slug] of [[94,'inorder','binary-tree-inorder-traversal'],[144,'preorder','binary-tree-preorder-traversal'],[145,'postorder','binary-tree-postorder-traversal']]) {
  const base=algorithms.find(x=>x.id===baseId),name={94:'inorderTraversal',144:'preorderTraversal',145:'postorderTraversal'}[number];
  link(number,slug,base.source.replaceAll('Traverse','Visit').replace('ds_output[ds_output_len++]=p->val;','buffer[(*size)++]=p->val;').replace('void Visit(TreeNode *p)','void Visit(struct TreeNode *p,int *buffer,int *size)').replaceAll('Visit(p->left);','Visit(p->left,buffer,size);').replaceAll('Visit(p->right);','Visit(p->right,buffer,size);')+`\nint* ${name}(struct TreeNode* root,int* returnSize) {\n    int *out=malloc(CAP*sizeof(int));\n    *returnSize=0;\n    Visit(root,out,returnSize);\n    return out;\n}`,{chapter:'tree',kind:'tree',entry:name,call:`int count=0;int *out=${name}(root,&count);for(int z=0;z<count;z++)ds_output[ds_output_len++]=out[z];`,input:base.input,tests:base.tests,summary:'返回动态数组，并通过 returnSize 返回长度。',oracleId:baseId});
}
const depth=algorithms.find(x=>x.id==='tree-depth');
link(104,'maximum-depth-of-binary-tree',depth.source.replaceAll('Depth','maxDepth').replaceAll('TreeNode *p','struct TreeNode *p'),{chapter:'tree',kind:'tree',entry:'maxDepth',call:'result=maxDepth(root);',input:depth.input,tests:depth.tests,summary:depth.summary,oracleId:'tree-depth'});
const match=algorithms.find(x=>x.id==='naive-match');
link(28,'find-the-index-of-the-first-occurrence-in-a-string',match.source.replaceAll('Index','strStr').replace('const char *s,const char *p','char *s,char *p'),{chapter:'string',kind:'string',entry:'strStr',call:'result=strStr(text,pattern);',input:match.input,tests:match.tests,summary:match.summary});
const bracket=algorithms.find(x=>x.id==='brackets');
link(20,'valid-parentheses',bracket.source.replace('int Match(const char *s)','bool isValid(char *s)'),{chapter:'stack',kind:'string',entry:'isValid',call:'result=isValid(text);',input:bracket.input,tests:bracket.tests,summary:bracket.summary,oracleId:'brackets'});
