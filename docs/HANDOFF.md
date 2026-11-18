# 实现与扩展说明

## 开始工作

先读根目录 README 和原始完整规格，再运行 `npm.cmd run doctor`、`npm.cmd test` 与浏览器回归。保留上游来源说明、LICENSE 与本机 `user-data`。各教学入口的具体操作变体见内容覆盖清单。

## 关键路径

1. `catalog.mjs` 定义基础算法、输入检查、harness 和独立预期结果。
2. `textbook-extra/storage/advanced/complete.mjs` 通过 `add` 注册全书其余主题。
3. `problems*.mjs` 配置原题 C 签名、类型、调用、结果序列化和选题目录。
4. `runner.mjs` 编译程序，使用 `mi.mjs` 调用 GDB，保存停点快照。
5. `runtime.mjs` 提供类型、ADT、分配记录、输入输出隔离与完成态检查。
6. `judging.mjs` 按结果或多解约束判题；`checks.mjs` 检查暂停态结构。
7. `Visuals.jsx` 把当前快照送入上游 Tracer/Renderer。
8. `server.mjs` 管理任务、会话、测试、SQLite 和运行档案。

## 执行语义

- 每个停点是 `nextLocation` 执行之前的状态，`executedLocation` 是前一停点位置。
- 所有视图绑定同一 `seq`；回退只读取已有记录。
- 默认先有界采集，再回放；前端可看到正在到达的记录。暂停播放不会暂停仍在采集的原生进程。
- GDB 只在可执行源位置停下，一行多个 C 动作可能合并显示。
- 全局观察表达式加 `::`，避免递归参数遮蔽根变量。
- 自由程序通过退出回调停在可观测的终态；`_Exit` 等绕过回调的方式需专门扩展。
- 用户 stdout 走单独文件，避免无换行输出破坏 GDB/MI。
- 单次分配身份使用分配序号；地址复用不会复用对象身份。

## 新增算法

ADT 浏览页位于 `src/study/LibraryPage.jsx`。分类、参数说明和调用示例集中在 `adtReference.mjs`；函数签名和实现从服务端返回的实际 `adt.h` 解析，并按顺序/链式预处理分支选择。新增 ADT 接口时同步补齐分类及说明，运行 `node --test tests/adt-reference.test.mjs` 和 `node tests/library-browser.mjs`。不要把整份头文件重新铺在分类页。

外观偏好由 `src/study/Appearance.jsx` 管理，颜色变量在 `appearance.css` 中。章节彩色标识集中在 `ChapterLogo.jsx` 与 `chapter-logo.css`，使用固定章节配色，独立于用户主题色。边高亮规则位于 `edgeHighlights.mjs`，根据实际快照比较指针变化；GraphRenderer 为每个图生成独立箭头 marker，支持同屏比较。

新增的 20 道题位于 `study-server/problems-expanded.mjs`，由服务端、覆盖清单脚本和目录测试显式导入。新增题目模块时同时更新这些入口。

使用 `add(id,title,chapter,kind,source,options)`，填写 `entry/call/input/tests/expected`。需要定制构造时提供 `setup`，定制结果提供 `serialize`。`expected` 必须独立核对实际输出；严禁检查一个未被算法修改的副本来冒充结果。

新节点类型放入 runtime，配置 `nodeType`、`viewKind`、`nodeLinks`、`rootSymbol`、`watches`。复杂结构完成条件要同时进入判题，不能只比较中序输出等弱证据。输入插入 C harness 前必须校验数字、大小和结构。

`covers` 绑定章节主题。新增入口通过 C 测试和必要视图检查后再更新覆盖状态。题目 `checker` 用于多解验证；原题链接与本地状态分别保存。

## 数据与版本

三栏容器位于 `WorkbenchLayout.jsx`，宽度分配和相邻拖动约束在 `paneLayout.mjs`。布局按算法保存在浏览器键 `zhixu.panes.v1:<algorithmId>`，支持 pagehide 刷新前保存。比例用 CSS fr 轨道渲染，窗口缩放时立即收缩，再由 ResizeObserver 校准最小宽度；Ace 也有独立 ResizeObserver。`RuntimePanel.jsx` 展示分区状态，纯分组与变化比较在 `runtimeState.mjs`。折叠状态按算法保存在 `zhixu.runtime.v1:<algorithmId>`。新增显示内容时只读取已采集快照，避免把未知指针或未核验初始化状态显示为已验证结果。测试入口为 `tests/workbench-layout.test.mjs` 与 `tests/layout-browser.mjs`。

测试输入由 `src/study/TestInput.jsx` 统一呈现，纯解析逻辑在 `testInput.mjs`。编辑器内部保存用户当前的输入文本，合法输入转换成原有 JSON 数据写入草稿，因此数据库及后端协议保持兼容。格式有误时禁止运行和保存用例，运行前再通过组件的 `read()` 校验，防止使用上次合法值。对比页启动前先读取两侧全部参数。新增题目参数时补充字段说明；运行 `node --test tests/test-input.test.mjs`（遍历所有算法默认及边界输入）和 `node tests/input-browser.mjs`。

`DS_DATA_DIR` 可指定独立数据目录，测试使用临时目录。`DS_GCC`、`DS_GDB` 指定工具路径，`DS_PORT` 指定生产端口。草稿有保存 revision，过期写入返回冲突；通过的测试提交保留源码和内容版本。

备份包含源码、stdin、用例、进度、笔记、布局和测试记录；完整 trace 单独存储、单独导出。升级时先备份，新增 schema 时编写迁移和恢复测试。

## 验证材料

- 图形视图使用 `src/study/VisualViewport.jsx` 统一按钮缩放、居中、适应画布和最大化；底层 Renderer 不再绑定滚轮事件。最大化支持 Esc 还原与键盘焦点循环，窗口及分栏尺寸变化后重新适配。`artifacts/visual-viewport-browser.json`：7 项专项检查；`visual-viewport-maximized.png`：最大化截图。

- `docs/PRACTICE_IMPORT_AND_REVIEW.md`：62 道接口、导入配置和错题本使用方法；新增数据种类为 `problem` 与 `mistake`，已接入备份恢复。导入记录按请求动态读取，不修改内置注册表。

- `docs/UI_UX_POLISH_2026-11-18.md`：视觉优化范围、截图、性能检查与复验命令。表现层集中在 `src/study/polish.css`，颜色可读性计算在 `appearanceColors.mjs`；移动导航状态在 `App.jsx`。路径相对于 `upstream/algorithm-visualizer`。

- `artifacts/tests-final.log`：最终全量测试输出。
- `artifacts/tests-final-expansion.log`：字号、主题、边高亮与 55 题扩充后的全量测试输出。
- `artifacts/browser-regression.json`：隔离数据的浏览器回归。
- `artifacts/dashboard.png`、`workbench.png`：界面截图。
- `artifacts/dashboard-dark.png`、`workbench-dark.png`、`graph-edge-highlight.png`：彩色章节、深色工作台与真实图边高亮截图。
- `implement-stage/SILENT_ASSUMPTION_SWEEP.round1.json`：第一轮审查原文。
- `docs/ACCEPTANCE.md`：当前验收范围及已知后续项。

第 2 轮独立审查被服务额度中断。它在中断前报告的保存冲突、取消记录和 stdin 用例问题已经由执行者补测；该轮不记为独立审查通过。
