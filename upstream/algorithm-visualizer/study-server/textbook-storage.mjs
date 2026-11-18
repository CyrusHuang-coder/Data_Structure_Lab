import { add,algorithms } from './catalog.mjs';
const addArray=(id,title,chapter,source,opts={})=>add(id,title,chapter,'array',source,{tests:[{values:[]},{values:[1]},{values:[3,1,2]}],...opts});

addArray('matrix-address','多维数组 · 地址计算','array',`void Solve(int a[],int n) {
    int i=key/cols,j=key%cols;
    int rowMajor=(i*cols+j)*sizeof(int);
    int columnMajor=(j*rows+i)*sizeof(int);
    ds_output[ds_output_len++]=rowMajor;
    ds_output[ds_output_len++]=columnMajor;
    result=a[key];
}`,{input:{values:[1,2,3,4,5,6],rows:2,cols:3,key:4},tests:[{values:[7],rows:1,cols:1,key:0}],setup:i=>`rows=${i.rows};cols=${i.cols};`,serialize:()=>'',watches:()=>['rows','cols'],covers:['多维数组地址计算'],summary:'key 是行优先展开下标。输出行优先和列优先的字节偏移，sizeof(int) 由本地编译器决定。',complexity:'O(1)',expected:i=>({output:[i.key*4,((i.key%i.cols)*i.rows+Math.floor(i.key/i.cols))*4],result:i.values[i.key]})});
addArray('matrix-triangle','特殊矩阵 · 对称矩阵压缩','array',`void Solve(int a[],int n) {
    count=0;
    for(int i=0;i<rows;i++)for(int j=0;j<=i;j++) {
        table[count++]=a[i*rows+j];
    }
    int row=key/rows,col=key%rows;
    if(row<col){int t=row;row=col;col=t;}
    result=table[row*(row+1)/2+col];
    for(int i=0;i<count;i++)ds_output[ds_output_len++]=table[i];
}`,{input:{values:[1,2,3,2,4,5,3,5,6],rows:3,key:2},tests:[{values:[9],rows:1,key:0}],setup:i=>`rows=${i.rows};`,serialize:()=>'',watches:()=>['table[0]@32','count','rows'],covers:['特殊矩阵压缩'],summary:'按下三角含对角线逐行存储，对称位置共用一个单元。key 为原矩阵行优先下标。',complexity:'压缩 O(r²)，访问 O(1)',expected:i=>{const out=[];for(let r=0;r<i.rows;r++)for(let c=0;c<=r;c++)out.push(i.values[r*i.rows+c]);return {output:out,result:i.values[i.key]};}});
addArray('sparse-transpose','稀疏矩阵 · 三元组转置','array',`void Solve(int a[],int n) {
    count=0;
    for(int i=0;i<rows;i++)for(int j=0;j<cols;j++)if(a[i*cols+j]) {
        matrix[count][0]=i;matrix[count][1]=j;matrix[count][2]=a[i*cols+j];count++;
    }
    for(int col=0;col<cols;col++) {
        for(int k=0;k<count;k++)if(matrix[k][1]==col) {
            aux[col*rows+matrix[k][0]]=matrix[k][2];
        }
    }
    for(int k=0;k<n;k++)ds_output[ds_output_len++]=aux[k];
}`,{input:{values:[0,2,0,3,0,4],rows:2,cols:3},tests:[{values:[0],rows:1,cols:1},{values:[1,0,0,2],rows:2,cols:2}],setup:i=>`rows=${i.rows};cols=${i.cols};`,serialize:()=>'',watches:()=>['matrix[0]@16','aux[0]@32','count','rows','cols'],covers:['稀疏矩阵转置'],summary:'先建立 (行,列,值) 三元组，依原列号扫描并转置。输出转置矩阵的行优先展开。',complexity:'O(cols×非零数)',expected:i=>({output:transpose(i)})});
addArray('sparse-fast-transpose','稀疏矩阵 · 快速转置','array',`void Solve(int a[],int n) {
    count=0;
    for(int i=0;i<rows;i++)for(int j=0;j<cols;j++)if(a[i*cols+j]) {
        matrix[count][0]=i;matrix[count][1]=j;matrix[count][2]=a[i*cols+j];count++;
        weights[j]++;
    }
    cursor[0]=0;
    for(int j=1;j<cols;j++)cursor[j]=cursor[j-1]+weights[j-1];
    for(int k=0;k<count;k++) {
        int col=matrix[k][1],pos=cursor[col]++;
        leftChild[pos]=col;rightChild[pos]=matrix[k][0];table[pos]=matrix[k][2];
    }
    for(int k=0;k<count;k++)aux[leftChild[k]*rows+rightChild[k]]=table[k];
    for(int k=0;k<n;k++)ds_output[ds_output_len++]=aux[k];
}`,{input:{values:[0,2,0,3,0,4],rows:2,cols:3},tests:[{values:[0],rows:1,cols:1}],setup:i=>`rows=${i.rows};cols=${i.cols};`,serialize:()=>'',watches:()=>['matrix[0]@16','weights[0]@16','cursor[0]@16','leftChild[0]@16','rightChild[0]@16','table[0]@16','aux[0]@32','count'],covers:['快速转置'],summary:'weights 统计每列非零数；cursor 给出转置后的起始位置。每个三元组直接落位。',complexity:'O(cols+非零数)',expected:i=>({output:transpose(i)})});
function transpose(i){const out=[];for(let c=0;c<i.cols;c++)for(let r=0;r<i.rows;r++)out.push(i.values[r*i.cols+c]);return out;}

add('nextval','串 · KMP nextval','string','string',`int KMP(char *s,char *p) {
    int m=(int)strlen(p),i=0,j=-1;
    next[0]=-1;
    while(i<m) {
        if(j==-1 || p[i]==p[j]) {
            i++;j++;
            next[i]=(i<m && p[i]==p[j])?next[j]:j;
        } else j=next[j];
    }
    i=0;j=0;
    while(s[i] && j<m) {
        if(j==-1 || s[i]==p[j]){i++;j++;}
        else j=next[j];
    }
    return j==m?i-j:-1;
}`,{entry:'KMP',call:'result=KMP(text,pattern);',input:{text:'aaaaabaaaaac',pattern:'aaaac'},tests:[{text:'abc',pattern:''},{text:'aaaa',pattern:'b'}],covers:['KMP nextval'],summary:'相同字符失配时跳过重复比较，nextval 继承更短位置的回退值。',complexity:'O(n+m)'});
add('fixed-string','定长串 · 复制、拼接与截取','string','string',`void Solve(void) {
    char copy[CAP];int len=0;
    while(text[len]){copy[len]=text[len];len++;}
    copy[len]='\0';
    int j=0;
    while(pattern[j] && len<CAP-1)copy[len++]=pattern[j++];
    copy[len]='\0';
    for(int i=0;i<len;i++)ds_output[ds_output_len++]=(unsigned char)copy[i];
    result=len;
}`,{call:'Solve();',input:{text:'data',pattern:'structure'},tests:[{text:'',pattern:''},{text:'abc',pattern:'x'}],serialize:()=>'',covers:['定长顺序串基本操作'],summary:'字符数组复制与有界拼接，末尾保留空字符。输出字符的 ASCII 值。',complexity:'O(n+m)',expected:i=>({output:[...(i.text+i.pattern)].map(c=>c.charCodeAt(0)),result:i.text.length+i.pattern.length})});
add('heap-string','堆分配串 · 拼接与插入','string','string',`void Solve(void) {
    size_t len=strlen(text),extra=strlen(pattern);
    char *s=malloc(len+1);
    memcpy(s,text,len+1);
    char *grown=realloc(s,len+extra+1);
    if(!grown){free(s);result=ERROR;return;}
    s=grown;
    for(size_t i=0;i<=extra;i++)s[len+i]=pattern[i];
    for(size_t i=0;i<len+extra;i++)ds_output[ds_output_len++]=(unsigned char)s[i];
    result=(int)(len+extra);
    free(s);
}`,{call:'Solve();',input:{text:'hello ',pattern:'C'},tests:[{text:'',pattern:'x'}],serialize:()=>'',covers:['堆分配串基本操作'],summary:'通过 realloc 调整连续存储，保留失败时原指针，再追加模式串。',complexity:'O(n+m)',expected:i=>({output:[...(i.text+i.pattern)].map(c=>c.charCodeAt(0)),result:i.text.length+i.pattern.length})});

addArray('external-runs','外部排序 · 初始归并段','external',`void Solve(int a[],int n) {
    int block=4;
    for(int start=0;start<n;start+=block) {
        int end=start+block<n?start+block:n;
        for(int i=start+1;i<end;i++) {
            int x=a[i],j=i-1;
            while(j>=start && a[j]>x){a[j+1]=a[j];j--;}
            a[j+1]=x;
        }
        count++;
    }
    result=count;
}`,{covers:['初始归并段'],summary:'教学块大小为 4 个记录，每次读入一个块并内部排序，形成初始归并段。',complexity:'随内排序方法；此例每块插入排序',expected:i=>{let out=[];for(let k=0;k<i.values.length;k+=4)out.push(...i.values.slice(k,k+4).sort((a,b)=>a-b));return {output:out,result:Math.ceil(i.values.length/4)};}});
addArray('external-multiway','外部排序 · 多路归并','external',`void Solve(int a[],int n) {
    int run=4;
    for(int s=0;s<n;s+=run)for(int i=s+1;i<s+run&&i<n;i++) {
        int x=a[i],j=i-1;while(j>=s&&a[j]>x){a[j+1]=a[j];j--;}a[j+1]=x;
    }
    int k=(n+run-1)/run;
    for(int r=0;r<k;r++)cursor[r]=r*run;
    for(int out=0;out<n;out++) {
        int winner=-1;
        for(int r=0;r<k;r++) {
            int end=(r+1)*run<n?(r+1)*run:n;
            if(cursor[r]<end && (winner==-1||a[cursor[r]]<a[cursor[winner]]))winner=r;
        }
        aux[out]=a[cursor[winner]++];
    }
    for(int i=0;i<n;i++)a[i]=aux[i];
}`,{covers:['多路归并'],watches:()=>['cursor[0]@8','aux[0]@32'],summary:'每 4 个记录形成一段，cursor 保存各段读指针，每次选择当前最小记录。',complexity:'此线性选胜者实现 O(nk)',expected:i=>({output:[...i.values].sort((a,b)=>a-b)})});
addArray('optimal-merge','外部排序 · 最佳归并树','external',`void Solve(int a[],int n) {
    for(int i=0;i<n;i++)weights[i]=a[i];
    int len=n;result=0;
    while(len>1) {
        for(int i=0;i<len;i++)for(int j=i+1;j<len;j++)if(weights[i]>weights[j]){int t=weights[i];weights[i]=weights[j];weights[j]=t;}
        int merged=weights[0]+weights[1];
        result+=merged;
        for(int j=2;j<len;j++)weights[j-2]=weights[j];
        len--;weights[len-1]=merged;
    }
}`,{input:{values:[5,10,20,30]},tests:[{values:[]},{values:[1]},{values:[1,2,3]}],watches:()=>['weights[0]@32'],covers:['最佳归并树'],summary:'values 表示归并段长度，每次合并两个最短段；result 是各轮输出记录数之和。',complexity:'此排序选择实现 O(n³)',expected:i=>{const q=[...i.values];let sum=0;while(q.length>1){q.sort((a,b)=>a-b);const x=q.shift()+q.shift();sum+=x;q.push(x);}return {result:sum};}});

addArray('sequential-file','顺序文件 · 块访问查找','file',`void Solve(int a[],int n) {
    int blockSize=4;
    result=-1;count=0;
    for(int block=0;block*blockSize<n;block++) {
        count++;
        int begin=block*blockSize,end=begin+blockSize<n?begin+blockSize:n;
        for(int i=begin;i<end;i++)if(a[i]==key){result=i;return;}
    }
}`,{input:{values:[4,7,1,3,9,2,5],key:2},tests:[{values:[],key:1},{values:[4],key:4}],watches:()=>['count'],covers:['顺序文件'],summary:'记录数组模拟磁盘文件，块大小为 4。每进入一个块计一次逻辑读；result 为记录下标。',complexity:'最坏读取 ceil(n/4) 块',expected:i=>({result:i.values.indexOf(i.key)})});
addArray('indexed-file','索引文件 · 索引查找与记录定位','file',`void Solve(int a[],int n) {
    for(int i=0;i<n;i++){table[i]=a[i];cursor[i]=i;}
    for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)if(table[i]>table[j]) {
        int t=table[i];table[i]=table[j];table[j]=t;
        t=cursor[i];cursor[i]=cursor[j];cursor[j]=t;
    }
    int l=0,r=n-1;result=-1;
    while(l<=r) {
        int mid=(l+r)/2;
        if(table[mid]==key){result=cursor[mid];return;}
        if(table[mid]<key)l=mid+1;else r=mid-1;
    }
}`,{input:{values:[9,2,7,4],key:7},tests:[{values:[],key:1},{values:[1],key:1}],watches:()=>['table[0]@32','cursor[0]@32'],covers:['索引文件'],summary:'数据记录保持原顺序，索引表按键排序；二分后从 cursor 找到记录位置。输入键要求唯一。',complexity:'索引建成后查找 O(log n)',expected:i=>({result:i.values.indexOf(i.key)})});
addArray('indexed-sequential-file','索引顺序文件 · 分块索引','file',`void Solve(int a[],int n) {
    for(int i=1;i<n;i++) {
        int x=a[i],j=i-1;while(j>=0&&a[j]>x){a[j+1]=a[j];j--;}a[j+1]=x;
    }
    int blockSize=4,blocks=(n+3)/4;
    for(int b=0;b<blocks;b++){cursor[b]=b*blockSize;int end=(b+1)*blockSize<n?(b+1)*blockSize:n;table[b]=a[end-1];}
    result=-1;count=0;
    for(int b=0;b<blocks;b++)if(key<=table[b]) {
        count++;
        int end=(b+1)*blockSize<n?(b+1)*blockSize:n;
        for(int j=cursor[b];j<end;j++)if(a[j]==key){result=j;return;}
        return;
    }
}`,{input:{values:[9,2,7,4,1],key:7},tests:[{values:[],key:1},{values:[1],key:2}],watches:()=>['table[0]@8','cursor[0]@8','count'],covers:['索引顺序文件'],summary:'记录按键排序，每 4 条记录建立最大键索引；只扫描候选块。result 为排序后位置。',complexity:'索引线性查找加一块扫描',expected:i=>{const a=[...i.values].sort((a,b)=>a-b);return {output:a,result:a.indexOf(i.key)};}});
addArray('hash-file','散列文件 · 桶与溢出链','file',`void Solve(int a[],int n) {
    for(int b=0;b<8;b++)cursor[b]=-1;
    for(int i=0;i<n;i++) {
        int bucket=((a[i]%8)+8)%8;
        table[i]=a[i];next[i]=cursor[bucket];cursor[bucket]=i;
    }
    int bucket=((key%8)+8)%8;
    result=-1;count=0;
    for(int p=cursor[bucket];p!=-1;p=next[p]) {
        count++;
        if(table[p]==key){result=p;break;}
    }
}`,{input:{values:[1,9,17,2],key:9},tests:[{values:[],key:0},{values:[1],key:5}],watches:()=>['cursor[0]@8','table[0]@32','next[0]@32','count'],covers:['散列文件','链地址哈希'],summary:'8 个桶，记录下标作为溢出链地址；头插形成同桶链。count 为逻辑记录访问数。',complexity:'平均依桶分布',expected:i=>({result:i.values.lastIndexOf(i.key)})});

const chainBase=algorithms.find(a=>a.id==='hash-file');
const {id:chainId,title:chainTitle,chapter:chainChapter,...chainOptions}=chainBase;
add('hash-chain','哈希 · 链地址法','search','array',chainBase.source,{...chainOptions,covers:['链地址哈希'],summary:'用桶头与下标链保存冲突记录，查找沿同桶链前进。与散列文件入口共用连接机制。'});
