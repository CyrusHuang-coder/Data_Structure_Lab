// Reference content describes the public C functions; signatures and bodies are
// read from the actual adt.h payload for the chosen storage implementation.
const param=(name,direction,description)=>({name,direction,description});
const stack=param('s','输入 / 修改','已初始化的 IntStack 地址，传 &stack。');
const queue=param('q','输入 / 修改','已初始化的 IntQueue 地址，传 &fifo。');
const list=param('L','输入 / 修改','带头结点链表的头指针，传 head；头结点不计入长度。');
const sq=param('L','输入 / 修改','已初始化的 SqList 地址，传 &list。');
const out=param('out','输出','接收元素的有效 int 变量地址，传 &value；仅在返回 OK 时读取。');
const elem=param('e','输入','待插入或查找的整数值。');
const listPos=param('i','输入','数据结点的位置，从 1 开始。');
const sqPos=param('i','输入','数组下标，从 0 开始。');
const item=(title,summary,params,returns,example,note='')=>({title,summary,params,returns,example,note});

export const operations={
 InitSqList:item('初始化顺序表','将元素数设为 0。',[sq],'OK；L 为 NULL 时返回 ERROR。','SqList list;\nInitSqList(&list);'),
 SqListInsert:item('插入元素','将插入位置及其后的元素后移一格。',[sq,sqPos,elem],'成功 OK；位置非法或表满返回 ERROR。','SqList list;\nInitSqList(&list);\nSqListInsert(&list, 0, 42);','合法位置为 [0, length]。容量 CAP=128；满表时不能插入。'),
 SqListDelete:item('删除元素','删除指定下标的元素，并将后续元素前移。',[sq,sqPos,out],'成功 OK；位置非法返回 ERROR。','int value;\nif (SqListDelete(&list, 0, &value) == OK) {\n    printf("%d", value);\n}','合法位置为 [0, length-1]。list 须已初始化。'),
 SqListGet:item('读取元素','读取指定下标的元素，保持顺序表不变。',[param('L','只读','已初始化的 SqList 地址，传 &list。'),sqPos,out],'成功 OK；位置非法返回 ERROR。','int value;\nif (SqListGet(&list, 0, &value) == OK) {\n    printf("%d", value);\n}'),
 SqListLocate:item('按值查找','返回第一个等于 e 的元素下标。',[param('L','只读','已初始化的 SqList 地址，传 &list。'),elem],'找到返回 0 起始下标；未找到返回 -1。','int index = SqListLocate(&list, 42);','下标 0 是有效结果，不能用 if (index) 判断是否找到。'),
 InitList:item('初始化链表','分配一个头结点，得到空链表。',[param('L','输出','头指针变量的地址，传 &head；成功后 head 指向新头结点。')],'成功 OK；内存分配失败 OVERFLOW；L 为 NULL 返回 ERROR。','LinkList head = NULL;\nStatus status = InitList(&head);\nif (status == OK) {\n    /* 使用 head */\n}','已有链表再次初始化前先 DestroyList，避免丢失原节点。'),
 ClearList:item('清空链表','释放所有数据结点，保留头结点。',[list],'void，无返回值。','ClearList(head);','清空后仍可插入；L 为 NULL 时直接返回。'),
 DestroyList:item('销毁链表','释放数据结点及头结点，并将头指针置为 NULL。',[param('L','输入 / 输出','头指针变量的地址，传 &head。')],'void，无返回值。','DestroyList(&head);\n/* head == NULL */'),
 ListEmpty:item('判断空表','判断链表是否没有数据结点。',[param('L','只读','带头结点链表指针，传 head。')],'空表或 NULL 返回 1；非空返回 0。','if (ListEmpty(head)) {\n    /* 当前没有数据结点 */\n}'),
 ListLength:item('获取长度','遍历并统计数据结点数。',[param('L','只读','带头结点链表指针，传 head。')],'返回数据结点数；NULL 返回 0。','int length = ListLength(head);','头结点不计入长度。'),
 GetElem:item('按位置取值','读取第 i 个数据结点的值。',[param('L','只读','带头结点链表指针，传 head。'),listPos,out],'成功 OK；位置非法、结点不存在或参数无效返回 ERROR。','int value;\nif (GetElem(head, 1, &value) == OK) {\n    printf("%d", value);\n}','第一个数据结点的位置为 1，头结点不参与编号。'),
 LocateElem:item('按值定位','查找第一个值等于 e 的数据结点。',[param('L','只读','带头结点链表指针，传 head。'),elem],'找到返回 1 起始位置；未找到返回 0。','int position = LocateElem(head, 42);','链表返回位置从 1 开始；顺序表 SqListLocate 返回下标从 0 开始。'),
 PriorElem:item('读取前驱','读取首个匹配元素的直接前驱。',[param('L','只读','带头结点链表指针，传 head。'),elem,out],'成功 OK；未找到或首个匹配元素没有数据前驱时返回 ERROR。','int previous;\nif (PriorElem(head, 42, &previous) == OK) {\n    printf("%d", previous);\n}','头结点不是数据前驱；out 必须是有效地址。'),
 NextElem:item('读取后继','读取首个匹配元素的直接后继。',[param('L','只读','带头结点链表指针，传 head。'),elem,out],'成功 OK；未找到或没有后继时返回 ERROR。','int next;\nif (NextElem(head, 42, &next) == OK) {\n    printf("%d", next);\n}'),
 ListTraverse:item('遍历链表','按链表顺序，对每个数据值调用 visit。',[param('L','只读','带头结点链表指针，传 head。'),param('visit','回调','接收一个 int 的有效函数指针，例如 void Print(int value)。')],'void，无返回值。','void Print(int value) { printf("%d ", value); }\n/* 在调用处： */\nListTraverse(head, Print);','Print 定义放在其他函数外；调用语句放在函数内。回调接收元素值，不接收结点地址。'),
 ListInsert:item('插入结点','在第 i 个数据位置前插入新结点。',[list,listPos,elem],'成功 OK；位置非法返回 ERROR；内存不足 OVERFLOW。','ListInsert(head, 1, 42);','合法位置为 [1, 长度+1]。正在考查链表插入的题目会禁用此辅助函数。'),
 ListDelete:item('删除结点','删除第 i 个数据结点，返回其值并释放结点。',[list,listPos,out],'成功 OK；位置非法或结点不存在返回 ERROR。','int removed;\nif (ListDelete(head, 1, &removed) == OK) {\n    printf("%d", removed);\n}','合法位置为 [1, 长度]。正在考查链表删除的题目会禁用此辅助函数。'),
 InitStack:item('初始化栈','初始化为空栈。',[param('s','输出','IntStack 对象地址，传 &stack。')],'成功 OK；s 为 NULL 返回 ERROR。','IntStack stack;\nInitStack(&stack);','已有栈再次初始化前先销毁，尤其是动态分配结点的链栈。'),
 ClearStack:item('清空栈','依次弹出全部元素，链栈会释放结点。',[stack],'void，无返回值。','ClearStack(&stack);','栈对象保留，清空后可直接继续 Push。'),
 DestroyStack:item('销毁栈','清空栈持有的元素与动态结点。',[stack],'void，无返回值。','DestroyStack(&stack);','当前实现与 ClearStack 相同；不会 free 调用者的 IntStack 对象。'),
 StackLength:item('获取栈长度','返回当前栈中的元素数。',[param('s','只读','已初始化的 IntStack 地址，传 &stack。')],'非负整数。','int count = StackLength(&stack);'),
 Push:item('入栈','将一个整数压到栈顶。',[stack,elem],'成功 OK；顺序栈满返回 ERROR；链栈分配失败 OVERFLOW。','if (Push(&stack, 42) != OK) {\n    /* 处理入栈失败 */\n}'),
 Pop:item('出栈','删除栈顶元素，通过 out 返回元素值。',[stack,out],'成功 OK；空栈返回 ERROR。','int value;\nif (Pop(&stack, &value) == OK) {\n    printf("%d", value);\n}','链栈会释放弹出的结点。返回 ERROR 时不要读取 value。'),
 GetTop:item('读取栈顶','读取栈顶元素，保持栈不变。',[param('s','只读','已初始化的 IntStack 地址，传 &stack。'),out],'成功 OK；空栈返回 ERROR。','int value;\nif (GetTop(&stack, &value) == OK) {\n    printf("%d", value);\n}'),
 StackEmpty:item('判断空栈','检查栈中是否没有元素。',[param('s','只读','已初始化的 IntStack 地址，传 &stack。')],'空栈返回 1；非空返回 0。','if (!StackEmpty(&stack)) {\n    /* 可以读取栈顶或弹出元素 */\n}'),
 InitQueue:item('初始化队列','初始化为空队列。',[param('q','输出','IntQueue 对象地址，传 &fifo。')],'成功 OK；q 为 NULL 返回 ERROR。','IntQueue fifo;\nInitQueue(&fifo);','已有队列再次初始化前先销毁，避免链队列结点泄漏。'),
 ClearQueue:item('清空队列','依次出队全部元素，链队列会释放结点。',[queue],'void，无返回值。','ClearQueue(&fifo);','保留队列对象，清空后可继续入队。'),
 DestroyQueue:item('销毁队列','清空队列中的元素与动态结点。',[queue],'void，无返回值。','DestroyQueue(&fifo);','当前实现与 ClearQueue 相同；不会 free 调用者的 IntQueue 对象。'),
 QueueLength:item('获取队列长度','返回当前队列中的元素数。',[param('q','只读','已初始化的 IntQueue 地址，传 &fifo。')],'非负整数。','int count = QueueLength(&fifo);'),
 QueueEmpty:item('判断空队列','检查队列中是否没有元素。',[param('q','只读','已初始化的 IntQueue 地址，传 &fifo。')],'空队列返回 1；非空返回 0。','if (!QueueEmpty(&fifo)) {\n    /* 可以读取队首或出队 */\n}'),
 GetHead:item('读取队首','读取队首元素，保持队列不变。',[param('q','只读','已初始化的 IntQueue 地址，传 &fifo。'),out],'成功 OK；空队列返回 ERROR。','int value;\nif (GetHead(&fifo, &value) == OK) {\n    printf("%d", value);\n}'),
 EnQueue:item('入队','把元素添加到队尾。',[queue,elem],'成功 OK；循环队列满返回 ERROR；链队列分配失败 OVERFLOW。','if (EnQueue(&fifo, 42) != OK) {\n    /* 处理入队失败 */\n}'),
 DeQueue:item('出队','移除队首元素，通过 out 返回元素值。',[queue,out],'成功 OK；空队列返回 ERROR。','int value;\nif (DeQueue(&fifo, &value) == OK) {\n    printf("%d", value);\n}','链队列会释放出队结点；移除最后一个结点后首尾指针均为 NULL。')
};
const stackOps=['InitStack','Push','Pop','GetTop','StackEmpty','StackLength','ClearStack','DestroyStack'];
const queueOps=['InitQueue','EnQueue','DeQueue','GetHead','QueueEmpty','QueueLength','ClearQueue','DestroyQueue'];
export const adtCategories=[
 {id:'sq-list',title:'顺序表',chapter:'array',type:'SqList',storage:'顺序存储',description:'连续数组存储，熟悉下标、长度与元素移动。',convention:'下标从 0 开始；length 是有效元素数，最大容量为 CAP=128。',typeCode:'typedef struct {\n    int data[CAP];\n    int length;\n} SqList;',functions:['InitSqList','SqListInsert','SqListDelete','SqListGet','SqListLocate']},
 {id:'linked-list',title:'带头结点单链表',chapter:'linear',type:'LinkList',storage:'链式存储',description:'带头结点，按位置读写、按值查找与遍历。',convention:'位置从 1 开始；头结点不存储有效数据。InitList 传 &head，读写已有链表传 head。',typeCode:'typedef struct LNode {\n    int data;\n    struct LNode *next;\n} LNode, *LinkList;',functions:['InitList','ListInsert','ListDelete','GetElem','LocateElem','PriorElem','NextElem','ListEmpty','ListLength','ListTraverse','ClearList','DestroyList']},
 {id:'seq-stack',title:'顺序栈',chapter:'stack',type:'IntStack',storage:'顺序存储',description:'后进先出，top 指向下一个空位。',convention:'top=0 时为空；top=CAP 时为满。栈顶元素位于 data[top-1]。',typeCode:'typedef struct {\n    int data[CAP];\n    int top;\n} IntStack;',functions:stackOps,exercise:'stack-push'},
 {id:'linked-stack',title:'链栈',chapter:'stack',type:'IntStack',storage:'链式存储',linked:true,description:'后进先出，top 直接指向栈顶结点。',convention:'top=NULL 时为空；size 保存元素数。练习中将 ADT 存储实现切换为“链式”，使用同一套栈接口。',typeCode:'typedef struct {\n    LNode *top;\n    int size;\n} IntStack;',functions:stackOps,exercise:'stack-push'},
 {id:'circular-queue',title:'循环队列',chapter:'stack',type:'IntQueue',storage:'顺序存储',description:'先进先出，首尾下标循环移动。',convention:'front 指向队首，rear 指向下一空位。牺牲一个单元区分满空，有效容量为 CAP-1=127。',typeCode:'typedef struct {\n    int data[CAP];\n    int front, rear;\n} IntQueue;',functions:queueOps,exercise:'queue-enqueue'},
 {id:'linked-queue',title:'链队列',chapter:'stack',type:'IntQueue',storage:'链式存储',linked:true,description:'先进先出，用首尾指针完成入队与出队。',convention:'当前实现无头结点；front/rear 指向首尾结点。空队列两者均为 NULL。练习中切换为“链式”。',typeCode:'typedef struct {\n    LNode *front, *rear;\n    int size;\n} IntQueue;',functions:queueOps,exercise:'queue-enqueue'}
];

export function activeAdt(source,linked=false){
  const defined=new Set(linked?['DS_LINKED_ADT']:[]),stack=[];let active=true;
  return source.split('\n').map(line=>{
    const directive=/^\s*#\s*(ifdef|ifndef|else|endif|define)\b\s*(\w+)?/.exec(line);
    if(!directive)return active?line:'';
    const [,op,name]=directive;
    if(op==='ifdef'||op==='ifndef'){const condition=defined.has(name)===(op==='ifdef');stack.push({parent:active,condition});active=active&&condition;}
    else if(op==='else'){const frame=stack.at(-1);if(frame){frame.condition=!frame.condition;active=frame.parent&&frame.condition;}}
    else if(op==='endif'){const frame=stack.pop();if(frame)active=frame.parent;}
    else if(op==='define'&&active)defined.add(name);
    return '';
  }).join('\n');
}
export function functionReferences(source,linked=false){
  const code=activeAdt(source,linked);
  const masked=code.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,m=>m.replace(/[^\n]/g,' '));
  const found=new Map(),pattern=/\b(?:Status|void|int)\s+(\w+)\s*\(/g;
  for(const match of masked.matchAll(pattern)){
    let i=match.index+match[0].length,depth=1;
    for(;i<masked.length&&depth;i++){if(masked[i]==='(')depth++;if(masked[i]===')')depth--;}
    while(/\s/.test(masked[i]||'')&&i<masked.length)i++;
    if(masked[i]!=='{')continue;
    const brace=i;depth=1;for(i++;i<masked.length&&depth;i++){if(masked[i]==='{')depth++;if(masked[i]==='}')depth--;}
    if(!depth)found.set(match[1],{signature:code.slice(match.index,brace).trim().replace(/\s+/g,' '),source:code.slice(match.index,i).trim()});
  }
  return found;
}
