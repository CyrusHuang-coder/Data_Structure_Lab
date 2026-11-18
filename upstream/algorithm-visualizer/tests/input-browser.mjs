import {chromium,expect} from '@playwright/test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
const temp=await mkdtemp(path.join(os.tmpdir(),'ds-input-'));process.env.DS_DATA_DIR=temp;
const {server}=await import('../study-server/server.mjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1480,height:1000}}),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const request=(url,method='GET',body)=>page.evaluate(async({url,method,body})=>{const r=await fetch('/api'+url,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return r.json();},{url,method,body});
const field=name=>page.getByRole('textbox',{name,exact:true});
await mkdir('../../artifacts',{recursive:true});
try{
  await page.goto(base+'/#/compare');await field('左侧数列').waitFor();assert.equal(await page.getByRole('textbox',{name:/JSON 输入/}).count(),0);
  assert.equal(await page.getByRole('textbox',{name:/目标值/}).count(),0);checks.push('comparison defaults to plain sequences without unused parameters or JSON');
  await field('左侧数列').fill('9， -2, 9, 0,');assert.equal(await field('左侧数列').inputValue(),'9， -2, 9, 0,');
  await field('右侧数列').fill('1,-');assert.ok(await page.getByRole('button',{name:'运行两侧',exact:true}).isDisabled());
  await page.getByRole('button',{name:'左输入用于右侧',exact:false}).click();await expect(field('右侧数列')).toHaveValue('9, -2, 9, 0');checks.push('copying left input replaces invalid right edits and retains real number types');
  await field('右侧数列').fill('[4,1,3]');await page.getByRole('button',{name:'运行两侧',exact:true}).click();
  await expect(page.getByRole('button',{name:'运行两侧',exact:true})).toBeEnabled({timeout:90000});
  const histories=await request('/records/history');for(const [id,expected]of [['insertion',[-2,0,9,9]],['quick',[1,3,4]]]){const item=histories.find(h=>h.algorithmId===id),result=(await request('/runs/'+item.id)).result;assert.equal(result.status,'completed');assert.deepEqual(result.output,expected);}
  checks.push('both C sorting runs receive their edited sequences and return correct results');
  await page.screenshot({path:'../../artifacts/compare-simple-input.png',fullPage:true});
  await request('/records/draft/insertion','PUT',{code:'void Solve(int a[], int n) {}',inputText:JSON.stringify({values:[7,6],key:3}),mode:'demo'});
  await page.locator('.compare-card').first().getByRole('button',{name:'载入我的草稿'}).click();await expect(field('左侧数列')).toHaveValue('7, 6');checks.push('existing JSON-format drafts load as plain fields');
  await page.goto(base+'/#/workbench/list-insert');await field('数列').waitFor();
  await field('数列').fill('10 20');await field('插入位置').fill('2');await field('插入值').fill('15');
  page.once('dialog',d=>d.accept('simple-case'));await page.getByRole('button',{name:'保存当前',exact:false}).click();await page.getByRole('button',{name:'simple-case',exact:false}).waitFor();
  const saved=(await request('/records/case')).find(c=>c.name==='simple-case');assert.deepEqual(saved.input,{values:[10,20],position:2,value:15});
  await field('插入位置').fill('-');assert.ok(await page.getByRole('button',{name:'运行代码',exact:true}).isDisabled());
  await page.getByRole('button',{name:'输出 / 诊断',exact:true}).click();assert.ok(await page.getByRole('button',{name:'运行代码',exact:true}).isDisabled());
  await page.getByRole('button',{name:'输入与用例',exact:true}).click();assert.equal(await field('插入位置').inputValue(),'-');
  await page.getByRole('button',{name:'simple-case',exact:false}).click();await expect(field('插入位置')).toHaveValue('2');checks.push('invalid partial integers block stale execution and saved cases restore all fields');
  await page.getByRole('button',{name:'输出 / 诊断',exact:true}).click();await page.getByRole('button',{name:'运行代码',exact:true}).click();await page.getByText('执行完成',{exact:true}).waitFor({timeout:90000});
  const listHistory=(await request('/records/history')).find(h=>h.algorithmId==='list-insert');assert.deepEqual((await request('/runs/'+listHistory.id)).result.output,[10,15,20]);checks.push('running from another panel uses the same live form values');
  await page.getByRole('button',{name:'输入与用例',exact:true}).click();await page.getByText('已保存',{exact:true}).waitFor();await page.reload();await expect(field('数列')).toHaveValue('10, 20');checks.push('valid parameter edits persist through draft reload');
  await page.goto(base+'/#/workbench/lc-100');await field('树的层序序列').waitFor();await field('第二棵树的层序序列').fill('1, null, 2');
  await page.getByRole('button',{name:'高级 JSON',exact:true}).click();assert.deepEqual(JSON.parse(await field('JSON 输入').inputValue()).values2,[1,null,2]);checks.push('tree nulls and second arrays convert to typed inputs');
  await page.goto(base+'/#/workbench/naive-match');await field('主串').waitFor();await field('主串').fill('hello "C"');await field('模式串').fill('"C"');
  await page.getByRole('button',{name:'高级 JSON',exact:true}).click();assert.equal(JSON.parse(await field('JSON 输入').inputValue()).text,'hello "C"');checks.push('text fields retain literal quotes without JSON escaping by the user');
  await page.goto(base+'/#/workbench/bfs');await field('边集').waitFor();await field('顶点数').fill('3');await field('边集').fill('0 1\n1 2');await field('起始顶点').fill('0');
  await page.getByRole('button',{name:'高级 JSON',exact:true}).click();const graph=JSON.parse(await field('JSON 输入').inputValue());assert.deepEqual(graph.edges,[[0,1],[1,2]]);
  await field('JSON 输入').fill('{');await expect(page.getByRole('button',{name:'运行代码',exact:true})).toBeDisabled();assert.ok(await page.getByRole('button',{name:'参数输入',exact:true}).isDisabled());
  await field('JSON 输入').fill(JSON.stringify({...graph,edges:'bad'}));await expect(page.getByRole('button',{name:'运行代码',exact:true})).toBeDisabled();
  await field('JSON 输入').fill(JSON.stringify(graph));await page.getByRole('button',{name:'参数输入',exact:true}).click();await expect(field('边集')).toHaveValue('0 1\n1 2');checks.push('graph edge rows, advanced-input validation and mode conversion work without preview crashes');
  await page.goto(base+'/#/settings');await page.getByRole('combobox',{name:'显示模式'}).selectOption('dark');await page.getByRole('combobox',{name:'阅读字号'}).selectOption('18');
  await page.goto(base+'/#/compare');await field('左侧数列').waitFor();await page.setViewportSize({width:1280,height:900});assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.screenshot({path:'../../artifacts/compare-simple-dark.png',fullPage:true});checks.push('dark and large-font parameter forms fit 1280px');
  assert.deepEqual(errors,[]);await writeFile('../../artifacts/input-browser.json',JSON.stringify({passed:true,checks,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
}catch(error){await page.screenshot({path:'../../artifacts/input-browser-failure.png',fullPage:true});await writeFile('../../artifacts/input-browser.json',JSON.stringify({passed:false,checks,errors,error:error.message},null,2));throw error;}
finally{await browser.close();await new Promise(r=>server.close(r));const target=path.resolve(temp);if(target.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(target).startsWith('ds-input-'))await rm(target,{recursive:true,force:true,maxRetries:3,retryDelay:100});}
