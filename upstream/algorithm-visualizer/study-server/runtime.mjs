export const runtime = String.raw`#ifndef DS_RUNTIME_H
#define DS_RUNTIME_H
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <stdint.h>
#include <stdbool.h>
typedef int Status;
typedef int ElemType;
#define OK 1
#define ERROR 0
#define OVERFLOW -2
#define CAP 128
typedef struct LNode { int data; struct LNode *next; } LNode, *LinkList;
struct ListNode { int val; struct ListNode *next; };
typedef struct TreeNode { int val; struct TreeNode *left, *right; int height; } TreeNode;
typedef struct DNode { int data; struct DNode *prev, *next; } DNode;
typedef struct GNode { int tag, atom; struct GNode *head, *tail; } GNode;
typedef struct BNode { int count,leaf,keys[3];struct BNode *child[4],*next; } BNode;
typedef struct TNode { int data,ltag,rtag;struct TNode *left,*right; } TNode;
typedef struct CrossNode { int row,col,val;struct CrossNode *right,*down; } CrossNode;
typedef struct OrthEdge { int tail,head,weight;struct OrthEdge *tlink,*hlink; } OrthEdge;
typedef struct MultiEdge { int ivex,jvex,weight;struct MultiEdge *ilink,*jlink; } MultiEdge;
typedef struct CharBlock { char data[4];int len;struct CharBlock *next; } CharBlock;
typedef struct Arc { int to, weight; struct Arc *next; } Arc;
typedef struct { void *address; size_t size; int live; } DSAlloc;
DSAlloc ds_allocs[512]; int ds_alloc_count = 0;
int ds_memory_error = 0,ds_invariant_error=0;
int ds_validate_bst(TreeNode *p,long long low,long long high,int avl,int depth) {
    if(!p)return 0;
    if(depth>CAP||p->val<=low||p->val>=high)return -10000;
    int left=ds_validate_bst(p->left,low,p->val,avl,depth+1);
    int right=ds_validate_bst(p->right,p->val,high,avl,depth+1);
    if(left<0||right<0)return -10000;
    int h=1+(left>right?left:right);
    if(avl&&(left-right>1||right-left>1||p->height!=h))return -10000;
    return h;
}
int ds_validate_btree(BNode *p,long long low,long long high,int depth,int *leafDepth,int plus) {
    if(!p||depth>CAP||p->count<1||p->count>3)return 0;
    for(int i=0;i<p->count;i++)if(p->keys[i]<low||p->keys[i]>high||(!plus&&(p->keys[i]==low||p->keys[i]==high))||(i&&(plus?p->keys[i]<p->keys[i-1]:p->keys[i]<=p->keys[i-1])))return 0;
    if(p->leaf){if(*leafDepth<0)*leafDepth=depth;return *leafDepth==depth;}
    for(int i=0;i<=p->count;i++) {
        if(!ds_validate_btree(p->child[i],i?p->keys[i-1]:low,i<p->count?p->keys[i]:high,depth+1,leafDepth,plus))return 0;
        if(plus&&i){BNode *q=p->child[i];int guard=0;while(q&&!q->leaf&&guard++<CAP)q=q->child[0];if(!q||q->keys[0]!=p->keys[i-1])return 0;}
    }
    return 1;
}
void *ds_malloc(size_t n) {
    void *p = malloc(n);
    if (p && ds_alloc_count < 512) ds_allocs[ds_alloc_count++] = (DSAlloc){p,n,1};
    return p;
}
void *ds_calloc(size_t n, size_t s) {
    if (s && n > SIZE_MAX/s) return NULL;
    void *p = ds_malloc(n*s);
    if(p) memset(p,0,n*s);
    return p;
}
void ds_free(void *p) {
    if(!p) return;
    for(int i=ds_alloc_count-1;i>=0;i--) if(ds_allocs[i].address==p) {
        if(!ds_allocs[i].live) { ds_memory_error=1; return; }
        ds_allocs[i].live=0; free(p); return;
    }
    ds_memory_error=2;
}
void *ds_realloc(void *p,size_t n) {
    if(!p) return ds_malloc(n);
    if(!n) {ds_free(p); return NULL;}
    for(int i=ds_alloc_count-1;i>=0;i--) if(ds_allocs[i].address==p && ds_allocs[i].live) {
        void *q=ds_malloc(n);
        if(q) {memcpy(q,p,n<ds_allocs[i].size?n:ds_allocs[i].size);ds_free(p);}
        return q;
    }
    ds_memory_error=2; return NULL;
}
#define malloc ds_malloc
#define calloc ds_calloc
#define realloc ds_realloc
#define free ds_free
int a[CAP], n, aux[CAP], key, result, ds_output[CAP], ds_output_len;
LinkList head;
struct ListNode *lc_head;
TreeNode *root;
Arc *first[16];
int matrix[128][16], visited[CAP], dist[CAP], parent[CAP], queue[CAP], qhead, qtail;
int rows, cols, m, count, cursor[CAP], table[CAP], weights[CAP], leftChild[CAP], rightChild[CAP];
DNode *dhead;
GNode *ghead;
BNode *broot;
TNode *troot;
CrossNode *rowHead[8],*colHead[8];
OrthEdge *outHead[16],*inHead[16];
MultiEdge *edgeHead[16];
CharBlock *strHead;
void ds_finish(void);
/* Per-run files separate user I/O from the debugger protocol. */
__attribute__((constructor)) static void ds_bind_io(void) {
    freopen("stdin.txt","r",stdin);
    freopen("stdout.txt","w",stdout);
    setvbuf(stdout,NULL,_IONBF,0);
    atexit(ds_finish);
}
char text[CAP], pattern[CAP]; int next[CAP];
#ifdef DS_LINKED_ADT
typedef struct { LNode *top;int size; } IntStack;
typedef struct { LNode *front,*rear;int size; } IntQueue;
#else
typedef struct { int data[CAP]; int top; } IntStack;
typedef struct { int data[CAP]; int front, rear; } IntQueue;
#endif
IntStack stack;
IntQueue fifo;
typedef IntStack Stack;
typedef IntQueue Queue;
typedef struct {int data[CAP];int length;} SqList;
void ds_finish(void) { volatile int done=1; (void)done; }
#endif
`;

export const adt = String.raw`#ifndef DS_ADT_H
#define DS_ADT_H
#ifdef DS_LINKED_ADT
/* 链栈：top 指向栈顶，size 是元素数；传入已零初始化的栈。 */
Status Push(IntStack *s,int e) {
    LNode *p=malloc(sizeof(LNode));
    if(!p)return OVERFLOW;
    p->data=e;p->next=s->top;s->top=p;s->size++;
    return OK;
}
Status Pop(IntStack *s,int *out) {
    if(!s->top)return ERROR;
    LNode *p=s->top;*out=p->data;s->top=p->next;s->size--;
    free(p);return OK;
}
Status GetTop(const IntStack *s,int *out) {if(!s->top)return ERROR;*out=s->top->data;return OK;}
int StackEmpty(const IntStack *s){return !s->top;}
/* 无头结点链队列：front/rear 指向首尾，空队列均为 NULL。 */
Status EnQueue(IntQueue *q,int e) {
    LNode *p=malloc(sizeof(LNode));if(!p)return OVERFLOW;
    p->data=e;p->next=NULL;
    if(q->rear)q->rear->next=p;else q->front=p;
    q->rear=p;q->size++;return OK;
}
Status DeQueue(IntQueue *q,int *out) {
    if(!q->front)return ERROR;
    LNode *p=q->front;*out=p->data;q->front=p->next;
    if(!q->front)q->rear=NULL;q->size--;free(p);return OK;
}
#else
/* s: 初始化后的栈地址；e: 入栈元素。成功 OK，栈满 ERROR。 */
Status Push(IntStack *s, int e) {
    if(s->top >= CAP) return ERROR;
    s->data[s->top++] = e;
    return OK;
}
/* out: 输出参数，传入 int 变量地址；空栈 ERROR。 */
Status Pop(IntStack *s, int *out) {
    if(s->top == 0) return ERROR;
    *out = s->data[--s->top];
    return OK;
}
Status GetTop(const IntStack *s, int *out) {
    if(s->top == 0) return ERROR;
    *out = s->data[s->top-1];
    return OK;
}
int StackEmpty(const IntStack *s) { return s->top == 0; }
/* 循环队列牺牲一个单元，front 指向首元素，rear 指向下一个空位。 */
Status EnQueue(IntQueue *q, int e) {
    if((q->rear+1)%CAP==q->front) return ERROR;
    q->data[q->rear]=e;
    q->rear=(q->rear+1)%CAP;
    return OK;
}
Status DeQueue(IntQueue *q,int *out) {
    if(q->front==q->rear) return ERROR;
    *out=q->data[q->front];
    q->front=(q->front+1)%CAP;
    return OK;
}
#endif
/* L 为输出参数；成功后获得一个空的带头结点单链表。 */
Status InitList(LinkList *L){if(!L)return ERROR;*L=calloc(1,sizeof(LNode));return *L?OK:OVERFLOW;}
void ClearList(LinkList L){if(!L)return;LNode *p=L->next;while(p){LNode *q=p->next;free(p);p=q;}L->next=NULL;}
void DestroyList(LinkList *L){if(!L||!*L)return;ClearList(*L);free(*L);*L=NULL;}
int ListEmpty(LinkList L){return !L||!L->next;}
int ListLength(LinkList L){int n=0;for(LNode *p=L?L->next:NULL;p;p=p->next)n++;return n;}
Status GetElem(LinkList L,int i,int *out){if(!L||!out||i<1)return ERROR;LNode *p=L->next;for(int j=1;j<i&&p;j++)p=p->next;if(!p)return ERROR;*out=p->data;return OK;}
/* LocateElem 返回第一个匹配位置；未找到返回 0。 */
int LocateElem(LinkList L,int e){int i=1;for(LNode *p=L?L->next:NULL;p;p=p->next,i++)if(p->data==e)return i;return 0;}
Status PriorElem(LinkList L,int e,int *out){LNode *prev=NULL;for(LNode *p=L?L->next:NULL;p;p=p->next){if(p->data==e){if(!prev)return ERROR;*out=prev->data;return OK;}prev=p;}return ERROR;}
Status NextElem(LinkList L,int e,int *out){for(LNode *p=L?L->next:NULL;p;p=p->next)if(p->data==e){if(!p->next)return ERROR;*out=p->next->data;return OK;}return ERROR;}
void ListTraverse(LinkList L,void (*visit)(int)){for(LNode *p=L?L->next:NULL;p;p=p->next)visit(p->data);}
/* 栈/队列必须先零初始化或调用初始化函数；重复初始化前先销毁。 */
Status InitStack(IntStack *s){if(!s)return ERROR;memset(s,0,sizeof(*s));return OK;}
void ClearStack(IntStack *s){int value;while(!StackEmpty(s))Pop(s,&value);}
void DestroyStack(IntStack *s){ClearStack(s);}
int StackLength(const IntStack *s){
#ifdef DS_LINKED_ADT
return s->size;
#else
return s->top;
#endif
}
Status InitQueue(IntQueue *q){if(!q)return ERROR;memset(q,0,sizeof(*q));return OK;}
int QueueEmpty(const IntQueue *q){
#ifdef DS_LINKED_ADT
return !q->front;
#else
return q->front==q->rear;
#endif
}
int QueueLength(const IntQueue *q){
#ifdef DS_LINKED_ADT
return q->size;
#else
return (q->rear-q->front+CAP)%CAP;
#endif
}
Status GetHead(const IntQueue *q,int *out){if(QueueEmpty(q))return ERROR;
#ifdef DS_LINKED_ADT
*out=q->front->data;
#else
*out=q->data[q->front];
#endif
return OK;}
void ClearQueue(IntQueue *q){int value;while(!QueueEmpty(q))DeQueue(q,&value);}
void DestroyQueue(IntQueue *q){ClearQueue(q);}
Status InitSqList(SqList *L){if(!L)return ERROR;L->length=0;return OK;}
Status SqListInsert(SqList *L,int i,int e){if(i<0||i>L->length||L->length==CAP)return ERROR;for(int j=L->length;j>i;j--)L->data[j]=L->data[j-1];L->data[i]=e;L->length++;return OK;}
Status SqListDelete(SqList *L,int i,int *out){if(i<0||i>=L->length)return ERROR;*out=L->data[i];for(int j=i+1;j<L->length;j++)L->data[j-1]=L->data[j];L->length--;return OK;}
Status SqListGet(const SqList *L,int i,int *out){if(i<0||i>=L->length)return ERROR;*out=L->data[i];return OK;}
int SqListLocate(const SqList *L,int e){for(int i=0;i<L->length;i++)if(L->data[i]==e)return i;return -1;}
#ifndef DS_HIDE_LIST_INSERT
Status ListInsert(LinkList L,int i,int e) {
    if(!L || i<1) return ERROR;
    LNode *p=L;
    for(int j=1;j<i && p;j++) p=p->next;
    if(!p) return ERROR;
    LNode *s=malloc(sizeof(LNode));
    if(!s) return OVERFLOW;
    s->data=e;
    s->next=p->next;
    p->next=s;
    return OK;
}
#endif
#ifndef DS_HIDE_LIST_DELETE
Status ListDelete(LinkList L,int i,int *out) {
    if(!L || i<1) return ERROR;
    LNode *p=L;
    for(int j=1;j<i && p;j++) p=p->next;
    if(!p || !p->next) return ERROR;
    LNode *q=p->next;
    *out=q->data;
    p->next=q->next;
    free(q);
    return OK;
}
#endif
#endif
`;
