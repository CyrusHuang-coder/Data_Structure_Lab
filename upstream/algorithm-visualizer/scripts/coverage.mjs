import {writeFile,mkdir} from 'node:fs/promises';
import {algorithms,chapters} from '../study-server/catalog.mjs';import {problems} from '../study-server/problems.mjs';
import '../study-server/textbook-extra.mjs';import '../study-server/textbook-storage.mjs';import '../study-server/textbook-advanced.mjs';import '../study-server/textbook-complete.mjs';import '../study-server/problems-extra.mjs';import '../study-server/problems-more.mjs';
import '../study-server/problems-expanded.mjs';
import '../study-server/problems-pending.mjs';
const textbook=algorithms.filter(a=>!a.problemNumber);
let md=`# 内容覆盖清单\n\n从实际代码注册表生成。教材入口 ${textbook.length} 个，已接入编程题 ${problems.filter(p=>p.algorithmId).length} 道。每个入口的具体操作和复杂度以页面说明为准。验证结果见 artifacts 测试日志。\n\n`;
for(const chapter of chapters){const items=textbook.filter(a=>a.chapter===chapter.id);md+=`## ${chapter.index}. ${chapter.title}（${items.length} 个入口）\n\n| ID | 入口 | 默认及边界用例数 | 说明 |\n|---|---|---|---|\n`;for(const a of items)md+=`| ${a.id} | ${a.title} | ${a.tests.length+1} | ${a.summary.replaceAll('|','／')} |\n`;md+='\n';}
md+='## 已配置的 LeetCode 编程题\n\n| 题号 | 名称 | 知识点 | 原题 |\n|---|---|---|---|\n';for(const p of problems.filter(p=>p.algorithmId))md+=`| ${p.number} | ${p.title} | ${p.topic} | [原题](${p.url}) |\n`;
md+='\n目录其余条目保留原站跳转；在配置 C 接口和测试前，不显示为本站可编程。\n';
await mkdir('../../docs',{recursive:true});await writeFile('../../docs/COVERAGE.md',md);console.log(JSON.stringify({textbook:textbook.length,chapters:chapters.length,problems:problems.filter(p=>p.algorithmId).length}));
