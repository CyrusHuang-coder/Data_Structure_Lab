# UI/UX 优化验收（2026-11-18）

本次沿用 React 19、Vite 8、Ace 和现有 CSS，实现克制的渐变、玻璃材质、交互反馈和移动端导航。页面内容、路由、C 执行逻辑、接口协议及个人数据格式保持原有行为。没有新增依赖。

## 已完成

- 统一浅色和深色的背景、边框、圆角、阴影及文字层级。主题色文字和按钮文字分别计算可读颜色。
- 首页使用柔和的多层径向渐变与 24 秒环境光动画。动画只改变 transform，标题区保留对比度遮罩。
- 玻璃效果集中用于导航、搜索、提示和播放控制；代码与内容卡片保留清晰背景。浏览器不支持模糊时有实色回退。
- 按钮具备按下缩放和自然回弹，卡片具备轻微上浮与高光。统一键盘焦点和搜索反馈。
- 增加跳到主要内容链接、搜索快捷键和移动端导航抽屉。抽屉支持焦点约束、Escape 关闭、返回触发按钮，以及背景滚动锁定。
- 设置页可关闭装饰动效；同时遵循系统 prefers-reduced-motion。主题和浏览器 theme-color 同步。
- 修复 390px 视口曾扩展到 599px 的横向溢出。密集题目表格在卡片内部横向滚动。

主要实现位于 `upstream/algorithm-visualizer/src/study/polish.css`、`App.jsx`、`Appearance.jsx` 和 `appearanceColors.mjs`。原有三栏拖动、运行状态分栏、ADT 卡片和参数输入继续使用现有实现。

## 验证证据

生产构建通过。14 项单元测试通过，覆盖主题色对比度、工作台布局、参数输入和 ADT 数据。主题色测试覆盖 226 种颜色的浅深两套主题，主题文字与主按钮文字对比度均达到 4.5。

五组隔离浏览器检查共 70 项通过：

| 结果文件（artifacts 目录） | 项目数 |
| --- | ---: |
| browser-regression.json | 21 |
| layout-browser.json | 14 |
| input-browser.json | 11 |
| adt-browser.json | 10 |
| polish-browser.json | 14 |

视觉检查覆盖浅色、深色、移动端大字号。10 类主要页面在 390px 下没有页面级横向溢出；320px 工作台与 18px 字号检查通过。浏览器测试使用临时数据库。

检查截图：`artifacts/polish-verified-light.png`、`polish-verified-dark.png`、`polish-verified-mobile.png`。性能检查确认无外部字体或新增网络资源，Ace 保持延迟加载。本次入口脚本与样式压缩传输体积合计约增加 6KB。装饰动画使用 transform，模糊范围限定在少数界面区域；本次没有进行设备帧率基准测试。

复验命令（在 upstream/algorithm-visualizer 下执行）：

```powershell
& 'D:\Node.js\npm.cmd' run build
& 'D:\Node.js\node.exe' --test tests/appearance-colors.test.mjs tests/workbench-layout.test.mjs tests/test-input.test.mjs tests/adt-reference.test.mjs
& 'D:\Node.js\node.exe' tests/polish-browser.mjs
```

设计检查参考：[Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)。
