# 内容覆盖清单

从实际代码注册表生成。教材入口 84 个，已接入编程题 62 道。每个入口的具体操作和复杂度以页面说明为准。验证结果见 artifacts 测试日志。

## 1. 绪论（2 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| adt-sequence | ADT · 同一序列的顺序与链式表示 | 4 | 将同一个逻辑序列存入链式节点，观察连续数组与非连续节点的对应关系。 |
| complexity-count | 操作计数 · 双重循环 | 4 | 内层循环次数依次为 1 到 n，总次数 n(n+1)/2。count 是显式执行的计数器。 |

## 2. 线性表（9 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| list-insert | 单链表 · 插入 | 4 | 先定位前驱，再连接新节点。观察两次指针更新的先后顺序。 |
| list-delete | 单链表 · 删除 | 4 | 用前驱绕过待删节点，再释放节点。释放的对象保留为灰色记录。 |
| list-reverse | 单链表 · 原地逆置 | 4 | 保存后继后，将当前节点插到头结点后方。工作指针仍持有尚未接回的节点。 |
| array-insert | 顺序表 · 插入 | 1 | 从表尾向后移动，为指定下标腾出位置。key 是 0 起始插入下标。 |
| array-delete | 顺序表 · 删除 | 1 | 删除位置后的元素依次前移。key 是 0 起始删除下标。 |
| list-merge | 有序链表 · 原地归并 | 4 | 先将输入划为两个有序链表，归并阶段复用原节点。输出按值升序。 |
| doubly-list | 双链表 · 构造、插入与删除 | 3 | key 个数据节点之后插入 value，再删除新节点原本的后继。观察双向链接更新的中间状态。 |
| circular-list | 循环链表 · 插入与遍历 | 4 | 尾节点的 next 回到头结点。遍历终止条件是回到 head。 |
| static-list | 静态链表 · 游标分配与连接 | 4 | 以数组下标代替地址，分别维护可用空间链与数据链。0 是头结点及空游标。 |

## 3. 栈与队列（10 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| stack-push | 顺序栈 · 入栈 | 1 | 栈顶 top 指向下一个空位置。可单步进入 ADT 的 Push。 |
| stack-pop | 顺序栈 · 出栈 | 1 | 先检查空栈，再递减 top 并取值。out 是输出参数。 |
| queue-enqueue | 循环队列 · 入队 | 1 | rear 是下一个空位，使用模运算推进。牺牲一个单元区分满与空。 |
| queue-dequeue | 循环队列 · 出队 | 1 | front 指向队首，取值后按模推进。 |
| brackets | 栈应用 · 括号匹配 | 4 | 左括号入栈；右括号必须匹配当前栈顶。结束时栈应为空。 |
| linked-stack | 链栈 · 入栈与出栈 | 4 | 头部入栈、头部出栈，输出序列反映后进先出。 |
| linked-queue | 链队列 · 入队与出队 | 4 | 尾部入队、头部出队。最后一个节点出队后 rear 回到头结点。 |
| base-conversion | 栈应用 · 进制转换 | 3 | 非负十进制整数转八进制，余数先入栈再逆序输出。 |
| expression | 栈应用 · 中缀表达式求值 | 4 | 数字栈与运算符栈配合处理优先级。支持非负整数字面量、二元 + - * / 和括号，除法向零截断。 |
| maze | 栈与回溯 · 迷宫求解 | 4 | 0 为可行格、1 为墙，从左上到右下。按右下左上顺序回溯，queue 保存当前路径的行优先下标。 |

## 4. 串（6 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| naive-match | 串 · 朴素模式匹配 | 4 | 从每个可能起点比较模式串，返回 0 起始匹配位置。 |
| kmp | 串 · KMP 与 next 构造 | 4 | next[0]=-1。失配时主串位置不回退，模式位置沿 next 回退。 |
| nextval | 串 · KMP nextval | 3 | 相同字符失配时跳过重复比较，nextval 继承更短位置的回退值。 |
| fixed-string | 定长串 · 复制、拼接与截取 | 3 | 字符数组复制与有界拼接，末尾保留空字符。输出字符的 ASCII 值。 |
| heap-string | 堆分配串 · 拼接与插入 | 2 | 通过 realloc 调整连续存储，保留失败时原指针，再追加模式串。 |
| block-string | 块链串 · 分块存储与遍历 | 4 | 每个块容纳 4 个字符，通过 next 连接；末块 len 表示有效字符数。输出 ASCII 值。 |

## 5. 数组与广义表（7 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| matrix-address | 多维数组 · 地址计算 | 2 | key 是行优先展开下标。输出行优先和列优先的字节偏移，sizeof(int) 由本地编译器决定。 |
| matrix-triangle | 特殊矩阵 · 对称矩阵压缩 | 2 | 按下三角含对角线逐行存储，对称位置共用一个单元。key 为原矩阵行优先下标。 |
| sparse-transpose | 稀疏矩阵 · 三元组转置 | 3 | 先建立 (行,列,值) 三元组，依原列号扫描并转置。输出转置矩阵的行优先展开。 |
| sparse-fast-transpose | 稀疏矩阵 · 快速转置 | 2 | weights 统计每列非零数；cursor 给出转置后的起始位置。每个三元组直接落位。 |
| generalized-list | 广义表 · 表头表尾、复制与深度 | 3 | tag=1 是原子；tag=0 的表结点通过 head 指向表头、tail 指向表尾。空表深度为 1，原子深度为 0。 |
| sparse-arithmetic | 稀疏矩阵 · 加法与乘法 | 3 | 以单矩阵演示 A+A 与 A×A，零因子跳过乘法。table 保存和，matrix 保存积；输出积。 |
| cross-matrix | 稀疏矩阵 · 十字链表 | 3 | 每个非零元素同时属于一条行链和一条列链。right 向同行，down 向同列。 |

## 6. 树与二叉树（9 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| preorder | 二叉树 · 先序遍历 | 4 | 递归调用每层保存独立的 p。观察访问节点与左右子树调用的顺序。 |
| inorder | 二叉树 · 中序遍历 | 4 | 递归调用每层保存独立的 p。观察访问节点与左右子树调用的顺序。 |
| postorder | 二叉树 · 后序遍历 | 4 | 递归调用每层保存独立的 p。观察访问节点与左右子树调用的顺序。 |
| tree-depth | 二叉树 · 深度 | 4 | 空树深度为 0，非空树深度为两子树最大深度加 1。 |
| tree-level | 二叉树 · 层序遍历 | 4 | 辅助队列按发现顺序保存待访问节点。 |
| tree-inorder-stack | 二叉树 · 非递归中序 | 4 | 沿左链入栈；弹出访问后转向右子树。 |
| huffman | 哈夫曼树 · 构造与 WPL | 4 | 每轮合并两个最小无父节点，累加合并权值得到 WPL；table 保存编码数值，cursor 保存位数，含前导零。单叶树采用长度 0 的空编码。 |
| threaded-tree | 线索二叉树 · 中序线索化与遍历 | 4 | 先把 values 作为中序序列构造平衡形状，再线索化。ltag/rtag 为 1 的链接表示前驱/后继，遍历不使用栈。 |
| forest-conversion | 树与森林 · 孩子兄弟表示 | 3 | 构造一个根和若干孩子；left 表示第一个孩子，right 表示下一个兄弟。观察一般树如何转为二叉链结构。 |

## 7. 图（12 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| bfs | 图 · 邻接表 BFS | 1 | 节点入队时标记，避免重复入队。本入口遍历 start 所在的可达部分。 |
| dfs | 图 · 邻接表 DFS | 1 | 访问顶点后递归探索未访问邻点；栈帧保留扫描位置。 |
| dijkstra | 图 · Dijkstra | 1 | 每轮确定未访问顶点中最短的距离，再松弛出边。要求非负权。1000000 表示不可达。 |
| topological | 图 · 拓扑排序 | 1 | 入度为 0 的顶点入队；移除其出边后继续寻找新起点。输出不足 n 表示存在环。 |
| prim | 图 · Prim 最小生成树 | 3 | 选择连接已选集合的最小权边。result 为总权值；不连通返回 -1。输入须为无向图。 |
| kruskal | 图 · Kruskal 与并查集 | 2 | 边按权排序，以并查集排除环。示例排序采用简单比较排序以便观察。 |
| floyd | 图 · Floyd 全源最短路径 | 1 | 依次允许顶点 k 作为中间点。工作表显示距离矩阵；输出 start 行。无负环输入。 |
| critical-path | 图 · AOE 网关键路径 | 1 | 先拓扑求事件最早时间，再逆序求最迟时间；输出关键活动的端点对。result 为工期，环返回 -1。 |
| matrix-graph | 图 · 邻接矩阵与度数 | 2 | 矩阵单元保存边权；此表示以 0 表示无边，故本模板要求非零权。dist 为出度，parent 为入度。 |
| orthogonal-graph | 有向图 · 十字链表 | 2 | 边记录被出边链和入边链共享。tlink 连接同尾顶点的边，hlink 连接同头顶点的边。输出各顶点入度。 |
| adjacency-multilist | 无向图 · 邻接多重表 | 2 | 一条无向边只保留一个记录，按当前端点选择 ilink 或 jlink。模板输入不含自环。输出度数。 |
| spanning-forest | 图 · DFS 生成森林 | 2 | 每次从尚未访问顶点启动 DFS，得到一个分量的生成树；parent 保存树边，result 为树的数量。 |

## 8. 查找（11 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| linear-search | 顺序查找 | 4 | 依次比较，返回首次出现的下标；未找到返回 -1。 |
| binary-search | 折半查找 | 4 | 维护闭区间 [low,high]，每次排除一半候选。输入要求升序。 |
| sentinel-search | 顺序查找 · 哨兵 | 4 | 在额外单元放置 key，循环内部省去下标边界判断。结果为 0 起始下标。 |
| block-search | 分块查找 | 3 | 每块最多 3 个元素，块间有序、块内可无序。先比较块最大值，再顺序查找。 |
| bst | 二叉排序树 · 插入与删除 | 4 | 重复值忽略。删除有两个孩子的节点时用中序后继替换，最后中序输出。 |
| avl | AVL · 插入与旋转 | 5 | 插入后更新高度；按 LL、LR、RR、RL 情形旋转。height 字段随节点显示。 |
| hash-open | 哈希 · 线性探测与删除标记 | 3 | 容量 37，线性探测；cursor 为 0 空、1 有值、2 墓碑。查到 key 后设置墓碑。 |
| hash-chain | 哈希 · 链地址法 | 3 | 用桶头与下标链保存冲突记录，查找沿同桶链前进。与散列文件入口共用连接机制。 |
| btree | B 树 · 2-3-4 树插入、查找与删除 | 6 | 最小度数 t=2，即每节点最多 3 个关键字。插入分裂满节点；删除下降前借位或合并；重复键忽略。 |
| bplus | B+ 树 · 叶层与索引构建、范围查找 | 4 | 使用有序批量装载展示叶层与分隔索引，再沿叶链输出不小于 key 的记录。此入口专注批量构建和范围查找。 |
| nearly-optimal-tree | 静态查找 · 次优查找树 | 3 | 输入键严格升序，weights 为查找频率。选择左右累计权重最接近的根。result 返回查到的键或 -1。 |

## 9. 内部排序（9 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| insertion | 直接插入排序 | 5 | 每轮将一个元素插入有序前缀。 |
| binary-insertion | 折半插入排序 | 5 | 折半查找插入位置，元素移动仍可能是线性的。 |
| bubble | 冒泡排序 | 5 | 相邻比较并交换，每轮固定一个后缀元素。 |
| selection | 简单选择排序 | 5 | 从未排序部分选择最小元素，交换到当前起点。 |
| shell | 希尔排序 | 5 | 按递减增量分组插入，最后一轮增量为 1。 |
| heap | 堆排序 | 5 | 先建大根堆，再依次将堆顶交换到末尾。 |
| merge | 归并排序 · 自底向上 | 5 | 依次合并长度为 1、2、4 的有序段。辅助数组保存本轮结果。 |
| radix | 基数排序 · LSD | 5 | 按个位到高位稳定分配与收集；本实现输入为非负整数。 |
| quick | 快速排序 · 双向划分 | 5 | 基准值单独保存，左右扫描交替填入空位，递归处理两侧。 |

## 10. 外部排序（5 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| external-runs | 外部排序 · 初始归并段 | 4 | 教学块大小为 4 个记录，每次读入一个块并内部排序，形成初始归并段。 |
| external-multiway | 外部排序 · 多路归并 | 4 | 每 4 个记录形成一段，cursor 保存各段读指针，每次选择当前最小记录。 |
| optimal-merge | 外部排序 · 最佳归并树 | 4 | values 表示归并段长度，每次合并两个最短段；result 是各轮输出记录数之和。 |
| replacement-selection | 外部排序 · 置换选择 | 4 | 内存容纳 4 条记录。新记录小于上次输出时冻结到下一段。aux 保存各输出记录所属段号。 |
| loser-tree | 外部排序 · 败者树选胜者 | 4 | 将排序输入交错分成四路，内部结点保存比较败者，table[0] 保存当前胜者。本小规模实现每轮重建锦标赛。 |

## 11. 文件（4 个入口）

| ID | 入口 | 默认及边界用例数 | 说明 |
|---|---|---|---|
| sequential-file | 顺序文件 · 块访问查找 | 3 | 记录数组模拟磁盘文件，块大小为 4。每进入一个块计一次逻辑读；result 为记录下标。 |
| indexed-file | 索引文件 · 索引查找与记录定位 | 3 | 数据记录保持原顺序，索引表按键排序；二分后从 cursor 找到记录位置。输入键要求唯一。 |
| indexed-sequential-file | 索引顺序文件 · 分块索引 | 3 | 记录按键排序，每 4 条记录建立最大键索引；只扫描候选块。result 为排序后位置。 |
| hash-file | 散列文件 · 桶与溢出链 | 3 | 8 个桶，记录下标作为溢出链地址；头插形成同桶链。count 为逻辑记录访问数。 |

## 已配置的 LeetCode 编程题

| 题号 | 名称 | 知识点 | 原题 |
|---|---|---|---|
| 26 | 删除有序数组中的重复项 | 数组 | [原题](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/) |
| 27 | 移除元素 | 数组 | [原题](https://leetcode.cn/problems/remove-element/) |
| 35 | 搜索插入位置 | 二分查找 | [原题](https://leetcode.cn/problems/search-insert-position/) |
| 88 | 合并两个有序数组 | 数组 | [原题](https://leetcode.cn/problems/merge-sorted-array/) |
| 704 | 二分查找 | 二分查找 | [原题](https://leetcode.cn/problems/binary-search/) |
| 19 | 删除链表的倒数第 N 个结点 | 链表 | [原题](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/) |
| 21 | 合并两个有序链表 | 链表 | [原题](https://leetcode.cn/problems/merge-two-sorted-lists/) |
| 24 | 两两交换链表中的节点 | 链表 | [原题](https://leetcode.cn/problems/swap-nodes-in-pairs/) |
| 83 | 删除排序链表中的重复元素 | 链表 | [原题](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/) |
| 141 | 环形链表 | 链表 | [原题](https://leetcode.cn/problems/linked-list-cycle/) |
| 142 | 环形链表 II | 链表 | [原题](https://leetcode.cn/problems/linked-list-cycle-ii/) |
| 160 | 相交链表 | 链表 | [原题](https://leetcode.cn/problems/intersection-of-two-linked-lists/) |
| 206 | 反转链表 | 链表 | [原题](https://leetcode.cn/problems/reverse-linked-list/) |
| 20 | 有效的括号 | 栈 | [原题](https://leetcode.cn/problems/valid-parentheses/) |
| 150 | 逆波兰表达式求值 | 栈 | [原题](https://leetcode.cn/problems/evaluate-reverse-polish-notation/) |
| 155 | 最小栈 | 栈 | [原题](https://leetcode.cn/problems/min-stack/) |
| 225 | 用队列实现栈 | 队列 | [原题](https://leetcode.cn/problems/implement-stack-using-queues/) |
| 232 | 用栈实现队列 | 栈 | [原题](https://leetcode.cn/problems/implement-queue-using-stacks/) |
| 739 | 每日温度 | 栈 | [原题](https://leetcode.cn/problems/daily-temperatures/) |
| 28 | 找出字符串中第一个匹配项的下标 | 串 | [原题](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/) |
| 459 | 重复的子字符串 | 串 | [原题](https://leetcode.cn/problems/repeated-substring-pattern/) |
| 94 | 二叉树的中序遍历 | 树 | [原题](https://leetcode.cn/problems/binary-tree-inorder-traversal/) |
| 98 | 验证二叉搜索树 | 树 | [原题](https://leetcode.cn/problems/validate-binary-search-tree/) |
| 102 | 二叉树的层序遍历 | 树 | [原题](https://leetcode.cn/problems/binary-tree-level-order-traversal/) |
| 104 | 二叉树的最大深度 | 树 | [原题](https://leetcode.cn/problems/maximum-depth-of-binary-tree/) |
| 105 | 从前序与中序遍历序列构造二叉树 | 树 | [原题](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) |
| 144 | 二叉树的前序遍历 | 树 | [原题](https://leetcode.cn/problems/binary-tree-preorder-traversal/) |
| 145 | 二叉树的后序遍历 | 树 | [原题](https://leetcode.cn/problems/binary-tree-postorder-traversal/) |
| 226 | 翻转二叉树 | 树 | [原题](https://leetcode.cn/problems/invert-binary-tree/) |
| 230 | 二叉搜索树中第 K 小的元素 | 树 | [原题](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/) |
| 236 | 二叉树的最近公共祖先 | 树 | [原题](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/) |
| 215 | 数组中的第 K 个最大元素 | 堆 | [原题](https://leetcode.cn/problems/kth-largest-element-in-an-array/) |
| 347 | 前 K 个高频元素 | 堆 | [原题](https://leetcode.cn/problems/top-k-frequent-elements/) |
| 912 | 排序数组 | 排序 | [原题](https://leetcode.cn/problems/sort-an-array/) |
| 133 | 克隆图 | 图 | [原题](https://leetcode.cn/problems/clone-graph/) |
| 200 | 岛屿数量 | 图 | [原题](https://leetcode.cn/problems/number-of-islands/) |
| 207 | 课程表 | 图 | [原题](https://leetcode.cn/problems/course-schedule/) |
| 210 | 课程表 II | 图 | [原题](https://leetcode.cn/problems/course-schedule-ii/) |
| 743 | 网络延迟时间 | 图 | [原题](https://leetcode.cn/problems/network-delay-time/) |
| 1 | 两数之和 | 哈希 | [原题](https://leetcode.cn/problems/two-sum/) |
| 49 | 字母异位词分组 | 哈希 | [原题](https://leetcode.cn/problems/group-anagrams/) |
| 128 | 最长连续序列 | 哈希 | [原题](https://leetcode.cn/problems/longest-consecutive-sequence/) |
| 92 | 反转链表 II | 链表 | [原题](https://leetcode.cn/problems/reverse-linked-list-ii/) |
| 61 | 旋转链表 | 链表 | [原题](https://leetcode.cn/problems/rotate-list/) |
| 86 | 分隔链表 | 链表 | [原题](https://leetcode.cn/problems/partition-list/) |
| 203 | 移除链表元素 | 链表 | [原题](https://leetcode.cn/problems/remove-linked-list-elements/) |
| 328 | 奇偶链表 | 链表 | [原题](https://leetcode.cn/problems/odd-even-linked-list/) |
| 100 | 相同的树 | 树 | [原题](https://leetcode.cn/problems/same-tree/) |
| 101 | 对称二叉树 | 树 | [原题](https://leetcode.cn/problems/symmetric-tree/) |
| 110 | 平衡二叉树 | 树 | [原题](https://leetcode.cn/problems/balanced-binary-tree/) |
| 111 | 二叉树的最小深度 | 树 | [原题](https://leetcode.cn/problems/minimum-depth-of-binary-tree/) |
| 112 | 路径总和 | 树 | [原题](https://leetcode.cn/problems/path-sum/) |
| 199 | 二叉树的右视图 | 树 | [原题](https://leetcode.cn/problems/binary-tree-right-side-view/) |
| 543 | 二叉树的直径 | 树 | [原题](https://leetcode.cn/problems/diameter-of-binary-tree/) |
| 33 | 搜索旋转排序数组 | 二分查找 | [原题](https://leetcode.cn/problems/search-in-rotated-sorted-array/) |
| 34 | 在排序数组中查找元素的第一个和最后一个位置 | 二分查找 | [原题](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) |
| 153 | 寻找旋转排序数组中的最小值 | 二分查找 | [原题](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/) |
| 239 | 滑动窗口最大值 | 队列 | [原题](https://leetcode.cn/problems/sliding-window-maximum/) |
| 496 | 下一个更大元素 I | 栈 | [原题](https://leetcode.cn/problems/next-greater-element-i/) |
| 946 | 验证栈序列 | 栈 | [原题](https://leetcode.cn/problems/validate-stack-sequences/) |
| 1971 | 寻找图中是否存在路径 | 图 | [原题](https://leetcode.cn/problems/find-if-path-exists-in-graph/) |
| 684 | 冗余连接 | 图 | [原题](https://leetcode.cn/problems/redundant-connection/) |

目录其余条目保留原站跳转；在配置 C 接口和测试前，不显示为本站可编程。
