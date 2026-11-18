# 仓库结构与提交范围

此仓库保存可复现源码、依赖锁文件、启动脚本、测试及设计文档。

| 路径 | 用途 |
| --- | --- |
| `upstream/algorithm-visualizer/src/study/` | 中文学习界面与交互 |
| `upstream/algorithm-visualizer/src/core/` | 基于 Algorithm Visualizer 的渲染与追踪器 |
| `upstream/algorithm-visualizer/study-server/` | 本地 API、GCC/GDB 执行、题库和数据存储 |
| `upstream/algorithm-visualizer/tests/` | 模型、原生执行和浏览器测试 |
| `scripts/` | Windows 启动和停止脚本 |
| `docs/` | 覆盖清单、使用说明和扩展说明 |

`user-data/`、`node_modules/`、`dist/`、`artifacts/` 与本地实施记录不提交。文档中提到的历史日志和截图位于开发机器的 artifacts 目录，可运行相应测试重新生成。备份与题目导出文件可能包含个人代码，应单独保管。

CI 在 Node.js 24 下执行依赖安装、生产构建和不依赖原生调试器的模型测试。原生 C/GDB 和 Edge 浏览器回归由本机运行；命令见根目录 README。

Algorithm Visualizer 的原始 MIT 许可证与来源提交保留在 LICENSE、THIRD_PARTY_NOTICES.md 和 docs/UPSTREAM_AUDIT.md。原始 README 位于应用目录的 README.upstream.md。此仓库为整理后的独立项目快照，上游历史可按来源提交在原仓库查询。
