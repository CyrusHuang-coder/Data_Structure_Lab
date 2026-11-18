# 免费共享部署

正式地址：<https://data-structure-lab.vercel.app>。使用现有 Vercel Hobby 账号及默认域名，没有购买服务器、域名或升级套餐。

## 使用

点击“创建账号”，设置用户名和密码。用户名为 3～32 位字母、数字或下划线；密码为 10～128 个字符。当前版本不提供密码找回，请妥善保存。

每个账号独立保存草稿、进度、导入题目、错题本和运行记录。首次访问及环境暂停后需要唤醒执行环境。设置页继续提供学习数据备份。

## 组件

- Vercel 静态前端：页面与编辑器。
- api/index.mjs：登录校验和代理。
- 私有 Vercel Blob：账号和会话。密码采用带随机盐的 scrypt 摘要；Cookie 使用 Secure、HttpOnly、SameSite=Lax。
- 每账号独立的 Vercel Sandbox 微型虚拟机：GCC/GDB、本地 API 和 SQLite；禁止对外网络访问。账号存储凭据不传入执行环境。
- 持久快照：暂停后恢复文件和 SQLite。每人仅保留最近一份环境快照；可自行导出学习备份。

环境默认运行约五分钟，活跃请求在临近期限时短暂延长。采集仍受原有步数、超时和输出限制约束。

## 额度

应用配置：最多 50 个注册账号；每账号每天 20 次执行类请求，平台每天共享 100 次。运行、提交、代码导出以及导入接口编译检查均计次，包括编译失败。

还受 Vercel Hobby 免费配额约束。Sandbox 当前提供每月 5 小时活跃 CPU、420 GB-hours 内存、5,000 次创建等额度；用完暂停创建，不自动产生额外用量费用。存储也受免费配额限制。此配置适合少量同学共享。

官方说明：[Sandbox 价格与配额](https://vercel.com/docs/sandbox/pricing)、[私有 Blob](https://vercel.com/docs/vercel-blob/private-storage)。

## 开发和维护

根目录 npm run build 构建云端登录版本；应用目录 npm run build 构建本地版本。双击启动脚本仍启动本地版，不依赖云端额度。

根目录 package-lock.json 锁定部署 SDK。DS_BASE_SNAPSHOT 为执行基础快照标识，Blob 凭据由平台注入。环境文件和 .vercel 目录不提交。基础快照中不包含用户学习数据。

修改 C 后端后重新执行 cloud/provision.mjs，更新项目快照变量后部署。已有用户的持久环境保留旧文件系统，升级时需单独迁移，保留 /vercel/data，不能直接删除用户 Sandbox。

## 验证

- npm test：账号参数和密码摘要。
- cloud/smoke.mjs：两个临时账号、隔离、拒绝直连、真实 C 追踪和暂停恢复。
- cloud/live-browser.mjs：正式网址注册、登录、数据隔离、提交测试、逐行回放。

云端测试使用临时账号，会消耗少量免费额度；结果和截图写入 artifacts，不提交。
