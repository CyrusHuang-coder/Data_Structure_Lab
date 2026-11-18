import { add, algorithms } from './catalog.mjs';
const register=(id,title,chapter,source,opts={})=>add(id,title,chapter,'array',source,{...opts});

const btreeCode=`BNode *NewNode(int leaf) {
    BNode *p=calloc(1,sizeof(BNode));p->leaf=leaf;return p;
}
void Split(BNode *p,int i) {
    BNode *y=p->child[i],*z=NewNode(y->leaf);
    z->count=1;z->keys[0]=y->keys[2];
    if(!y->leaf){z->child[0]=y->child[2];z->child[1]=y->child[3];y->child[2]=y->child[3]=NULL;}
    int median=y->keys[1];y->count=1;
    for(int j=p->count;j>=i+1;j--)p->child[j+1]=p->child[j];
    p->child[i+1]=z;
    for(int j=p->count-1;j>=i;j--)p->keys[j+1]=p->keys[j];
    p->keys[i]=median;p->count++;
}
int Contains(BNode *p,int x) {
    if(!p)return 0;
    int i=0;while(i<p->count && p->keys[i]<x)i++;
    if(i<p->count && p->keys[i]==x)return 1;
    return p->leaf?0:Contains(p->child[i],x);
}
void InsertNonFull(BNode *p,int x) {
    int i=p->count-1;
    if(p->leaf) {
        while(i>=0 && x<p->keys[i]){p->keys[i+1]=p->keys[i];i--;}
        p->keys[i+1]=x;p->count++;
    } else {
        while(i>=0 && x<p->keys[i])i--;
        i++;
        if(p->child[i]->count==3){Split(p,i);if(x>p->keys[i])i++;}
        InsertNonFull(p->child[i],x);
    }
}
void Insert(int x) {
    if(Contains(broot,x))return;
    if(!broot)broot=NewNode(1);
    if(broot->count==3){BNode *s=NewNode(0);s->child[0]=broot;broot=s;Split(s,0);}
    InsertNonFull(broot,x);
}
void Merge(BNode *p,int i) {
    BNode *a=p->child[i],*b=p->child[i+1];
    a->keys[a->count++]=p->keys[i];
    for(int j=0;j<b->count;j++)a->keys[a->count+j]=b->keys[j];
    if(!a->leaf)for(int j=0;j<=b->count;j++)a->child[a->count+j]=b->child[j];
    a->count+=b->count;
    for(int j=i;j<p->count-1;j++)p->keys[j]=p->keys[j+1];
    for(int j=i+1;j<p->count;j++)p->child[j]=p->child[j+1];
    p->child[p->count]=NULL;p->count--;free(b);
}
void Remove(BNode *p,int x) {
    int i=0;while(i<p->count && p->keys[i]<x)i++;
    if(i<p->count && p->keys[i]==x) {
        if(p->leaf){for(int j=i;j<p->count-1;j++)p->keys[j]=p->keys[j+1];p->count--;return;}
        if(p->child[i]->count>=2){BNode *q=p->child[i];while(!q->leaf)q=q->child[q->count];int v=q->keys[q->count-1];p->keys[i]=v;Remove(p->child[i],v);}
        else if(p->child[i+1]->count>=2){BNode *q=p->child[i+1];while(!q->leaf)q=q->child[0];int v=q->keys[0];p->keys[i]=v;Remove(p->child[i+1],v);}
        else {Merge(p,i);Remove(p->child[i],x);}
        return;
    }
    if(p->leaf)return;
    if(p->child[i]->count==1) {
        BNode *c=p->child[i];
        if(i>0 && p->child[i-1]->count>=2) {
            BNode *s=p->child[i-1];
            for(int j=c->count;j>0;j--)c->keys[j]=c->keys[j-1];
            if(!c->leaf)for(int j=c->count+1;j>0;j--)c->child[j]=c->child[j-1];
            c->keys[0]=p->keys[i-1];if(!c->leaf){c->child[0]=s->child[s->count];s->child[s->count]=NULL;}
            p->keys[i-1]=s->keys[s->count-1];s->count--;c->count++;
        } else if(i<p->count && p->child[i+1]->count>=2) {
            BNode *s=p->child[i+1];
            c->keys[c->count]=p->keys[i];if(!c->leaf)c->child[c->count+1]=s->child[0];
            p->keys[i]=s->keys[0];for(int j=0;j<s->count-1;j++)s->keys[j]=s->keys[j+1];
            if(!s->leaf){for(int j=0;j<s->count;j++)s->child[j]=s->child[j+1];s->child[s->count]=NULL;}
            s->count--;c->count++;
        } else {if(i==p->count)i--;Merge(p,i);}
    }
    Remove(p->child[i],x);
}
void Visit(BNode *p) {
    if(!p)return;
    for(int i=0;i<p->count;i++){if(!p->leaf)Visit(p->child[i]);ds_output[ds_output_len++]=p->keys[i];}
    if(!p->leaf)Visit(p->child[p->count]);
}
void Solve(int a[],int n) {
    for(int i=0;i<n;i++)Insert(a[i]);
    if(broot) {
        Remove(broot,key);
        if(!broot->count){BNode *old=broot;broot=old->leaf?NULL:old->child[0];free(old);}
    }
    Visit(broot);
}`;
register('btree','B 树 · 2-3-4 树插入、查找与删除','search',btreeCode,{nodeType:'BNode',viewKind:'btree',rootSymbol:'broot',watches:()=>['broot'],serialize:()=>'',covers:['B 树'],input:{values:[10,20,5,6,12,30,7,17],key:6},tests:[{values:[],key:0},{values:[1],key:1},{values:[1,2,3,4,5,6,7,8,9,10,11,12],key:6},{values:[8,7,6,5,4,3,2,1],key:8},{values:[1,1,2],key:9}],summary:'最小度数 t=2，即每节点最多 3 个关键字。插入分裂满节点；删除下降前借位或合并；重复键忽略。',complexity:'每次查找/更新 O(log n)',expected:i=>({output:[...new Set(i.values)].filter(v=>v!==i.key).sort((a,b)=>a-b)})});

register('bplus','B+ 树 · 叶层与索引构建、范围查找','search',`void Solve(int a[],int n) {
    for(int i=1;i<n;i++){int x=a[i],j=i-1;while(j>=0&&a[j]>x){a[j+1]=a[j];j--;}a[j+1]=x;}
    BNode *level[CAP];int nodes=0;BNode *last=NULL;
    int groups=(n+2)/3,offset=0;
    for(int g=0;g<groups;g++) {
        BNode *leaf=calloc(1,sizeof(BNode));leaf->leaf=1;
        int amount=n/groups+(g<n%groups);
        for(int j=0;j<amount;j++)leaf->keys[leaf->count++]=a[offset++];
        if(last)last->next=leaf;last=leaf;level[nodes++]=leaf;
    }
    while(nodes>1) {
        int out=0,groups=(nodes+3)/4,offset=0;
        for(int g=0;g<groups;g++) {
            BNode *p=calloc(1,sizeof(BNode));p->leaf=0;
            int children=nodes/groups+(g<nodes%groups),i=offset;offset+=children;
            for(int j=0;j<children;j++) {
                p->child[j]=level[i+j];
                if(j){BNode *q=level[i+j];while(!q->leaf)q=q->child[0];p->keys[p->count++]=q->keys[0];}
            }
            level[out++]=p;
        }
        nodes=out;
    }
    broot=nodes?level[0]:NULL;
    BNode *p=broot;
    while(p&&!p->leaf){int j=0;while(j<p->count&&key>p->keys[j])j++;p=p->child[j];}
    while(p){for(int j=0;j<p->count;j++)if(p->keys[j]>=key)ds_output[ds_output_len++]=p->keys[j];p=p->next;}
}`,{nodeType:'BNode',viewKind:'bplus',rootSymbol:'broot',watches:()=>['broot'],serialize:()=>'',input:{values:[8,3,6,1,5,9,12,2,4,7],key:5},tests:[{values:[],key:0},{values:[1],key:1},{values:[1,2,3,4,5,6,7],key:4}],covers:['B+ 树'],summary:'使用有序批量装载展示叶层与分隔索引，再沿叶链输出不小于 key 的记录。此入口专注批量构建和范围查找。',complexity:'构建含排序；查询 O(h+k)',expected:i=>({output:i.values.filter(x=>x>=i.key).sort((a,b)=>a-b)})});

register('threaded-tree','线索二叉树 · 中序线索化与遍历','tree',`TNode *Build(int a[],int l,int r) {
    if(l>=r)return NULL;
    int mid=(l+r)/2;
    TNode *p=calloc(1,sizeof(TNode));p->data=a[mid];
    p->left=Build(a,l,mid);p->right=Build(a,mid+1,r);
    return p;
}
void Thread(TNode *p,TNode **pre) {
    if(!p)return;
    Thread(p->left,pre);
    if(!p->left){p->ltag=1;p->left=*pre;}
    if(*pre&&!(*pre)->right){(*pre)->rtag=1;(*pre)->right=p;}
    *pre=p;
    Thread(p->right,pre);
}
void Solve(int a[],int n) {
    troot=Build(a,0,n);
    TNode *pre=NULL;Thread(troot,&pre);
    if(pre)pre->rtag=1;
    TNode *p=troot;
    while(p) {
        while(!p->ltag&&p->left)p=p->left;
        ds_output[ds_output_len++]=p->data;
        while(p->rtag&&p->right){p=p->right;ds_output[ds_output_len++]=p->data;}
        p=p->right;
    }
}`,{nodeType:'TNode',viewKind:'threaded',rootSymbol:'troot',watches:()=>['troot'],serialize:()=>'',input:{values:[1,2,3,4,5,6,7]},tests:[{values:[]},{values:[1]},{values:[4,2,6,1]}],covers:['线索二叉树'],summary:'先把 values 作为中序序列构造平衡形状，再线索化。ltag/rtag 为 1 的链接表示前驱/后继，遍历不使用栈。',complexity:'O(n)',expected:i=>({output:i.values})});

register('forest-conversion','树与森林 · 孩子兄弟表示','tree',`void Solve(int a[],int n) {
    for(int i=0;i<n;i++) {
        TreeNode *p=calloc(1,sizeof(TreeNode));p->val=a[i];
        if(!root)root=p;
        else if(!root->left)root->left=p;
        else {TreeNode *q=root->left;while(q->right)q=q->right;q->right=p;}
    }
    TreeNode *p=root;
    if(p)ds_output[ds_output_len++]=p->val;
    for(p=p?p->left:NULL;p;p=p->right)ds_output[ds_output_len++]=p->val;
}`,{nodeType:'TreeNode',viewKind:'tree',setup:()=> 'root=NULL;',watches:()=>['root'],serialize:()=>'',input:{values:[1,2,3,4]},tests:[{values:[]},{values:[1]}],covers:['树与森林转换','孩子兄弟表示'],summary:'构造一个根和若干孩子；left 表示第一个孩子，right 表示下一个兄弟。观察一般树如何转为二叉链结构。',complexity:'此逐次寻找末兄弟构造 O(n²)',expected:i=>({output:i.values})});

const generateGList=value=>{
  let serial=0;const statements=[];
  const build=v=>{if(!Array.isArray(v)){const id='g'+serial++;statements.push(`GNode *${id}=calloc(1,sizeof(GNode));${id}->tag=1;${id}->atom=${v};`);return id;}let first='NULL',last=null;for(const item of v){const cell='g'+serial++;statements.push(`GNode *${cell}=calloc(1,sizeof(GNode));`);const child=build(item);statements.push(`${cell}->head=${child};`);if(last)statements.push(`${last}->tail=${cell};`);else first=cell;last=cell;}return first;};const root=build(value);return statements.join('\n')+`\nghead=${root};`;
};
register('generalized-list','广义表 · 表头表尾、复制与深度','array',`int Depth(GNode *p) {
    if(!p)return 1;
    if(p->tag)return 0;
    int max=0;
    for(GNode *q=p;q;q=q->tail){int d=Depth(q->head);if(d>max)max=d;}
    return max+1;
}
GNode *Copy(GNode *p) {
    if(!p)return NULL;
    GNode *q=calloc(1,sizeof(GNode));q->tag=p->tag;q->atom=p->atom;
    if(!p->tag){q->head=Copy(p->head);q->tail=Copy(p->tail);}
    return q;
}
void Solve(int a[],int n) {
    result=Depth(ghead);
    GNode *copy=Copy(ghead);
    int length=0;for(GNode *p=copy;p;p=p->tail)length++;
    ds_output[ds_output_len++]=length;
}`,{nodeType:'GNode',viewKind:'generalized',rootSymbol:'ghead',watches:()=>['ghead'],serialize:()=>'',setup:i=>generateGList(i.structure),input:{values:[],structure:[1,[2,3],[]]},tests:[{values:[],structure:[]},{values:[],structure:[[1],[[2]]]}],covers:['广义表基本操作与深度'],summary:'tag=1 是原子；tag=0 的表结点通过 head 指向表头、tail 指向表尾。空表深度为 1，原子深度为 0。',complexity:'O(节点数)',expected:i=>{const depth=v=>Array.isArray(v)?1+Math.max(0,...v.map(depth)):0;return {result:depth(i.structure),output:[i.structure.length]};}});

register('replacement-selection','外部排序 · 置换选择','external',`void Solve(int a[],int n) {
    int memory=4,read=0,active=0,run=0,last=INT_MIN;
    for(;read<n&&active<memory;read++){table[active]=a[read];cursor[active++]=0;}
    while(active) {
        int winner=-1;
        for(int i=0;i<active;i++)if(cursor[i]==run&&(winner<0||table[i]<table[winner]))winner=i;
        if(winner<0){run++;last=INT_MIN;continue;}
        last=table[winner];
        ds_output[ds_output_len++]=last;aux[ds_output_len-1]=run;
        if(read<n){table[winner]=a[read++];cursor[winner]=table[winner]<last?run+1:run;}
        else {active--;table[winner]=table[active];cursor[winner]=cursor[active];}
    }
    result=n?run+1:0;
}`,{input:{values:[8,3,6,1,5,2,9,4,7,0]},tests:[{values:[]},{values:[1]},{values:[9,8,7,6,5,4,3,2,1]}],serialize:()=>'',watches:()=>['table[0]@4','cursor[0]@4','aux[0]@32','ds_output[0]@32','ds_output_len'],covers:['置换选择'],summary:'内存容纳 4 条记录。新记录小于上次输出时冻结到下一段。aux 保存各输出记录所属段号。',complexity:'此线性选择实现 O(n×4)',expected:i=>{const slots=i.values.slice(0,4).map(v=>({v,run:0})),out=[];let read=slots.length,run=0;while(slots.length){const candidates=slots.map((s,k)=>({...s,k})).filter(s=>s.run===run).sort((a,b)=>a.v-b.v);if(!candidates.length){run++;continue;}const win=candidates[0];out.push(win.v);if(read<i.values.length){const v=i.values[read++];slots[win.k]={v,run:v<win.v?run+1:run};}else slots.splice(win.k,1);}return {output:out,result:out.length?run+1:0};}});

register('loser-tree','外部排序 · 败者树选胜者','external',`void Solve(int a[],int n) {
    int k=4,player[4],loser[4];
    for(int i=0;i<4;i++){player[i]=i;loser[i]=-1;cursor[i]=i;}
    for(int i=1;i<n;i++){int x=a[i],j=i-1;while(j>=0&&a[j]>x){a[j+1]=a[j];j--;}a[j+1]=x;}
    for(int out=0;out<n;out++) {
        int value[4];
        for(int i=0;i<k;i++)value[i]=cursor[i]<n?a[cursor[i]]:INT_MAX;
        int w0=value[0]<=value[1]?0:1;
        int w1=value[2]<=value[3]?2:3;
        loser[2]=1-w0;loser[3]=5-w1;
        int winner=value[w0]<=value[w1]?w0:w1;
        loser[1]=winner==w0?w1:w0;loser[0]=winner;
        for(int i=0;i<4;i++)table[i]=loser[i];
        ds_output[ds_output_len++]=value[winner];
        cursor[winner]+=k;
    }
}`,{input:{values:[8,3,6,1,5,2,9,4]},tests:[{values:[]},{values:[1]},{values:[3,3,2]}],serialize:()=>'',watches:()=>['table[0]@4','cursor[0]@4'],covers:['败者树'],summary:'将排序输入交错分成四路，内部结点保存比较败者，table[0] 保存当前胜者。本小规模实现每轮重建锦标赛。',complexity:'四路每轮 3 次比较；重建教学版',expected:i=>({output:[...i.values].sort((a,b)=>a-b)})});
