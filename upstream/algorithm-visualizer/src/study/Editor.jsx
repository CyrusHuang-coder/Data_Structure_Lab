import React,{useEffect,useRef} from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/ext-language_tools';

const completions=[
  ['InitList','InitList(&head);','创建带头结点的空链表；head 为输出参数'],
  ['DestroyList','DestroyList(&head);','释放所有节点并将 head 置为 NULL'],
  ['ClearList','ClearList(head);','释放数据节点，保留头结点'],
  ['ListLength','ListLength(head)','返回数据节点数，不包含头结点'],
  ['GetElem','GetElem(head, position, &value);','位置从 1 开始，value 为输出参数'],
  ['LocateElem','LocateElem(head, value)','返回第一个匹配位置，未找到为 0'],
  ['InitStack','InitStack(&stack);','初始化一个新栈；重复初始化前先销毁'],
  ['StackLength','StackLength(&stack)','返回栈元素数'],
  ['ClearStack','ClearStack(&stack);','清空栈，链式版本释放节点'],
  ['InitQueue','InitQueue(&fifo);','初始化新队列'],
  ['QueueLength','QueueLength(&fifo)','返回队列元素数'],
  ['QueueEmpty','QueueEmpty(&fifo)','判断队列是否为空'],
  ['GetHead','GetHead(&fifo, &value);','读取队首，不改变队列'],
  ['ClearQueue','ClearQueue(&fifo);','清空队列，链式版本释放节点'],
  ['Push','Push(&stack, value);','Status Push(IntStack *s, int e) · s 为栈地址，e 为入栈值'],
  ['Pop','Pop(&stack, &value);','Status Pop(IntStack *s, int *out) · out 为输出参数'],
  ['GetTop','GetTop(&stack, &value);','读取栈顶，不修改栈；空栈返回 ERROR'],
  ['StackEmpty','StackEmpty(&stack)','判断栈是否为空'],
  ['EnQueue','EnQueue(&fifo, value);','Status EnQueue(IntQueue *q,int e) · q 为队列地址'],
  ['DeQueue','DeQueue(&fifo, &value);','Status DeQueue(IntQueue *q,int *out) · out 为输出参数'],
  ['ListInsert','ListInsert(head, position, value);','带头结点，position 范围 1～长度+1'],
  ['ListDelete','ListDelete(head, position, &value);','带头结点，position 范围 1～长度，value 接收删除值']
];
export default function Editor({editorRef,onLoad,hiddenOperations=[],...props}){
  const observer=useRef(null),resizeFrame=useRef(null);
  useEffect(()=>()=>{observer.current?.disconnect();if(resizeFrame.current)cancelAnimationFrame(resizeFrame.current);},[]);
  return <AceEditor ref={editorRef} {...props} onLoad={editor=>{
    observer.current?.disconnect();
    observer.current=new ResizeObserver(()=>{if(resizeFrame.current)cancelAnimationFrame(resizeFrame.current);resizeFrame.current=requestAnimationFrame(()=>{resizeFrame.current=null;editor.resize();});});
    observer.current.observe(editor.container);
    const completer={getCompletions(_editor,_session,_pos,prefix,callback){callback(null,completions.filter(([name])=>!hiddenOperations.includes(name)&&name.toLowerCase().startsWith(prefix.toLowerCase())).map(([caption,value,docText])=>({caption,value,meta:'平台 ADT',score:1000,docText})));}};
    editor.completers=[...(editor.completers||[]),completer];
    onLoad?.(editor);
  }}/>;
}
