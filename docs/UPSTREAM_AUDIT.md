# 上游审计与复用记录

- 主仓库：https://github.com/algorithm-visualizer/algorithm-visualizer
- 起始提交：`18de2edf6b629e843ee4bcedfa2208d22b253f0f`
- 获取日期：2026-11-16。
- 上游 LICENSE 保留，MIT。没有修改 Git 全局配置。

| 上游模块 | 当前复用与修改 |
|---|---|
| `src/core/tracers/Tracer.jsx` | 保留 Tracer 与 Renderer 关系，改为直接模块导入 |
| `Array1DTracer.js`、`Array2DTracer.js` | 实际用于数组、辅助表、比较与修改高亮 |
| `GraphTracer.js` | 实际用于链表、树、图和多种链式节点；上层适配真实 C 状态 |
| Array/Graph/Renderer | 保留渲染、拖动与缩放，迁移 JSX 后缀、修改样式与布局 |
| `components/Ellipsis`、`common/util` | 保留标题与样式辅助逻辑 |
| 原 React/Ace 技术路线 | 使用当前 React、react-ace，编辑器按需加载 |
| 原构建链 | 从 react-scripts/node-sass 迁移到 Vite/Dart Sass，锁文件随工程保存 |

旧导航、云端 GitHub 登录与原服务端运行接口没有用于当前个人版。新的本地执行器通过统一快照适配上游视图。未导入 Python Tutor、doocs 或其他项目的题解源码。
